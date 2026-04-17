<script>
	import { base, resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { loadPuzzleState, clearPuzzleKeyPrefix } from '$lib/puzzle-utils.js';
	import ClearProgressButton from '$lib/components/ClearProgressButton.svelte';
	import { gcm26HubImage } from './hub-images.js';
	import { GCM26_STORAGE_PREFIX, gcm26Keys } from './storage-keys.js';

	let gameADone = $state(false);
	let gameBDone = $state(false);
	let gameCDone = $state(false);
	let gameDDone = $state(false);
	let codeDone = $state(false);

	const allPuzzlesDone = $derived(gameADone && gameBDone && gameCDone && gameDDone);

	onMount(() => {
		try {
			gameADone = loadPuzzleState(gcm26Keys.gameADone);
			gameBDone = loadPuzzleState(gcm26Keys.gameBDone);
			gameCDone = loadPuzzleState(gcm26Keys.gameCDone);
			gameDDone = loadPuzzleState(gcm26Keys.gameDDone);
			codeDone = loadPuzzleState(gcm26Keys.codeDone);
		} catch {
			void 0;
		}
	});

	function clearGlobalState() {
		try {
			/** Must stay in sync with `GCM26_STORAGE_PREFIX` / `gcm26Keys`. */
			clearPuzzleKeyPrefix(GCM26_STORAGE_PREFIX);
			gameADone = false;
			gameBDone = false;
			gameCDone = false;
			gameDDone = false;
			codeDone = false;
		} catch {
			void 0;
		}
	}
</script>

<svelte:head>
	<title>GCM 26</title>
</svelte:head>

<main>
		<ClearProgressButton onClear={clearGlobalState} />
		<div class="content">
			<div class="games-grid">
				<a href={resolve('/gcm26/a')} class="game-button" class:game-button-solved={gameADone}>
					{#if gameADone}<img src="{base}/gcm26/code/{gcm26HubImage.a}" alt="" class="hub-img" />{:else}?{/if}
				</a>
				<a href={resolve('/gcm26/b')} class="game-button" class:game-button-solved={gameBDone}>
					{#if gameBDone}<img src="{base}/gcm26/code/{gcm26HubImage.b}" alt="" class="hub-img" />{:else}?{/if}
				</a>
				<a href={resolve('/gcm26/c')} class="game-button" class:game-button-solved={gameCDone}>
					{#if gameCDone}<img src="{base}/gcm26/code/{gcm26HubImage.c}" alt="" class="hub-img" />{:else}?{/if}
				</a>
				<a href={resolve('/gcm26/d')} class="game-button" class:game-button-solved={gameDDone}>
					{#if gameDDone}<img src="{base}/gcm26/code/{gcm26HubImage.d}" alt="" class="hub-img" />{:else}?{/if}
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
		padding: 2rem;
		background: var(--color-white);
		border: 2px solid var(--color-border);
		border-radius: 0.5rem;
		transition: all 0.2s ease;
		font-weight: 500;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.game-button-solved {
		padding: 0;
	}

	.hub-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.code-button {
		font-size: 3rem;
		padding: 3rem;
		max-width: 200px;
		margin: 0 auto;
	}

	.code-button-solved {
		padding: 0;
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
			padding: 1.5rem;
			font-size: 1.75rem;
		}

		.code-button {
			padding: 2rem;
			font-size: 2.5rem;
		}
	}

	.arrow {
		font-size: 6rem;
		color: var(--color-text);
		margin: 1rem 0;
	}
</style>
