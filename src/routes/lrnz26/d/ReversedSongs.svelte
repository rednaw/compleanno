<script>
	import { base } from '$app/paths';
	import { onMount, tick } from 'svelte';
	import { tracks, guessMatchesTrack, trackDisplayTitle } from './tracks.js';
	import {
		saveTrackSolved,
		loadTrackSolved,
		saveNormalCount,
		loadNormalCount
	} from './persistence.js';
	import CheatTuner from './CheatTuner.svelte';

	/** @type {{ done: boolean }} */
	let { done = $bindable(false) } = $props();

	/** @type {Record<string, boolean>} */
	let solved = $state(Object.fromEntries(tracks.map((t) => [t.id, false])));

	let guess = $state('');
	/** @type {'not-started' | 'wrong'} */
	let guessStatus = $state('not-started');

	/** How many tracks (in manifest order) play forward instead of reversed. */
	let normalCount = $state(0);

	/** @type {Record<string, boolean>} */
	let audioLoadError = $state(Object.fromEntries(tracks.map((t) => [t.id, false])));

	/** @type {Record<string, HTMLAudioElement | undefined>} */
	const forwardAudioById = {};

	/** @type {Record<string, HTMLAudioElement | undefined>} */
	const reversedAudioById = {};

	const allCompleted = $derived(tracks.every((t) => solved[t.id]));

	const unsolvedTracks = $derived(tracks.filter((t) => !solved[t.id]));

	const solvedTracksOrdered = $derived(tracks.filter((t) => solved[t.id]));

	/** Nominal loop length (s) when metadata not ready yet; clips are ~20s from extract_d. */
	const DEFAULT_LOOP_SEC = 20;

	/** @param {string} id @param {'forward' | 'reversed'} kind */
	function trackSrc(id, kind) {
		return kind === 'forward'
			? `${base}/lrnz26/d/${id}.mp3`
			: `${base}/lrnz26/d/${id}-reversed.mp3`;
	}

	/** @param {HTMLElement} node @param {{ id: string; kind: 'forward' | 'reversed' }} opts */
	function audioEl(node, opts) {
		const { id, kind } = opts;
		const el = /** @type {HTMLAudioElement} */ (node);
		if (kind === 'forward') forwardAudioById[id] = el;
		else reversedAudioById[id] = el;
		return {
			destroy() {
				if (kind === 'forward' && forwardAudioById[id] === el) delete forwardAudioById[id];
				if (kind === 'reversed' && reversedAudioById[id] === el) delete reversedAudioById[id];
			}
		};
	}

	/** @param {number} trackIndex @param {number} count @param {number} loopSec */
	function phaseOffsetSec(trackIndex, count, loopSec) {
		if (count <= 1) return 0;
		return (trackIndex / count) * loopSec;
	}

	/** @param {number} trackIndex */
	function trackPlaysNormal(trackIndex) {
		return trackIndex < normalCount;
	}

	/** @param {string} id */
	function activeAudio(id) {
		const trackIndex = tracks.findIndex((t) => t.id === id);
		return trackPlaysNormal(trackIndex) ? forwardAudioById[id] : reversedAudioById[id];
	}

	function pauseAll() {
		for (const t of tracks) {
			forwardAudioById[t.id]?.pause();
			reversedAudioById[t.id]?.pause();
		}
	}

	/** @param {string} id */
	function stopTrack(id) {
		forwardAudioById[id]?.pause();
		reversedAudioById[id]?.pause();
		const fwd = forwardAudioById[id];
		const rev = reversedAudioById[id];
		if (fwd) {
			fwd.muted = true;
			fwd.volume = 0;
		}
		if (rev) {
			rev.muted = true;
			rev.volume = 0;
		}
	}

	function startMix() {
		if (allCompleted || unsolvedTracks.length === 0) return;

		pauseAll();
		for (const t of tracks) stopTrack(t.id);

		const playing = unsolvedTracks.filter((t) => !audioLoadError[t.id]);
		if (playing.length === 0) return;

		for (let i = 0; i < playing.length; i++) {
			const t = playing[i];
			const a = activeAudio(t.id);
			if (!a) continue;

			const seekAndPlay = () => {
				const loopSec =
					Number.isFinite(a.duration) && a.duration > 0.1 ? a.duration : DEFAULT_LOOP_SEC;
				const offset = phaseOffsetSec(i, playing.length, loopSec);
				a.currentTime = Math.min(offset, Math.max(0, loopSec - 0.05));
				a.muted = false;
				a.volume = 1;
				a.play().catch(() => {
					audioLoadError[t.id] = true;
				});
			};

			if (a.readyState >= 1) seekAndPlay();
			else a.addEventListener('loadedmetadata', seekAndPlay, { once: true });
		}
	}

	function checkGuess() {
		if (allCompleted || !guess.trim()) return;

		const matches = unsolvedTracks.filter((t) => guessMatchesTrack(guess, t));

		if (matches.length === 1) {
			const t = matches[0];
			solved[t.id] = true;
			saveTrackSolved(t.id);
			stopTrack(t.id);
			guessStatus = 'not-started';
			guess = '';
			done = tracks.every((tr) => solved[tr.id]);
			if (!done) startMix();
		} else {
			guessStatus = 'wrong';
			guess = '';
			window.setTimeout(() => {
				guessStatus = 'not-started';
			}, 1200);
		}
	}

	function chickenOut() {
		if (allCompleted || normalCount >= tracks.length) return;
		normalCount += 1;
		saveNormalCount(normalCount);
		startMix();
	}

	onMount(() => {
		try {
			tracks.forEach((t) => {
				if (loadTrackSolved(t.id)) solved[t.id] = true;
			});
			normalCount = loadNormalCount();
			done = tracks.every((t) => solved[t.id]);
		} catch { /* localStorage may be unavailable */ }

		void tick().then(() => {
			if (!done) startMix();
		});

		return () => pauseAll();
	});
