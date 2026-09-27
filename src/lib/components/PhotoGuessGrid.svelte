<script>
	/**
	 * 2×2 photo grid with solved marks, flash, and shake.
	 * @typedef {{ id: string; src: string }} PhotoItem
	 * @typedef {object} Props
	 * @property {PhotoItem[]} items
	 * @property {Record<string, boolean>} solved
	 * @property {string | null} [flashId]
	 * @property {boolean} [shake]
	 */
	/** @type {Props} */
	let { items, solved, flashId = null, shake = false } = $props();
</script>

<div class="photo-grid" class:shake>
	{#each items as item (item.id)}
		<figure class="photo" class:solved={solved[item.id]} class:flash={flashId === item.id}>
			<img src={item.src} alt="" />
			{#if solved[item.id]}
				<span class="mark" aria-hidden="true">✓</span>
			{/if}
		</figure>
	{/each}
</div>

<style>
	.photo-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		width: 100%;
		max-width: 36rem;
	}

	.photo-grid.shake {
		animation: grid-shake 0.45s ease;
	}

	.photo {
		position: relative;
		margin: 0;
		overflow: hidden;
		border-radius: 0.5rem;
		line-height: 0;
		box-sizing: border-box;
		transform-origin: center;
	}

	.photo.solved img {
		filter: brightness(0.72) saturate(0.85);
	}

	.photo.flash {
		animation: hit-pop 0.65s ease;
		z-index: 1;
	}

	.photo img {
		display: block;
		width: 100%;
		height: auto;
	}

	.mark {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: clamp(2.5rem, 12vw, 4rem);
		font-weight: 800;
		color: var(--color-white);
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
		pointer-events: none;
		animation: mark-in 0.35s ease;
	}

	@keyframes hit-pop {
		0% {
			transform: scale(1);
		}
		35% {
			transform: scale(1.06);
		}
		100% {
			transform: scale(1);
		}
	}

	@keyframes mark-in {
		from {
			opacity: 0;
			transform: scale(0.6);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes grid-shake {
		0%,
		100% {
			transform: translateX(0);
		}
		20%,
		60% {
			transform: translateX(-6px);
		}
		40%,
		80% {
			transform: translateX(6px);
		}
	}

	@media (max-width: 500px) {
		.photo-grid {
			gap: 0.5rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.photo.flash,
		.mark,
		.photo-grid.shake {
			animation: none;
		}
	}
</style>
