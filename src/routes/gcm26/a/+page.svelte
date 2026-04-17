<script>
	import { base, resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { savePuzzleState, loadPuzzleState } from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import { gcm26HubImage } from '../hub-images.js';
	import { gcm26Keys } from '../storage-keys.js';
	import ResultFullscreen from '../ResultFullscreen.svelte';
	import '../quiz-shared.css';

	import FilmClips from './FilmClips.svelte';
	import CommonQuestion from './CommonQuestion.svelte';
	import FinalCode from './FinalCode.svelte';

	let filmsDone = $state(false);
	let commonDone = $state(false);
	let codeDone = $state(false);
	let previouslyDone = $state(false);

	const allCompleted = $derived(previouslyDone || (filmsDone && commonDone && codeDone));

	/** @type {CommonQuestion} */
	let commonRef;
	/** @type {FinalCode} */
	let codeRef;

	$effect(() => {
		if (allCompleted) savePuzzleState(gcm26Keys.gameADone, '1');
	});

	onMount(() => {
		try {
			if (loadPuzzleState(gcm26Keys.gameADone)) {
				previouslyDone = true;
			}
		} catch { /* localStorage may be unavailable */ }
		commonRef.restore(filmsDone);
		codeRef.restore(commonDone);
	});
</script>

<svelte:head>
	<title>Indovina il film</title>
</svelte:head>

<BackButton href={resolve('/gcm26')} />

<main>
	<div class="content-wrap">
		<FilmClips bind:done={filmsDone} />
		<CommonQuestion bind:this={commonRef} enabled={filmsDone} bind:done={commonDone} />
		<FinalCode bind:this={codeRef} enabled={commonDone} bind:done={codeDone} />

		{#if allCompleted}
			<ResultFullscreen src="{base}/gcm26/code/{gcm26HubImage.a}" />
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
</style>
