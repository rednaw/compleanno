<script>
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		checkOrientation,
		setupOrientationListeners,
		savePuzzleState,
		loadPuzzleState,
		clearPuzzleState
	} from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import RotateMessage from '$lib/components/RotateMessage.svelte';
	import { gcm26HubDigit } from '$lib/gcm26-hub-digits.js';

	const ITEMS = [
		{
			id: 'gawx',
			question: 'Wat is de nieuwe naam van Gawx?',
			answer: 'Aqasix Yanagawn'
		},
		{
			id: 'nuatoma',
			question: 'Hoe heet de leider van een clan van de Unkalaki?',
			answer: 'Nuatoma'
		},
		{
			id: 'karavaniga',
			question: 'Hoe heet de tweede kleindochter van Taravangian?',
			answer: 'Karavaniga'
		}
	];

	let showRotateMessage = $state(false);

	/** @param {string} s */
	function normalizeAnswer(s) {
		return s
			.trim()
			.toLowerCase()
			.normalize('NFD')
			.replace(/\p{M}/gu, '')
			.replace(/\s+/g, ' ');
	}

	/** @type {string[]} */
	let guesses = $state(ITEMS.map(() => ''));
	/** @type {('not-started' | 'wrong' | 'correct')[]} */
	let rowStatus = $state(ITEMS.map(() => /** @type {'not-started'} */ ('not-started')));

	let allCompleted = $state(false);

	const solvedCount = $derived(ITEMS.filter((_, i) => rowStatus[i] === 'correct').length);

	function checkAllCompleted() {
		allCompleted = ITEMS.every((_, i) => rowStatus[i] === 'correct');
		if (allCompleted) {
			savePuzzleState('gcm26_game_c_done', '1');
		} else {
			clearPuzzleState('gcm26_game_c_done');
		}
	}

	/** @param {number} index */
	function checkItem(index) {
		if (allCompleted || rowStatus[index] === 'correct') return;
		const g = guesses[index];
		if (!g.trim()) return;
		const expected = ITEMS[index].answer;
		if (normalizeAnswer(g) === normalizeAnswer(expected)) {
			rowStatus = rowStatus.map((s, i) => (i === index ? 'correct' : s));
			guesses = guesses.map((v, i) => (i === index ? expected : v));
			try {
				savePuzzleState(`gcm26_c_${ITEMS[index].id}`, '1');
			} catch {
				void 0;
			}
			checkAllCompleted();
		} else {
			rowStatus = rowStatus.map((s, i) => (i === index ? 'wrong' : s));
			guesses = guesses.map((v, i) => (i === index ? '' : v));
		}
	}

	onMount(() => {
		try {
			const nextGuesses = [...guesses];
			const nextStatus = [...rowStatus];
			ITEMS.forEach((item, index) => {
				if (loadPuzzleState(`gcm26_c_${item.id}`)) {
					nextStatus[index] = 'correct';
					nextGuesses[index] = item.answer;
				}
			});
			guesses = nextGuesses;
			rowStatus = nextStatus;

			if (loadPuzzleState('gcm26_game_c_done')) {
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
		return setupOrientationListeners(updateOrientation);
	});
</script>

<svelte:head>
	<title>GCM 26 — C</title>
</svelte:head>

<BackButton href={resolve('/gcm26')} />

<RotateMessage show={showRotateMessage} encouragePortrait={true} />

{#if !showRotateMessage}
	<main>
		<div class="quiz-wrap">
			<p class="progress-hint" aria-live="polite">
				{solvedCount} / {ITEMS.length} vragen goed
			</p>

			{#each ITEMS as item, i (item.id)}
				<div class="quiz-item">
					<div class="clip-row question-row">
						<p class="quiz-question">{item.question}</p>
					</div>
					<div
						class="input-row answer-row"
						class:input-row-solved={rowStatus[i] === 'correct'}
						class:answer-row-wrong={rowStatus[i] === 'wrong'}
					>
						<input
							type="text"
							placeholder="Antwoord"
							bind:value={guesses[i]}
							autocomplete="off"
							readonly={rowStatus[i] === 'correct'}
							onkeydown={(e) => rowStatus[i] !== 'correct' && e.key === 'Enter' && checkItem(i)}
						/>
						{#if rowStatus[i] !== 'correct'}
							<button
								type="button"
								onclick={() => checkItem(i)}
								disabled={!guesses[i].trim()}
							>
								Controleer
							</button>
						{:else}
							<span class="feedback correct" aria-hidden="true">✅</span>
						{/if}
					</div>
				</div>
			{/each}

			{#if allCompleted}
				<div class="result-section">
					<p class="result-text">
						<span class="result-emoji" aria-hidden="true">🎉</span>
						<span class="result-digit">{gcm26HubDigit.c}</span>
					</p>
				</div>
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

	.quiz-wrap {
		width: 100%;
		max-width: 520px;
		margin-left: auto;
		margin-right: auto;
		box-sizing: border-box;
		text-align: center;
	}

	.progress-hint {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 1.5rem;
		-webkit-font-smoothing: antialiased;
	}

	.quiz-item {
		margin-bottom: 2rem;
		width: 100%;
		text-align: left;
	}

	.quiz-question {
		font-family: var(--font-body);
		font-size: clamp(1.1rem, 3.2vw, 1.3rem);
		font-weight: 700;
		color: var(--color-text);
		line-height: 1.5;
		letter-spacing: 0.01em;
		margin: 0;
		padding: 0;
		text-align: left;
		text-wrap: pretty;
		-webkit-font-smoothing: antialiased;
		hyphens: auto;
		-webkit-hyphens: auto;
		width: 100%;
	}

	.question-row {
		justify-content: flex-start;
		text-align: left;
	}

	.clip-row {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		padding: 0.85em 1em;
		border-radius: 0.5em;
		margin-bottom: 0.45em;
		background: var(--color-white);
		border: 2px solid var(--color-border);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
		transition:
			border 0.2s,
			background 0.2s;
		font-size: 1.05em;
		gap: 0.75rem 1rem;
		width: 100%;
		box-sizing: border-box;
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
	}

	.answer-row {
		gap: 0.65rem;
		justify-content: stretch;
		flex-wrap: wrap;
	}

	.answer-row-wrong {
		background: #ffcdd2;
		border-color: #d32f2f;
		color: #b71c1c;
	}

	.answer-row-wrong input[type='text'] {
		border-color: rgba(211, 47, 47, 0.55);
	}

	.input-row-solved {
		background: #e8f5e9;
		border-color: #388e3c;
	}

	.answer-row button[type='button'] {
		font-size: 1.05em;
		padding: 0.55em 1em;
		border-radius: 0.5em;
		border: none;
		background: var(--color-theme-2);
		color: var(--color-white);
		font-weight: 600;
		cursor: pointer;
		flex-shrink: 0;
	}

	.answer-row button[type='button']:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.answer-row .feedback.correct {
		flex-shrink: 0;
	}

	input[type='text'] {
		font-size: 1.05em;
		padding: 0.6em 1em;
		border-radius: 0.5em;
		border: 1px solid var(--color-border);
		min-width: 0;
		width: 100%;
		max-width: 100%;
		background: var(--color-white);
		color: var(--color-text);
		box-sizing: border-box;
	}

	.answer-row input[type='text'] {
		flex: 1 1 8rem;
		width: auto;
		max-width: none;
	}

	.input-row-solved input[type='text'] {
		background: transparent;
		border-color: rgba(56, 142, 60, 0.45);
		color: #1b5e20;
		font-weight: 600;
		cursor: default;
	}

	.feedback.correct {
		font-size: 1.5em;
		color: #388e3c;
	}

	.result-section {
		text-align: center;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 0.5rem;
		border: 2px solid var(--color-border);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		padding: 1.2rem 1.5rem;
		width: fit-content;
		min-width: 140px;
		margin: 2rem auto 0;
	}

	.result-text {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.45em;
		font-size: 2.2rem;
		margin: 0;
		font-weight: bold;
		color: var(--color-text);
	}

	.result-digit {
		font-variant-numeric: tabular-nums;
	}

	@media (max-width: 480px) {
		.clip-row {
			font-size: 0.95em;
			gap: 0.5em;
		}

		.answer-row button[type='button'] {
			flex: 1 1 auto;
			min-width: 9rem;
		}
	}
</style>
