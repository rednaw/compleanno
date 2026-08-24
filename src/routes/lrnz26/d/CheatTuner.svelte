<script>
	import { base } from '$app/paths';
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import manifest from './manifest.json';
	import { trackDisplayTitle } from './tracks.js';

	/** @type {{ onPauseAll: () => void }} */
	let { onPauseAll } = $props();

	let open = $state(true);
	let showCheat = $state(dev);

	/** @type {HTMLAudioElement | null} */
	let previewAudio = $state(null);

	/** @type {string | null} e.g. "ari-ari:forward" */
	let previewKey = $state(null);

	const entries = manifest.tracks;

	onMount(() => {
		if (new URL(window.location.href).searchParams.has('cheat')) {
			showCheat = true;
		}
		return () => stopPreview();
	});

	/** @param {string} id @param {'forward' | 'reversed'} kind */
	function clipSrc(id, kind) {
		const file = kind === 'forward' ? `${id}.mp3` : `${id}-reversed.mp3`;
		return `${base}/lrnz26/d/${file}`;
	}

	function stopPreview() {
		if (previewAudio) {
			previewAudio.pause();
			previewAudio = null;
		}
		previewKey = null;
	}

	function pauseAll() {
		onPauseAll();
		stopPreview();
	}

	/** @param {string} id @param {'forward' | 'reversed'} kind */
	function togglePreview(id, kind) {
		const key = `${id}:${kind}`;
		if (previewKey === key && previewAudio && !previewAudio.paused) {
			previewAudio.pause();
			return;
		}

		onPauseAll();
		stopPreview();

		const audio = new Audio(clipSrc(id, kind));
		audio.loop = true;
		previewAudio = audio;
		previewKey = key;
		audio.play().catch(() => stopPreview());
	}

	/** @param {string} id @param {'forward' | 'reversed'} kind */
	function isPlaying(id, kind) {
		return previewKey === `${id}:${kind}` && previewAudio != null && !previewAudio.paused;
	}
</script>

{#if showCheat}
	<aside class="cheat-tuner" aria-label="Preview cheat">
		<button type="button" class="cheat-toggle" onclick={() => (open = !open)}>
			{open ? '▼' : '▶'} Preview tracks
		</button>

		{#if open}
			<div class="cheat-global">
				<button type="button" onclick={() => pauseAll()}>Pause all</button>
			</div>

			{#each entries as entry, i (entry.id)}
				<div class="cheat-track">
					<strong>{i + 1}. {trackDisplayTitle(entry)}</strong>
					<div class="cheat-track-btns">
						<button
							type="button"
							class:playing={isPlaying(entry.id, 'forward')}
							onclick={() => togglePreview(entry.id, 'forward')}
						>
							{isPlaying(entry.id, 'forward') ? '⏸' : '▶'} Forward
						</button>
						<button
							type="button"
							class:playing={isPlaying(entry.id, 'reversed')}
							onclick={() => togglePreview(entry.id, 'reversed')}
						>
							{isPlaying(entry.id, 'reversed') ? '⏸' : '▶'} Backward
						</button>
					</div>
				</div>
			{/each}
		{/if}
	</aside>
{/if}

<style>
	.cheat-tuner {
		width: 100%;
		margin-top: 1.5rem;
		padding: 0.75rem;
		border: 2px dashed #c45c00;
		border-radius: 0.5rem;
		background: rgba(255, 244, 230, 0.95);
		box-sizing: border-box;
		text-align: left;
		font-size: 0.85rem;
		color: #333;
	}

	.cheat-toggle {
		width: 100%;
		padding: 0.35rem 0.5rem;
		border: none;
		background: transparent;
		font-weight: 700;
		font-size: 0.9rem;
		cursor: pointer;
		text-align: left;
		color: #a34700;
	}

	.cheat-global {
		margin: 0.5rem 0 0.75rem;
	}

	.cheat-track {
		margin-bottom: 0.65rem;
		padding-bottom: 0.65rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.08);
	}

	.cheat-track strong {
		display: block;
		margin-bottom: 0.4rem;
	}

	.cheat-track-btns {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.cheat-tuner button:not(.cheat-toggle) {
		font-size: 0.78rem;
		padding: 0.35rem 0.6rem;
		border-radius: 0.35rem;
		border: 1px solid #ccc;
		background: #fff;
		cursor: pointer;
	}

	.cheat-tuner button.playing {
		background: #ffe0b2;
		border-color: #c45c00;
		font-weight: 600;
	}
</style>
