<script>
	import { onMount, tick } from 'svelte';
	import {
		createAudioRegistry,
		applySolvedToAudios,
		startAudioMix,
		stopAllAudio
	} from '$lib/audio-mix.js';
	import { answerMatches } from '$lib/normalize.js';
	import { savePuzzleState, loadPuzzleState, clearPuzzleState } from '$lib/puzzle-utils.js';
	import GuessRow from '$lib/components/GuessRow.svelte';

	/**
	 * Layered audio + single guess field + solved tally.
	 * @typedef {{ id: string; title: string; src: string }} MixTrack
	 * @typedef {object} Props
	 * @property {MixTrack[]} tracks
	 * @property {(id: string) => string} solvedKeyFn
	 * @property {string} doneKey
	 * @property {'random' | 'phased'} [seekMode]
	 * @property {string} [startLabel]
	 * @property {string} [submitLabel]
	 * @property {string} [wrongMessage]
	 * @property {(n: number, total: number) => string} [progressLabel]
	 * @property {boolean} [clearDoneWhenIncomplete]
	 * @property {boolean} [allCompleted]
	 * @property {() => void} [onAllCompleted]
	 * @property {import('svelte').Snippet} [children] extra under the form (hints, etc.)
	 */
	/** @type {Props} */
	let {
		tracks,
		solvedKeyFn,
		doneKey,
		seekMode = 'random',
		startLabel = '▶ Ascolta',
		submitLabel = 'OK',
		wrongMessage = '',
		progressLabel = (n, total) => `${n} / ${total}`,
		clearDoneWhenIncomplete = false,
		allCompleted = $bindable(false),
		onAllCompleted,
		children
	} = $props();

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
	/** @type {Record<string, boolean>} */
	let audioLoadError = $state(Object.fromEntries(tracks.map((t) => [t.id, false])));
	let needsTap = $state(false);

	const solvedTally = $derived(tracks.filter((t) => solved[t.id]).length);
	const solvedTracksOrdered = $derived(tracks.filter((t) => solved[t.id]));

	function startMix() {
		needsTap = false;
		startAudioMix({
			tracks,
			solved,
			loadError: audioLoadError,
			audioById: registry.byId,
			seekMode,
			onNeedsTap: () => {
				needsTap = true;
			},
			onLoadError: (id) => {
				audioLoadError[id] = true;
			}
		});
	}

	function checkAllCompleted() {
		const done = tracks.every((t) => solved[t.id]);
		allCompleted = done;
		if (done) {
			savePuzzleState(doneKey, '1');
			onAllCompleted?.();
			for (const a of registry.all()) {
				a.pause();
				a.muted = true;
			}
		} else if (clearDoneWhenIncomplete) {
			clearPuzzleState(doneKey);
		}
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
			savePuzzleState(solvedKeyFn(t.id), '1');
			checkAllCompleted();
		} else {
			status = 'wrong';
			if (clearDoneWhenIncomplete) guessInput = '';
		}
	}

	onMount(() => {
		try {
			for (const t of tracks) {
				if (loadPuzzleState(solvedKeyFn(t.id))) solved[t.id] = true;
			}
			if (loadPuzzleState(doneKey)) allCompleted = true;
			else checkAllCompleted();
		} catch {
			/* localStorage may be unavailable */
		}

		void tick().then(() => {
			applySolvedToAudios(tracks, solved, registry.byId);
			if (!allCompleted) startMix();
		});

		return () => stopAllAudio(registry.byId);
	});
</script>

{#if !allCompleted}
	<div class="clip-list">
		<p class="progress-hint" aria-live="polite">
			{progressLabel(solvedTally, tracks.length)}
		</p>

		<div class="audio-layer" aria-hidden="true">
			{#each tracks as track (track.id)}
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
			<button type="button" class="start-button" onclick={startMix}>{startLabel}</button>
		{/if}

		<GuessRow
			bind:value={guessInput}
			wrong={status === 'wrong'}
			{submitLabel}
			onSubmit={submitGuess}
			ariaDescribedby={wrongMessage ? 'audio-mix-guess-status' : undefined}
		/>
		{#if wrongMessage}
			<p id="audio-mix-guess-status" class="field-feedback" role="status" aria-live="polite">
				{#if status === 'wrong'}
					{wrongMessage}
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

		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}

<style>
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
		opacity: 0.85;
		margin-top: 1rem;
	}
</style>
