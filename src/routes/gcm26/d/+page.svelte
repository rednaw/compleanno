<script>
	import { base, resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { savePuzzleState, loadPuzzleState, clearPuzzleState } from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import { gcm26HubImage } from '../hub-images.js';
	import { gcm26DClueKey, gcm26Keys } from '../storage-keys.js';
	import { INTRO_TEXT, QUESTION_STEM, PARTIES, CLUES } from './clues.js';
	import ResultFullscreen from '../ResultFullscreen.svelte';
	import '../quiz-shared.css';

	/** @type {string[]} */
	let answers = $state(CLUES.map(() => ''));
	/** @type {('idle' | 'wrong' | 'correct')[]} */
	let rowStatus = $state(CLUES.map(() => /** @type {'idle'} */ ('idle')));

	let allCompleted = $state(false);

	const allFilled = $derived(answers.every((a) => a !== ''));
	const solvedCount = $derived(rowStatus.filter((s) => s === 'correct').length);

	function checkAnswers() {
		if (!allFilled || allCompleted) return;

		let allCorrect = true;
		CLUES.forEach((clue, i) => {
			if (rowStatus[i] === 'correct') return;
			if (answers[i] === clue.answer) {
				rowStatus[i] = 'correct';
				savePuzzleState(gcm26DClueKey(clue.id), '1');
			} else {
				rowStatus[i] = 'wrong';
				answers[i] = '';
				allCorrect = false;
			}
		});

		if (allCorrect && rowStatus.every((s) => s === 'correct')) {
			allCompleted = true;
			savePuzzleState(gcm26Keys.gameDDone, '1');
		}
	}

	/** @param {number} i */
	function onSelect(i) {
		if (rowStatus[i] === 'wrong') rowStatus[i] = 'idle';
	}

	onMount(() => {
		try {
			CLUES.forEach((clue, i) => {
				if (loadPuzzleState(gcm26DClueKey(clue.id))) {
					rowStatus[i] = 'correct';
					answers[i] = clue.answer;
				}
			});

			if (loadPuzzleState(gcm26Keys.gameDDone)) {
				allCompleted = true;
			} else if (rowStatus.every((s) => s === 'correct')) {
				allCompleted = true;
				savePuzzleState(gcm26Keys.gameDDone, '1');
			}
		} catch {
			void 0;
		}
	});
</script>

<svelte:head>
	<title>GCM 26 — D</title>
</svelte:head>

<BackButton href={resolve('/gcm26')} />

<main>
	<div class="quiz-wrap">
		<img src="{base}/gcm26/d/spider.jpg" alt="" class="puzzle-image" />

		<p class="intro-text">{INTRO_TEXT}</p>

		<h2 class="question-stem">{QUESTION_STEM}</h2>

		<div class="clue-list">
			{#each CLUES as clue, i (clue.id)}
				<div
					class="clue-row"
					class:clue-correct={rowStatus[i] === 'correct'}
					class:clue-wrong={rowStatus[i] === 'wrong'}
				>
					<p class="clue-text">{clue.text}</p>
					<select
						class="clue-select"
						bind:value={answers[i]}
						disabled={rowStatus[i] === 'correct'}
						onchange={() => onSelect(i)}
					>
						<option value="">—</option>
						{#each PARTIES as party (party)}
							<option value={party}>{party}</option>
						{/each}
					</select>
				</div>
			{/each}
		</div>

		{#if !allCompleted}
			<div class="check-row">
				<p class="progress-hint" aria-live="polite">
					{solvedCount} / {CLUES.length} correct
				</p>
				<button
					type="button"
					class="check-btn"
					disabled={!allFilled}
					onclick={checkAnswers}
				>
					Controleer
				</button>
			</div>
		{/if}
	</div>

	{#if allCompleted}
		<ResultFullscreen src="{base}/gcm26/code/{gcm26HubImage.d}" />
	{/if}
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

	.puzzle-image {
		width: 100%;
		border-radius: 0.5rem;
		border: 2px solid var(--color-border);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
		margin-bottom: 1.25rem;
		display: block;
	}

	.intro-text {
		font-size: 0.95rem;
		line-height: 1.55;
		color: var(--color-white);
		text-align: left;
		margin: 0 0 1.25rem;
		hyphens: auto;
		-webkit-hyphens: auto;
		text-wrap: pretty;
	}

	.question-stem {
		font-size: clamp(1.1rem, 3.2vw, 1.3rem);
		font-weight: 700;
		color: var(--color-white);
		text-align: left;
		margin: 0 0 0.75rem;
		line-height: 1.3;
	}

	.clue-list {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-bottom: 1.25rem;
	}

	.clue-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.65rem;
		padding: 0.75rem 1rem;
		border-radius: 0.5em;
		background: var(--color-white);
		border: 2px solid var(--color-border);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
		transition:
			border-color 0.2s,
			background 0.2s;
	}

	.clue-correct {
		background: #e8f5e9;
		border-color: #388e3c;
	}

	.clue-wrong {
		background: #ffcdd2;
		border-color: #d32f2f;
	}

	.clue-text {
		flex: 1 1 12rem;
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.45;
		color: var(--color-text);
		text-align: left;
		hyphens: auto;
		-webkit-hyphens: auto;
		text-wrap: pretty;
	}

	.clue-select {
		flex: 0 0 auto;
		font-size: 1rem;
		padding: 0.45em 0.75em;
		border-radius: 0.4em;
		border: 1px solid var(--color-border);
		background: var(--color-white);
		color: var(--color-text);
		cursor: pointer;
		min-width: 5.5rem;
	}

	.clue-correct .clue-select {
		background: transparent;
		border-color: rgba(56, 142, 60, 0.45);
		color: #1b5e20;
		font-weight: 600;
		cursor: default;
	}

	.clue-wrong .clue-select {
		border-color: rgba(211, 47, 47, 0.55);
	}

	.check-row {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.progress-hint {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-white);
		margin: 0;
	}

	.check-btn {
		font-size: 1.05em;
		padding: 0.55em 1.5em;
		border-radius: 0.5em;
		border: none;
		background: var(--color-theme-1);
		color: var(--color-white);
		font-weight: 700;
		cursor: pointer;
	}

	.check-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
</style>
