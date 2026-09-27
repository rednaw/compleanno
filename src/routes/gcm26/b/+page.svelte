<script>
	import { base } from '$app/paths';
	import { onMount, tick } from 'svelte';
	import manifest from './manifest.json';
	import { savePuzzleState, loadPuzzleState, clearPuzzleState } from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import {
		createAudioRegistry,
		applySolvedToAudios,
		startAudioMix,
		stopAllAudio
	} from '$lib/audio-mix.js';
	import { gcm26HubImage } from '../hub-images.js';
	import { gcm26BSolvedKey, gcm26Keys } from '../storage-keys.js';
	import { answerMatches } from '$lib/normalize.js';
	import ResultOverlay from '$lib/components/ResultOverlay.svelte';
	import '$lib/quiz-form.css';

	/** @type {{ id: string; title: string }[]} */
	const tracks = manifest.tracks;

	const registry = createAudioRegistry();

	/** @param {HTMLAudioElement} node @param {string} id */
	function audioEl(node, id) {
		return registry.register(node, id);
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

	const mixTracks = tracks.map((t) => ({ id: t.id, src: `${base}/gcm26/b/${t.id}.mp3` }));

	function startMix() {
		startAudioMix({
			tracks: mixTracks,
			solved,
			loadError: audioLoadError,
			audioById: registry.byId,
			seekMode: 'phased',
			onLoadError: (id) => {
				audioLoadError[id] = true;
			}
		});
	}

	function submitGuess() {
		if (allCompleted) return;
		const g = guessInput;
		if (!g.trim()) return;

		const unsolved = tracks.filter((t) => !solved[t.id]);
		const matches = unsolved.filter((t) => answerMatches(g, t.title));

		if (matches.length === 1) {
			const t = matches[0];
			solved[t.id] = true;
			guessRowStatus = 'not-started';
			guessInput = '';
			const a = registry.get(t.id);
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

			if (loadPuzzleState(gcm26Keys.gameBDone)) {
				allCompleted = true;
			} else {
				checkAllCompleted();
			}
		} catch {
			/* localStorage may be unavailable */
		}

		void tick().then(() => {
			applySolvedToAudios(mixTracks, solved, registry.byId);
			if (!allCompleted) startMix();
		});

		return () => stopAllAudio(registry.byId);
	});
</script>

<svelte:head>
	<title>Cacophony</title>
</svelte:head>

<BackButton href="/gcm26" />

<main>
	<div class="clip-list">
		<p class="progress-hint" aria-live="polite">
			{solvedTally} / {tracks.length} songs identified
		</p>

		<div class="audio-layer" aria-hidden="true">
			{#each tracks as track (track.id)}
				<audio
					use:audioEl={track.id}
					src={`${base}/gcm26/b/${track.id}.mp3`}
					loop
					preload="metadata"
					onerror={() => {
						audioLoadError[track.id] = true;
					}}
				></audio>
			{/each}
		</div>

		{#if !allCompleted}
			<div class="card-row {guessRowStatus === 'wrong' ? 'wrong' : ''}">
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
					aria-invalid={guessRowStatus === 'wrong'}
					aria-describedby="gcm26b-guess-status"
					onkeydown={(e) => e.key === 'Enter' && submitGuess()}
				/>
			</div>
			<p id="gcm26b-guess-status" class="field-feedback" role="status" aria-live="polite">
				{#if guessRowStatus === 'wrong'}
					Song not recognized. Try again.
				{/if}
			</p>
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
			<ResultOverlay src="{base}/gcm26/code/{gcm26HubImage.b}" />
		{/if}
	</div>
</main>

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

	.card-row button[type='button'] {
		font-size: 1.05em;
		padding: 0.55em 1em;
		border-radius: 0.5em;
		border: none;
		background: var(--color-theme-2);
		color: var(--color-white);
		font-weight: 600;
		cursor: pointer;
	}

	.card-row button[type='button']:disabled {
		opacity: 0.5;
		cursor: not-allowed;
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
