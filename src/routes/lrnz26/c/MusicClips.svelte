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
	{#each clips as clip, i (clip.id)}
		<div class="clip-container">
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

			<div
				class="input-row"
				class:input-row-solved={clipStates[i].status === 'correct'}
				class:input-row-wrong={clipStates[i].status === 'wrong'}
			>
				<input
					type="text"
					placeholder="Band name"
					bind:value={clipStates[i].guess}
					autocomplete="off"
					readonly={clipStates[i].status === 'correct'}
					aria-invalid={clipStates[i].status === 'wrong'}
					onkeydown={(e) =>
						clipStates[i].status !== 'correct' && e.key === 'Enter' && checkGuess(i)}
				/>
			</div>

			{#if clipStates[i].status !== 'correct'}
				<div class="actions-row">
					{#if clipStates[i].level >= 2}
						<button
							type="button"
							class="play-btn"
							onclick={() => playClip(i)}
							disabled={clipStates[i].playing || clipStates[i].videoError}
						>
							Play
						</button>
					{/if}
					<button
						type="button"
						class="check-btn"
						onclick={() => checkGuess(i)}
						disabled={clipStates[i].playing || !clipStates[i].guess.trim()}
					>
						Check
					</button>
					{#if clipStates[i].level < 3}
						<button
							type="button"
							class="chicken-btn"
							onclick={() => chickenOut(i)}
							disabled={clipStates[i].playing}
						>
							Chicken out
						</button>
					{/if}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.music-clips-root {
		width: 100%;
	}

	.clip-container {
		margin-bottom: 1.75em;
		width: 100%;
	}

	.clip-preview {
		width: 100%;
		margin-bottom: 0.65rem;
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

	.clip-video {
		width: 100%;
		height: 100%;
		max-height: min(52vh, 280px);
		object-fit: contain;
		display: block;
	}

	.input-row {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.6em 1em;
		border-radius: 0.5em;
		background: var(--color-white);
		border: 2px solid var(--color-border);
		width: 100%;
		box-sizing: border-box;
		margin-bottom: 0.65rem;
	}

	.input-row-wrong {
		background: var(--color-error-bg);
		border-color: var(--color-error-border);
	}

	.input-row-solved {
		background: var(--color-success-bg);
		border-color: var(--color-success-border);
	}

	.input-row input[type='text'] {
		width: 100%;
		box-sizing: border-box;
		padding: 0.6em 0.25em;
		border: none;
		border-radius: 0;
		font-size: 1.05em;
		text-align: center;
		color: var(--color-text);
		background: transparent;
		outline: none;
	}

	.input-row input[type='text']::placeholder {
		color: #999;
	}

	.input-row-solved input[type='text'] {
		color: var(--color-success-text);
		font-weight: 600;
	}

	.actions-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}

	.check-btn {
		font-size: 1.05em;
		padding: 0.55em 1.5em;
		border-radius: 0.5em;
		border: none;
		background: var(--color-royal-blue);
		color: var(--color-white);
		font-weight: 700;
		cursor: pointer;
	}

	.check-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.play-btn {
		font-size: 1.05em;
		padding: 0.55em 1.2em;
		border-radius: 0.5em;
		border: none;
		background: var(--color-theme-1);
		color: var(--color-white);
		font-weight: 700;
		cursor: pointer;
	}

	.play-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.chicken-btn {
		padding: 0;
		border: none;
		background: none;
		font-size: 0.85rem;
		color: var(--color-text);
		opacity: 0.65;
		text-decoration: underline;
		cursor: pointer;
	}

	.chicken-btn:hover:not(:disabled) {
		opacity: 1;
	}

	.chicken-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
</style>
