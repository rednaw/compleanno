<script>
	import { asset, base, resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { savePuzzleState, loadPuzzleState } from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import { lrnz26Keys } from '../storage-keys.js';
	import { lrnz26HubImage } from '../coordinates.js';
	import { answerMatches } from '../normalize.js';
	import {
		EXERCISE_1_IMAGE,
		EXERCISE_2_IMAGE,
		ANSWER_1,
		ANSWER_2,
		HINT_2,
		matchesAnswer1
	} from './exercises.js';
	import ResultFullscreen from '../../gcm26/ResultFullscreen.svelte';
	import DevSkipButton from '../DevSkipButton.svelte';

	let guess = $state('');
	let step1Done = $state(false);
	let completed = $state(false);
	let showWrong = $state(false);
	let showHint2 = $state(false);

	const onStep2 = $derived(step1Done && !completed);

	function completeCurrent() {
		if (completed) return;
		showWrong = false;
		if (onStep2) {
			completed = true;
			guess = ANSWER_2;
			savePuzzleState(lrnz26Keys.gameBDone, '1');
		} else {
			step1Done = true;
			guess = '';
			savePuzzleState(lrnz26Keys.gameBStep1Done, '1');
		}
	}

	function checkAnswer() {
		if (completed || !guess.trim()) return;

		const correct = onStep2 ? answerMatches(guess, ANSWER_2) : matchesAnswer1(guess);

		if (correct) {
			completeCurrent();
		} else {
			showWrong = true;
			guess = '';
			window.setTimeout(() => {
				showWrong = false;
			}, 1200);
		}
	}

	onMount(() => {
		if (loadPuzzleState(lrnz26Keys.gameBDone)) {
			completed = true;
		} else if (loadPuzzleState(lrnz26Keys.gameBStep1Done)) {
			step1Done = true;
		}
	});
</script>

<svelte:head>
	<title>Lrnz 26 — B</title>
</svelte:head>

<BackButton href={resolve('/lrnz26')} />
<DevSkipButton onSkip={completeCurrent} />

{#if completed}
	<ResultFullscreen src="{base}/lrnz26/code/{lrnz26HubImage.b}" />
{:else}
<main>
	<div class="quiz-wrap">
		<div class="exercise-block">
			<img class="exercise-img" src={asset(`/lrnz26/b/${EXERCISE_1_IMAGE}`)} alt="Exercise 1" />
			{#if step1Done}
				<div class="input-row input-row-solved">
					<input type="text" class="answer-input" value={ANSWER_1} readonly aria-label="Answer 1" />
				</div>
			{/if}
		</div>

		{#if step1Done}
			<div class="exercise-block">
				<img class="exercise-img" src={asset(`/lrnz26/b/${EXERCISE_2_IMAGE}`)} alt="Exercise 2" />
			</div>
		{/if}

			<div class="input-row" class:input-row--wrong={showWrong}>
				<input
					type="text"
					class="answer-input"
					placeholder="Answer"
					aria-label={onStep2 ? 'Answer 2' : 'Answer 1'}
					autocomplete="off"
					spellcheck="false"
					bind:value={guess}
					disabled={showWrong}
					onkeydown={(e) => e.key === 'Enter' && checkAnswer()}
				/>
			</div>
			<div class="check-row">
				{#if showWrong}
					<p class="wrong-hint" aria-live="polite">Incorrect. Try again.</p>
				{/if}
				<div class="check-actions">
					<button
						type="button"
						class="check-btn"
						disabled={!guess.trim() || showWrong}
						onclick={checkAnswer}
					>
						Check
					</button>
					{#if onStep2}
						<button type="button" class="hint-link" onclick={() => (showHint2 = !showHint2)}>
							hint
						</button>
					{/if}
				</div>
				{#if showHint2 && onStep2}
					<p class="hint-text" aria-live="polite">{HINT_2}</p>
				{/if}
			</div>
	</div>
</main>
{/if}

<style>
	main {
		width: 100%;
		max-width: 520px;
		margin: 0 auto;
		padding: 5rem 1rem 2rem;
		box-sizing: border-box;
	}

	.quiz-wrap {
		width: 100%;
	}

	.exercise-block {
		margin-bottom: 1.25rem;
	}

	.exercise-img {
		display: block;
		width: 100%;
		border-radius: 0.5rem;
		border: 2px solid var(--color-border);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
		background: var(--color-white);
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
		margin-top: 0.75rem;
		transition:
			background 0.2s,
			border-color 0.2s;
	}

	.exercise-block + .exercise-block {
		margin-top: 1.5rem;
	}

	.quiz-wrap > .input-row,
	.quiz-wrap > .check-row {
		margin-top: 0;
	}

	.quiz-wrap > .input-row {
		margin-bottom: 1rem;
	}

	.input-row--wrong {
		background: var(--color-error-bg);
		border-color: var(--color-error-border);
	}

	.input-row-solved {
		background: var(--color-success-bg);
		border-color: var(--color-success-border);
	}

	.answer-input {
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

	.answer-input::placeholder {
		color: #999;
	}

	.check-row {
		text-align: center;
		margin-bottom: 0.5rem;
	}

	.check-actions {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
	}

	.hint-link {
		padding: 0;
		border: none;
		background: none;
		font-size: 0.85rem;
		color: var(--color-text);
		opacity: 0.65;
		text-decoration: underline;
		cursor: pointer;
	}

	.hint-link:hover {
		opacity: 1;
	}

	.hint-text {
		margin: 0.75rem 0 0;
		font-size: 0.95rem;
		font-style: italic;
		color: var(--color-text);
		opacity: 0.9;
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
		color: var(--color-error-bg);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
	}
</style>
