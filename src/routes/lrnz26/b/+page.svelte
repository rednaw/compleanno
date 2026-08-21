<script>
	import { asset, resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { savePuzzleState, loadPuzzleState } from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import { lrnz26Keys } from '../storage-keys.js';
	import { answerMatches } from '../normalize.js';
	import {
		EXERCISE_1_IMAGE,
		EXERCISE_2_IMAGE,
		ANSWER_1,
		ANSWER_2,
		matchesAnswer1
	} from './exercises.js';

	let guess = $state('');
	let step1Done = $state(false);
	let completed = $state(false);
	let showWrong = $state(false);

	const onStep2 = $derived(step1Done && !completed);

	function checkAnswer() {
		if (completed || !guess.trim()) return;

		const correct = onStep2 ? answerMatches(guess, ANSWER_2) : matchesAnswer1(guess);

		if (correct) {
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
		} else {
			showWrong = true;
			guess = '';
			window.setTimeout(() => {
				showWrong = false;
			}, 1200);
		}
	}

	onMount(() => {
		try {
			if (loadPuzzleState(lrnz26Keys.gameBDone)) {
				step1Done = true;
				completed = true;
				guess = ANSWER_2;
			} else if (loadPuzzleState(lrnz26Keys.gameBStep1Done)) {
				step1Done = true;
			}
		} catch { /* localStorage may be unavailable */ }
	});
</script>

<svelte:head>
	<title>Lrnz 26 — B</title>
</svelte:head>

<BackButton href={resolve('/lrnz26')} />

<main>
	<div class="quiz-wrap">
		<div class="exercise-block">
			<img class="exercise-img" src={asset(`/lrnz26/b/${EXERCISE_1_IMAGE}`)} alt="Esercizio 1" />
			{#if step1Done}
				<div class="input-row input-row-solved">
					<input type="text" class="answer-input" value={ANSWER_1} readonly aria-label="Risposta 1" />
				</div>
			{/if}
		</div>

		{#if step1Done}
			<div class="exercise-block">
				<img class="exercise-img" src={asset(`/lrnz26/b/${EXERCISE_2_IMAGE}`)} alt="Esercizio 2" />
			</div>
		{/if}

		{#if completed}
			<div class="input-row input-row-solved">
				<input type="text" class="answer-input" value={ANSWER_2} readonly aria-label="Risposta 2" />
			</div>
			<p class="success" aria-live="polite">Corretto!</p>
		{:else}
			<div class="input-row" class:input-row--wrong={showWrong}>
				<input
					type="text"
					class="answer-input"
					placeholder="Risposta"
					aria-label={onStep2 ? 'Risposta 2' : 'Risposta 1'}
					autocomplete="off"
					spellcheck="false"
					bind:value={guess}
					disabled={showWrong}
					onkeydown={(e) => e.key === 'Enter' && checkAnswer()}
				/>
			</div>
			<div class="check-row">
				{#if showWrong}
					<p class="wrong-hint" aria-live="polite">Risposta non corretta. Riprova.</p>
				{/if}
				<button
					type="button"
					class="check-btn"
					disabled={!guess.trim() || showWrong}
					onclick={checkAnswer}
				>
					Controlla
				</button>
			</div>
		{/if}
	</div>
</main>

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

	.input-row-solved .answer-input {
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
		color: var(--color-error-bg);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
	}

	.success {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
		text-align: center;
		color: var(--color-success-bg-strong);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}
</style>
