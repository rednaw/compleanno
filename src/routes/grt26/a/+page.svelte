<script>
	import { base } from '$app/paths';
	import BackButton from '$lib/components/BackButton.svelte';
	import WordleBoard from '$lib/components/WordleBoard.svelte';
	import ResultOverlay from '$lib/components/ResultOverlay.svelte';
	import { grt26Keys } from '../storage-keys.js';
	import { grt26PrizeImages } from '../prizes.js';

	const ANSWER = 'sofia';
	let won = $state(false);
</script>

<svelte:head>
	<title>Indovina la parola</title>
</svelte:head>

<BackButton href="/grt26" />

<WordleBoard
	answer={ANSWER}
	storageKey={grt26Keys.wordle}
	doneKey={grt26Keys.gameADone}
	onWon={() => {
		won = true;
	}}
>
	<h1>Indovina la parola</h1>
</WordleBoard>

{#if won}
	<ResultOverlay src="{base}/grt26/code/{grt26PrizeImages.a}" />
{/if}
