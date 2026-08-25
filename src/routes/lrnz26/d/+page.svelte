<script>
	import { base, resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { savePuzzleState, loadPuzzleState } from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import { lrnz26Keys } from '../storage-keys.js';
	import { lrnz26HubImage } from '../coordinates.js';
	import ReversedSongs from './ReversedSongs.svelte';
	import ResultFullscreen from '../../gcm26/ResultFullscreen.svelte';
	import DevSkipButton from '../DevSkipButton.svelte';
	import { tracks } from './tracks.js';
	import { saveTrackSolved } from './persistence.js';
	import '../../gcm26/quiz-shared.css';

	let songsDone = $state(false);
	let previouslyDone = $state(false);

	const allCompleted = $derived(previouslyDone || songsDone);

	$effect(() => {
		if (allCompleted) savePuzzleState(lrnz26Keys.gameDDone, '1');
	});

	onMount(() => {
		if (loadPuzzleState(lrnz26Keys.gameDDone)) {
			previouslyDone = true;
		}
	});

	function skipPuzzle() {
		if (allCompleted) return;
		for (const t of tracks) saveTrackSolved(t.id);
		songsDone = true;
	}
</script>

<svelte:head>
	<title>Lrnz 26 — D</title>
</svelte:head>

<BackButton href={resolve('/lrnz26')} />
<DevSkipButton onSkip={skipPuzzle} />

{#if allCompleted}
	<ResultFullscreen src="{base}/lrnz26/code/{lrnz26HubImage.d}" />
{:else}
<main>
	<div class="content-wrap">
		<ReversedSongs bind:done={songsDone} />
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
