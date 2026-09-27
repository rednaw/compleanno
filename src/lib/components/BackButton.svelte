<script>
	import { resolve } from '$app/paths';

	/**
	 * App-relative path (e.g. `/grt26`), resolved with `base` for GH Pages.
	 * @type {{ href?: string; className?: string; highZIndex?: boolean }}
	 */
	let { href = '/lrnz25', className = '', highZIndex = false } = $props();
</script>

<a href={resolve(href)} class="back-button {className}" class:high-z-index={highZIndex}>←</a>

<style>
	.back-button {
		position: fixed;
		top: 0;
		left: 1rem;
		font-size: 3rem;
		color: var(--color-theme-1);
		text-decoration: none;
		font-weight: bold;
		z-index: 100;
	}

	.back-button.high-z-index {
		z-index: 1001;
	}
</style>
