<script>
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { savePuzzleState, loadPuzzleState } from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import { lrnz26Keys } from '../storage-keys.js';
	import { answerMatches } from '../normalize.js';
	import { CLUES, ANSWER, INTRO } from './countries.js';
	import CountryClue from './CountryClue.svelte';

	let guess = $state('');
	let completed = $state(false);
	let showWrong = $state(false);

	function checkAnswer() {
		if (completed || !guess.trim()) return;

		if (answerMatches(guess, ANSWER)) {
			completed = true;
			showWrong = false;
			savePuzzleState(lrnz26Keys.gameADone, '1');
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
			if (loadPuzzleState(lrnz26Keys.gameADone)) {
				completed = true;
			}
		} catch { /* localStorage may be unavailable */ }
	});
</script>

<svelte:head>
	<title>Lrnz 26 — A</title>
</svelte:head>

<BackButton href={resolve('/lrnz26')} />

<main>
	<div class="quiz-wrap">
		<h2 class="intro">{INTRO}</h2>

		<ol class="clues-grid">
			{#each CLUES as clue, i (clue.id)}
				<li class="clue-item">
					<span class="clue-index">{i + 1}</span>
					<CountryClue id={clue.id} kind={clue.kind} />
				</li>
			{/each}
		</ol>

		{#if completed}
			<p class="success" aria-live="polite">
				Corretto — <strong>{ANSWER.charAt(0).toUpperCase() + ANSWER.slice(1)}</strong>!
			</p>
		{:else}
			<form
				class="answer-row"
				class:answer-row--wrong={showWrong}
				onsubmit={(e) => {
					e.preventDefault();
					checkAnswer();
				}}
			>
				<input
					id="country-guess"
					type="text"
					class="answer-input"
					placeholder="Paese"
					aria-label="Paese"
					autocomplete="off"
					spellcheck="false"
					bind:value={guess}
					disabled={showWrong}
				/>
				{#if showWrong}
					<p class="wrong-hint" aria-live="polite">Riprova</p>
				{/if}
			</form>
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

	.intro {
		margin: 0 0 1.5rem;
		font-size: clamp(1.5rem, 6vw, 2rem);
		font-weight: 700;
		line-height: 1.2;
		text-align: center;
		color: var(--color-white);
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		text-wrap: balance;
	}

	.clues-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		margin: 0 0 1.5rem;
		padding: 0;
		list-style: none;
	}

	.clue-item {
		position: relative;
		margin: 0;
		min-width: 0;
	}

	.clue-index {
		position: absolute;
		top: 0.35rem;
		left: 0.35rem;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.35rem;
		height: 1.35rem;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.45);
		color: #fff;
		font-size: 0.75rem;
		font-weight: 700;
		line-height: 1;
	}

	.answer-row {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		margin: 0;
		padding: 0;
	}

	.answer-input {
		width: 100%;
		max-width: 14rem;
		box-sizing: border-box;
		padding: 0.45rem 0;
		border: none;
		border-bottom: 2px solid rgba(255, 255, 255, 0.75);
		background: transparent;
		font-size: 1.15rem;
		text-align: center;
		color: var(--color-white);
		outline: none;
		transition: border-color 0.2s;
	}

	.answer-input::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	.answer-input:focus {
		border-bottom-color: var(--color-white);
	}

	.answer-row--wrong .answer-input {
		border-bottom-color: var(--color-chili-pepper);
	}

	.wrong-hint {
		margin: 0;
		font-size: 0.85rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.85);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
	}

	.success {
		margin: 0;
		padding: 0.75rem 0;
		color: var(--color-white);
		font-size: 1.1rem;
		font-weight: 600;
		text-align: center;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}

	@media (max-width: 380px) {
		.clues-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
