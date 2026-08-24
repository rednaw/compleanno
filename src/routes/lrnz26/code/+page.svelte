<script>
	import { base, resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		savePuzzleState,
		loadPuzzleState,
		clearPuzzleState
	} from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import { lrnz26Keys } from '../storage-keys.js';
	import CodeSolved from '../CodeSolved.svelte';
	import { formatCoords, locationByLineId, mapsUrl } from '../coordinates.js';
	import {
		CODE_HEADING,
		lineById,
		CODE_CORRECT_ORDER,
		CODE_START_ORDER,
		isValidSavedOrder
	} from './items.js';

	let solved = $state(false);
	/** @type {string[]} */
	let orderIds = $state([...CODE_START_ORDER]);
	/** @type {'idle' | 'wrong'} */
	let checkStatus = $state('idle');

	/** @param {string} id */
	function lineImageSrc(id) {
		const file = lineById[id].image;
		return file ? `${base}/lrnz26/code/${file}` : null;
	}

	function persistOrder() {
		if (solved) return;
		try {
			localStorage.setItem(lrnz26Keys.codeOrder, JSON.stringify(orderIds));
		} catch { /* localStorage may be unavailable */ }
	}

	function loadSavedOrder() {
		try {
			const raw = localStorage.getItem(lrnz26Keys.codeOrder);
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
		if (CODE_CORRECT_ORDER.every((id, i) => orderIds[i] === id)) {
			solved = true;
			checkStatus = 'idle';
			savePuzzleState(lrnz26Keys.codeDone, '1');
			clearPuzzleState(lrnz26Keys.codeOrder);
		} else {
			checkStatus = 'wrong';
		}
	}

	onMount(() => {
		try {
			if (loadPuzzleState(lrnz26Keys.codeDone)) {
				solved = true;
				orderIds = [...CODE_CORRECT_ORDER];
			} else {
				const saved = loadSavedOrder();
				if (saved) orderIds = saved;
			}
		} catch { /* localStorage may be unavailable */ }
	});
</script>

<svelte:head>
	<title>Lrnz 26 — Code</title>
</svelte:head>

<BackButton href={resolve('/lrnz26')} />

{#if solved}
	<CodeSolved orderedIds={CODE_CORRECT_ORDER} />
{:else}
	<main>
		<div class="quiz-wrap">
			<h1 class="game-heading">{CODE_HEADING}</h1>

			<div
				class="order-list"
				role="list"
				aria-describedby="order-hint"
				class:order-list-wrong={checkStatus === 'wrong'}
			>
				{#each orderIds as id, i (id)}
					{@const imgSrc = lineImageSrc(id)}
					{@const point = locationByLineId(id)}
					<div class="order-row" role="listitem">
						<a
							class="line-link"
							href={mapsUrl(point.lat, point.lng)}
							target="_blank"
							rel="noopener noreferrer"
						>
							{formatCoords(point.lat, point.lng)}
						</a>
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
									disabled={i === 0}
									aria-label="Sposta su: {lineById[id].text}"
								>
									Su
								</button>
								<button
									type="button"
									class="move-btn"
									onclick={() => swapRows(i, i + 1)}
									disabled={i === orderIds.length - 1}
									aria-label="Sposta giù: {lineById[id].text}"
								>
									Giù
								</button>
							</span>
						</div>
					</div>
				{/each}
			</div>

			<div class="check-row">
				<button type="button" class="check-btn" onclick={() => checkOrder()}> Controlla </button>
			</div>
			{#if checkStatus === 'wrong'}
				<p class="wrong-msg" role="status">Ordine errato. Continua a riordinare.</p>
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
	}

	.quiz-wrap {
		width: 100%;
		max-width: 520px;
		margin-left: auto;
		margin-right: auto;
		box-sizing: border-box;
		text-align: center;
		padding: 5rem 1rem 2rem;
	}

	.game-heading {
		font-size: clamp(1.25rem, 4vw, 1.5rem);
		font-weight: 700;
		color: var(--color-text);
		margin: 0 0 0.75rem;
		line-height: 1.3;
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
		border-color: var(--color-error-border);
		background: var(--color-error-bg);
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
		border-radius: 0.35rem;
	}

	.order-row:last-child {
		border-bottom: none;
	}

	.line-link {
		margin: 0;
		width: 100%;
		min-width: 0;
		font-family: ui-monospace, 'Cascadia Code', 'DejaVu Sans Mono', monospace;
		font-size: 0.95em;
		font-weight: 600;
		line-height: 1.45;
		color: var(--color-text);
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}

	.line-link:active {
		opacity: 0.75;
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

	.wrong-msg {
		font-weight: 600;
		margin: 0 0 1rem;
		font-size: 0.95rem;
		color: var(--color-error-text);
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
