<script>
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { resolve } from '$app/paths';
	import { savePuzzleState, loadPuzzleState, loadPuzzleValue } from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import { grt26Keys } from '../storage-keys.js';
	import { grt26Prizes } from '../prizes.js';
	import PrizeOverlay from '../PrizeOverlay.svelte';

	const GROUPS = [
		{ name: 'bisnonni', color: '#f7d070', words: ['omirp', 'airad', 'erotama', 'ailuig'] },
		{
			name: 'amici a quattro zampe',
			color: '#50b0e3',
			words: ['sushi', 'pixel', 'spijker', 'tappo']
		},
		{
			name: 'quello che studi',
			color: '#a78bfa',
			words: ['global', 'art', 'culture', 'politics']
		},
		{ name: 'UvA campus', color: '#94d3a2', words: ['OMHP', 'SP', 'REC', 'UB'] }
	];

	/**
	 * Board order must be identical at prerender and on the client, or hydration leaves the
	 * server's labels on tiles bound to different words. Seeded, so it never drifts.
	 * @param {number} seed
	 */
	function seededRandom(seed) {
		let a = seed;
		return () => {
			a = (a + 0x6d2b79f5) | 0;
			let t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	function buildTiles() {
		const board = GROUPS.flatMap((group, groupIndex) =>
			group.words.map((word) => ({ label: word, groupIndex, locked: false }))
		);
		const rand = seededRandom(0x51b26026);
		for (let i = board.length - 1; i > 0; i--) {
			const j = Math.floor(rand() * (i + 1));
			[board[i], board[j]] = [board[j], board[i]];
		}
		return board;
	}

	const tiles = $state(buildTiles());
	const selected = new SvelteSet();
	/** Names of solved groups, in the order the player found them. */
	let solvedNames = $state([]);
	let message = $state('');
	let shake = $state(false);
	let won = $state(false);

	const solvedGroups = $derived(
		solvedNames.map((name) => GROUPS.find((g) => g.name === name)).filter((g) => g !== undefined)
	);

	/** @param {string} name */
	function lockGroup(name) {
		const groupIndex = GROUPS.findIndex((g) => g.name === name);
		if (groupIndex === -1) return;
		for (const tile of tiles) {
			if (tile.groupIndex === groupIndex) tile.locked = true;
		}
	}

	onMount(() => {
		const saved = loadPuzzleValue(grt26Keys.connectionsSolved);
		if (saved) {
			try {
				solvedNames = JSON.parse(saved)
					.map((/** @type {string | { name: string }} */ entry) =>
						typeof entry === 'string' ? entry : entry?.name
					)
					.filter((/** @type {unknown} */ name) => typeof name === 'string');
				solvedNames.forEach(lockGroup);
			} catch {
				/* unreadable progress — start over */
			}
		}
		won = loadPuzzleState(grt26Keys.gameBDone);
	});

	function toggleTile(idx) {
		if (tiles[idx].locked) return;

		if (selected.has(idx)) {
			selected.delete(idx);
		} else if (selected.size < 4) {
			selected.add(idx);
		}

		message = '';
	}

	function checkSelection() {
		if (selected.size !== 4) return;

		const indices = Array.from(selected);
		const groupIndices = indices.map((i) => tiles[i].groupIndex);

		if (!groupIndices.every((g) => g === groupIndices[0])) {
			const counts = {};
			for (const g of groupIndices) counts[g] = (counts[g] || 0) + 1;
			message =
				Math.max(...Object.values(counts)) === 3 ? 'Ne manca ancora uno...' : 'Sbagliato, riprova.';
			shake = true;
			setTimeout(() => (shake = false), 400);
			return;
		}

		const group = GROUPS[groupIndices[0]];
		solvedNames = [...solvedNames, group.name];
		lockGroup(group.name);
		savePuzzleState(grt26Keys.connectionsSolved, JSON.stringify(solvedNames));
		selected.clear();

		if (solvedNames.length === GROUPS.length) {
			won = true;
			savePuzzleState(grt26Keys.gameBDone, '1');
		}
	}
</script>

<svelte:head>
	<title>Collega le parole</title>
</svelte:head>

<BackButton href={resolve('/grt26')} />

<main class="container">
	<div class="grid-wrap">
		<div class="grid" class:shake>
			{#each tiles as tile, i (`${tile.groupIndex}-${tile.label}`)}
				<button
					type="button"
					class="tile"
					class:selected={selected.has(i)}
					class:locked={tile.locked}
					disabled={tile.locked}
					onclick={() => toggleTile(i)}
				>
					{tile.label}
				</button>
			{/each}
		</div>

		{#if selected.size === 4}
			<button
				type="button"
				class="check-dot"
				onclick={checkSelection}
				aria-label="Controlla selezione"
			>
				✔
			</button>
		{/if}
	</div>

	{#if message}
		<div class="message">{message}</div>
	{/if}

	{#if solvedGroups.length}
		<div class="solved">
			{#each solvedGroups as group (group.name)}
				<div class="solved-row" style="background: {group.color}; border-color: {group.color}">
					<div class="solved-title">{group.name}</div>
					<div class="solved-words">{group.words.join(', ')}</div>
				</div>
			{/each}
		</div>
	{/if}
</main>

{#if won}
	<PrizeOverlay text={grt26Prizes.b} />
{/if}

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		min-height: 100vh;
		padding: 11rem 1rem 2rem;
		box-sizing: border-box;
		gap: 0.75rem;
	}

	.solved {
		width: 100%;
		max-width: 480px;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.solved-row {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 0.5rem 0.7rem;
		border: 2px solid;
		border-radius: 0.5rem;
		color: #1b1b1b;
		text-align: center;
	}

	.solved-title {
		font-weight: 800;
		letter-spacing: 0.03em;
	}

	.solved-words {
		font-weight: 600;
	}

	.grid-wrap {
		position: relative;
		width: 100%;
		max-width: 480px;
		padding-bottom: 0.4rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.4rem;
		width: 100%;
	}

	.tile {
		padding: 0.8rem 0.4rem;
		background: var(--color-white);
		border: 2px solid var(--color-border);
		border-radius: 0.5rem;
		font-weight: 900;
		letter-spacing: 0.06em;
		cursor: pointer;
		color: var(--color-text);
		text-transform: uppercase;
	}

	.tile.selected {
		background: #ffe082;
		border-color: #ffb300;
	}

	.tile.locked {
		background: #e8f5e9;
		border-color: #2e7d32;
		color: #1b5e20;
		cursor: default;
	}

	.check-dot {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		bottom: -0.5rem;
		width: 34px;
		height: 34px;
		border-radius: 50%;
		border: 2px solid var(--color-theme-2);
		background: var(--color-theme-2);
		color: var(--color-white);
		font-weight: 900;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
		cursor: pointer;
	}

	.check-dot:active {
		transform: translateX(-50%) scale(0.97);
	}

	.message {
		color: var(--color-text);
		font-weight: 700;
		font-size: 1.2rem;
		text-align: center;
		padding: 0.5rem 0.75rem;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 0.5rem;
		border: 2px solid var(--color-border);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		max-width: 480px;
		width: 100%;
		box-sizing: border-box;
	}

	.shake {
		animation: shake 0.4s;
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		20%,
		60% {
			transform: translateX(-8px);
		}
		40%,
		80% {
			transform: translateX(8px);
		}
	}

	@media (max-width: 500px) {
		.container {
			padding: 9rem 0.75rem 1.5rem;
		}

		.grid-wrap {
			max-width: 100%;
		}

		.grid {
			gap: 0.3rem;
		}

		.tile {
			padding: 0.65rem 0.25rem;
			font-size: 0.75rem;
			border-radius: 0.35rem;
		}

		.solved-row {
			padding: 0.4rem 0.55rem;
			border-radius: 0.35rem;
		}

		.solved-title {
			font-size: 0.85rem;
		}

		.solved-words {
			font-size: 0.75rem;
		}

		.message {
			font-size: 0.95rem;
		}

		.check-dot {
			width: 30px;
			height: 30px;
			font-size: 1rem;
			bottom: -0.75rem;
		}
	}
</style>
