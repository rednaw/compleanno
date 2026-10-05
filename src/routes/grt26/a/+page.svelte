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
	<p class="howto">
		Parola di 5 lettere. Verde = posto giusto · giallo = nella parola · grigio = no.
	</p>
</WordleBoard>

{#if won}
	<ResultOverlay src="{base}/grt26/code/{grt26PrizeImages.a}" />
{/if}

<style>
	.howto {
		margin: 0 0 1rem;
		max-width: 22rem;
		text-align: center;
		font-size: 0.95rem;
		line-height: 1.35;
		color: var(--color-text);
		opacity: 0.85;
	}

	:global(.main-container h1) {
		margin: 0 0 0.5rem;
		font-size: 1.5rem;
		text-align: center;
	}
</style>
