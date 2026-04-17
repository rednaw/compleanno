<script>
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { films, filmTitleMatches } from './films.js';
	import { saveFilmProgress, loadFilmProgress } from './persistence.js';

	/** @type {{ done: boolean }} */
	let { done = $bindable(false) } = $props();

	/** @type {{ guess: string; feedback: string; status: string; playing: boolean; video: HTMLVideoElement | null; videoError: boolean }[]} */
	let clipStates = $state(
		films.map(() => ({
			guess: '',
			feedback: '',
			status: 'not-started',
			playing: false,
			video: null,
			videoError: false
		}))
	);

	function clipSrc(id) {
		return `${base}/gcm26/a/${id}.mp4`;
	}

	function playClip(idx) {
		const st = clipStates[idx];
		const video = st.video;
		if (!video || st.videoError) return;
		st.playing = true;
		video.pause();
		video.currentTime = 0;
		video.play().catch(() => {
			st.videoError = true;
			st.playing = false;
		});
	}

	function onClipEnded(idx) {
		clipStates[idx].playing = false;
	}

	function onClipError(idx) {
		clipStates[idx].videoError = true;
		clipStates[idx].playing = false;
	}

	function checkGuess(idx) {
		const st = clipStates[idx];
		const title = films[idx].title;
		if (!st.guess.trim()) return;

		if (filmTitleMatches(st.guess, title)) {
			st.feedback = 'correct';
			st.status = 'correct';
			st.guess = title;
		} else {
			st.feedback = 'wrong';
			st.status = 'wrong';
			st.guess = '';
		}

		saveFilmProgress(idx, { status: st.status, feedback: st.feedback, guess: st.guess });
		done = clipStates.every((s) => s.status === 'correct');
	}

	onMount(() => {
		try {
			clipStates.forEach((st, index) => {
				const parsed = loadFilmProgress(index);
				if (!parsed) return;
				st.status = parsed.status;
				st.feedback = parsed.feedback;
				if (typeof parsed.guess === 'string') {
					st.guess = parsed.guess;
				} else if (st.status === 'correct') {
					st.guess = films[index].title;
				}
			});
			done = clipStates.every((s) => s.status === 'correct');
		} catch { /* localStorage may be unavailable */ }
	});
</script>

{#each films as film, i (film.id)}
	<div class="clip-container">
		<div class="clip-preview">
			<!-- svelte-ignore a11y_media_has_caption -->
			<video
				class="clip-video"
				bind:this={clipStates[i].video}
				src={clipSrc(film.id)}
				playsinline
				preload="metadata"
				onended={() => onClipEnded(i)}
				onerror={() => onClipError(i)}
			></video>
		</div>
		<div class="card-row {clipStates[i].status}">
			<button
				type="button"
				class="play-btn"
				onclick={() => playClip(i)}
				disabled={clipStates[i].playing || clipStates[i].videoError}
			>
				▶️ Riproduci
			</button>
			{#if clipStates[i].videoError}
				<span class="clip-hint"
					>Video assente — esegui <code>scripts/gcm26/extract_a.py</code></span
				>
			{/if}
			{#if clipStates[i].status !== 'correct'}
				<button
					type="button"
					onclick={() => checkGuess(i)}
					disabled={clipStates[i].playing ||
						!clipStates[i].guess.trim() ||
						clipStates[i].status === 'correct'}
				>
					Controlla
				</button>
			{:else}
				<span class="feedback correct"
					><span class="visually-hidden">Corretto. </span><span aria-hidden="true">✅</span
					></span
				>
			{/if}
		</div>
		<div class="input-row" class:input-row-solved={clipStates[i].status === 'correct'}>
			<input
				type="text"
				placeholder="Titolo del film"
				bind:value={clipStates[i].guess}
				autocomplete="off"
				readonly={clipStates[i].status === 'correct'}
				aria-invalid={clipStates[i].status === 'wrong'}
				aria-describedby="gcm26a-film-{i}-status"
				onkeydown={(e) =>
					clipStates[i].status !== 'correct' && e.key === 'Enter' && checkGuess(i)}
			/>
		</div>
		<p id="gcm26a-film-{i}-status" class="field-feedback" role="status" aria-live="polite">
			{#if clipStates[i].status === 'wrong'}
				Titolo non corretto. Riprova con il titolo esatto.
			{:else if clipStates[i].status === 'correct'}
				Titolo corretto.
			{/if}
		</p>
	</div>
{/each}

<style>
	.clip-container {
		margin-bottom: 1.5em;
		width: 100%;
	}

	.field-feedback {
		margin: 0.35rem 0 0;
		min-height: 1.25em;
		font-size: 0.875rem;
		text-align: center;
		color: var(--color-text);
		line-height: 1.35;
	}

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

	.card-row button[type='button']:not(.play-btn) {
		font-size: 1.05em;
		padding: 0.55em 1em;
		border-radius: 0.5em;
		border: none;
		background: var(--color-theme-2);
		color: var(--color-white);
		font-weight: 600;
		cursor: pointer;
	}

	.card-row button[type='button']:not(.play-btn):disabled {
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
