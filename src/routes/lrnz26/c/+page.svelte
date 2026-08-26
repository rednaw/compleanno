<script>
	import { base, resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { savePuzzleState, loadPuzzleState } from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import { lrnz26Keys } from '../storage-keys.js';
	import { lrnz26HubImage } from '../coordinates.js';
	import MusicClips from './MusicClips.svelte';
	import FinalPuzzle from './FinalPuzzle.svelte';
	import ResultFullscreen from '../../gcm26/ResultFullscreen.svelte';
	import '../../gcm26/quiz-shared.css';

	let clipsDone = $state(false);
	let finalDone = $state(false);
	let previouslyDone = $state(false);

	const allCompleted = $derived(previouslyDone || (clipsDone && finalDone));

	$effect(() => {
		if (allCompleted) savePuzzleState(lrnz26Keys.gameCDone, '1');
	});

	onMount(() => {
		if (loadPuzzleState(lrnz26Keys.gameCDone)) {
			previouslyDone = true;
		}
	});
</script>

<svelte:head>
	<title>Lrnz 26 — C</title>
</svelte:head>

<BackButton href={resolve('/lrnz26')} />

{#if allCompleted}
	<ResultFullscreen src="{base}/lrnz26/code/{lrnz26HubImage.c}" />
{:else}
<main>
	<div class="content-wrap">
		<MusicClips bind:done={clipsDone} />
		{#if clipsDone}
			<FinalPuzzle bind:done={finalDone} />
		{/if}
	</div>
</main>
{/if}

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		min-height: 100vh;
		background: var(--color-background);
		padding: 1rem 0.5rem;
		box-sizing: border-box;
		margin-top: 4rem;
	}

	.content-wrap {
		width: 100%;
		max-width: 520px;
		margin-left: auto;
		margin-right: auto;
		box-sizing: border-box;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
