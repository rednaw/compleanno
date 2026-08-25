<script>
	import { base } from '$app/paths';
	import { onDestroy, onMount } from 'svelte';
	import { confetti } from '@neoconfetti/svelte';
	import { loadPuzzleState, savePuzzleState } from '$lib/puzzle-utils.js';
	import { lrnz26FinalImage } from '../coordinates.js';
	import { lrnz26Keys } from '../storage-keys.js';
	import { NOTE_DISPLAY, PRESENT_TITLE, PRESENT_URL, noteMatches } from './items.js';
	import DevSkipButton from '../DevSkipButton.svelte';

	let guess = $state('');
	let noteDone = $state(false);
	let showWrong = $state(false);
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let wrongTimer;
	/** @type {(() => void) | undefined} */
	let stopCelebrate;

	const CONFETTI_COLORS = ['#FFC700', '#ff3d33', '#0e61cb', '#ffffff', '#ddd5f4', '#388e3c'];

	function startCelebrate() {
		stopCelebrate?.();

		const layer = document.createElement('div');
		layer.setAttribute('aria-hidden', 'true');
		layer.style.cssText =
			'position:fixed;inset:0;z-index:150;pointer-events:none;overflow:visible';

		/** @param {string} top @param {string} left */
		function burstAt(top, left) {
			const el = document.createElement('div');
			el.style.cssText = `position:absolute;top:${top};left:${left}`;
			layer.append(el);
			return el;
		}

		const left = burstAt('28%', '28%');
		const right = burstAt('22%', '72%');
		document.body.append(layer);

		const opts = {
			particleCount: 140,
			force: 0.72,
			duration: 4500,
			particleSize: 12,
			stageHeight: window.innerHeight,
			stageWidth: window.innerWidth,
			colors: CONFETTI_COLORS
		};
		const instLeft = confetti(left, opts);
		const instRight = confetti(right, { ...opts, particleCount: 110, force: 0.6 });

		const timeout = window.setTimeout(() => {
			stopCelebrate?.();
		}, opts.duration + 400);

		stopCelebrate = () => {
			clearTimeout(timeout);
			instLeft.destroy();
			instRight.destroy();
			layer.remove();
			stopCelebrate = undefined;
		};
	}

	function completeNote() {
		if (noteDone) return;
		noteDone = true;
		showWrong = false;
		guess = NOTE_DISPLAY;
		savePuzzleState(lrnz26Keys.codeNoteDone, '1');
		if (wrongTimer) clearTimeout(wrongTimer);
		startCelebrate();
	}

	function checkNote() {
		if (noteDone || !guess.trim()) return;

		if (noteMatches(guess)) {
			completeNote();
		} else {
			showWrong = true;
			guess = '';
			if (wrongTimer) clearTimeout(wrongTimer);
			wrongTimer = setTimeout(() => {
				showWrong = false;
			}, 1200);
		}
	}

	onMount(() => {
		if (loadPuzzleState(lrnz26Keys.codeNoteDone)) {
			noteDone = true;
			guess = NOTE_DISPLAY;
			startCelebrate();
		}
	});

	onDestroy(() => {
		stopCelebrate?.();
		if (wrongTimer) clearTimeout(wrongTimer);
	});
</script>

{#if !noteDone}
	<DevSkipButton onSkip={completeNote} />
{/if}

<main>
	<div class="finale-wrap">
		<img
			src="{base}/lrnz26/code/{lrnz26FinalImage}"
			alt=""
			class="moshpit"
		/>

		<div
			class="input-row"
			class:input-row--wrong={showWrong}
			class:input-row--solved={noteDone}
		>
			<input
				type="text"
				class="note-input"
				placeholder="Nota"
				aria-label="Nota"
				autocomplete="off"
				spellcheck="false"
				bind:value={guess}
				readonly={noteDone}
				disabled={showWrong}
				aria-invalid={showWrong}
				onkeydown={(e) => !noteDone && e.key === 'Enter' && checkNote()}
			/>
		</div>

		{#if !noteDone}
			<div class="check-row">
				{#if showWrong}
					<p class="wrong-hint" aria-live="polite">Risposta non corretta. Riprova.</p>
				{/if}
				<button
					type="button"
					class="check-btn"
					disabled={!guess.trim() || showWrong}
					onclick={checkNote}
				>
					Controlla
				</button>
			</div>
		{:else}
			<a
				class="present"
				href={PRESENT_URL}
				target="_blank"
				rel="noopener noreferrer"
			>
				{PRESENT_TITLE}
			</a>
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
	}

	.finale-wrap {
		width: 100%;
		max-width: 520px;
		margin-left: auto;
		margin-right: auto;
		box-sizing: border-box;
		text-align: center;
		padding: 5rem 1rem 2rem;
	}

	.moshpit {
		display: block;
		width: 100%;
		border-radius: 0.5rem;
		border: 2px solid var(--color-border);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
		margin-bottom: 0.85rem;
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
		margin-bottom: 0.75rem;
		transition:
			background 0.2s,
			border-color 0.2s;
	}

	.input-row--wrong {
		background: var(--color-error-bg);
		border-color: var(--color-error-border);
	}

	.input-row--solved {
		background: var(--color-success-bg);
		border-color: var(--color-success-border);
	}

	.note-input {
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

	.note-input::placeholder {
		color: #999;
	}

	.input-row--solved .note-input {
		color: var(--color-success-text);
		font-weight: 600;
	}

	.check-row {
		text-align: center;
		margin-bottom: 0.5rem;
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

	.wrong-hint {
		margin: 0 0 0.75rem;
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--color-error-text);
	}

	.present {
		display: block;
		width: 100%;
		box-sizing: border-box;
		margin-top: 0.25rem;
		padding: 1rem 1.1rem 1.15rem;
		border-radius: 0.5rem;
		background: var(--color-white);
		border: 2px solid var(--color-border);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
		font-size: clamp(1.05rem, 4vw, 1.25rem);
		font-weight: 800;
		line-height: 1.3;
		text-wrap: pretty;
		color: var(--color-royal-blue);
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}

	.present:active {
		opacity: 0.85;
	}
</style>
