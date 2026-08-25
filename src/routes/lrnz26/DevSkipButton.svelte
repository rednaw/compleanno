<script>
	/**
	 * TEMP testing cheat — delete this file and every <DevSkipButton> use before go-live.
	 * Invisible tap target, top-right corner.
	 */
	const LRNZ26_DEV_SKIP = true;

	/** @type {{ onSkip: () => void }} */
	let { onSkip } = $props();
</script>

{#if LRNZ26_DEV_SKIP}
	<button type="button" class="dev-skip" tabindex="-1" aria-hidden="true" onclick={onSkip}></button>
{/if}

<style>
	.dev-skip {
		position: fixed;
		top: 0;
		right: 0;
		z-index: 1100;
		width: 3.25rem;
		height: 3.25rem;
		margin: 0;
		padding: 0;
		border: none;
		background: transparent;
		opacity: 0;
	}
</style>
