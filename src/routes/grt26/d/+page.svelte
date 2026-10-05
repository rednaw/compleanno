<script>
	import { base } from '$app/paths';
	import manifest from './manifest.json';
	import BackButton from '$lib/components/BackButton.svelte';
	import AudioMixGuess from '$lib/components/AudioMixGuess.svelte';
	import ResultOverlay from '$lib/components/ResultOverlay.svelte';
	import { grt26DSolvedKey, grt26Keys } from '../storage-keys.js';
	import { grt26PrizeImages } from '../prizes.js';

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
		<ResultOverlay src="{base}/grt26/code/{grt26PrizeImages.d}" />
	{:else}
		<h1>Che canzone è?</h1>
		<p class="howto">Ascolta il mix e indovina le canzoni, una alla volta.</p>
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
		gap: 0.5rem;
	}

	h1 {
		margin: 0;
		font-size: 1.5rem;
		text-align: center;
		color: var(--color-white);
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
	}

	.howto {
		margin: 0 0 0.75rem;
		max-width: 22rem;
		text-align: center;
		font-size: 0.95rem;
		line-height: 1.35;
		color: var(--color-white);
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
		opacity: 0.95;
	}

	.mix :global(.progress-hint),
	.mix :global(.field-feedback),
	.mix :global(.clip-hint) {
		color: var(--color-white);
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}
</style>
