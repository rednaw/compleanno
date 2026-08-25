<script>
	import { base, resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { savePuzzleState, loadPuzzleState } from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import { lrnz26Keys } from '../storage-keys.js';
	import { lrnz26HubImage } from '../coordinates.js';
	import { answerMatches } from '../normalize.js';
	import { CLUES, ANSWER, INTRO } from './countries.js';
	import CountryClue from './CountryClue.svelte';
	import ResultFullscreen from '../../gcm26/ResultFullscreen.svelte';
	import DevSkipButton from '../DevSkipButton.svelte';

	let guess = $state('');
	let completed = $state(false);
	let showWrong = $state(false);

	function completePuzzle() {
		if (completed) return;
		completed = true;
		showWrong = false;
		savePuzzleState(lrnz26Keys.gameADone, '1');
	}

	function checkAnswer() {
		if (completed || !guess.trim()) return;

		if (answerMatches(guess, ANSWER)) {
			completePuzzle();
		} else {
			showWrong = true;
			guess = '';
			window.setTimeout(() => {
				showWrong = false;
			}, 1200);
		}
	}

	onMount(() => {
		if (loadPuzzleState(lrnz26Keys.gameADone)) {
			completed = true;
		}
	});
</script>

<svelte:head>
	<title>Lrnz 26 — A</title>
</svelte:head>

<BackButton href={resolve('/lrnz26')} />
<DevSkipButton onSkip={completePuzzle} />

{#if completed}
	<ResultFullscreen src="{base}/lrnz26/code/{lrnz26HubImage.a}" />
{:else}
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

			<div class="input-row" class:input-row--wrong={showWrong}>
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
		margin-bottom: 1rem;
		transition:
			background 0.2s,
			border-color 0.2s;
	}

	.input-row--wrong {
		background: var(--color-error-bg);
		border-color: var(--color-error-border);
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

	@media (max-width: 380px) {
		.clues-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
