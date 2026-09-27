<script>
	/**
	 * Authoring toggles for hub puzzle done flags. Keep `enabled={false}` in release.
	 * @typedef {{ label: string; done: boolean; onToggle: () => void }} DevKey
	 * @typedef {object} Props
	 * @property {boolean} [enabled]
	 * @property {DevKey[]} keys
	 */
	/** @type {Props} */
	let { enabled = false, keys } = $props();
</script>

{#if enabled}
	<div class="dev-bar">
		{#each keys as dk (dk.label)}
			<button type="button" class="dev-btn" class:dev-on={dk.done} onclick={dk.onToggle}>
				{dk.label}
			</button>
		{/each}
	</div>
{/if}

<style>
	.dev-bar {
		position: fixed;
		top: 0;
		right: 0;
		z-index: 999;
		display: flex;
		gap: 2px;
		padding: 4px;
		background: rgba(0, 0, 0, 0.6);
		border-bottom-left-radius: 6px;
	}

	.dev-btn {
		font-size: 0.7rem;
		padding: 3px 7px;
		border: 1px solid #888;
		border-radius: 3px;
		background: #333;
		color: #ccc;
		cursor: pointer;
		font-weight: 600;
		line-height: 1;
	}

	.dev-btn.dev-on {
		background: #2e7d32;
		border-color: #4caf50;
		color: #fff;
	}
</style>
