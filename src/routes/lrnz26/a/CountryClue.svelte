<script>
	import { asset } from '$app/paths';
	import { FLAG_FILES, SHAPE_FILES } from './countries.js';

	/** @type {{ id: string, kind: 'flag' | 'shape' }} */
	let { id, kind } = $props();
</script>

<div class="clue" class:clue--flag={kind === 'flag'} class:clue--shape={kind === 'shape'}>
	{#if kind === 'shape'}
		<img class="clue-img" src={asset(`/lrnz26/a/${SHAPE_FILES[id]}`)} alt="" />
	{:else}
		<img class="clue-img" src={asset(`/lrnz26/a/${FLAG_FILES[id]}`)} alt="" />
	{/if}
</div>

<style>
	.clue {
		width: 100%;
		aspect-ratio: 1;
		border-radius: 0.5rem;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
	}

	.clue--shape {
		background: #d0d0d0;
	}

	.clue--flag {
		background: var(--color-white);
		border: 2px solid var(--color-border);
		box-sizing: border-box;
	}

	.clue-img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>
