<script>
	import { onMount } from 'svelte';
	import { FINAL_HINT_SEGMENTS, FINAL_CODE_ANSWER } from './films.js';
	import {
		saveFinalCodeProgress,
		loadFinalCodeProgress,
		clearFinalCodeProgress
	} from './persistence.js';

	const CODE_LEN = FINAL_CODE_ANSWER.length;
	const CELL_INDEXES = Array.from({ length: CODE_LEN }, (_, i) => i);

	/** @type {{ enabled: boolean; done: boolean }} */
	let { enabled, done = $bindable(false) } = $props();

	/** @type {string[]} */
	let cells = $state(Array.from({ length: CODE_LEN }, () => ''));
	/** @type {'not-started' | 'wrong' | 'correct'} */
	let status = $state(/** @type {'not-started' | 'wrong' | 'correct'} */ ('not-started'));

	const allFilled = $derived(cells.every((c) => (c || '').length > 0));

	function reset() {
		status = 'not-started';
		cells = Array.from({ length: CODE_LEN }, () => '');
		clearFinalCodeProgress();
	}

	/** @param {number} index */
	function onInput(index) {
		if (status === 'wrong') status = 'not-started';
		let v = (cells[index] || '').slice(-1);
		if (/[a-z]/i.test(v)) v = v.toLowerCase();
		cells[index] = v;
	}

	function check() {
		if (!enabled || status === 'correct') return;
		const attempt = cells.join('').toLowerCase();
		if (attempt.length !== CODE_LEN) return;

		if (attempt === FINAL_CODE_ANSWER) {
			status = 'correct';
			cells = FINAL_CODE_ANSWER.split('');
			done = true;
			saveFinalCodeProgress({ status, cells });
		} else {
			status = 'wrong';
			const ansChars = FINAL_CODE_ANSWER.split('');
			const guessChars = attempt.split('');
			cells = ansChars.map((ch, i) => (guessChars[i] === ch ? ch : ''));
		}
	}

	/**
	 * Called by the parent after mount to restore persisted state.
	 * Resets if the common question isn't solved yet.
	 * @param {boolean} commonOk
	 */
	export function restore(commonOk) {
		try {
			if (commonOk) {
				const parsed = loadFinalCodeProgress();
				if (
					parsed &&
					parsed.status === 'correct' &&
					Array.isArray(parsed.cells) &&
					parsed.cells.length === CODE_LEN
				) {
					status = 'correct';
					cells = [...parsed.cells];
					done = true;
				}
			}

			if (!commonOk) reset();
		} catch { /* localStorage may be unavailable */ }
	}
</script>

