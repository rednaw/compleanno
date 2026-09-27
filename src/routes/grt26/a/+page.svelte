<script>
	import { onMount, onDestroy } from 'svelte';
	import { Game } from '$lib/wordle/Game.js';
	import { browser } from '$app/environment';
		import { savePuzzleState, loadPuzzleState, loadPuzzleValue } from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import { grt26Keys } from '../storage-keys.js';
	import { grt26Prizes } from '../prizes.js';
	import ResultOverlay from '$lib/components/ResultOverlay.svelte';

	const ANSWER = 'sofia';
	const ROWS = [0, 1, 2, 3, 4, 5];
	const COLS = [0, 1, 2, 3, 4];
	const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

	let game = new Game({ answer: ANSWER });
	let guesses = $state([...game.guesses]);
	let answers = $state([...game.answers]);
	let currentGuess = $state('');
	let won = $state(false);
	let badGuess = $state(false);

	const gameOver = $derived(won || answers.length >= 6);

	/** @type {(e: KeyboardEvent) => void} */
	let onKeyDown;

	function loadGame() {
		game = new Game({ answer: ANSWER, serialized: loadPuzzleValue(grt26Keys.wordle) });
		guesses = [...game.guesses];
		answers = [...game.answers];
		currentGuess = guesses[answers.length] || '';
		const playedWin = answers.at(-1) === 'xxxxx';
		if (playedWin) savePuzzleState(grt26Keys.gameADone, '1');
		// Stays won even if only the board state was cleared
		won = playedWin || loadPuzzleState(grt26Keys.gameADone);
	}

	function saveGame() {
		savePuzzleState(grt26Keys.wordle, game.toString());
	}

	function handleKey(key) {
		if (gameOver) return;
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
		if (browser && onKeyDown) {
			window.removeEventListener('keydown', onKeyDown);
		}
	});
</script>

<svelte:head>
	<title>Indovina la parola</title>
</svelte:head>

<BackButton href="/grt26" />

<main class="main-container">
	<h1>Indovina la parola</h1>
	<div class="game">
		{#each ROWS as row (row)}
			<div
				class="row {row === answers.length && !gameOver ? 'current' : ''} {badGuess &&
				row === answers.length
					? 'bad-guess'
					: ''}"
			>
				{#each COLS as col (col)}
					{#if row < answers.length}
						<div
							class="letter {answers[row][col] === 'x'
								? 'exact'
								: answers[row][col] === 'c'
									? 'close'
									: answers[row][col] === '_'
										? 'missing'
										: ''}"
						>
							{guesses[row][col] || ''}
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

	{#if !gameOver}
		<div class="keyboard">
			{#each KEYBOARD_ROWS as row (row)}
				<div class="kb-row">
					{#each row.split('') as key (key)}
						<button onclick={() => handleKey(key)}>{key}</button>
					{/each}
					{#if row === 'zxcvbnm'}
						<button onclick={() => handleKey('backspace')}>←</button>
						<button onclick={() => handleKey('enter')} disabled={currentGuess.length !== 5}>
							Enter
						</button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</main>

{#if won}
	<ResultOverlay text={grt26Prizes.a} />
{/if}

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
		background: var(--color-exact);
		color: var(--color-white);
		border-color: var(--color-exact);
	}
	.close {
		background: var(--color-close);
		color: var(--color-white);
		border-color: var(--color-close);
	}
	.missing {
		background: var(--color-missing);
		color: var(--color-white);
		border-color: var(--color-missing);
	}
	.current {
		border-bottom: 2px solid var(--color-border-active);
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
