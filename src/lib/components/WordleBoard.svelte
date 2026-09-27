<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { Game } from '$lib/wordle/Game.js';
	import {
		savePuzzleState,
		loadPuzzleState,
		loadPuzzleValue,
		clearPuzzleState
	} from '$lib/puzzle-utils.js';

	/**
	 * Five-letter Wordle board + keyboard. Answer and storage keys are trail-injected.
	 * @typedef {object} Props
	 * @property {string} answer
	 * @property {string} [storageKey] localStorage key for serialized Game
	 * @property {string} [doneKey] hub completion flag
	 * @property {boolean} [restartable]
	 * @property {import('svelte').Snippet} [children] heading / chrome above the grid
	 * @property {import('svelte').Snippet<[ { won: boolean; restart: () => void } ]>} [result] shown when game over
	 * @property {() => void} [onWon]
	 */
	/** @type {Props} */
	let {
		answer,
		storageKey = '',
		doneKey = '',
		restartable = false,
		children,
		result,
		onWon
	} = $props();

	const ROWS = [0, 1, 2, 3, 4, 5];
	const COLS = [0, 1, 2, 3, 4];
	const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

	let game = new Game({ answer });
	let guesses = $state([...game.guesses]);
	let answers = $state([...game.answers]);
	let currentGuess = $state('');
	let won = $state(false);
	let badGuess = $state(false);

	const gameOver = $derived(won || answers.length >= 6);

	/** @type {(e: KeyboardEvent) => void} */
	let onKeyDown;

	function loadGame() {
		const serialized = storageKey ? loadPuzzleValue(storageKey) : null;
		game = new Game({ answer, serialized });
		guesses = [...game.guesses];
		answers = [...game.answers];
		currentGuess = guesses[answers.length] || '';
		const playedWin = answers.at(-1) === 'xxxxx';
		if (playedWin && doneKey) savePuzzleState(doneKey, '1');
		won = playedWin || (doneKey ? loadPuzzleState(doneKey) : false);
		if (won) onWon?.();
	}

	function saveGame() {
		if (storageKey) savePuzzleState(storageKey, game.toString());
	}

	/** @param {string} key */
	function handleKey(key) {
		if (won || answers.length >= 6) return;
		if (key === 'backspace') {
			currentGuess = currentGuess.slice(0, -1);
			badGuess = false;
		} else if (key === 'enter') {
			if (currentGuess.length === 5) {
				const valid = game.enter(currentGuess.split(''));
				if (!valid) {
					badGuess = true;
					return;
				}
				saveGame();
				loadGame();
				currentGuess = '';
			}
		} else if (/^[a-z]$/.test(key) && currentGuess.length < 5) {
			currentGuess += key;
			badGuess = false;
		}
	}

	function restart() {
		if (storageKey) clearPuzzleState(storageKey);
		if (doneKey) clearPuzzleState(doneKey);
		game = new Game({ answer });
		guesses = [...game.guesses];
		answers = [...game.answers];
		currentGuess = '';
		won = false;
		badGuess = false;
	}

	onMount(() => {
		if (browser) {
			onKeyDown = (e) => {
				if (e.metaKey || e.ctrlKey || e.altKey) return;
				if (e.key === 'Enter') handleKey('enter');
				else if (e.key === 'Backspace') handleKey('backspace');
				else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toLowerCase());
			};
			window.addEventListener('keydown', onKeyDown);
		}
		loadGame();
	});

	onDestroy(() => {
		if (browser && onKeyDown) window.removeEventListener('keydown', onKeyDown);
	});
</script>

