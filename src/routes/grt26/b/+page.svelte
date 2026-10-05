<script>
	import { base } from '$app/paths';
	import BackButton from '$lib/components/BackButton.svelte';
	import ConnectionsBoard from '$lib/components/ConnectionsBoard.svelte';
	import ResultOverlay from '$lib/components/ResultOverlay.svelte';
	import { grt26Keys } from '../storage-keys.js';
	import { grt26PrizeImages } from '../prizes.js';

	const GROUPS = [
		{ name: 'Bisnonni', color: '#f7d070', words: ['omirp', 'airad', 'erotama', 'ailuig'] },
		{
			name: 'Amici a quattro zampe',
			color: '#50b0e3',
			words: ['sushi', 'pixel', 'spijker', 'tappo']
		},
		{
			name: 'Lo studio di GMJ',
			color: '#a78bfa',
			words: ['global', 'art', 'culture', 'politics']
		},
		{ name: 'Luoghi storici di Champoluc', color: '#94d3a2', words: [
      'Crest', 'Golo', 'Churen', 'Conigli'
    ] }
	];

	let won = $state(false);
</script>

<svelte:head>
	<title>Collega le parole</title>
</svelte:head>

<BackButton href="/grt26" />

<main class="container">
	<h1>Collega le parole</h1>
	<p class="howto">Forma 4 gruppi di 4 parole che hanno qualcosa in comune.</p>
	<ConnectionsBoard
		groups={GROUPS}
		seed={0x51b26026}
		solvedKey={grt26Keys.connectionsSolved}
		doneKey={grt26Keys.gameBDone}
		onWon={() => {
			won = true;
		}}
	/>
</main>

{#if won}
	<ResultOverlay src="{base}/grt26/code/{grt26PrizeImages.b}" />
{/if}

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		min-height: 100vh;
		padding: 11rem 1rem 2rem;
		box-sizing: border-box;
		gap: 0.75rem;
	}

	h1 {
		margin: 0;
		font-size: 1.5rem;
		text-align: center;
		color: var(--color-white);
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
	}

	.howto {
		margin: 0 0 0.5rem;
		max-width: 22rem;
		text-align: center;
		font-size: 0.95rem;
		line-height: 1.35;
		color: var(--color-white);
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
		opacity: 0.95;
	}

	@media (max-width: 500px) {
		.container {
			padding: 9rem 0.75rem 1.5rem;
		}
	}
</style>
