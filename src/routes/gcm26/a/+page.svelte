<script>
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { films, filmTitleMatches } from '../films.js';
	import { checkOrientation, setupOrientationListeners, savePuzzleState, loadPuzzleState } from '../../lrnz25/utils.js';
	import BackButton from '../../lrnz25/components/BackButton.svelte';
	import RotateMessage from '$lib/components/RotateMessage.svelte';

	let showRotateMessage = false;

	/** @type {{ guess: string; feedback: string; status: string; playing: boolean; video: HTMLVideoElement | null; videoError: boolean }[]} */
	let clipStates = films.map(() => ({
		guess: '',
		feedback: '',
		status: 'not-started',
		playing: false,
		video: null,
		videoError: false
	}));

	let allCompleted = false;

	function clipSrc(id) {
		return `${base}/gcm26/clips/${id}.mp4`;
	}

	function playClip(idx) {
		const st = clipStates[idx];
		const video = st.video;
		if (!video || st.videoError) return;
		st.playing = true;
		clipStates = [...clipStates];
		video.pause();
		video.currentTime = 0;
		video.play().catch(() => {
			st.videoError = true;
			st.playing = false;
			clipStates = [...clipStates];
		});
	}

	function onClipEnded(idx) {
		clipStates[idx].playing = false;
		clipStates = [...clipStates];
	}

	function onClipError(idx) {
		clipStates[idx].videoError = true;
		clipStates[idx].playing = false;
		clipStates = [...clipStates];
	}

	function checkGuess(idx) {
		const st = clipStates[idx];
		const title = films[idx].title;
		if (!st.guess.trim()) return;

		if (filmTitleMatches(st.guess, title)) {
			st.feedback = 'correct';
			st.status = 'correct';
		} else {
			st.feedback = 'wrong';
			st.status = 'wrong';
			st.guess = '';
		}

		try {
			localStorage.setItem(
				`gcm26_film_${idx}`,
				JSON.stringify({ status: st.status, feedback: st.feedback })
			);
		} catch {
			void 0;
		}

		clipStates = [...clipStates];
		checkAllCompleted();
	}

	function checkAllCompleted() {
		allCompleted = clipStates.every((s) => s.status === 'correct');
		if (allCompleted) {
			savePuzzleState('gcm26_game_a_done', '1');
		}
	}

	onMount(() => {
		try {
			clipStates.forEach((st, index) => {
				const raw = localStorage.getItem(`gcm26_film_${index}`);
				if (raw) {
					const parsed = JSON.parse(raw);
					st.status = parsed.status;
					st.feedback = parsed.feedback;
				}
			});

			if (loadPuzzleState('gcm26_game_a_done')) {
				allCompleted = true;
			} else {
				checkAllCompleted();
			}
		} catch {
			void 0;
		}

		const updateOrientation = () => {
			showRotateMessage = !checkOrientation(true);
		};
		updateOrientation();
		return setupOrientationListeners(updateOrientation);
	});
</script>

<svelte:head>
	<title>GCM 26 — A</title>
</svelte:head>

<BackButton href="{base}/gcm26/" />

<RotateMessage show={showRotateMessage} encouragePortrait={true} />

{#if !showRotateMessage}
	<main>
		<div class="clip-list">
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
							on:ended={() => onClipEnded(i)}
							on:error={() => onClipError(i)}
						></video>
					</div>
					<div class="clip-row {clipStates[i].status}">
						<button
							type="button"
							class="play-btn"
							on:click={() => playClip(i)}
							disabled={clipStates[i].playing || clipStates[i].videoError}
						>
							▶️ Play
						</button>
						{#if clipStates[i].videoError}
							<span class="clip-hint">Video missing — run <code>scripts/gcm26/extract.py</code></span>
						{/if}
						{#if clipStates[i].status !== 'correct'}
							<button
								type="button"
								on:click={() => checkGuess(i)}
								disabled={clipStates[i].playing ||
									!clipStates[i].guess.trim() ||
									clipStates[i].status === 'correct'}
							>
								Check
							</button>
						{:else}
							<span class="feedback correct">✅</span>
						{/if}
					</div>
					<div class="input-row">
						{#if clipStates[i].status !== 'correct'}
							<input
								type="text"
								placeholder="Film title"
								bind:value={clipStates[i].guess}
								autocomplete="off"
								disabled={clipStates[i].status === 'correct'}
								on:keydown={(e) => e.key === 'Enter' && checkGuess(i)}
							/>
						{:else}
							<span class="feedback correct">✅</span>
						{/if}
					</div>
				</div>
			{/each}

			{#if allCompleted}
				<div class="result-section">
					<p class="result-text">🎉</p>
				</div>
			{/if}
		</div>
	</main>
{/if}

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		min-height: 100vh;
		background: var(--color-background);
		padding: 1rem 0.5rem 1rem 0.5rem;
		box-sizing: border-box;
		margin-top: 4rem;
	}

	.clip-list {
		width: 100%;
		max-width: 520px;
		margin-left: auto;
		margin-right: auto;
		box-sizing: border-box;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.clip-container {
		margin-bottom: 1.5em;
		width: 100%;
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

	.clip-row {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		padding: 0.8em 1em;
		border-radius: 0.5em;
		margin-bottom: 0.4em;
		background: var(--color-white);
		border: 2px solid var(--color-border);
		transition:
			border 0.2s,
			background 0.2s;
		font-size: 1.05em;
		gap: 0.8em;
		width: 100%;
		box-sizing: border-box;
	}

	.clip-row.correct {
		background: #a5d6a7;
		border-color: #388e3c;
		color: #1b5e20;
	}

	.clip-row.wrong {
		background: #ffcdd2;
		border-color: #d32f2f;
		color: #b71c1c;
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

	.clip-row button[type='button']:not(.play-btn) {
		font-size: 1.05em;
		padding: 0.55em 1em;
		border-radius: 0.5em;
		border: none;
		background: var(--color-theme-2);
		color: var(--color-white);
		font-weight: 600;
		cursor: pointer;
	}

	.clip-row button[type='button']:not(.play-btn):disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	input[type='text'] {
		font-size: 1.05em;
		padding: 0.6em 1em;
		border-radius: 0.5em;
		border: 1px solid var(--color-border);
		min-width: 0;
		width: 100%;
		max-width: 280px;
		background: var(--color-white);
		color: var(--color-text);
		box-sizing: border-box;
	}

	.feedback {
		font-size: 1.5em;
		margin-left: 0.5em;
	}

	.feedback.correct {
		color: #388e3c;
	}

	.result-section {
		text-align: center;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 0.5rem;
		border: 2px solid var(--color-border);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		padding: 1.2rem 1.5rem;
		width: fit-content;
		min-width: 140px;
		margin: 2rem auto;
	}

	.result-text {
		font-size: 2.2rem;
		margin: 0;
		font-weight: bold;
		color: var(--color-text);
	}

	@media (max-width: 480px) {
		.clip-row {
			font-size: 0.95em;
			gap: 0.5em;
		}

		.play-btn {
			font-size: 0.95em;
		}
	}
</style>
