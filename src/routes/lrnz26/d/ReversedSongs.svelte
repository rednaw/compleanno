<script>
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { tracks, guessMatchesTrack, trackDisplayTitle } from './tracks.js';
	import { saveTrackSolved, loadTrackSolved, saveGroups, loadGroups } from './persistence.js';

	/** @type {{ done: boolean }} */
	let { done = $bindable(false) } = $props();

	/** @type {Record<string, boolean>} */
	let solved = $state(Object.fromEntries(tracks.map((t) => [t.id, false])));

	/** @type {string[][]} */
	let groupTrackIds = $state([tracks.map((t) => t.id)]);

	/** @type {Record<string, string>} */
	let guesses = $state({});

	/** @type {Record<string, 'idle' | 'wrong'>} */
	let guessStatus = $state({});

	/** @type {Record<string, boolean>} */
	let groupPlaying = $state({});

	/** @type {Record<string, boolean>} */
	let audioLoadError = $state(Object.fromEntries(tracks.map((t) => [t.id, false])));

	/** @type {Record<string, HTMLAudioElement | undefined>} */
	const reversedAudioById = {};

	const allCompleted = $derived(tracks.every((t) => solved[t.id]));

	const solvedTracksOrdered = $derived(tracks.filter((t) => solved[t.id]));

	const trackById = Object.fromEntries(tracks.map((t) => [t.id, t]));

	/** @param {string[]} ids */
	function groupIdFor(ids) {
		return ids.join('|');
	}

	/** @type {{ id: string; tracks: typeof tracks; unsolved: typeof tracks }[]} */
	const groups = $derived(
		groupTrackIds.map((ids) => {
			const groupTracks = ids.map((id) => trackById[id]);
			return {
				id: groupIdFor(ids),
				tracks: groupTracks,
				unsolved: groupTracks.filter((t) => !solved[t.id])
			};
		})
	);

	const activeGroups = $derived(groups.filter((g) => g.unsolved.length > 0));

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

	/** @param {string} groupId */
	function groupById(groupId) {
		return groups.find((g) => g.id === groupId);
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

	/** @param {string} groupId */
	function pauseGroup(groupId) {
		const group = groupById(groupId);
		if (!group) return;
		for (const t of group.tracks) {
			reversedAudioById[t.id]?.pause();
		}
		groupPlaying = { ...groupPlaying, [groupId]: false };
	}

	/** @param {string} groupId */
	function playGroup(groupId) {
		const group = groupById(groupId);
		if (!group || allCompleted) return;

		pauseAll();

		const playing = group.unsolved.filter((t) => !audioLoadError[t.id]);
		if (playing.length === 0) return;

		groupPlaying = { [groupId]: true };

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
						groupPlaying = { ...groupPlaying, [groupId]: false };
						return;
					}
					audioLoadError[t.id] = true;
				});
			};

			if (a.readyState >= 1) seekAndPlay();
			else a.addEventListener('loadedmetadata', seekAndPlay, { once: true });
		}
	}

	/** @param {string} groupId */
	function togglePlay(groupId) {
		if (groupPlaying[groupId]) pauseGroup(groupId);
		else playGroup(groupId);
	}

	/** @param {string} groupId */
	function checkGuess(groupId) {
		const group = groupById(groupId);
		if (!group || allCompleted) return;

		const guess = (guesses[groupId] ?? '').trim();
		if (!guess) return;

		const unsolved = group.unsolved;
		const matches = unsolved.filter((t) => guessMatchesTrack(guess, t));

		if (matches.length === 1) {
			const t = matches[0];
			solved[t.id] = true;
			saveTrackSolved(t.id);
			stopTrack(t.id);
			guessStatus[groupId] = 'idle';
			guesses = { ...guesses, [groupId]: '' };
			done = allCompleted;

			if (unsolved.length === 1) {
				pauseGroup(groupId);
			} else if (groupPlaying[groupId]) {
				playGroup(groupId);
			}
		} else {
			guessStatus[groupId] = 'wrong';
			guesses = { ...guesses, [groupId]: '' };
			clearTimeout(wrongTimer);
			wrongTimer = window.setTimeout(() => {
				guessStatus[groupId] = 'idle';
			}, 1200);
		}
	}

	/** @param {string} groupId */
	function chickenOut(groupId) {
		const index = groupTrackIds.findIndex((ids) => groupIdFor(ids) === groupId);
		if (index < 0 || allCompleted) return;

		const ids = groupTrackIds[index];
		if (ids.filter((id) => !solved[id]).length < 2) return;

		pauseAll();
		const mid = Math.floor(ids.length / 2);
		groupTrackIds = [
			...groupTrackIds.slice(0, index),
			ids.slice(0, mid),
			ids.slice(mid),
			...groupTrackIds.slice(index + 1)
		];
		saveGroups(groupTrackIds);
		guesses = { ...guesses, [groupId]: '' };
		guessStatus = { ...guessStatus, [groupId]: 'idle' };
	}

	onMount(() => {
		for (const t of tracks) {
			if (loadTrackSolved(t.id)) solved[t.id] = true;
		}
		groupTrackIds = loadGroups();
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
			{#each activeGroups as group (group.id)}
				<section class="song-group">
					<div
						class="input-row"
						class:input-row-wrong={guessStatus[group.id] === 'wrong'}
					>
						<input
							type="text"
							placeholder="Song or band"
							value={guesses[group.id] ?? ''}
							oninput={(e) => {
								guesses = { ...guesses, [group.id]: e.currentTarget.value };
							}}
							autocomplete="off"
							aria-invalid={guessStatus[group.id] === 'wrong'}
							onkeydown={(e) => e.key === 'Enter' && checkGuess(group.id)}
						/>
					</div>

					<div class="actions-row">
						<button
							type="button"
							class="play-btn"
							onclick={() => togglePlay(group.id)}
							aria-pressed={groupPlaying[group.id] ?? false}
						>
							{groupPlaying[group.id] ? 'Pause' : 'Play'}
						</button>
						<button
							type="button"
							class="check-btn"
							onclick={() => checkGuess(group.id)}
							disabled={!(guesses[group.id] ?? '').trim()}
						>
							Check
						</button>
						{#if group.unsolved.length > 1}
							<button type="button" class="chicken-btn" onclick={() => chickenOut(group.id)}>
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
