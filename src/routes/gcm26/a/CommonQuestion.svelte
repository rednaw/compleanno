<script>
	import { onMount } from 'svelte';
	import { filmTitleMatches, COMMON_QUESTION, COMMON_ANSWER } from './films.js';
	import { saveCommonProgress, loadCommonProgress, clearCommonProgress } from './persistence.js';

	/** @type {{ enabled: boolean; done: boolean }} */
	let { enabled, done = $bindable(false) } = $props();

	let guess = $state('');
	let feedback = $state('');
	/** @type {'not-started' | 'correct' | 'wrong'} */
	let status = $state(/** @type {'not-started' | 'correct' | 'wrong'} */ ('not-started'));

	function check() {
		if (!enabled || !guess.trim()) return;

		if (filmTitleMatches(guess, COMMON_ANSWER)) {
			feedback = 'correct';
			status = 'correct';
			guess = COMMON_ANSWER;
			done = true;
		} else {
			feedback = 'wrong';
			status = 'wrong';
			guess = '';
		}

		saveCommonProgress({ status, feedback, guess });
	}

	/**
	 * Called by the parent after mount to restore persisted state.
	 * Resets to not-started if films aren't all solved yet.
	 * @param {boolean} filmsOk
	 */
	export function restore(filmsOk) {
		try {
			const parsed = loadCommonProgress();
			if (parsed) {
				status = parsed.status;
				feedback = parsed.feedback ?? '';
				if (typeof parsed.guess === 'string') {
					guess = parsed.guess;
				} else if (status === 'correct') {
					guess = COMMON_ANSWER;
				}
			}

			if (status === 'correct' && !filmsOk) {
				status = 'not-started';
				feedback = '';
				guess = '';
				clearCommonProgress();
			}

			done = status === 'correct';
		} catch { /* localStorage may be unavailable */ }
	}
</script>

<div class="common-section" class:common-disabled={!enabled}>
	<p class="common-question">{COMMON_QUESTION}</p>
	<div
		class="clip-row {status === 'correct' ? 'correct' : ''} {status === 'wrong' ? 'wrong' : ''}"
	>
		{#if status !== 'correct'}
			<button
				type="button"
				onclick={() => check()}
				disabled={!enabled || !guess.trim() || status === 'correct'}
			>
				Controlla
			</button>
		{:else}
			<span class="feedback correct"
				><span class="visually-hidden">Corretto. </span><span aria-hidden="true">✅</span></span
			>
		{/if}
	</div>
	<div class="input-row" class:input-row-solved={status === 'correct'}>
		<input
			type="text"
			placeholder={enabled ? 'La tua risposta' : 'Indovina prima tutti i film'}
			bind:value={guess}
			autocomplete="off"
			disabled={!enabled}
			readonly={status === 'correct'}
			aria-invalid={status === 'wrong'}
			aria-describedby="gcm26a-common-status"
			onkeydown={(e) => status !== 'correct' && enabled && e.key === 'Enter' && check()}
		/>
	</div>
	<p id="gcm26a-common-status" class="field-feedback" role="status" aria-live="polite">
		{#if status === 'wrong'}
			Risposta non corretta. Riprova.
		{:else if status === 'correct'}
			Risposta corretta.
		{/if}
	</p>
</div>

<style>
	.common-section {
		width: 100%;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.common-section.common-disabled {
		opacity: 0.72;
	}

	.common-question {
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--color-text);
		text-align: center;
		margin: 0 0 0.75rem;
		line-height: 1.35;
	}

	.clip-row button[type='button'] {
		font-size: 1.05em;
		padding: 0.55em 1em;
		border-radius: 0.5em;
		border: none;
		background: var(--color-theme-2);
		color: var(--color-white);
		font-weight: 600;
		cursor: pointer;
	}

	.clip-row button[type='button']:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.feedback {
		font-size: 1.5em;
		margin-left: 0.5em;
	}

	.feedback.correct {
		color: var(--color-success-border);
	}

	.field-feedback {
		margin: 0.35rem 0 0;
		min-height: 1.25em;
		font-size: 0.875rem;
		text-align: center;
		color: var(--color-text);
		line-height: 1.35;
	}

	.clip-row.wrong ~ .input-row + .field-feedback {
		color: var(--color-error-text);
		font-weight: 600;
	}

	.input-row-solved + .field-feedback {
		color: var(--color-success-text);
		font-weight: 600;
	}
</style>
