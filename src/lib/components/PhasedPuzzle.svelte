<script>
	import { onMount } from 'svelte';
	import { savePuzzleState, loadPuzzleState } from '$lib/puzzle-utils.js';

	/**
	 * Loads hub done-key as previouslyDone; saves when `complete` becomes true.
	 * Children receive `{ allCompleted }`.
	 * @typedef {object} Props
	 * @property {string} doneKey
	 * @property {boolean} complete
	 * @property {import('svelte').Snippet<[ { allCompleted: boolean } ]>} children
	 */
	/** @type {Props} */
	let { doneKey, complete, children } = $props();

	let previouslyDone = $state(false);
	const allCompleted = $derived(previouslyDone || complete);

	$effect(() => {
		if (allCompleted) savePuzzleState(doneKey, '1');
	});

	onMount(() => {
		try {
			if (loadPuzzleState(doneKey)) previouslyDone = true;
		} catch {
			/* localStorage may be unavailable */
		}
	});
</script>

{@render children({ allCompleted })}
