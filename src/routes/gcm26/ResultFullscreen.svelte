<script>
	/** @type {{ src: string; alt?: string; href?: string; cover?: boolean }} */
	let { src, alt = '', href = '', cover = false } = $props();
</script>

<svelte:element
	this={href ? 'a' : 'div'}
	class="result-fullscreen"
	href={href || undefined}
	target={href ? '_blank' : undefined}
	rel={href ? 'noopener noreferrer' : undefined}
	aria-label={href ? alt : undefined}
>
	<img {src} alt={href ? '' : alt} class="result-fullscreen-img" class:cover />
</svelte:element>

<style>
	.result-fullscreen {
		position: fixed;
		inset: 0;
		z-index: 90;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-background);
	}

	a.result-fullscreen {
		cursor: pointer;
		text-decoration: none;
		color: inherit;
	}

	.result-fullscreen-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.result-fullscreen-img.cover {
		object-fit: cover;
	}
</style>
