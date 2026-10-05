<script>
	import { base } from '$app/paths';
	import { onDestroy, onMount } from 'svelte';
	import { confetti } from '@neoconfetti/svelte';
	import { savePuzzleState, loadPuzzleState } from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import CodeKeypad from '$lib/components/CodeKeypad.svelte';
	import ResultOverlay from '$lib/components/ResultOverlay.svelte';
	import { grt26Keys } from '../storage-keys.js';
	import {
		GRT26_CODE,
		GRT26_FINAL_IMAGE,
		grt26Prizes,
		grt26PrizeImages
	} from '../prizes.js';

	const PRIZES = /** @type {const} */ (['a', 'b', 'c', 'd']).map((id) => ({
		id,
		name: grt26Prizes[id].name,
		digit: grt26Prizes[id].digit,
		image: grt26PrizeImages[id]
	}));

	const CONFETTI_COLORS = ['#FFC700', '#ff3d33', '#0e61cb', '#ffffff', '#ddd5f4', '#388e3c'];

	let success = $state(false);
	/** @type {(() => void) | undefined} */
	let stopRain;

	function startConfettiRain() {
		stopRain?.();

		const layer = document.createElement('div');
		layer.setAttribute('aria-hidden', 'true');
		layer.style.cssText =
			'position:fixed;inset:0;z-index:150;pointer-events:none;overflow:visible';
		document.body.append(layer);

		/** @type {Array<{ destroy: () => void }>} */
		const instances = [];
		/** @type {number[]} */
		const timers = [];

		const duration = 5200;
		const xs = ['8%', '26%', '44%', '62%', '80%', '94%'];

		/** @param {string} left @param {number} particleCount */
		function dropFrom(left, particleCount) {
			const el = document.createElement('div');
			el.style.cssText = `position:absolute;top:0;left:${left}`;
			layer.append(el);
			instances.push(
				confetti(el, {
					particleCount,
					force: 0.38,
					duration,
					particleSize: 11,
					stageHeight: window.innerHeight,
					stageWidth: window.innerWidth,
					colors: CONFETTI_COLORS
				})
			);
		}

		for (const left of xs) dropFrom(left, 55);
		timers.push(
			window.setTimeout(() => {
				for (const left of xs) dropFrom(left, 40);
			}, 900)
		);
		timers.push(
			window.setTimeout(() => {
				for (const left of ['18%', '50%', '82%']) dropFrom(left, 45);
			}, 1800)
		);

		timers.push(
			window.setTimeout(() => {
				stopRain?.();
			}, duration + 2200)
		);

		stopRain = () => {
			for (const t of timers) clearTimeout(t);
			for (const inst of instances) inst.destroy();
			layer.remove();
			stopRain = undefined;
		};
	}

	function showFinale() {
		success = true;
		startConfettiRain();
	}

	onMount(() => {
		try {
			if (loadPuzzleState(grt26Keys.codeDone)) showFinale();
		} catch {
			/* localStorage may be unavailable */
		}
	});

	onDestroy(() => {
		stopRain?.();
	});
</script>

<svelte:head>
	<title>Sai già l’ordine</title>
</svelte:head>

<BackButton href="/grt26" />

{#if success}
	<ResultOverlay src="{base}/grt26/code/{GRT26_FINAL_IMAGE}" />
{:else}
	<CodeKeypad
		correctCode={GRT26_CODE}
		onCorrect={() => {
			savePuzzleState(grt26Keys.codeDone, '1');
			showFinale();
		}}
	>
		<p class="howto">Sai già l’ordine. Digita.</p>
		<ul class="prizes">
			{#each PRIZES as prize (prize.id)}
				<li>
					<img src="{base}/grt26/code/{prize.image}" alt={prize.name} class="prize-img" />
					<span class="eq">=</span>
					<span class="digit">{prize.digit}</span>
				</li>
			{/each}
		</ul>
	</CodeKeypad>
{/if}

<style>
	.howto {
		margin: 0 0 1rem;
		max-width: 22rem;
		text-align: center;
		font-size: 0.95rem;
		line-height: 1.35;
		color: var(--color-text);
		opacity: 0.85;
	}

	.prizes {
		list-style: none;
		margin: 0 0 1.25rem;
		padding: 0;
		width: 100%;
		max-width: 18rem;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.prizes li {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		min-width: 0;
	}

	.prize-img {
		width: 3.5rem;
		height: 3.5rem;
		object-fit: cover;
		border-radius: 0.35rem;
		border: 2px solid var(--color-border);
		flex-shrink: 0;
	}

	.eq,
	.digit {
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--color-text);
		line-height: 1;
	}
</style>
