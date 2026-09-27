<script>
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import {
		savePuzzleState,
		loadPuzzleState,
		loadPuzzleValue,
		seededShuffle
	} from '$lib/puzzle-utils.js';

	/**
	 * @typedef {{ name: string; color: string; words: string[] }} ConnectionGroup
	 * @typedef {object} Props
	 * @property {ConnectionGroup[]} groups
	 * @property {number} seed board shuffle seed (must be stable across prerender/client)
	 * @property {string} solvedKey localStorage key for JSON string[] of group names
	 * @property {string} doneKey localStorage key for completion flag
	 * @property {string} [almostMessage]
	 * @property {string} [wrongMessage]
	 * @property {() => void} [onWon]
	 */
	/** @type {Props} */
	let {
		groups,
		seed,
		solvedKey,
		doneKey,
		almostMessage = 'Ne manca ancora uno...',
		wrongMessage = 'Sbagliato, riprova.',
		onWon
	} = $props();

	function buildTiles() {
		const board = groups.flatMap((group, groupIndex) =>
			group.words.map((word) => ({ label: word, groupIndex, locked: false }))
		);
		return seededShuffle(board, seed);
	}

	const tiles = $state(buildTiles());
	const selected = new SvelteSet();
	/** @type {string[]} */
	let solvedNames = $state([]);
	let message = $state('');
	let shake = $state(false);

	const solvedGroups = $derived(
		solvedNames.map((name) => groups.find((g) => g.name === name)).filter((g) => g !== undefined)
	);

	/** @param {string} name */
	function lockGroup(name) {
		const groupIndex = groups.findIndex((g) => g.name === name);
		if (groupIndex === -1) return;
		for (const tile of tiles) {
			if (tile.groupIndex === groupIndex) tile.locked = true;
		}
	}

	onMount(() => {
		const saved = loadPuzzleValue(solvedKey);
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
		const already = loadPuzzleState(doneKey);
		if (already) onWon?.();
	});

	/** @param {number} idx */
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
			/** @type {Record<number, number>} */
			const counts = {};
			for (const g of groupIndices) counts[g] = (counts[g] || 0) + 1;
			message = Math.max(...Object.values(counts)) === 3 ? almostMessage : wrongMessage;
			shake = true;
			setTimeout(() => (shake = false), 400);
			return;
		}

		const group = groups[groupIndices[0]];
		solvedNames = [...solvedNames, group.name];
		lockGroup(group.name);
		savePuzzleState(solvedKey, JSON.stringify(solvedNames));
		selected.clear();

		if (solvedNames.length === groups.length) {
			onWon?.();
			savePuzzleState(doneKey, '1');
		}
	}
</script>

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

<style>
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
