<script>
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { tracks, guessMatchesTrack, trackDisplayTitle } from './tracks.js';
	import {
		saveTrackSolved,
		loadTrackSolved,
		saveSplitLevel,
		loadSplitLevel
	} from './persistence.js';

	/** @type {{ done: boolean }} */
	let { done = $bindable(false) } = $props();

	/** @type {Record<string, boolean>} */
	let solved = $state(Object.fromEntries(tracks.map((t) => [t.id, false])));

	/** 0 = one field (4 songs), 1 = two fields (2 each), 2 = four fields (1 each). */
	/** @type {0 | 1 | 2} */
	let splitLevel = $state(0);

	/** @type {Record<number, string>} */
	let guesses = $state({});

	/** @type {Record<number, 'idle' | 'wrong'>} */
	let guessStatus = $state({});

	/** @type {Record<number, boolean>} */
	let groupPlaying = $state({});

	/** @type {Record<string, boolean>} */
	let audioLoadError = $state(Object.fromEntries(tracks.map((t) => [t.id, false])));

	/** @type {Record<string, HTMLAudioElement | undefined>} */
	const reversedAudioById = {};

	const allCompleted = $derived(tracks.every((t) => solved[t.id]));

	const solvedTracksOrdered = $derived(tracks.filter((t) => solved[t.id]));

	/** @type {{ index: number; tracks: typeof tracks }[]} */
	const groups = $derived.by(() => {
		const numGroups = 2 ** splitLevel;
		const size = tracks.length / numGroups;
		return Array.from({ length: numGroups }, (_, i) => ({
			index: i,
			tracks: tracks.slice(i * size, (i + 1) * size)
		}));
	});

	const activeGroups = $derived(
		groups.filter((g) => g.tracks.some((t) => !solved[t.id]))
	);

	const DEFAULT_LOOP_SEC = 20;

	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let wrongTimer;

	/** @param {string} id */
	function trackSrc(id) {
		return `${base}/lrnz26/d/${id}-reversed.mp3`;
	}

	/** @param {HTMLElement} node @param {{ id: string }} opts */
	function audioEl(node, opts) {
		const { id } = opts;
		const el = /** @type {HTMLAudioElement} */ (node);
		reversedAudioById[id] = el;
		return {
			destroy() {
				if (reversedAudioById[id] === el) delete reversedAudioById[id];
			}
		};
	}

	/** @param {number} trackIndex @param {number} count @param {number} loopSec */
	function phaseOffsetSec(trackIndex, count, loopSec) {
		if (count <= 1) return 0;
		return (trackIndex / count) * loopSec;
	}

	/** @param {typeof tracks} groupTracks */
	function unsolvedInGroup(groupTracks) {
		return groupTracks.filter((t) => !solved[t.id] && !audioLoadError[t.id]);
	}

	/** @param {number} groupIndex */
	function groupAt(groupIndex) {
		return groups.find((g) => g.index === groupIndex);
	}

	function pauseAll() {
		for (const t of tracks) {
			reversedAudioById[t.id]?.pause();
		}
		groupPlaying = {};
	}

	/** @param {string} id */
	function stopTrack(id) {
		const rev = reversedAudioById[id];
		if (rev) {
			rev.pause();
			rev.muted = true;
			rev.volume = 0;
		}
	}

	/** @param {number} groupIndex */
	function pauseGroup(groupIndex) {
		const group = groupAt(groupIndex);
		if (!group) return;
		for (const t of group.tracks) {
			reversedAudioById[t.id]?.pause();
		}
		groupPlaying = { ...groupPlaying, [groupIndex]: false };
	}

	/** @param {number} groupIndex */
	function playGroup(groupIndex) {
		const group = groupAt(groupIndex);
		if (!group || allCompleted) return;

		for (const g of groups) {
			if (g.index !== groupIndex) pauseGroup(g.index);
		}

		const playing = unsolvedInGroup(group.tracks);
		if (playing.length === 0) return;

		groupPlaying = { ...groupPlaying, [groupIndex]: true };

		for (let i = 0; i < playing.length; i++) {
			const t = playing[i];
			const a = reversedAudioById[t.id];
			if (!a) continue;

			const seekAndPlay = () => {
				const loopSec =
					Number.isFinite(a.duration) && a.duration > 0.1 ? a.duration : DEFAULT_LOOP_SEC;
				const offset = phaseOffsetSec(i, playing.length, loopSec);
				a.currentTime = Math.min(offset, Math.max(0, loopSec - 0.05));
				a.muted = false;
				a.volume = 1;
				a.play().catch((err) => {
					if (err instanceof DOMException && err.name === 'NotAllowedError') {
						groupPlaying = { ...groupPlaying, [groupIndex]: false };
						return;
					}
					audioLoadError[t.id] = true;
				});
			};

			if (a.readyState >= 1) seekAndPlay();
			else a.addEventListener('loadedmetadata', seekAndPlay, { once: true });
		}
	}

	/** @param {number} groupIndex */
	function togglePlay(groupIndex) {
		if (groupPlaying[groupIndex]) pauseGroup(groupIndex);
		else playGroup(groupIndex);
	}

	/** @param {number} groupIndex */
	function checkGuess(groupIndex) {
		const group = groupAt(groupIndex);
		if (!group || allCompleted) return;

		const guess = (guesses[groupIndex] ?? '').trim();
		if (!guess) return;

		const unsolved = group.tracks.filter((t) => !solved[t.id]);
		const matches = unsolved.filter((t) => guessMatchesTrack(guess, t));

		if (matches.length === 1) {
			const t = matches[0];
			solved[t.id] = true;
			saveTrackSolved(t.id);
			stopTrack(t.id);
			guessStatus[groupIndex] = 'idle';
			guesses = { ...guesses, [groupIndex]: '' };
			done = allCompleted;

			if (unsolvedInGroup(group.tracks).length === 0) {
				pauseGroup(groupIndex);
			} else if (groupPlaying[groupIndex]) {
				playGroup(groupIndex);
			}
		} else {
			guessStatus[groupIndex] = 'wrong';
			guesses = { ...guesses, [groupIndex]: '' };
			clearTimeout(wrongTimer);
			wrongTimer = window.setTimeout(() => {
				guessStatus[groupIndex] = 'idle';
			}, 1200);
		}
	}

	function chickenOut() {
		if (allCompleted || splitLevel >= 2) return;
		splitLevel = /** @type {0 | 1 | 2} */ (splitLevel + 1);
		saveSplitLevel(splitLevel);
		pauseAll();
	}

	onMount(() => {
		for (const t of tracks) {
			if (loadTrackSolved(t.id)) solved[t.id] = true;
		}
		splitLevel = loadSplitLevel();
		done = allCompleted;

		return () => {
			clearTimeout(wrongTimer);
			pauseAll();
		};
	});
