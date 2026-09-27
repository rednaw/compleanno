<script>
	import { onMount } from 'svelte';

	/**
	 * Video clip → title guess list. Trail injects clips, matcher, and persistence.
	 * @typedef {{ id: string; title: string; src: string; label?: string }} ClipItem
	 * @typedef {object} Props
	 * @property {ClipItem[]} clips
	 * @property {(guess: string, title: string) => boolean} matchTitle
	 * @property {(index: number, state: { status: string; feedback: string; guess: string }) => void} saveProgress
	 * @property {(index: number) => { status?: string; feedback?: string; guess?: string } | null} loadProgress
	 * @property {string} [playLabel]
	 * @property {string} [checkLabel]
	 * @property {boolean} [done]
	 * @property {(done: boolean) => void} [onDoneChange]
	 */
	/** @type {Props} */
	let {
		clips,
		matchTitle,
		saveProgress,
		loadProgress,
		playLabel = '▶️ Riproduci',
		checkLabel = 'Check',
		done = $bindable(false),
		onDoneChange
	} = $props();

	/** @type {{ guess: string; feedback: string; status: string; playing: boolean; video: HTMLVideoElement | null; videoError: boolean }[]} */
	let clipStates = $state(
		clips.map(() => ({
			guess: '',
			feedback: '',
			status: 'not-started',
			playing: false,
			video: null,
			videoError: false
		}))
	);

	function syncDone() {
		const next = clipStates.every((s) => s.status === 'correct');
		done = next;
		onDoneChange?.(next);
	}

	/** @param {number} idx */
	function playClip(idx) {
		const st = clipStates[idx];
		const video = st.video;
		if (!video || st.videoError) return;
		st.playing = true;
		video.pause();
		video.currentTime = 0;
		video.play().catch(() => {
			st.videoError = true;
			st.playing = false;
		});
	}

	/** @param {number} idx */
	function checkGuess(idx) {
		const st = clipStates[idx];
		const title = clips[idx].title;
		if (!st.guess.trim()) return;

		if (matchTitle(st.guess, title)) {
			st.feedback = 'correct';
			st.status = 'correct';
			st.guess = title;
		} else {
			st.feedback = 'wrong';
			st.status = 'wrong';
			st.guess = '';
		}

		saveProgress(idx, { status: st.status, feedback: st.feedback, guess: st.guess });
		syncDone();
	}

	onMount(() => {
		try {
			clipStates.forEach((st, index) => {
				const parsed = loadProgress(index);
				if (!parsed) return;
				if (parsed.status) st.status = parsed.status;
				if (parsed.feedback) st.feedback = parsed.feedback;
				if (typeof parsed.guess === 'string') st.guess = parsed.guess;
				else if (st.status === 'correct') st.guess = clips[index].title;
			});
			syncDone();
		} catch {
			/* localStorage may be unavailable */
		}
	});
</script>

<div class="clip-quiz-root" data-phase-complete={done}>
	{#each clips as clip, i (clip.id)}
		<div class="clip-container">
			<div class="clip-preview">
				<video
					class="clip-video"
					bind:this={clipStates[i].video}
					src={clip.src}
					playsinline
					preload="metadata"
					aria-label={clip.label ?? `Clip ${i + 1}`}
					onended={() => {
						clipStates[i].playing = false;
					}}
					onerror={() => {
						clipStates[i].videoError = true;
						clipStates[i].playing = false;
					}}
				></video>
			</div>
			<div class="card-row {clipStates[i].status}">
				<button
					type="button"
					class="play-btn"
					onclick={() => playClip(i)}
					disabled={clipStates[i].playing || clipStates[i].videoError}
				>
					{playLabel}
				</button>
				{#if clipStates[i].status !== 'correct'}
					<button
						type="button"
						onclick={() => checkGuess(i)}
						disabled={clipStates[i].playing ||
							!clipStates[i].guess.trim() ||
							clipStates[i].status === 'correct'}
					>
						{checkLabel}
					</button>
				{:else}
					<span class="feedback correct" aria-hidden="true">✅</span>
				{/if}
			</div>
			{#if clipStates[i].status !== 'correct'}
				<div class="input-row">
					<input
						type="text"
						bind:value={clipStates[i].guess}
						autocomplete="off"
						onkeydown={(e) => e.key === 'Enter' && checkGuess(i)}
					/>
				</div>
			{:else}
				<div class="input-row input-row-solved">
					<input type="text" value={clipStates[i].guess} readonly />
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.clip-quiz-root {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.clip-container {
		width: 100%;
		text-align: left;
	}

	.clip-preview {
		margin-bottom: 0.5rem;
		border-radius: 0.5em;
		overflow: hidden;
		background: #000;
	}

	.clip-video {
		display: block;
		width: 100%;
		max-height: 240px;
		object-fit: contain;
		background: #000;
	}

	.play-btn {
		font-weight: 600;
	}

	.feedback.correct {
		font-size: 1.25rem;
	}
</style>
