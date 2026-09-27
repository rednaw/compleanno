<script>
	import { base } from '$app/paths';
	import BackButton from '$lib/components/BackButton.svelte';
	import CodeOrderList from '$lib/components/CodeOrderList.svelte';
	import ResultOverlay from '$lib/components/ResultOverlay.svelte';
	import { gcm26Keys } from '../storage-keys.js';
	import {
		CODE_HEADING,
		lineById,
		CODE_CORRECT_ORDER,
		CODE_START_ORDER,
		isValidSavedOrder
	} from './items.js';

	let solved = $state(false);

	/** @param {string} id */
	function lineImageSrc(id) {
		const file = lineById[id].image;
		return file ? `${base}/gcm26/code/${file}` : null;
	}
</script>

<svelte:head>
	<title>GCM 26 — Code</title>
</svelte:head>

<BackButton href="/gcm26" />

{#if solved}
	<ResultOverlay src="{base}/gcm26/code/madagascar.webp" />
{:else}
	<main>
		<CodeOrderList
			startOrder={CODE_START_ORDER}
			correctOrder={CODE_CORRECT_ORDER}
			{isValidSavedOrder}
			orderKey={gcm26Keys.codeOrder}
			doneKey={gcm26Keys.codeDone}
			heading={CODE_HEADING}
			bind:solved
		>
			{#snippet row({ id, moveUp, moveDown, isFirst, isLast })}
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
								onclick={moveUp}
								disabled={isFirst}
								aria-label="Sposta su: {lineById[id].text}"
							>
								Su
							</button>
							<button
								type="button"
								class="move-btn"
								onclick={moveDown}
								disabled={isLast}
								aria-label="Sposta giù: {lineById[id].text}"
							>
								Giù
							</button>
						</span>
					</div>
				</div>
			{/snippet}
		</CodeOrderList>
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
		padding: 5rem 0.5rem 2rem;
		box-sizing: border-box;
	}
</style>