</script>

<div class="reversed-songs">
	<div class="audio-layer" aria-hidden="true">
		{#each tracks as track (track.id)}
			<audio
				use:audioEl={{ id: track.id }}
				src={trackSrc(track.id)}
				loop
				preload="auto"
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
		<div class="groups-stack">
			{#each activeGroups as group (group.index)}
				{@const unsolved = group.tracks.filter((t) => !solved[t.id])}
				<section class="song-group" aria-label="Song group {group.index + 1}">
					{#if splitLevel > 0 && unsolved.length > 1}
						<p class="group-hint">{unsolved.length} songs</p>
					{/if}

					<div
						class="input-row"
						class:input-row-wrong={guessStatus[group.index] === 'wrong'}
					>
						<input
							type="text"
							placeholder="Song or band"
							value={guesses[group.index] ?? ''}
							oninput={(e) => {
								guesses = { ...guesses, [group.index]: e.currentTarget.value };
							}}
							autocomplete="off"
							aria-invalid={guessStatus[group.index] === 'wrong'}
							onkeydown={(e) => e.key === 'Enter' && checkGuess(group.index)}
						/>
					</div>

					<div class="actions-row">
						<button
							type="button"
							class="play-btn"
							onclick={() => togglePlay(group.index)}
							aria-pressed={groupPlaying[group.index] ?? false}
						>
							{groupPlaying[group.index] ? 'Pause' : 'Play'}
						</button>
						<button
							type="button"
							class="check-btn"
							onclick={() => checkGuess(group.index)}
							disabled={!(guesses[group.index] ?? '').trim()}
						>
							Check
						</button>
						{#if splitLevel < 2}
							<button type="button" class="chicken-btn" onclick={() => chickenOut()}>
								Chicken out
							</button>
						{/if}
					</div>
				</section>
			{/each}
		</div>
	{/if}

	{#if tracks.some((t) => audioLoadError[t.id])}
		<p class="audio-hint">Some audio failed to load.</p>
	{/if}
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

	.groups-stack {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		width: 100%;
	}

	.song-group {
		width: 100%;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.08);
	}

	.song-group:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.group-hint {
		margin: 0 0 0.5rem;
		font-size: 0.8rem;
		opacity: 0.65;
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
		gap: 0.65rem;
		flex-wrap: wrap;
	}

	.play-btn,
	.check-btn {
		font-size: 1.05em;
		padding: 0.55em 1.25em;
		border-radius: 0.5em;
		border: none;
		font-weight: 700;
		cursor: pointer;
	}

	.play-btn {
		background: var(--color-white);
		border: 2px solid var(--color-border);
		color: var(--color-text);
	}

	.check-btn {
		background: var(--color-royal-blue);
		color: var(--color-white);
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
</style>