<div class="final-code-section" class:section-disabled={!enabled}>
	<p class="heading">Suggerimento</p>
	<div class="code-cells-row">
		{#each FINAL_HINT_SEGMENTS as seg, hi (hi)}
			<input
				type="text"
				class="code-cell hint-cell"
				class:code-cell-wide={seg.length > 1}
				value={seg}
				disabled
				aria-label="Suggerimento {hi + 1}"
			/>
		{/each}
	</div>
	<p class="heading">Codice</p>
	<div
		class="answer-row"
		class:answer-row-solved={status === 'correct'}
		class:answer-row-wrong={status === 'wrong'}
	>
		{#each CELL_INDEXES as ci (ci)}
			<input
				type="text"
				class="code-cell"
				maxlength="1"
				inputmode="text"
				autocomplete="off"
				autocorrect="off"
				spellcheck="false"
				bind:value={cells[ci]}
				disabled={!enabled}
				readonly={status === 'correct'}
				aria-label="Codice carattere {ci + 1}"
				aria-invalid={status === 'wrong'}
				aria-describedby="gcm26a-code-status"
				oninput={() => onInput(ci)}
				onkeydown={(e) =>
					status !== 'correct' && enabled && e.key === 'Enter' && check()}
			/>
		{/each}
		{#if status !== 'correct'}
			<button
				type="button"
				onclick={() => check()}
				disabled={!enabled || !allFilled}
			>
				Controlla
			</button>
		{:else}
			<span class="feedback correct"
				><span class="visually-hidden">Corretto. </span><span aria-hidden="true">✅</span></span
			>
		{/if}
	</div>
	<p id="gcm26a-code-status" class="field-feedback" role="status" aria-live="polite">
		{#if status === 'wrong'}
			Codice non corretto. Le lettere indovinate restano.
		{:else if status === 'correct'}
			Codice corretto.
		{/if}
	</p>
</div>

<style>
	.final-code-section {
		width: 100%;
		margin-top: 1.25rem;
		margin-bottom: 0.5rem;
	}

	.final-code-section.section-disabled {
		opacity: 0.72;
	}

	.heading {
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--color-text);
		text-align: center;
		margin: 0 0 0.45rem;
		letter-spacing: 0.02em;
	}

	.code-cells-row {
		display: flex;
		flex-wrap: nowrap;
		align-items: stretch;
		justify-content: center;
		gap: 0;
		margin: 0 auto 1rem;
		width: fit-content;
		max-width: 100%;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.code-cells-row .code-cell {
		flex: 0 0 auto;
		border-radius: 0;
		margin: 0;
		border-right-width: 0;
	}

	.code-cells-row .code-cell:first-child {
		border-top-left-radius: 0.4em;
		border-bottom-left-radius: 0.4em;
	}

	.code-cells-row .code-cell:last-child {
		border-top-right-radius: 0.4em;
		border-bottom-right-radius: 0.4em;
		border-right-width: 2px;
	}

	/* Override global input[type='text'] width so hint cells stay visible in a row */
	.code-cells-row input[type='text'].code-cell {
		width: 2.35rem;
		max-width: none;
		min-width: 0;
		height: 2.45rem;
		padding: 0.15rem;
		flex: 0 0 2.35rem;
		border-width: 2px;
		border-radius: 0;
	}

	.code-cells-row input[type='text'].code-cell-wide {
		width: 2.85rem;
		flex: 0 0 2.85rem;
	}

	.code-cell {
		width: 2.35rem;
		height: 2.45rem;
		padding: 0.15rem;
		font-size: 1.2rem;
		font-family: var(--font-mono);
		font-weight: 600;
		text-align: center;
		border-radius: 0.4em;
		border: 2px solid var(--color-border);
		box-sizing: border-box;
		background: var(--color-white);
		color: var(--color-text);
		line-height: 1;
	}

	.code-cell-wide {
		width: 2.85rem;
	}

	.hint-cell {
		background: var(--color-lilac);
		color: var(--color-text);
		opacity: 1;
		cursor: default;
	}

	.answer-row {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.6em 1em;
		border-radius: 0.5em;
		background: var(--color-white);
		border: 2px solid var(--color-border);
		width: 100%;
		box-sizing: border-box;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.answer-row-solved {
		background: #e8f5e9;
		border-color: #388e3c;
	}

	.answer-row .code-cell {
		flex: 0 0 auto;
	}

	.answer-row-wrong {
		background: #ffcdd2;
		border-color: #d32f2f;
		color: #b71c1c;
	}

	.answer-row-wrong .code-cell {
		border-color: rgba(211, 47, 47, 0.6);
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

	.answer-row input.code-cell[type='text'] {
		width: 2.35rem;
		max-width: none;
		min-width: 0;
		padding: 0.15rem;
		height: 2.45rem;
		text-align: center;
	}

	.feedback {
		font-size: 1.5em;
		margin-left: 0.5em;
	}

	.feedback.correct {
		color: #388e3c;
	}

	.field-feedback {
		margin: 0.35rem 0 0;
		min-height: 1.25em;
		font-size: 0.875rem;
		text-align: center;
		color: var(--color-text);
		line-height: 1.35;
	}

	.answer-row-wrong + .field-feedback {
		color: #b71c1c;
		font-weight: 600;
	}

	.answer-row-solved + .field-feedback {
		color: #1b5e20;
		font-weight: 600;
	}
</style>
