<script>
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import RotateMessage from '$lib/components/RotateMessage.svelte';
	import {
		checkOrientation,
		setupOrientationListeners,
		loadPuzzleState,
		clearPuzzleKeyPrefix
	} from '$lib/puzzle-utils.js';
	import ClearProgressButton from '$lib/components/ClearProgressButton.svelte';
	import { gcm26HubDigit } from '$lib/gcm26-hub-digits.js';

	let showRotateMessage = $state(false);
	let gameADone = $state(false);
	let gameBDone = $state(false);
	let gameCDone = $state(false);
	let gameDDone = $state(false);

	onMount(() => {
		try {
			gameADone = loadPuzzleState('gcm26_game_a_done');
			gameBDone = loadPuzzleState('gcm26_game_b_done');
			gameCDone = loadPuzzleState('gcm26_game_c_done');
			gameDDone = loadPuzzleState('gcm26_game_d_done');
		} catch {
			void 0;
		}

		const updateOrientation = () => {
			showRotateMessage = !checkOrientation(true);
		};
		updateOrientation();
		return setupOrientationListeners(updateOrientation);
	});

	function clearGlobalState() {
		try {
			/** All gcm26 games must use localStorage keys prefixed with `gcm26_` so the hub can reset without importing any game module. */
			clearPuzzleKeyPrefix('gcm26_');
			gameADone = false;
			gameBDone = false;
			gameCDone = false;
			gameDDone = false;
		} catch {
			void 0;
		}
	}
</script>

<svelte:head>
	<title>GCM 26</title>
</svelte:head>

<RotateMessage show={showRotateMessage} encouragePortrait={true} />

{#if !showRotateMessage}
	<main>
		<ClearProgressButton onClear={clearGlobalState} />
		<div class="content">
			<div class="games-grid">
				<a href={resolve('/gcm26/a')} class="game-button">{gameADone ? gcm26HubDigit.a : '?'}</a>
				<a href={resolve('/gcm26/b')} class="game-button">{gameBDone ? gcm26HubDigit.b : '?'}</a>
				<a href={resolve('/gcm26/c')} class="game-button">{gameCDone ? gcm26HubDigit.c : '?'}</a>
				<a href={resolve('/gcm26/d')} class="game-button">{gameDDone ? gcm26HubDigit.d : '?'}</a>
			</div>
			<div class="arrow">↓</div>
			<div class="code-section">
				<a href={resolve('/gcm26/code')} class="code-button">?</a>
			</div>
		</div>
	</main>
{/if}

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
	}

	.code-button {
		font-size: 3rem;
		padding: 3rem;
		max-width: 200px;
		margin: 0 auto;
	}

	.game-button:hover,
	.code-button:hover {
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
