<script>
	/**
	 * Fullscreen win: text prize and/or image.
	 * @typedef {object} Props
	 * @property {string} [text]
	 * @property {boolean} [large]
	 * @property {string} [src]
	 * @property {string} [alt]
	 * @property {string} [href]
	 * @property {boolean} [cover]
	 */
	/** @type {Props} */
	let { text = '', large = false, src = '', alt = '', href = '', cover = false } = $props();
</script>

{#if src}
	<svelte:element
		this={href ? 'a' : 'div'}
		class="result-overlay"
		href={href || undefined}
		target={href ? '_blank' : undefined}
		rel={href ? 'noopener noreferrer' : undefined}
		aria-label={href ? alt : undefined}
	>
		<img {src} alt={href ? '' : alt} class="result-overlay-img" class:cover />
	</svelte:element>
{:else if text}
	<div class="result-overlay text" role="status">
		<p class="prize" class:large>{text}</p>
	</div>
{/if}

<style>
	.result-overlay {
		position: fixed;
		inset: 0;
		z-index: 90;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-background, var(--color-bg-0, #1a1a2e));
	}

	.result-overlay.text {
		background: linear-gradient(
			135deg,
			var(--color-bg-0, #1a1a2e) 0%,
			var(--color-bg-1, #16213e) 100%
		);
		padding: 1.5rem;
		box-sizing: border-box;
	}

	a.result-overlay {
		cursor: pointer;
		text-decoration: none;
		color: inherit;
	}

	.result-overlay-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.result-overlay-img.cover {
		object-fit: cover;
	}

	.prize {
		margin: 0;
		font-size: clamp(1.75rem, 7vw, 2.5rem);
		font-weight: 700;
		color: var(--color-white, #fff);
		text-align: center;
		text-wrap: balance;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
	}

	.prize.large {
		font-size: clamp(3rem, 12vw, 5rem);
	}
</style>
