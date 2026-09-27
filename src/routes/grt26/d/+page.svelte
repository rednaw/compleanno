<script>
	import { base } from '$app/paths';
	import manifest from './manifest.json';
	import BackButton from '$lib/components/BackButton.svelte';
	import AudioMixGuess from '$lib/components/AudioMixGuess.svelte';
	import ResultOverlay from '$lib/components/ResultOverlay.svelte';
	import { grt26DSolvedKey, grt26Keys } from '../storage-keys.js';
	import { grt26Prizes } from '../prizes.js';

	/** @type {{ id: string; title: string }[]} */
	const tracks = manifest.tracks.map((t) => ({
		id: t.id,
		title: t.title,
		src: `${base}/grt26/d/${t.id}.mp3`
	}));

	let allCompleted = $state(false);
</script>

<svelte:head>
	<title>Che canzone è?</title>
</svelte:head>

<BackButton href="/grt26" />

<main>
	{#if allCompleted}
		<ResultOverlay text={grt26Prizes.d} />
	{:else}
		<div class="mix">
			<AudioMixGuess
				{tracks}
				solvedKeyFn={grt26DSolvedKey}
				doneKey={grt26Keys.gameDDone}
				seekMode="random"
				startLabel="▶ Ascolta"
				wrongMessage="Non è questa, riprova."
				bind:allCompleted
			/>
		</div>
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

	.mix :global(.progress-hint),
	.mix :global(.field-feedback),
	.mix :global(.clip-hint) {
		color: var(--color-white);
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}
</style>
