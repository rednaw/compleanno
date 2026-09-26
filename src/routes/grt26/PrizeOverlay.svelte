<script>
	/** @type {{ text: string; large?: boolean }} */
	let { text, large = false } = $props();
</script>

<div class="prize-overlay" role="status">
	<p class="prize" class:large>{text}</p>
</div>

<style>
	.prize-overlay {
		position: fixed;
		inset: 0;
		z-index: 90;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--color-bg-0) 0%, var(--color-bg-1) 100%);
		padding: 1.5rem;
		box-sizing: border-box;
	}

	.prize {
		margin: 0;
		font-size: clamp(1.75rem, 7vw, 2.5rem);
		font-weight: 700;
		color: var(--color-white);
		text-align: center;
		text-wrap: balance;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
	}

	.prize.large {
		font-size: clamp(3rem, 12vw, 5rem);
	}
</style>
