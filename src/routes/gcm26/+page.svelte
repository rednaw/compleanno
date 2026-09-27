<script>
	import { base, resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		loadPuzzleState,
		savePuzzleState,
		clearPuzzleState,
		clearPuzzleKeyPrefix
	} from '$lib/puzzle-utils.js';
	import ClearProgressButton from '$lib/components/ClearProgressButton.svelte';
	import HubDevBar from '$lib/components/HubDevBar.svelte';
	import { gcm26HubImage } from './hub-images.js';
	import { GCM26_STORAGE_PREFIX, gcm26Keys } from './storage-keys.js';

	/** Set true while authoring; leave false for release. */
	const DEV_MODE = false;

	let gameADone = $state(false);
	let gameBDone = $state(false);
	let gameCDone = $state(false);
	let gameDDone = $state(false);
	let codeDone = $state(false);

	const allPuzzlesDone = $derived(gameADone && gameBDone && gameCDone && gameDDone);

	/** @param {string} key @param {(v: boolean) => void} set */
	function toggleDone(key, set, current) {
		const next = !current;
		if (next) savePuzzleState(key, '1');
		else clearPuzzleState(key);
		set(next);
	}

	const devKeys = $derived([
		{
			label: 'A',
			done: gameADone,
			onToggle: () => toggleDone(gcm26Keys.gameADone, (v) => (gameADone = v), gameADone)
		},
		{
			label: 'B',
			done: gameBDone,
			onToggle: () => toggleDone(gcm26Keys.gameBDone, (v) => (gameBDone = v), gameBDone)
		},
		{
			label: 'C',
			done: gameCDone,
			onToggle: () => toggleDone(gcm26Keys.gameCDone, (v) => (gameCDone = v), gameCDone)
		},
		{
			label: 'D',
			done: gameDDone,
			onToggle: () => toggleDone(gcm26Keys.gameDDone, (v) => (gameDDone = v), gameDDone)
		},
		{
			label: '🔑',
			done: codeDone,
			onToggle: () => toggleDone(gcm26Keys.codeDone, (v) => (codeDone = v), codeDone)
		}
	]);

	onMount(() => {
		try {
			gameADone = loadPuzzleState(gcm26Keys.gameADone);
			gameBDone = loadPuzzleState(gcm26Keys.gameBDone);
			gameCDone = loadPuzzleState(gcm26Keys.gameCDone);
			gameDDone = loadPuzzleState(gcm26Keys.gameDDone);
			codeDone = loadPuzzleState(gcm26Keys.codeDone);
		} catch {
			/* localStorage may be unavailable */
		}
	});

	function clearGlobalState() {
		try {
			clearPuzzleKeyPrefix(GCM26_STORAGE_PREFIX);
			gameADone = false;
			gameBDone = false;
			gameCDone = false;
			gameDDone = false;
			codeDone = false;
		} catch {
			/* localStorage may be unavailable */
		}
	}
</script>

<svelte:head>
	<title>GCM 26</title>
</svelte:head>

<main>
	<ClearProgressButton onClear={clearGlobalState} />
	<HubDevBar enabled={DEV_MODE} keys={devKeys} />
	<div class="content">
		<div class="games-grid">
			<a href={resolve('/gcm26/a')} class="game-button" class:game-button-solved={gameADone}>
				{#if gameADone}<img
						src="{base}/gcm26/code/{gcm26HubImage.a}"
						alt=""
						class="hub-img"
					/>{:else}?{/if}
			</a>
			<a href={resolve('/gcm26/b')} class="game-button" class:game-button-solved={gameBDone}>
				{#if gameBDone}<img
						src="{base}/gcm26/code/{gcm26HubImage.b}"
						alt=""
						class="hub-img"
					/>{:else}?{/if}
			</a>
			<a href={resolve('/gcm26/c')} class="game-button" class:game-button-solved={gameCDone}>
				{#if gameCDone}<img
						src="{base}/gcm26/code/{gcm26HubImage.c}"
						alt=""
						class="hub-img"
					/>{:else}?{/if}
			</a>
			<a href={resolve('/gcm26/d')} class="game-button" class:game-button-solved={gameDDone}>
				{#if gameDDone}<img
						src="{base}/gcm26/code/{gcm26HubImage.d}"
						alt=""
						class="hub-img"
					/>{:else}?{/if}
			</a>
		</div>
		<div class="arrow">↓</div>
		<div class="code-section">
			{#if codeDone}
				<a href={resolve('/gcm26/code')} class="code-button code-button-solved">
					<img src="{base}/gcm26/code/madagascar.webp" alt="" class="hub-img" />
				</a>
			{:else if allPuzzlesDone}
				<a href={resolve('/gcm26/code')} class="code-button">?</a>
			{:else}
				<span class="code-button code-button-disabled">?</span>
			{/if}
		</div>
	</div>
</main>

<style>
	main {
		text-align: center;
		min-height: 105vh;
		display: flex;
		background: var(--color-background);
		width: 100%;
	}

	.content {
		width: 100%;
		padding: 8rem 2rem 2rem 2rem;
		display: flex;
		flex-direction: column;
		margin-top: auto;
	}

	.games-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		max-width: 400px;
		width: 100%;
		margin: 0 auto;
	}

	.code-section {
		margin-top: 2rem;
		margin-bottom: 6rem;
	}

	.game-button,
	.code-button {
		color: var(--color-text);
		text-decoration: none;
		font-size: 2rem;
		padding: 0;
		background: var(--color-white);
		border: 2px solid var(--color-border);
		border-radius: 0.5rem;
		transition: all 0.2s ease;
		font-weight: 500;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		aspect-ratio: 1;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		box-sizing: border-box;
	}

	.hub-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: block;
	}

	.code-button {
		font-size: 3rem;
		max-width: 170px;
		margin: 0 auto;
	}

	.code-button-disabled {
		opacity: 0.35;
		cursor: not-allowed;
		pointer-events: none;
	}

	.game-button:hover,
	.code-button:not(.code-button-disabled):hover {
		background: var(--color-hover-bg);
		border-color: var(--color-hover-border);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.game-button:active,
	.code-button:active {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	@media (max-width: 500px) {
		.content {
			padding: 6rem 1rem 2rem 1rem;
		}

		.games-grid {
			gap: 0.75rem;
		}

		.game-button {
			font-size: 1.75rem;
		}

		.code-button {
			font-size: 2.5rem;
		}
	}

	.arrow {
		font-size: 6rem;
		color: var(--color-text);
		margin: 1rem 0;
	}
</style>
