<script>
	import { onMount } from 'svelte';
	import { savePuzzleState, loadPuzzleState, clearPuzzleState } from '$lib/puzzle-utils.js';

	/**
	 * Reorderable list + Controlla. Trail owns each row via snippet.
	 * @typedef {object} Props
	 * @property {string[]} startOrder
	 * @property {string[]} correctOrder
	 * @property {(ids: unknown) => boolean} isValidSavedOrder
	 * @property {string} orderKey
	 * @property {string} doneKey
	 * @property {string} [heading]
	 * @property {string} [checkLabel]
	 * @property {string} [wrongMessage]
	 * @property {boolean} [solved]
	 * @property {() => void} [onSolved]
	 * @property {import('svelte').Snippet<[ {
	 *   id: string,
	 *   index: number,
	 *   moveUp: () => void,
	 *   moveDown: () => void,
	 *   isFirst: boolean,
	 *   isLast: boolean
	 * } ]>} row
	 */
	/** @type {Props} */
	let {
		startOrder,
		correctOrder,
		isValidSavedOrder,
		orderKey,
		doneKey,
		heading = '',
		checkLabel = 'Controlla',
		wrongMessage = 'Ordine errato. Continua a riordinare.',
		solved = $bindable(false),
		onSolved,
		row
	} = $props();

	/** @type {string[]} */
	let orderIds = $state([...startOrder]);
	/** @type {'idle' | 'wrong'} */
	let checkStatus = $state('idle');

	function persistOrder() {
		if (solved) return;
		try {
			localStorage.setItem(orderKey, JSON.stringify(orderIds));
		} catch {
			/* localStorage may be unavailable */
		}
	}

	function loadSavedOrder() {
		try {
			const raw = localStorage.getItem(orderKey);
			if (!raw) return null;
			const parsed = JSON.parse(raw);
			return isValidSavedOrder(parsed) ? /** @type {string[]} */ (parsed) : null;
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

	function complete() {
		orderIds = [...correctOrder];
		solved = true;
		checkStatus = 'idle';
		savePuzzleState(doneKey, '1');
		clearPuzzleState(orderKey);
		onSolved?.();
	}

	function checkOrder() {
		if (solved) return;
		if (correctOrder.every((id, i) => orderIds[i] === id)) complete();
		else checkStatus = 'wrong';
	}

	onMount(() => {
		try {
			if (loadPuzzleState(doneKey)) {
				solved = true;
				orderIds = [...correctOrder];
				onSolved?.();
			} else {
				const saved = loadSavedOrder();
				if (saved) orderIds = saved;
			}
		} catch {
			/* localStorage may be unavailable */
		}
	});
</script>

{#if !solved}
	<div class="quiz-wrap">
		{#if heading}
			<h1 class="game-heading">{heading}</h1>
		{/if}

		<div class="order-list" role="list" class:order-list-wrong={checkStatus === 'wrong'}>
			{#each orderIds as id, i (id)}
				{@render row({
					id,
					index: i,
					moveUp: () => swapRows(i, i - 1),
					moveDown: () => swapRows(i, i + 1),
					isFirst: i === 0,
					isLast: i === orderIds.length - 1
				})}
			{/each}
		</div>

		<div class="check-row">
			<button type="button" class="check-btn" onclick={checkOrder}>{checkLabel}</button>
		</div>
		{#if checkStatus === 'wrong'}
			<p class="wrong-msg" role="status">{wrongMessage}</p>
		{/if}
	</div>
{/if}

<style>
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

	/* Shared row chrome for trail snippets */
	:global(.order-row) {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.55rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border);
		font-size: 1.05em;
		line-height: 1.45;
	}

	:global(.order-row:last-child) {
		border-bottom: none;
	}

	:global(.order-row-controls) {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
		gap: 0.65rem;
	}

	:global(.order-row .line-text) {
		margin: 0;
		width: 100%;
		min-width: 0;
		text-wrap: pretty;
		color: var(--color-text);
	}

	:global(.order-row .row-thumb) {
		width: 4.5rem;
		height: 4.5rem;
		object-fit: cover;
		display: block;
		flex-shrink: 0;
	}

	:global(.order-row .move-btns) {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		flex-shrink: 0;
		margin-left: auto;
	}

	:global(.order-row .move-btn) {
		font-size: 0.88em;
		padding: 0.4em 0.65em;
		border-radius: 0.45em;
		border: none;
		background: var(--color-theme-2);
		color: var(--color-white);
		font-weight: 600;
		cursor: pointer;
	}

	:global(.order-row .move-btn:disabled) {
		opacity: 0.45;
		cursor: not-allowed;
	}

	@media (max-width: 480px) {
		:global(.order-row .row-thumb) {
			width: 3.75rem;
			height: 3.75rem;
		}

		:global(.order-row .move-btns) {
			flex-direction: row;
		}
	}
</style>
