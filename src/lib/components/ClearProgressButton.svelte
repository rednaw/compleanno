<script>
	/** Accessible label (native tooltip). */
	export let title = 'Clear progress';

	/** Called when the user confirms clearing stored progress. */
	export let onClear = /** @type {() => void} */ () => {};
</script>

<button type="button" class="clear-button" {title} on:click={onClear}>🗑️</button>

<style>
	.clear-button {
		position: fixed;
		top: 0;
		left: 1rem;
		font-size: 2rem;
		background: none;
		border: none;
		color: #dc3545;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.5rem;
		transition: all 0.2s ease;
		z-index: 100;
	}

	.clear-button:hover {
		background: rgba(220, 53, 69, 0.1);
		transform: scale(1.1);
	}

	.clear-button:active {
		transform: scale(0.95);
	}
</style>
