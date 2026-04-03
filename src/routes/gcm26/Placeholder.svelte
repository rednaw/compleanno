<script>
	import { resolve } from '$app/paths';

	/** @type {string} */
	export let label = 'Puzzle';
</script>

<main class="stub">
	<a class="back" href={resolve('/gcm26')}>←</a>
	<p class="msg">{label} — placeholder.</p>
</main>

<style>
	.stub {
		min-height: 100vh;
		margin: 0;
		padding: 4rem 1.5rem 2rem;
		box-sizing: border-box;
		background: var(--color-background);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}

	.back {
		position: fixed;
		top: 0;
		left: 1rem;
		font-size: 3rem;
		color: var(--color-theme-1);
		text-decoration: none;
		font-weight: bold;
		z-index: 100;
	}

	.msg {
		font-size: 1.2rem;
		text-align: center;
		max-width: 24rem;
		margin: 0;
	}
</style>
