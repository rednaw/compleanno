<script>
	import { resolve } from '$app/paths';
	import BackButton from '$lib/components/BackButton.svelte';
</script>

<svelte:head>
	<title>Lrnz 26 — Code</title>
</svelte:head>

<BackButton href={resolve('/lrnz26')} />

<main>
	<h1>Final code</h1>
</main>

<style>
	main {
		width: 100%;
		max-width: var(--column-width);
		padding: 6rem 1.5rem 2rem;
		box-sizing: border-box;
	}
</style>
