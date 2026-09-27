<script>
	/**
	 * Single-line guess + OK button.
	 * @typedef {object} Props
	 * @property {string} [value]
	 * @property {(v: string) => void} [onValueChange]
	 * @property {() => void} [onSubmit]
	 * @property {boolean} [wrong]
	 * @property {string} [submitLabel]
	 * @property {string} [ariaDescribedby]
	 */
	/** @type {Props} */
	let {
		value = $bindable(''),
		onSubmit,
		wrong = false,
		submitLabel = 'OK',
		ariaDescribedby = undefined
	} = $props();
</script>

<form
	class="guess-row"
	class:wrong
	onsubmit={(e) => {
		e.preventDefault();
		onSubmit?.();
	}}
>
	<input
		type="text"
		bind:value
		autocomplete="off"
		aria-invalid={wrong}
		aria-describedby={ariaDescribedby}
	/>
	<button type="submit" disabled={!value.trim()}>{submitLabel}</button>
</form>

<style>
	.guess-row {
		display: flex;
		gap: 0.5rem;
		width: 100%;
		max-width: 22rem;
	}

	.guess-row input {
		flex: 1;
		min-width: 0;
		padding: 0.65rem 0.75rem;
		border: 2px solid var(--color-border);
		border-radius: 0.5rem;
		background: var(--color-white);
		color: var(--color-text);
		font-size: 1rem;
		box-sizing: border-box;
	}

	.guess-row.wrong input {
		background: var(--color-error-bg);
		border-color: var(--color-error-border);
	}

	.guess-row button {
		padding: 0.65rem 1rem;
		border: 2px solid var(--color-border);
		border-radius: 0.5rem;
		background: var(--color-white);
		color: var(--color-text);
		font-weight: 600;
		cursor: pointer;
	}

	.guess-row button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
</style>
