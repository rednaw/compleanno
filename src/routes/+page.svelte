<script>
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>Compleanno</title>
</svelte:head>

<main class="landing">
	<div class="text-column">
		<h1>Compleanno</h1>
		<nav class="routes" aria-label="Puzzle sections">
			<a class="route-card" href="{base}/maria25/">Maria 25</a>
			<a class="route-card" href="{base}/jan25/">Jan 25</a>
			<a class="route-card" href="{base}/lrnz25/">Lrnz 25</a>
			<a class="route-card" href="{base}/gcm26/">Gcm 26</a>
		</nav>
	</div>
</main>

<style>
	.landing {
		width: 100%;
		padding: 2rem 1rem 3rem;
		box-sizing: border-box;
		align-self: stretch;
	}

	.routes {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 2rem;
		max-width: 20rem;
	}

	.route-card {
		display: block;
		padding: 0.85rem 1.1rem;
		background: rgba(255, 255, 255, 0.55);
		border-radius: 0.5rem;
		border: 2px solid var(--color-border);
		color: var(--color-text);
		font-weight: 500;
		text-decoration: none;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		transition:
			background 0.2s,
			border-color 0.2s,
			transform 0.15s;
	}

	.route-card:hover {
		background: rgba(255, 255, 255, 0.85);
		border-color: var(--color-hover-border);
		text-decoration: none;
		transform: translateY(-1px);
	}
</style>