<div class="main-container">
	{#if children}
		{@render children()}
	{/if}
	<div class="game">
		{#each ROWS as row (row)}
			<div
				class="row"
				class:current={row === answers.length && !gameOver}
				class:bad-guess={badGuess && row === answers.length}
			>
				{#each COLS as col (col)}
					{#if row < answers.length}
						<div
							class="letter"
							class:exact={answers[row][col] === 'x'}
							class:close={answers[row][col] === 'c'}
							class:missing={answers[row][col] === '_'}
						>
							{guesses[row]?.[col] || ''}
						</div>
					{:else if row === answers.length && !gameOver}
						<div class="letter">{currentGuess[col] || ''}</div>
					{:else}
						<div class="letter"></div>
					{/if}
				{/each}
			</div>
		{/each}
	</div>

	{#if gameOver}
		{#if result}
			{@render result({ won, restart })}
		{:else if won}
			{#if restartable}
				<div class="result">
					<button type="button" onclick={restart}>Riprova</button>
				</div>
			{/if}
		{:else}
			<div class="result">
				<p class="lose-msg">Era <strong>{answer}</strong></p>
				<button type="button" onclick={restart}>Riprova</button>
			</div>
		{/if}
	{:else}
		<div class="keyboard">
			{#each KEYBOARD_ROWS as row (row)}
				<div class="kb-row">
					{#each row.split('') as key (key)}
						<button type="button" onclick={() => handleKey(key)}>{key}</button>
					{/each}
					{#if row === 'zxcvbnm'}
						<button type="button" onclick={() => handleKey('backspace')}>←</button>
						<button
							type="button"
							onclick={() => handleKey('enter')}
							disabled={currentGuess.length !== 5}
						>
							Enter
						</button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.main-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 1em;
		box-shadow: 0 4px 32px rgba(0, 0, 0, 0.1);
		padding: 2em 2em 1em 2em;
		max-width: 420px;
		width: 100%;
		margin: 5em auto 2em auto;
		box-sizing: border-box;
	}

	.game {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		margin-bottom: 1em;
		align-items: center;
	}

	.row {
		display: flex;
		gap: 0.25em;
	}

	.letter {
		width: 2em;
		height: 2em;
		border: 2px solid var(--color-border);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5em;
		background: var(--color-white);
		text-transform: uppercase;
		color: var(--color-text);
		font-weight: 600;
		border-radius: 0.5em;
	}

	.exact {
		background: var(--color-exact, #4caf50);
		color: var(--color-white);
		border-color: var(--color-exact, #4caf50);
	}

	.close {
		background: var(--color-close, #ffc107);
		color: var(--color-white);
		border-color: var(--color-close, #ffc107);
	}

	.missing {
		background: var(--color-missing, #90a4ae);
		color: var(--color-white);
		border-color: var(--color-missing, #90a4ae);
	}

	.current {
		border-bottom: 2px solid var(--color-border-active, var(--color-border));
	}

	.bad-guess {
		animation: shake 0.2s 2;
	}

	@keyframes shake {
		0% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-5px);
		}
		50% {
			transform: translateX(5px);
		}
		75% {
			transform: translateX(-5px);
		}
		100% {
			transform: translateX(0);
		}
	}

	.keyboard {
		display: flex;
		flex-direction: column;
		gap: 0.25em;
		align-items: center;
	}

	.kb-row {
		display: flex;
		gap: 0.25em;
	}

	button {
		padding: 0.5em 1em;
		font-size: 1em;
		border: 2px solid var(--color-border);
		background: var(--color-white);
		color: var(--color-text);
		cursor: pointer;
		border-radius: 0.5em;
		transition: all 0.2s;
		font-weight: 500;
	}

	button:hover {
		background: var(--color-hover-bg);
		border-color: var(--color-hover-border);
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.result {
		margin-top: 1em;
		text-align: center;
	}

	.lose-msg {
		margin: 0 0 0.75rem;
		font-size: 1.1rem;
		color: var(--color-text);
	}

	@media (max-width: 500px) {
		.main-container {
			max-width: 98vw;
			padding: 1em 0.2em 0.5em 0.2em;
		}

		.game {
			width: 100%;
		}

		.row {
			width: 100%;
			justify-content: center;
		}

		.letter {
			width: 2.2em;
			height: 2.2em;
			font-size: 1.1em;
		}

		.keyboard {
			width: 100%;
			max-width: 100vw;
		}

		.kb-row {
			width: 100%;
			justify-content: center;
		}

		button {
			padding: 0.3em 0.5em;
			font-size: 0.95em;
			min-width: 2.2em;
		}
	}
</style>
