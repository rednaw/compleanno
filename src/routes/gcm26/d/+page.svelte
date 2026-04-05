<script>
	import { base, resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		checkOrientation,
		setupOrientationListeners,
		savePuzzleState,
		loadPuzzleState,
		clearPuzzleState
	} from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import RotateMessage from '$lib/components/RotateMessage.svelte';
	import { gcm26HubDigit } from '../hub-digits.js';
	import { gcm26Keys } from '../storage-keys.js';
	import {
		GAME_D_HEADING,
		lineById,
		GAME_D_CORRECT_ORDER,
		GAME_D_START_ORDER,
		isValidSavedOrder
	} from './items.js';

	let showRotateMessage = $state(false);

	let solved = $state(false);
	/** @type {string[]} */
	let orderIds = $state([...GAME_D_START_ORDER]);
	/** @type {'idle' | 'wrong'} */
	let checkStatus = $state('idle');

	/** @param {string} id */
	function lineImageSrc(id) {
		const file = lineById[id].image;
		return file ? `${base}/gcm26/d/${file}` : null;
	}

	function persistOrder() {
		if (solved) return;
		try {
			localStorage.setItem(gcm26Keys.gameDOrder, JSON.stringify(orderIds));
		} catch {
			void 0;
		}
	}

	function loadSavedOrder() {
		try {
			const raw = localStorage.getItem(gcm26Keys.gameDOrder);
			if (!raw) return null;
			const parsed = JSON.parse(raw);
			return isValidSavedOrder(parsed) ? parsed : null;
		} catch {
			return null;
		}
	}

	/** @param {number} i @param {number} j */
	function swapRows(i, j) {
		if (solved || j < 0 || j >= orderIds.length) return;
		const next = [...orderIds];
		[next[i], next[j]] = [next[j], next[i]];
		orderIds = next;
		checkStatus = 'idle';
		persistOrder();
	}

	function checkOrder() {
		if (solved) return;
		if (GAME_D_CORRECT_ORDER.every((id, i) => orderIds[i] === id)) {
			solved = true;
			checkStatus = 'idle';
			savePuzzleState(gcm26Keys.gameDDone, '1');
			clearPuzzleState(gcm26Keys.gameDOrder);
		} else {
			checkStatus = 'wrong';
		}
	}

	onMount(() => {
		try {
			if (loadPuzzleState(gcm26Keys.gameDDone)) {
				solved = true;
				orderIds = [...GAME_D_CORRECT_ORDER];
			} else {
				const saved = loadSavedOrder();
				if (saved) orderIds = saved;
			}
		} catch {
			void 0;
		}

		const updateOrientation = () => {
			showRotateMessage = !checkOrientation(true);
		};
		updateOrientation();
		return setupOrientationListeners(updateOrientation);
	});
</script>

<svelte:head>
	<title>Metti in ordine · GCM 26</title>
</svelte:head>

<BackButton href={resolve('/gcm26')} />

<RotateMessage show={showRotateMessage} encouragePortrait={true} />

