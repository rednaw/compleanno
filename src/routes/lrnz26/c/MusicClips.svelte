<script>
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { clips, bandNameMatches } from './clips.js';
	import { saveClipProgress, loadClipProgress } from './persistence.js';

	/** @type {{ done: boolean }} */
	let { done = $bindable(false) } = $props();

	/** @typedef {1 | 2 | 3} ClipLevel */

	/** @type {{ guess: string; feedback: string; status: string; level: ClipLevel; playing: boolean; video: HTMLVideoElement | null; videoError: boolean }[]} */
	let clipStates = $state(
		clips.map(() => ({
			guess: '',
			feedback: '',
			status: 'not-started',
			level: /** @type {ClipLevel} */ (1),
			playing: false,
			video: null,
			videoError: false
		}))
	);

	const solvedTally = $derived(clipStates.filter((s) => s.status === 'correct').length);

	/** @param {ClipLevel} level */
	function levelLabel(level) {
		if (level === 1) return 'Level 1 — still only';
		if (level === 2) return 'Level 2 — clip, no sound';
		return 'Level 3 — clip with sound';
	}

	/** @param {ClipLevel} level */
	function chickenOutHint(level) {
		if (level === 1) return 'Chicken out → clip without sound';
		if (level === 2) return 'Chicken out → clip with sound';
		return '';
	}

	function clipSrc(id) {
		return `${base}/lrnz26/c/${id}.mp4`;
	}

	/** @param {number} idx */
	function applyClipLevel(idx) {
		const st = clipStates[idx];
		const video = st.video;
		if (!video || st.videoError) return;

		video.pause();
		video.currentTime = 0;
		st.playing = false;

		if (st.level >= 3) {
			video.muted = false;
			video.volume = 1;
		} else {
			video.muted = true;
			video.volume = 0;
		}
	}

	/** @param {number} idx */
	function persistClip(idx) {
		const st = clipStates[idx];
		saveClipProgress(idx, {
			status: st.status,
			feedback: st.feedback,
			guess: st.guess,
			level: st.level
		});
	}

	/** @param {number} idx */
	function onVideoReady(idx) {
		applyClipLevel(idx);
	}

	/** @param {number} idx */
	function playClip(idx) {
		const st = clipStates[idx];
		if (st.level < 2) return;
		const video = st.video;
		if (!video || st.videoError) return;

		st.playing = true;
		video.pause();
		video.currentTime = 0;

		if (st.level >= 3) {
			video.muted = false;
			video.volume = 1;
		} else {
			video.muted = true;
			video.volume = 0;
		}

		video.play().catch(() => {
			st.videoError = true;
			st.playing = false;
		});
	}

	/** @param {number} idx */
	function onClipEnded(idx) {
		clipStates[idx].playing = false;
	}

	/** @param {number} idx */
	function onClipError(idx) {
		clipStates[idx].videoError = true;
		clipStates[idx].playing = false;
	}

	/** @param {number} idx */
	function chickenOut(idx) {
		const st = clipStates[idx];
		if (st.status === 'correct' || st.level >= 3) return;
		st.level = /** @type {ClipLevel} */ (st.level + 1);
		st.status = st.status === 'wrong' ? 'not-started' : st.status;
		applyClipLevel(idx);
		persistClip(idx);
	}

	/** @param {number} idx */
	function checkGuess(idx) {
		const st = clipStates[idx];
		const band = clips[idx].band;
		if (!st.guess.trim()) return;

		if (bandNameMatches(st.guess, band)) {
			st.feedback = 'correct';
			st.status = 'correct';
			st.guess = band;
		} else {
			st.feedback = 'wrong';
			st.status = 'wrong';
			st.guess = '';
		}

		persistClip(idx);
		done = clipStates.every((s) => s.status === 'correct');
	}

	onMount(() => {
		try {
			clipStates.forEach((st, index) => {
				const parsed = loadClipProgress(index);
				if (!parsed) return;
				st.status = parsed.status;
				st.feedback = parsed.feedback;
				if (typeof parsed.level === 'number' && parsed.level >= 1 && parsed.level <= 3) {
					st.level = /** @type {ClipLevel} */ (parsed.level);
				}
				if (typeof parsed.guess === 'string') {
					st.guess = parsed.guess;
				} else if (st.status === 'correct') {
					st.guess = clips[index].band;
				}
			});
			done = clipStates.every((s) => s.status === 'correct');
		} catch { /* localStorage may be unavailable */ }
	});
</script>

