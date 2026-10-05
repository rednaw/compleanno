<script>
	import { base } from '$app/paths';
	import { onMount, tick } from 'svelte';
	import { savePuzzleState, loadPuzzleState } from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import PhotoGuessGrid from '$lib/components/PhotoGuessGrid.svelte';
	import GuessRow from '$lib/components/GuessRow.svelte';
	import ResultOverlay from '$lib/components/ResultOverlay.svelte';
	import { answerMatches } from '$lib/normalize.js';
	import { grt26CItemKey, grt26Keys } from '../storage-keys.js';
	import { grt26PrizeImages } from '../prizes.js';

	const ITEMS = [
		{ id: 'one', file: 'one.jpg', answers: ['gogh', 'van gogh'] },
		{ id: 'two', file: 'two.jpeg', answers: ['vermeer'] },
		{ id: 'three', file: 'three.jpg', answers: ['rembrandt'] },
		{ id: 'four', file: 'four.jpg', answers: ['mondriaan'] }
	];

	const gridItems = ITEMS.map((item) => ({
		id: item.id,
		src: `${base}/grt26/c/${item.file}`
	}));

	/** @type {Record<string, boolean>} */
	let solved = $state(Object.fromEntries(ITEMS.map((item) => [item.id, false])));
	let guess = $state('');
	/** @type {'idle' | 'wrong'} */
	let status = $state('idle');
	let allCompleted = $state(false);
	/** @type {string | null} */
	let flashId = $state(null);
	let gridShake = $state(false);

	function checkAllCompleted() {
		const done = ITEMS.every((item) => solved[item.id]);
		if (done) savePuzzleState(grt26Keys.gameCDone, '1');
		return done;
	}

	async function submit() {
		if (allCompleted || !guess.trim()) return;
		const match = ITEMS.find((item) => !solved[item.id] && answerMatches(guess, item.answers));
		if (match) {
			solved[match.id] = true;
			savePuzzleState(grt26CItemKey(match.id), '1');
			guess = '';
			status = 'idle';
			flashId = null;
			await tick();
			flashId = match.id;
			window.setTimeout(() => {
				if (flashId === match.id) flashId = null;
			}, 700);
			if (checkAllCompleted()) {
				window.setTimeout(() => {
					allCompleted = true;
				}, 550);
			}
		} else {
			status = 'wrong';
			gridShake = true;
			window.setTimeout(() => {
				gridShake = false;
				status = 'idle';
			}, 450);
		}
	}

	onMount(() => {
		try {
			for (const item of ITEMS) {
				if (loadPuzzleState(grt26CItemKey(item.id))) {
					solved[item.id] = true;
				}
			}
			if (loadPuzzleState(grt26Keys.gameCDone)) {
				allCompleted = true;
			} else {
				checkAllCompleted();
			}
		} catch {
			/* localStorage may be unavailable */
		}
	});
</script>

<svelte:head>
	<title>Chi l'ha dipinto?</title>
</svelte:head>

<BackButton href="/grt26" />

<main>
	<h1>Chi l'ha dipinto?</h1>
	<p class="howto">Scrivi il nome del pittore di ogni quadro.</p>

	<PhotoGuessGrid items={gridItems} {solved} {flashId} shake={gridShake} />

	{#if !allCompleted}
		<GuessRow bind:value={guess} wrong={status === 'wrong'} onSubmit={submit} />
	{/if}
</main>

{#if allCompleted}
	<ResultOverlay src="{base}/grt26/code/{grt26PrizeImages.c}" />
{/if}

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		min-height: 100vh;
		padding: 5rem 1rem 2rem;
		box-sizing: border-box;
		gap: 1.25rem;
	}

	h1 {
		margin: 0;
		font-size: 1.5rem;
		text-align: center;
		color: var(--color-white);
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
	}

	.howto {
		margin: -0.5rem 0 0;
		max-width: 22rem;
		text-align: center;
		font-size: 0.95rem;
		line-height: 1.35;
		color: var(--color-white);
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
		opacity: 0.95;
	}
</style>
