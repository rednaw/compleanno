<script>
	import { base } from '$app/paths';
	import BackButton from '$lib/components/BackButton.svelte';
	import PhasedPuzzle from '$lib/components/PhasedPuzzle.svelte';
	import ResultOverlay from '$lib/components/ResultOverlay.svelte';
	import { gcm26HubImage } from '../hub-images.js';
	import { gcm26Keys } from '../storage-keys.js';
	import '$lib/quiz-form.css';

	import FilmClips from './FilmClips.svelte';
	import CommonQuestion from './CommonQuestion.svelte';
	import FinalCode from './FinalCode.svelte';

	let filmsDone = $state(false);
	let commonDone = $state(false);
	let codeDone = $state(false);

	const phasesComplete = $derived(filmsDone && commonDone && codeDone);
</script>

<svelte:head>
	<title>Indovina il film</title>
</svelte:head>

<BackButton href="/gcm26" />

<PhasedPuzzle doneKey={gcm26Keys.gameADone} complete={phasesComplete}>
	{#snippet children({ allCompleted })}
		<main>
			<div class="content-wrap">
				{#if !allCompleted}
					<FilmClips bind:done={filmsDone} />
					{#if filmsDone}
						<CommonQuestion bind:done={commonDone} />
					{/if}
					{#if commonDone}
						<FinalCode bind:done={codeDone} />
					{/if}
				{/if}

				{#if allCompleted}
					<ResultOverlay src="{base}/gcm26/code/{gcm26HubImage.a}" />
				{/if}
			</div>
		</main>
	{/snippet}
</PhasedPuzzle>

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
