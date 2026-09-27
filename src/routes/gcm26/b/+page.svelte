<script>
	import { base } from '$app/paths';
	import manifest from './manifest.json';
	import BackButton from '$lib/components/BackButton.svelte';
	import AudioMixGuess from '$lib/components/AudioMixGuess.svelte';
	import ResultOverlay from '$lib/components/ResultOverlay.svelte';
	import { gcm26HubImage } from '../hub-images.js';
	import { gcm26BSolvedKey, gcm26Keys } from '../storage-keys.js';
	import '$lib/quiz-form.css';

	/** @type {{ id: string; title: string }[]} */
	const tracks = manifest.tracks.map((t) => ({
		id: t.id,
		title: t.title,
		src: `${base}/gcm26/b/${t.id}.mp3`
	}));

	let allCompleted = $state(false);
</script>

<svelte:head>
	<title>Cacophony</title>
</svelte:head>

<BackButton href="/gcm26" />

<main>
	{#if allCompleted}
		<ResultOverlay src="{base}/gcm26/code/{gcm26HubImage.b}" />
	{:else}
		<AudioMixGuess
			{tracks}
			solvedKeyFn={gcm26BSolvedKey}
			doneKey={gcm26Keys.gameBDone}
			seekMode="phased"
			submitLabel="Submit"
			clearDoneWhenIncomplete
			progressLabel={(n, total) => `${n} / ${total} songs identified`}
			bind:allCompleted
		/>
	{/if}
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		min-height: 100vh;
		padding: 1rem 0.5rem;
		box-sizing: border-box;
		margin-top: 4rem;
	}
</style>