{#if !showRotateMessage}
	<main>
		<div class="quiz-wrap">
			<h1 class="game-heading">{GAME_D_HEADING}</h1>

			<p class="help-text" id="order-hint">
				Usa Su e Giù per ordinare le frasi, poi premi Controlla.
			</p>

			<div
				class="order-list"
				role="list"
				aria-describedby="order-hint"
				class:order-list-solved={solved}
				class:order-list-wrong={checkStatus === 'wrong'}
			>
				{#each orderIds as id, i (id)}
					{@const imgSrc = lineImageSrc(id)}
					<div class="order-row" role="listitem">
						<p class="line-text">{lineById[id].text}</p>
						<div class="order-row-controls">
							{#if imgSrc}
								<img
									class="row-thumb"
									src={imgSrc}
									alt=""
									loading="lazy"
									decoding="async"
									width="72"
									height="72"
								/>
							{/if}
							<span class="move-btns">
								<button
									type="button"
									class="move-btn"
									onclick={() => swapRows(i, i - 1)}
									disabled={solved || i === 0}
									aria-label="Sposta su: {lineById[id].text}"
								>
									Su
								</button>
								<button
									type="button"
									class="move-btn"
									onclick={() => swapRows(i, i + 1)}
									disabled={solved || i === orderIds.length - 1}
									aria-label="Sposta giù: {lineById[id].text}"
								>
									Giù
								</button>
							</span>
						</div>
					</div>
				{/each}
			</div>

			{#if !solved}
				<div class="check-row">
					<button type="button" class="check-btn" onclick={() => checkOrder()}> Controlla </button>
				</div>
				{#if checkStatus === 'wrong'}
					<p class="wrong-msg" role="status">Ordine errato. Continua a riordinare.</p>
				{/if}
			{:else}
				<p class="solved-msg" role="status">Ordine corretto.</p>
			{/if}

			{#if solved}
				<div class="result-section">
					<p class="result-text">
						<span class="result-emoji" aria-hidden="true">🎉</span>
						<span class="result-digit">{gcm26HubDigit.d}</span>
					</p>
				</div>
			{/if}
		</div>
	</main>
{/if}

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		min-height: 100vh;
		background: var(--color-background);
		padding: 1rem 0.5rem 1rem 0.5rem;
		box-sizing: border-box;
		margin-top: 4rem;
	}

	.quiz-wrap {
		width: 100%;
		max-width: 520px;
		margin-left: auto;
		margin-right: auto;
		box-sizing: border-box;
		text-align: center;
	}

	.game-heading {
		font-size: clamp(1.25rem, 4vw, 1.5rem);
		font-weight: 700;
		color: var(--color-text);
		margin: 0 0 0.75rem;
		line-height: 1.3;
	}

	.help-text {
		font-size: 0.95rem;
		color: var(--color-text);
		margin: 0 0 1.25rem;
		line-height: 1.4;
		opacity: 0.92;
	}

	.order-list {
		padding: 0;
		margin: 0 auto 1.25rem;
		width: 100%;
		text-align: left;
		box-sizing: border-box;
		border-radius: 0.5em;
		background: var(--color-white);
		border: 2px solid var(--color-border);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}

	.order-list-wrong {
		border-color: #d32f2f;
		background: #ffcdd2;
	}

	.order-list-solved {
		border-color: #388e3c;
		background: #e8f5e9;
	}

	.order-row {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.55rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border);
		font-size: 1.05em;
		line-height: 1.45;
	}

	.order-row-controls {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
		gap: 0.65rem;
	}

	.row-thumb {
		width: 4.5rem;
		height: 4.5rem;
		object-fit: cover;
		display: block;
		flex-shrink: 0;
	}

	.order-row:last-child {
		border-bottom: none;
	}

	.line-text {
		margin: 0;
		width: 100%;
		min-width: 0;
		text-wrap: pretty;
		hyphens: auto;
		-webkit-hyphens: auto;
		color: var(--color-text);
	}

	.move-btns {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		flex-shrink: 0;
		margin-left: auto;
	}

	.move-btn {
		font-size: 0.88em;
		padding: 0.4em 0.65em;
		border-radius: 0.45em;
		border: none;
		background: var(--color-theme-2);
		color: var(--color-white);
		font-weight: 600;
		cursor: pointer;
	}

	.move-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.check-row {
		margin-bottom: 0.75rem;
	}

	.check-btn {
		font-size: 1.05em;
		padding: 0.55em 1.25em;
		border-radius: 0.5em;
		border: none;
		background: var(--color-theme-1);
		color: var(--color-white);
		font-weight: 700;
		cursor: pointer;
	}

	.wrong-msg,
	.solved-msg {
		font-weight: 600;
		margin: 0 0 1rem;
		font-size: 0.95rem;
	}

	.wrong-msg {
		color: #b71c1c;
	}

	.solved-msg {
		color: #1b5e20;
	}

	.result-section {
		text-align: center;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 0.5rem;
		border: 2px solid var(--color-border);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		padding: 1.2rem 1.5rem;
		width: fit-content;
		min-width: 140px;
		margin: 1.5rem auto 0;
	}

	.result-text {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.45em;
		font-size: 2.2rem;
		margin: 0;
		font-weight: bold;
		color: var(--color-text);
	}

	.result-digit {
		font-variant-numeric: tabular-nums;
	}

	@media (max-width: 480px) {
		.row-thumb {
			width: 3.75rem;
			height: 3.75rem;
		}

		.move-btns {
			flex-direction: row;
		}
	}
</style>
