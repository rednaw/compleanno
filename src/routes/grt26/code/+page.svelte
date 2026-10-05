<script>
	import { onMount } from 'svelte';
	import { savePuzzleState, loadPuzzleState } from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import CodeKeypad from '$lib/components/CodeKeypad.svelte';
	import ResultOverlay from '$lib/components/ResultOverlay.svelte';
	import { grt26Keys } from '../storage-keys.js';
	import { GRT26_CODE, grt26Prizes } from '../prizes.js';

	const PRIZES = Object.values(grt26Prizes);

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
	<ResultOverlay text="✓" large />
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
			{#each PRIZES as prize (prize.name)}
				<li>{prize.name} = {prize.digit}</li>
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
		text-align: center;
	}

	.prizes li {
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--color-text);
		padding: 0.25rem 0;
	}
</style>
