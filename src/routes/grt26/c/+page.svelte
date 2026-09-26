<script>
	import { base, resolve } from '$app/paths';
	import { onMount, tick } from 'svelte';
	import { savePuzzleState, loadPuzzleState } from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import { grt26CItemKey, grt26Keys } from '../storage-keys.js';
	import { answerMatches } from '../normalize.js';
	import { grt26Prizes } from '../prizes.js';
	import PrizeOverlay from '../PrizeOverlay.svelte';

	const ITEMS = [
		{
			id: 'one',
			file: 'one.jpg',
			answers: ['gogh', 'van gogh']
		},
		{
			id: 'two',
			file: 'two.jpeg',
			answers: ['vermeer']
		},
		{
			id: 'three',
			file: 'three.jpg',
			answers: ['rembrandt']
		},
		{
			id: 'four',
			file: 'four.jpg',
			answers: ['mondriaan']
		}
	];

	/** @type {Record<string, boolean>} */
	let solved = $state(Object.fromEntries(ITEMS.map((item) => [item.id, false])));
	let guess = $state('');
	/** @type {'idle' | 'wrong'} */
	let status = $state('idle');
	let allCompleted = $state(false);
	/** @type {string | null} */
	let flashId = $state(null);
	let gridShake = $state(false);

	function checkAllCompleted() {
		const done = ITEMS.every((item) => solved[item.id]);
		if (done) savePuzzleState(grt26Keys.gameCDone, '1');
		return done;
	}

	async function submit() {
		if (allCompleted || !guess.trim()) return;
		const match = ITEMS.find((item) => !solved[item.id] && answerMatches(guess, item.answers));
		if (match) {
			solved[match.id] = true;
			savePuzzleState(grt26CItemKey(match.id), '1');
			guess = '';
			status = 'idle';
			flashId = null;
			await tick();
			flashId = match.id;
			window.setTimeout(() => {
				if (flashId === match.id) flashId = null;
			}, 700);
			if (checkAllCompleted()) {
				window.setTimeout(() => {
					allCompleted = true;
				}, 550);
			}
		} else {
			status = 'wrong';
			gridShake = true;
			window.setTimeout(() => {
				gridShake = false;
				status = 'idle';
			}, 450);
		}
	}

	onMount(() => {
		try {
			for (const item of ITEMS) {
				if (loadPuzzleState(grt26CItemKey(item.id))) {
					solved[item.id] = true;
				}
			}
			if (loadPuzzleState(grt26Keys.gameCDone)) {
				allCompleted = true;
			} else {
				checkAllCompleted();
			}
		} catch {
			/* localStorage may be unavailable */
		}
	});
</script>

<svelte:head>
	<title>Chi l'ha dipinto?</title>
</svelte:head>

<BackButton href={resolve('/grt26')} />

<main>
	<div class="photo-grid" class:shake={gridShake}>
		{#each ITEMS as item (item.id)}
			<figure class="photo" class:solved={solved[item.id]} class:flash={flashId === item.id}>
				<img src="{base}/grt26/c/{item.file}" alt="" />
				{#if solved[item.id]}
					<span class="mark" aria-hidden="true">✓</span>
				{/if}
			</figure>
		{/each}
	</div>

	{#if !allCompleted}
		<form
			class="guess-row"
			class:wrong={status === 'wrong'}
			onsubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<input type="text" bind:value={guess} autocomplete="off" />
			<button type="submit" disabled={!guess.trim()}>OK</button>
		</form>
	{/if}
</main>

{#if allCompleted}
	<PrizeOverlay text={grt26Prizes.c} />
{/if}

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		min-height: 100vh;
		padding: 5rem 1rem 2rem;
		box-sizing: border-box;
		gap: 1.25rem;
	}

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

	.guess-row {
		display: flex;
		gap: 0.5rem;
		width: 100%;
		max-width: 22rem;
	}

	.guess-row input {
		flex: 1;
		min-width: 0;
		padding: 0.65rem 0.75rem;
		border: 2px solid var(--color-border);
		border-radius: 0.5rem;
		background: var(--color-white);
		color: var(--color-text);
		font-size: 1rem;
		box-sizing: border-box;
	}

	.guess-row.wrong input {
		background: var(--color-error-bg);
		border-color: var(--color-error-border);
	}

	.guess-row button {
		padding: 0.65rem 1rem;
		border: 2px solid var(--color-border);
		border-radius: 0.5rem;
		background: var(--color-white);
		color: var(--color-text);
		font-weight: 600;
		cursor: pointer;
	}

	.guess-row button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
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
