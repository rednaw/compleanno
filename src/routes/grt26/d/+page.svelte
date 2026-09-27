<script>
	import { base } from '$app/paths';
	import { onMount, tick } from 'svelte';
	import manifest from './manifest.json';
	import { savePuzzleState, loadPuzzleState } from '$lib/puzzle-utils.js';
	import {
		createAudioRegistry,
		applySolvedToAudios,
		startAudioMix,
		stopAllAudio
	} from '$lib/audio-mix.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import GuessRow from '$lib/components/GuessRow.svelte';
	import ResultOverlay from '$lib/components/ResultOverlay.svelte';
	import { answerMatches } from '$lib/normalize.js';
	import { grt26DSolvedKey, grt26Keys } from '../storage-keys.js';
	import { grt26Prizes } from '../prizes.js';

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
	/** @type {'idle' | 'wrong'} */
	let status = $state('idle');
	let allCompleted = $state(false);
	/** @type {Record<string, boolean>} */
	let audioLoadError = $state(Object.fromEntries(tracks.map((t) => [t.id, false])));
	let needsTap = $state(false);

	const solvedTally = $derived(tracks.filter((t) => solved[t.id]).length);
	const solvedTracksOrdered = $derived(tracks.filter((t) => solved[t.id]));

	const mixTracks = tracks.map((t) => ({ id: t.id, src: `${base}/grt26/d/${t.id}.mp3` }));

	function startMix() {
		needsTap = false;
		startAudioMix({
			tracks: mixTracks,
			solved,
			loadError: audioLoadError,
			audioById: registry.byId,
			seekMode: 'random',
			onNeedsTap: () => {
				needsTap = true;
			},
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
			status = 'idle';
			guessInput = '';
			const a = registry.get(t.id);
			if (a) {
				a.pause();
				a.muted = true;
				a.volume = 0;
			}
			savePuzzleState(grt26DSolvedKey(t.id), '1');
			checkAllCompleted();
		} else {
			status = 'wrong';
		}
	}

	function checkAllCompleted() {
		allCompleted = tracks.every((t) => solved[t.id]);
		if (allCompleted) {
			savePuzzleState(grt26Keys.gameDDone, '1');
			for (const a of registry.all()) {
				a.pause();
				a.muted = true;
			}
		}
	}

	onMount(() => {
		try {
			tracks.forEach((t) => {
				if (loadPuzzleState(grt26DSolvedKey(t.id))) {
					solved[t.id] = true;
				}
			});

			if (loadPuzzleState(grt26Keys.gameDDone)) {
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
	<title>Che canzone è?</title>
</svelte:head>

<BackButton href="/grt26" />

<main>
	<div class="clip-list">
		<p class="progress-hint" aria-live="polite">
			{solvedTally} / {tracks.length}
		</p>

		<div class="audio-layer" aria-hidden="true">
			{#each mixTracks as track (track.id)}
				<audio
					use:audioEl={track.id}
					src={track.src}
					loop
					preload="metadata"
					onerror={() => {
						audioLoadError[track.id] = true;
					}}
				></audio>
			{/each}
		</div>

		{#if needsTap}
			<button type="button" class="start-button" onclick={startMix}>▶ Ascolta</button>
		{/if}

		{#if !allCompleted}
			<GuessRow
				bind:value={guessInput}
				wrong={status === 'wrong'}
				onSubmit={submitGuess}
				ariaDescribedby="grt26d-guess-status"
			/>
			<p id="grt26d-guess-status" class="field-feedback" role="status" aria-live="polite">
				{#if status === 'wrong'}
					Non è questa, riprova.
				{/if}
			</p>
		{/if}

		{#if solvedTracksOrdered.length > 0}
			<div class="solved-titles">
				<ul class="solved-titles-list" aria-live="polite">
					{#each solvedTracksOrdered as t (t.id)}
						<li>{t.title}</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if tracks.some((t) => audioLoadError[t.id])}
			<p class="clip-hint">Audio non disponibile.</p>
		{/if}
	</div>
</main>

{#if allCompleted}
	<ResultOverlay text={grt26Prizes.d} />
{/if}

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		min-height: 100vh;
		padding: 1rem 0.5rem;
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
		color: var(--color-white);
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
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

	.start-button {
		font-size: 1.05em;
		padding: 0.55em 1.4em;
		margin-bottom: 1rem;
		border-radius: 0.5em;
		border: none;
		background: var(--color-theme-2);
		color: var(--color-white);
		font-weight: 600;
		cursor: pointer;
	}

	.field-feedback {
		margin: 0.35rem 0 0;
		min-height: 1.25em;
		font-size: 0.875rem;
		text-align: center;
		color: var(--color-white);
		line-height: 1.35;
	}

	.solved-titles {
		width: 100%;
		max-width: 320px;
		margin-top: 0.65rem;
		text-align: left;
		box-sizing: border-box;
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
		color: var(--color-white);
		opacity: 0.85;
		margin-top: 1rem;
	}
</style>
