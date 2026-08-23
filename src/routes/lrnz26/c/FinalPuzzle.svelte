<script>
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { answerMatches } from '../normalize.js';
	import { FINAL_ANSWERS } from './final.js';
	import { saveFinalProgress, loadFinalProgress } from './persistence.js';

	/** @type {{ done: boolean }} */
	let { done = $bindable(false) } = $props();

	let guesses = $state(FINAL_ANSWERS.map(() => ''));
	/** @type {('not-started' | 'wrong' | 'correct')[]} */
	let statuses = $state(FINAL_ANSWERS.map(() => /** @type {'not-started'} */ ('not-started')));

	/** @param {number} idx @param {string} guess */
	function matchesFinalAnswer(idx, guess) {
		return FINAL_ANSWERS[idx].accepted.some((answer) => answerMatches(guess, answer));
	}

	function persist() {
		saveFinalProgress({ guesses: [...guesses], statuses: [...statuses] });
	}

	function syncDone() {
		done = statuses.every((s) => s === 'correct');
	}

	/** @param {number} idx */
	function checkAnswer(idx) {
		if (statuses[idx] === 'correct') return;
		if (!guesses[idx].trim()) return;

		if (matchesFinalAnswer(idx, guesses[idx])) {
			statuses[idx] = 'correct';
			guesses[idx] = FINAL_ANSWERS[idx].display;
		} else {
			statuses[idx] = 'wrong';
			guesses[idx] = '';
		}

		persist();
		syncDone();
	}

	onMount(() => {
		try {
			const parsed = loadFinalProgress();
			if (!parsed) return;
			if (Array.isArray(parsed.statuses)) {
				parsed.statuses.forEach((status, i) => {
					if (i >= statuses.length) return;
					if (status === 'correct' || status === 'wrong' || status === 'not-started') {
						statuses[i] = status;
					}
				});
			}
			if (Array.isArray(parsed.guesses)) {
				parsed.guesses.forEach((guess, i) => {
					if (i >= guesses.length) return;
					if (typeof guess === 'string') guesses[i] = guess;
				});
			}
			FINAL_ANSWERS.forEach((item, i) => {
				if (statuses[i] === 'correct' && !guesses[i]) {
					guesses[i] = item.display;
				}
			});
			syncDone();
		} catch { /* localStorage may be unavailable */ }
	});
</script>

<div class="final-puzzle">
	<img src="{base}/lrnz26/c/final.jpg" alt="" class="final-img" />

	{#each FINAL_ANSWERS as item, i (item.id)}
		<p class="final-text">{item.question}</p>

		<div
			class="input-row"
			class:input-row-solved={statuses[i] === 'correct'}
			class:input-row-wrong={statuses[i] === 'wrong'}
		>
			<input
				type="text"
				placeholder="Answer"
				bind:value={guesses[i]}
				autocomplete="off"
				readonly={statuses[i] === 'correct'}
				aria-invalid={statuses[i] === 'wrong'}
				onkeydown={(e) => statuses[i] !== 'correct' && e.key === 'Enter' && checkAnswer(i)}
			/>
		</div>

		{#if statuses[i] !== 'correct'}
			<div class="actions-row">
				<button
					type="button"
					class="check-btn"
					onclick={() => checkAnswer(i)}
					disabled={!guesses[i].trim()}
				>
					Check
				</button>
			</div>
		{/if}
	{/each}
</div>

<style>
	.final-puzzle {
		width: 100%;
		margin-top: 0.5rem;
	}

	.final-img {
		display: block;
		width: 100%;
		border-radius: 0.5rem;
		border: 2px solid var(--color-border);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
		margin-bottom: 0.75rem;
	}

	.final-text {
		margin: 0 0 1rem;
		font-size: clamp(1.05rem, 3.5vw, 1.25rem);
		font-weight: 600;
		line-height: 1.45;
		text-align: center;
		color: var(--color-text);
		text-wrap: pretty;
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
		margin-bottom: 0.65rem;
	}

	.input-row-wrong {
		background: var(--color-error-bg);
		border-color: var(--color-error-border);
	}

	.input-row-solved {
		background: var(--color-success-bg);
		border-color: var(--color-success-border);
	}

	.input-row input[type='text'] {
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

	.input-row input[type='text']::placeholder {
		color: #999;
	}

	.input-row-solved input[type='text'] {
		color: var(--color-success-text);
		font-weight: 600;
	}

	.actions-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
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
</style>
