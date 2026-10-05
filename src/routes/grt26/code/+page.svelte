<script>
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { savePuzzleState, loadPuzzleState } from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import CodeKeypad from '$lib/components/CodeKeypad.svelte';
	import ResultOverlay from '$lib/components/ResultOverlay.svelte';
	import { grt26Keys } from '../storage-keys.js';
	import {
		GRT26_CODE,
		GRT26_FINAL_IMAGE,
		grt26Prizes,
		grt26PrizeImages
	} from '../prizes.js';

	const PRIZES = /** @type {const} */ (['a', 'b', 'c', 'd']).map((id) => ({
		id,
		name: grt26Prizes[id].name,
		digit: grt26Prizes[id].digit,
		image: grt26PrizeImages[id]
	}));

	let success = $state(false);

	onMount(() => {
		try {
			if (loadPuzzleState(grt26Keys.codeDone)) success = true;
		} catch {
			/* localStorage may be unavailable */
		}
	});
</script>

<svelte:head>
	<title>Sai già l’ordine</title>
</svelte:head>

<BackButton href="/grt26" />

{#if success}
	<ResultOverlay src="{base}/grt26/code/{GRT26_FINAL_IMAGE}" />
{:else}
	<CodeKeypad
		correctCode={GRT26_CODE}
		onCorrect={() => {
			success = true;
			savePuzzleState(grt26Keys.codeDone, '1');
		}}
	>
		<p class="howto">Sai già l’ordine. Digita.</p>
		<ul class="prizes">
			{#each PRIZES as prize (prize.id)}
				<li>
					<img src="{base}/grt26/code/{prize.image}" alt={prize.name} class="prize-img" />
					<span class="eq">=</span>
					<span class="digit">{prize.digit}</span>
				</li>
			{/each}
		</ul>
	</CodeKeypad>
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

	.prizes {
		list-style: none;
		margin: 0 0 1.25rem;
		padding: 0;
		width: 100%;
		max-width: 18rem;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.prizes li {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		min-width: 0;
	}

	.prize-img {
		width: 3.5rem;
		height: 3.5rem;
		object-fit: cover;
		border-radius: 0.35rem;
		border: 2px solid var(--color-border);
		flex-shrink: 0;
	}

	.eq,
	.digit {
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--color-text);
		line-height: 1;
	}
</style>
