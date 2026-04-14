<script>
	import { base, resolve } from '$app/paths';
	import { onMount, tick } from 'svelte';
	import manifest from './manifest.json';
	import {
		checkOrientation,
		setupOrientationListeners,
		savePuzzleState,
		loadPuzzleState,
		clearPuzzleState
	} from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import RotateMessage from '$lib/components/RotateMessage.svelte';
	import { gcm26HubImage } from '../hub-images.js';
	import { gcm26BSolvedKey, gcm26Keys } from '../storage-keys.js';
	import ResultFullscreen from '../ResultFullscreen.svelte';
	import '../quiz-shared.css';

	/** @type {{ id: string; title: string }[]} */
	const tracks = manifest.tracks;

	let showRotateMessage = $state(false);

	/** @type {Record<string, HTMLAudioElement | undefined>} */
	const audioById = {};

	/** @param {string} id */
	function audioEl(node, id) {
		const el = /** @type {HTMLAudioElement} */ (node);
		audioById[id] = el;
		return {
			destroy() {
				if (audioById[id] === el) delete audioById[id];
			}
		};
	}

	/** @type {Record<string, boolean>} */
	let solved = $state(Object.fromEntries(tracks.map((t) => [t.id, false])));

	let guessInput = $state('');
	/** @type {'not-started' | 'wrong'} */
	let guessRowStatus = $state('not-started');

	let allCompleted = $state(false);

	/** @type {Record<string, boolean>} */
	let audioLoadError = $state(Object.fromEntries(tracks.map((t) => [t.id, false])));

	const solvedTally = $derived(tracks.filter((t) => solved[t.id]).length);
	/** Solved tracks in manifest order (for display under the guess field). */
	const solvedTracksOrdered = $derived(tracks.filter((t) => solved[t.id]));

	function trackSrc(id) {
		return `${base}/gcm26/b/${id}.mp3`;
	}

	function titleMatches(guess, title) {
		return guess.trim().toLowerCase() === title.trim().toLowerCase();
	}

	function applySolvedToAudios() {
		tracks.forEach((t) => {
			const a = audioById[t.id];
			if (!a) return;
			if (solved[t.id]) {
				a.pause();
				a.muted = true;
				a.volume = 0;
			} else {
				a.muted = false;
				a.volume = 1;
			}
		});
	}

	/** Nominal loop length (s) when metadata not ready yet; clips are ~20s from extract_b. */
	const DEFAULT_LOOP_SEC = 20;

	/** Evenly space playheads over one loop so layers don't all align at t=0 (same wall-clock start). */
	function phaseOffsetSec(trackIndex, loopSec) {
		const n = tracks.length;
		if (n <= 1) return 0;
		return (trackIndex / n) * loopSec;
	}

	function startMix() {
		for (let i = 0; i < tracks.length; i++) {
			const t = tracks[i];
			const a = audioById[t.id];
			if (!a || audioLoadError[t.id] || solved[t.id]) continue;

			const seekAndPlay = () => {
				const loopSec =
					Number.isFinite(a.duration) && a.duration > 0.1 ? a.duration : DEFAULT_LOOP_SEC;
				const offset = phaseOffsetSec(i, loopSec);
				a.currentTime = Math.min(offset, Math.max(0, loopSec - 0.05));
				a.muted = false;
				a.volume = 1;
				a.play().catch(() => {
					audioLoadError = { ...audioLoadError, [t.id]: true };
				});
			};

			// HAVE_METADATA: duration/currentTime seek is reliable before play.
			if (a.readyState >= 1) seekAndPlay();
			else a.addEventListener('loadedmetadata', seekAndPlay, { once: true });
		}
	}

	function submitGuess() {
		if (allCompleted) return;
		const g = guessInput;
		if (!g.trim()) return;

		const unsolved = tracks.filter((t) => !solved[t.id]);
		const matches = unsolved.filter((t) => titleMatches(g, t.title));

		if (matches.length === 1) {
			const t = matches[0];
			solved = { ...solved, [t.id]: true };
			guessRowStatus = 'not-started';
			guessInput = '';
			const a = audioById[t.id];
			if (a) {
				a.pause();
				a.muted = true;
				a.volume = 0;
			}
			savePuzzleState(gcm26BSolvedKey(t.id), '1');
			checkAllCompleted();
		} else {
			guessRowStatus = 'wrong';
			guessInput = '';
		}
	}

	function checkAllCompleted() {
		allCompleted = tracks.every((t) => solved[t.id]);
		if (allCompleted) {
			savePuzzleState(gcm26Keys.gameBDone, '1');
		} else {
			clearPuzzleState(gcm26Keys.gameBDone);
		}
	}

	onMount(() => {
		try {
			tracks.forEach((t) => {
				if (loadPuzzleState(gcm26BSolvedKey(t.id))) {
					solved[t.id] = true;
				}
			});
			solved = { ...solved };

			if (loadPuzzleState(gcm26Keys.gameBDone)) {
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

		void tick().then(() => {
			applySolvedToAudios();
			if (!allCompleted) startMix();
		});

		return setupOrientationListeners(updateOrientation);
	});
</script>

<svelte:head>
	<title>Cacophony</title>
</svelte:head>

<BackButton href={resolve('/gcm26')} />

<RotateMessage show={showRotateMessage} encouragePortrait={true} />

{#if !showRotateMessage}
	<main>
		<div class="clip-list">
			<p class="progress-hint" aria-live="polite">
				{solvedTally} / {tracks.length} songs identified
			</p>

			<div class="audio-layer" aria-hidden="true">
				{#each tracks as track (track.id)}
					<audio
						use:audioEl={track.id}
						src={trackSrc(track.id)}
						loop
						preload="metadata"
						onerror={() => {
							audioLoadError = { ...audioLoadError, [track.id]: true };
						}}
					></audio>
				{/each}
			</div>

			{#if !allCompleted}
				<div class="clip-row {guessRowStatus === 'wrong' ? 'wrong' : ''}">
					<button type="button" onclick={() => submitGuess()} disabled={!guessInput.trim()}>
						Submit
					</button>
				</div>
				<div class="input-row">
					<input
						type="text"
						placeholder="Song title"
						bind:value={guessInput}
						autocomplete="off"
						disabled={allCompleted}
						onkeydown={(e) => e.key === 'Enter' && submitGuess()}
					/>
				</div>
			{/if}

			{#if solvedTracksOrdered.length > 0}
				<div class="solved-titles">
					<p class="solved-titles-label">Identified</p>
					<ul class="solved-titles-list" aria-live="polite">
						{#each solvedTracksOrdered as t (t.id)}
							<li>{t.title}</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if tracks.some((t) => audioLoadError[t.id])}
				<p class="clip-hint">
					Some audio failed to load — run <code>scripts/gcm26/extract_b.py</code>
				</p>
			{/if}

		{#if allCompleted}
			<ResultFullscreen src="{base}/gcm26/code/{gcm26HubImage.b}" />
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

	.progress-hint {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 1rem;
	}

	.audio-layer {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
		pointer-events: none;
		opacity: 0;
	}

	.clip-row button[type='button'] {
		font-size: 1.05em;
		padding: 0.55em 1em;
		border-radius: 0.5em;
		border: none;
		background: var(--color-theme-2);
		color: var(--color-white);
		font-weight: 600;
		cursor: pointer;
	}

	.clip-row button[type='button']:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.solved-titles {
		width: 100%;
		max-width: 320px;
		margin-top: 0.65rem;
		text-align: left;
		box-sizing: border-box;
	}

	.solved-titles-label {
		margin: 0 0 0.35rem;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text);
		opacity: 0.75;
	}

	.solved-titles-list {
		list-style: none;
		margin: 0;
		padding: 0.55rem 0.75rem;
		border-radius: 0.5em;
		background: rgba(255, 255, 255, 0.85);
		border: 1px solid var(--color-border);
		font-size: 0.95em;
		line-height: 1.45;
		color: var(--color-text);
	}

	.solved-titles-list li {
		padding: 0.15em 0;
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
	}

	.solved-titles-list li:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.clip-hint {
		font-size: 0.75rem;
		color: var(--color-text);
		opacity: 0.85;
		margin-top: 1rem;
		max-width: 20rem;
	}

	.clip-hint code {
		font-size: 0.68rem;
	}

</style>
