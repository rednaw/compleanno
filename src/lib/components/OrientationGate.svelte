<script>
	import { onMount } from 'svelte';
	import { checkOrientation, setupOrientationListeners } from '$lib/puzzle-utils.js';
	import RotateMessage from '$lib/components/RotateMessage.svelte';

	/**
	 * Shows RotateMessage until the encouraged orientation is met; then renders children.
	 * @typedef {object} Props
	 * @property {boolean} [encouragePortrait]
	 * @property {import('svelte').Snippet} children
	 */
	/** @type {Props} */
	let { encouragePortrait = true, children } = $props();

	let showRotate = $state(false);

	onMount(() => {
		const update = () => {
			showRotate = !checkOrientation(encouragePortrait);
		};
		update();
		return setupOrientationListeners(update);
	});
</script>

<RotateMessage show={showRotate} {encouragePortrait} />

{#if !showRotate}
	{@render children()}
{/if}