<div class="music-clips-root" data-phase-complete={done}>
	<p class="progress-hint" aria-live="polite">
		{solvedTally} / {clips.length} bands identified
	</p>

	{#each clips as clip, i (clip.id)}
		<div class="clip-container">
			<div class="clip-heading">
				{#if clip.label}
					<p class="clip-label">{clip.label}</p>
				{/if}
				<p class="level-tag" aria-live="polite">{levelLabel(clipStates[i].level)}</p>
			</div>
			<div class="clip-preview" class:clip-preview-still={clipStates[i].level === 1}>
				<!-- svelte-ignore a11y_media_has_caption -->
				<video
					class="clip-video"
					bind:this={clipStates[i].video}
					src={clipSrc(clip.id)}
					playsinline
					preload="auto"
					aria-label={clip.label ?? `Clip ${i + 1}`}
					onloadeddata={() => onVideoReady(i)}
					onended={() => onClipEnded(i)}
					onerror={() => onClipError(i)}
				></video>
			</div>
			<div class="card-row {clipStates[i].status}">
				{#if clipStates[i].level >= 2 && clipStates[i].status !== 'correct'}
					<button
						type="button"
						class="play-btn"
						onclick={() => playClip(i)}
						disabled={clipStates[i].playing || clipStates[i].videoError}
					>
						▶ Play
					</button>
				{/if}
				{#if clipStates[i].videoError}
					<span class="clip-hint"
						>Video missing — run <code>scripts/lrnz26/extract_c.py</code></span
					>
				{/if}
				{#if clipStates[i].status !== 'correct'}
					<button
						type="button"
						class="check-btn"
						onclick={() => checkGuess(i)}
						disabled={clipStates[i].playing ||
							!clipStates[i].guess.trim() ||
							clipStates[i].status === 'correct'}
					>
						Check
					</button>
				{:else}
					<span class="feedback correct"
						><span class="visually-hidden">Correct. </span><span aria-hidden="true">✅</span></span
					>
				{/if}
			</div>
			{#if clipStates[i].status !== 'correct' && clipStates[i].level < 3}
				<div class="chicken-row">
					<button type="button" class="chicken-btn" onclick={() => chickenOut(i)}>
						{chickenOutHint(clipStates[i].level)}
					</button>
				</div>
			{/if}
			<div class="input-row" class:input-row-solved={clipStates[i].status === 'correct'}>
				<input
					type="text"
					placeholder="Band name"
					bind:value={clipStates[i].guess}
					autocomplete="off"
					readonly={clipStates[i].status === 'correct'}
					aria-invalid={clipStates[i].status === 'wrong'}
					aria-describedby="lrnz26c-clip-{i}-status"
					onkeydown={(e) =>
						clipStates[i].status !== 'correct' && e.key === 'Enter' && checkGuess(i)}
				/>
			</div>
			<p id="lrnz26c-clip-{i}-status" class="field-feedback" role="status" aria-live="polite">
				{#if clipStates[i].status === 'wrong'}
					Band not recognized. Try again.
				{:else if clipStates[i].status === 'correct'}
					Correct band.
				{/if}
			</p>
		</div>
	{/each}
</div>

<style>
	.music-clips-root {
		width: 100%;
	}

	.progress-hint {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 1rem;
		text-align: center;
	}

	.clip-container {
		margin-bottom: 1.5em;
		width: 100%;
	}

	.clip-heading {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.35rem 0.75rem;
		margin-bottom: 0.5rem;
	}

	.clip-label {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 700;
		text-align: left;
		color: var(--color-text);
	}

	.level-tag {
		margin: 0;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--color-text);
		opacity: 0.7;
	}

	.field-feedback {
		margin: 0.35rem 0 0;
		min-height: 1.25em;
		font-size: 0.875rem;
		text-align: center;
		color: var(--color-text);
		line-height: 1.35;
	}

	.card-row.wrong ~ .chicken-row + .input-row + .field-feedback,
	.card-row.wrong ~ .input-row + .field-feedback {
		color: var(--color-error-text);
		font-weight: 600;
	}

	.input-row-solved + .field-feedback {
		color: var(--color-success-text);
		font-weight: 600;
	}

	.clip-preview {
		width: 100%;
		margin-bottom: 0.5rem;
		border-radius: 0.5rem;
		overflow: hidden;
		background: #0a0a0a;
		border: 2px solid var(--color-border);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
		aspect-ratio: 16 / 9;
		max-height: min(52vh, 280px);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.clip-preview-still .clip-video {
		pointer-events: none;
	}

	.card-row.correct {
		background: var(--color-success-bg-strong);
		border-color: var(--color-success-border);
		color: var(--color-success-text);
	}

	.clip-video {
		width: 100%;
		height: 100%;
		max-height: min(52vh, 280px);
		object-fit: contain;
		display: block;
	}

	.chicken-row {
		text-align: center;
		margin: 0.35rem 0 0.5rem;
	}

	.chicken-btn {
		padding: 0;
		border: none;
		background: none;
		font-size: 0.85rem;
		color: var(--color-text);
		opacity: 0.75;
		text-decoration: underline;
		cursor: pointer;
	}

	.chicken-btn:hover {
		opacity: 1;
	}

	.clip-hint {
		font-size: 0.75rem;
		color: var(--color-text);
		opacity: 0.85;
		max-width: 12rem;
		text-align: left;
	}

	.clip-hint code {
		font-size: 0.68rem;
	}

	.play-btn {
		font-size: 1.05em;
		padding: 0.6em 1.2em;
		border-radius: 0.5em;
		border: none;
		background: var(--color-theme-1);
		color: var(--color-white);
		font-weight: bold;
		cursor: pointer;
		transition: background 0.2s;
	}

	.play-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.check-btn {
		font-size: 1.05em;
		padding: 0.55em 1em;
		border-radius: 0.5em;
		border: none;
		background: var(--color-royal-blue);
		color: var(--color-white);
		font-weight: 600;
		cursor: pointer;
	}

	.check-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.feedback {
		font-size: 1.5em;
		margin-left: 0.5em;
	}

	.feedback.correct {
		color: var(--color-success-border);
	}

	@media (max-width: 480px) {
		.play-btn {
			font-size: 0.95em;
		}
	}
</style>
