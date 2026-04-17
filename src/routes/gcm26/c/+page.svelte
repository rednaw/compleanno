<script>
	import { base, resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		savePuzzleState,
		loadPuzzleState,
		clearPuzzleState
	} from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import { gcm26HubImage } from '../hub-images.js';
	import { gcm26CItemKey, gcm26Keys } from '../storage-keys.js';
	import { ITEMS } from './items.js';
	import ResultFullscreen from '../ResultFullscreen.svelte';
	import '../quiz-shared.css';

	/** @param {string} s */
	function normalizeAnswer(s) {
		return s.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/\s+/g, ' ');
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
			savePuzzleState(gcm26Keys.gameCDone, '1');
		} else {
			clearPuzzleState(gcm26Keys.gameCDone);
		}
	}

	/** @param {number} index */
	function checkItem(index) {
		if (allCompleted || rowStatus[index] === 'correct') return;
		const g = guesses[index];
		if (!g.trim()) return;
		const expected = ITEMS[index].answer;
		if (normalizeAnswer(g) === normalizeAnswer(expected)) {
			rowStatus[index] = 'correct';
			guesses[index] = expected;
			savePuzzleState(gcm26CItemKey(ITEMS[index].id), '1');
			checkAllCompleted();
		} else {
			rowStatus[index] = 'wrong';
			guesses[index] = '';
		}
	}

	onMount(() => {
		try {
			ITEMS.forEach((item, index) => {
				if (loadPuzzleState(gcm26CItemKey(item.id))) {
					rowStatus[index] = 'correct';
					guesses[index] = item.answer;
				}
			});

			if (loadPuzzleState(gcm26Keys.gameCDone)) {
				allCompleted = true;
			} else {
				checkAllCompleted();
			}
		} catch {
			void 0;
		}
	});
</script>

<svelte:head>
	<title>Certamen Stormlight</title>
</svelte:head>

<BackButton href={resolve('/gcm26')} />

<main>
		<div class="quiz-wrap">
			<p class="progress-hint" aria-live="polite">
				Recte solutae: {solvedCount} / {ITEMS.length}
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
							placeholder="Responsum"
							bind:value={guesses[i]}
							autocomplete="off"
							readonly={rowStatus[i] === 'correct'}
							onkeydown={(e) => rowStatus[i] !== 'correct' && e.key === 'Enter' && checkItem(i)}
						/>
						{#if rowStatus[i] !== 'correct'}
							<button type="button" onclick={() => checkItem(i)} disabled={!guesses[i].trim()}>
								Conproba
							</button>
						{:else}
							<span class="feedback correct" aria-hidden="true">✅</span>
						{/if}
					</div>
				</div>
			{/each}

		{#if allCompleted}
			<ResultFullscreen src="{base}/gcm26/code/{gcm26HubImage.c}" />
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
		padding: 0.85em 1em;
		margin-bottom: 0.45em;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
		gap: 0.75rem 1rem;
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

	.answer-row input[type='text'] {
		flex: 1 1 8rem;
		width: auto;
		max-width: none;
	}

	.feedback.correct {
		font-size: 1.5em;
		color: #388e3c;
	}

	@media (max-width: 480px) {
		.clip-row {
			gap: 0.5em;
		}

		.answer-row button[type='button'] {
			flex: 1 1 auto;
			min-width: 9rem;
		}
	}
</style>
