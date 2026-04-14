<script>
	import { base, resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		checkOrientation,
		setupOrientationListeners,
		savePuzzleState,
		loadPuzzleState
	} from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import RotateMessage from '$lib/components/RotateMessage.svelte';
	import { gcm26HubImage } from '../hub-images.js';
	import { gcm26Keys } from '../storage-keys.js';
	import ResultFullscreen from '../ResultFullscreen.svelte';

	const ACCEPTED = ['placeholder'];

	let showRotateMessage = $state(false);
	let barOpen = $state(false);
	let guess = $state('');
	let shaking = $state(false);
	let solved = $state(false);

	/** @type {HTMLInputElement | undefined} */
	let inputEl = $state();

	function openBar() {
		if (solved) return;
		barOpen = true;
		requestAnimationFrame(() => inputEl?.focus());
	}

	function closeBar() {
		barOpen = false;
		guess = '';
	}

	function submit() {
		if (!guess.trim()) return;
		if (ACCEPTED.includes(guess.trim().toLowerCase())) {
			solved = true;
			barOpen = false;
			savePuzzleState(gcm26Keys.gameDDone, '1');
		} else {
			shaking = true;
			guess = '';
			setTimeout(() => (shaking = false), 500);
		}
	}

	/** @param {MouseEvent} e */
	function onBackdropClick(e) {
		if (/** @type {HTMLElement} */ (e.target).classList.contains('bar-backdrop')) {
			closeBar();
		}
	}

	onMount(() => {
		try {
			if (loadPuzzleState(gcm26Keys.gameDDone)) {
				solved = true;
			}
		} catch {
			void 0;
		}

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
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<main onclick={openBar}>
		<img src="{base}/gcm26/d/spider.png" alt="Puzzle D" class="puzzle-image" />

		{#if solved}
			<ResultFullscreen src="{base}/gcm26/code/{gcm26HubImage.d}" />
		{/if}
	</main>

	{#if barOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="bar-backdrop" onclick={onBackdropClick}>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<form
				class="input-bar"
				class:shaking
				onsubmit={(e) => { e.preventDefault(); submit(); }}
				onclick={(e) => e.stopPropagation()}
			>
				<input
					bind:this={inputEl}
					bind:value={guess}
					type="text"
					class="bar-input"
					autocomplete="off"
					autocapitalize="off"
				/>
				<button type="submit" class="bar-btn" disabled={!guess.trim()}>→</button>
			</form>
		</div>
	{/if}
{/if}

<style>
	main {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: #000;
		padding: 0;
		margin: 0;
		cursor: pointer;
		position: relative;
	}

	.puzzle-image {
		width: 100%;
		height: 100vh;
		object-fit: contain;
	}

	.bar-backdrop {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.input-bar {
		display: flex;
		gap: 0.5rem;
		width: 100%;
		max-width: 480px;
		padding: 0.75rem 1rem;
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		box-sizing: border-box;
	}

	.bar-input {
		flex: 1;
		font-size: 1.1rem;
		padding: 0.55rem 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 0.4rem;
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
		outline: none;
	}

	.bar-input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.bar-input:focus {
		border-color: rgba(255, 255, 255, 0.5);
	}

	.bar-btn {
		font-size: 1.3rem;
		padding: 0.45rem 0.9rem;
		border: none;
		border-radius: 0.4rem;
		background: var(--color-theme-1, #4a90d9);
		color: #fff;
		font-weight: 700;
		cursor: pointer;
	}

	.bar-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		15%,
		45%,
		75% {
			transform: translateX(-6px);
		}
		30%,
		60%,
		90% {
			transform: translateX(6px);
		}
	}

	.shaking {
		animation: shake 0.4s ease-in-out;
	}
</style>
