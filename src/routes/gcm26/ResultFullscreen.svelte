<script>
	/** @type {{ src: string; alt?: string }} */
	let { src, alt = '' } = $props();
</script>

<div class="result-fullscreen">
	<img {src} {alt} class="result-fullscreen-img" />
</div>

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

	.result-fullscreen-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>
