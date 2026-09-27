<script>
	import { base } from '$app/paths';
	import BackButton from '$lib/components/BackButton.svelte';
	import CodeOrderList from '$lib/components/CodeOrderList.svelte';
	import CodeFinale from './CodeFinale.svelte';
	import { lrnz26Keys } from '../storage-keys.js';
	import { formatCoords, locationByLineId, mapsUrl } from '../coordinates.js';
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
		return file ? `${base}/lrnz26/code/${file}` : null;
	}
</script>

<svelte:head>
	<title>Lrnz 26 — Code</title>
</svelte:head>

<BackButton href="/lrnz26" />

{#if solved}
	<CodeFinale />
{:else}
	<main>
		<CodeOrderList
			startOrder={CODE_START_ORDER}
			correctOrder={CODE_CORRECT_ORDER}
			{isValidSavedOrder}
			orderKey={lrnz26Keys.codeOrder}
			doneKey={lrnz26Keys.codeDone}
			heading={CODE_HEADING}
			bind:solved
		>
			{#snippet row({ id, moveUp, moveDown, isFirst, isLast })}
				{@const imgSrc = lineImageSrc(id)}
				{@const point = locationByLineId(id)}
				<div class="order-row" role="listitem">
					<!-- eslint-disable svelte/no-navigation-without-resolve -- external Google Maps URL -->
					<a
						class="line-link"
						href={mapsUrl(point.lat, point.lng)}
						target="_blank"
						rel="noopener noreferrer"
					>
						{formatCoords(point.lat, point.lng)}
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
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
								aria-label="Sposta su: {formatCoords(point.lat, point.lng)}"
							>
								Su
							</button>
							<button
								type="button"
								class="move-btn"
								onclick={moveDown}
								disabled={isLast}
								aria-label="Sposta giù: {formatCoords(point.lat, point.lng)}"
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

	:global(.line-link) {
		color: var(--color-theme-1);
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}
</style>
