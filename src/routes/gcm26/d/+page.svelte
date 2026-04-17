<script>
	import { base, resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { savePuzzleState, loadPuzzleState } from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import { gcm26HubImage } from '../hub-images.js';
	import { gcm26Keys } from '../storage-keys.js';
	import { INTRO_TEXT, QUESTION_STEM, PARTIES, CLUES } from './clues.js';
	import ResultFullscreen from '../ResultFullscreen.svelte';
	import '../quiz-shared.css';

	/** @type {string[]} */
	let answers = $state(CLUES.map(() => ''));
	let allCompleted = $state(false);
	let showWrong = $state(false);

	const allFilled = $derived(answers.every((a) => a !== ''));

	function checkAnswers() {
		if (!allFilled || allCompleted) return;

		const allCorrect = CLUES.every((clue, i) => answers[i] === clue.answer);
		if (allCorrect) {
			allCompleted = true;
			savePuzzleState(gcm26Keys.gameDDone, '1');
		} else {
			showWrong = true;
			answers = CLUES.map(() => '');
			setTimeout(() => { showWrong = false; }, 1200);
		}
	}

	onMount(() => {
		try {
			if (loadPuzzleState(gcm26Keys.gameDDone)) {
				allCompleted = true;
			}
		} catch { /* localStorage may be unavailable */ }
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
				<div class="clue-row">
					<p class="clue-text">{clue.text}</p>
					<select
						class="clue-select"
						bind:value={answers[i]}
						disabled={allCompleted}
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
				{#if showWrong}
					<p class="wrong-hint" aria-live="polite">Fout! Probeer opnieuw.</p>
				{/if}
				<button
					type="button"
					class="check-btn"
					disabled={!allFilled || showWrong}
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

	.check-row {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.wrong-hint {
		font-size: 0.95rem;
		font-weight: 700;
		color: #ffcdd2;
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
