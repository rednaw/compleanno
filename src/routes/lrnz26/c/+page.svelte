<script>
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { savePuzzleState, loadPuzzleState } from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import { lrnz26Keys } from '../storage-keys.js';
	import MusicClips from './MusicClips.svelte';
	import '../../gcm26/quiz-shared.css';

	let clipsDone = $state(false);
	let previouslyDone = $state(false);

	const allCompleted = $derived(previouslyDone || clipsDone);

	$effect(() => {
		if (allCompleted) savePuzzleState(lrnz26Keys.gameCDone, '1');
	});

	onMount(() => {
		try {
			if (loadPuzzleState(lrnz26Keys.gameCDone)) {
				previouslyDone = true;
				clipsDone = true;
			}
		} catch { /* localStorage may be unavailable */ }
	});
</script>

<svelte:head>
	<title>Lrnz 26 — C</title>
</svelte:head>

<BackButton href={resolve('/lrnz26')} />

<main>
	<div class="content-wrap">
		<MusicClips bind:done={clipsDone} />

		{#if allCompleted}
			<p class="success" aria-live="polite">All bands identified!</p>
		{/if}
	</div>
</main>

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

	.success {
		margin: 1rem 0 0;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-success-bg-strong);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}
</style>
