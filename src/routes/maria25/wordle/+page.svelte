<script>
	import { resolve } from '$app/paths';
	import WordleBoard from '$lib/components/WordleBoard.svelte';

	const ANSWER = 'caffe';
</script>

<svelte:head>
	<title>Dove si trova?</title>
</svelte:head>

<a href={resolve('/maria25')} class="back-button">←</a>

<WordleBoard answer={ANSWER} storageKey="wordle" restartable>
	<h1>Dove si trova?</h1>
	{#snippet result({ won, restart })}
		<div class="result">
			{#if won}
				<h1>☕</h1>
			{/if}
			<button type="button" onclick={restart}>Riprova</button>
		</div>
	{/snippet}
</WordleBoard>

<style>
	.back-button {
		position: fixed;
		top: 0em;
		left: 1em;
		font-size: 3em;
		color: var(--color-theme-1);
		text-decoration: none;
		font-weight: bold;
		z-index: 100;
	}

	.result h1 {
		font-size: 6rem;
		margin: 0;
		line-height: 1;
	}
</style>