</script>

<div class="reversed-songs" data-phase-complete={done}>
	<div class="audio-layer" aria-hidden="true">
		{#each tracks as track (track.id)}
			<audio
				use:audioEl={{ id: track.id, kind: 'forward' }}
				src={trackSrc(track.id, 'forward')}
				loop
				preload="metadata"
				onerror={() => {
					audioLoadError[track.id] = true;
				}}
			></audio>
			<audio
				use:audioEl={{ id: track.id, kind: 'reversed' }}
				src={trackSrc(track.id, 'reversed')}
				loop
				preload="metadata"
				onerror={() => {
					audioLoadError[track.id] = true;
				}}
			></audio>
		{/each}
	</div>

	{#if solvedTracksOrdered.length > 0}
		<div class="solved-labels" aria-live="polite">
			{#each solvedTracksOrdered as track (track.id)}
				<span class="solved-label">{trackDisplayTitle(track)}</span>
			{/each}
		</div>
	{/if}

	{#if !allCompleted}
		<div class="input-row" class:input-row-wrong={guessStatus === 'wrong'}>
			<input
				type="text"
				placeholder="Song or band"
				bind:value={guess}
				autocomplete="off"
				aria-invalid={guessStatus === 'wrong'}
				onkeydown={(e) => e.key === 'Enter' && checkGuess()}
			/>
		</div>

		<div class="actions-row">
			<button type="button" class="check-btn" onclick={() => checkGuess()} disabled={!guess.trim()}>
				Check
			</button>
			{#if normalCount < tracks.length}
				<button type="button" class="chicken-btn" onclick={() => chickenOut()}>Chicken out</button>
			{/if}
		</div>
	{/if}

	{#if tracks.some((t) => audioLoadError[t.id])}
		<p class="audio-hint">Some audio failed to load — run <code>scripts/lrnz26/extract_d.py</code></p>
	{/if}

	<CheatTuner onPauseAll={pauseAll} />
</div>

<style>
	.reversed-songs {
		width: 100%;
	}

	.audio-layer {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
		pointer-events: none;
		opacity: 0;
	}

	.solved-labels {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
		width: 100%;
	}

	.solved-label {
		display: inline-block;
		padding: 0.4em 0.75em;
		border-radius: 999px;
		background: var(--color-success-bg);
		border: 2px solid var(--color-success-border);
		color: var(--color-success-text);
		font-size: 0.95em;
		font-weight: 600;
		line-height: 1.3;
		text-align: center;
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

	.actions-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		flex-wrap: wrap;
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

	.chicken-btn:hover {
		opacity: 1;
	}

	.audio-hint {
		margin: 1rem 0 0;
		font-size: 0.75rem;
		color: var(--color-text);
		opacity: 0.85;
		text-align: center;
	}

	.audio-hint code {
		font-size: 0.68rem;
	}
</style>
