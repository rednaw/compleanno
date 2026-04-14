<script>
	import { base, resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		checkOrientation,
		setupOrientationListeners,
		savePuzzleState
	} from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import RotateMessage from '$lib/components/RotateMessage.svelte';
	import { gcm26Keys } from '../storage-keys.js';

	let showRotateMessage = $state(false);

	onMount(() => {
		savePuzzleState(gcm26Keys.gameDDone, '1');

		const updateOrientation = () => {
			showRotateMessage = !checkOrientation(false);
		};
		updateOrientation();
		return setupOrientationListeners(updateOrientation);
	});
</script>

<svelte:head>
	<title>GCM 26 — D</title>
</svelte:head>

<BackButton href={resolve('/gcm26')} />

<RotateMessage show={showRotateMessage} encouragePortrait={false} />

{#if !showRotateMessage}
	<main>
		<img src="{base}/gcm26/d/spider.png" alt="Puzzle D" class="puzzle-image" />
	</main>
{/if}

<style>
	main {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: var(--color-background);
		padding: 0;
		margin: 0;
	}

	.puzzle-image {
		width: 100%;
		height: 100vh;
		object-fit: contain;
	}
</style>
