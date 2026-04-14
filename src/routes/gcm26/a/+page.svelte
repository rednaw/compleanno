<script>
	import { base, resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		films,
		filmTitleMatches,
		COMMON_QUESTION,
		COMMON_ANSWER,
		FINAL_HINT_SEGMENTS,
		FINAL_CODE_ANSWER
	} from './films.js';
	import {
		saveFilmProgress,
		loadFilmProgress,
		saveCommonProgress,
		loadCommonProgress,
		clearCommonProgress,
		saveFinalCodeProgress,
		loadFinalCodeProgress,
		clearFinalCodeProgress
	} from './persistence.js';
	import {
		checkOrientation,
		setupOrientationListeners,
		savePuzzleState,
		clearPuzzleState
	} from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import RotateMessage from '$lib/components/RotateMessage.svelte';
	import { gcm26HubImage } from '../hub-images.js';
	import { gcm26Keys } from '../storage-keys.js';
	import ResultFullscreen from '../ResultFullscreen.svelte';
	import '../quiz-shared.css';

	let showRotateMessage = $state(false);

	/** @type {{ guess: string; feedback: string; status: string; playing: boolean; video: HTMLVideoElement | null; videoError: boolean }[]} */
	let clipStates = $state(
		films.map(() => ({
			guess: '',
			feedback: '',
			status: 'not-started',
			playing: false,
			video: null,
			videoError: false
		}))
	);

	let allCompleted = $state(false);

	const FINAL_CODE_LEN = FINAL_CODE_ANSWER.length;
	const FINAL_CODE_CELL_INDEXES = Array.from({ length: FINAL_CODE_LEN }, (_, i) => i);

	let commonGuess = $state('');
	let commonFeedback = $state('');
	/** @type {'not-started' | 'correct' | 'wrong'} */
	let commonStatus = $state(/** @type {'not-started' | 'correct' | 'wrong'} */ ('not-started'));

	/** @type {string[]} */
	let finalCodeCells = $state(Array.from({ length: FINAL_CODE_LEN }, () => ''));
	/** @type {'not-started' | 'wrong' | 'correct'} */
	let finalCodeStatus = $state(/** @type {'not-started' | 'wrong' | 'correct'} */ ('not-started'));

	const filmsAllCorrect = $derived(clipStates.every((s) => s.status === 'correct'));
	const commonComplete = $derived(commonStatus === 'correct');
	const finalCodeReady = $derived(finalCodeCells.every((c) => (c || '').length > 0));

	function clipSrc(id) {
		return `${base}/gcm26/a/${id}.mp4`;
	}

	function playClip(idx) {
		const st = clipStates[idx];
		const video = st.video;
		if (!video || st.videoError) return;
		st.playing = true;
		clipStates = [...clipStates];
		video.pause();
		video.currentTime = 0;
		video.play().catch(() => {
			st.videoError = true;
			st.playing = false;
			clipStates = [...clipStates];
		});
	}

	function onClipEnded(idx) {
		clipStates[idx].playing = false;
		clipStates = [...clipStates];
	}

	function onClipError(idx) {
		clipStates[idx].videoError = true;
		clipStates[idx].playing = false;
		clipStates = [...clipStates];
	}

	function checkGuess(idx) {
		const st = clipStates[idx];
		const title = films[idx].title;
		if (!st.guess.trim()) return;

		if (filmTitleMatches(st.guess, title)) {
			st.feedback = 'correct';
			st.status = 'correct';
			st.guess = title;
		} else {
			st.feedback = 'wrong';
			st.status = 'wrong';
			st.guess = '';
		}

		saveFilmProgress(idx, { status: st.status, feedback: st.feedback, guess: st.guess });

		clipStates = [...clipStates];
		checkAllCompleted();
	}

	function checkAllCompleted() {
		allCompleted =
			clipStates.every((s) => s.status === 'correct') &&
			commonStatus === 'correct' &&
			finalCodeStatus === 'correct';
		if (allCompleted) {
			savePuzzleState(gcm26Keys.gameADone, '1');
		} else {
			clearPuzzleState(gcm26Keys.gameADone);
		}
	}

	function resetFinalCode() {
		finalCodeStatus = 'not-started';
		finalCodeCells = Array.from({ length: FINAL_CODE_LEN }, () => '');
		clearFinalCodeProgress();
	}

	/** @param {number} index */
	function onFinalCodeInput(index) {
		if (finalCodeStatus === 'wrong') finalCodeStatus = 'not-started';
		let v = (finalCodeCells[index] || '').slice(-1);
		if (/[a-z]/i.test(v)) v = v.toLowerCase();
		finalCodeCells = finalCodeCells.map((c, i) => (i === index ? v : c));
	}

	function checkFinalCode() {
		if (!commonComplete || finalCodeStatus === 'correct') return;
		const attempt = finalCodeCells.join('').toLowerCase();
		if (attempt.length !== FINAL_CODE_LEN) return;

		if (attempt === FINAL_CODE_ANSWER) {
			finalCodeStatus = 'correct';
			finalCodeCells = FINAL_CODE_ANSWER.split('');
			saveFinalCodeProgress({ status: finalCodeStatus, cells: finalCodeCells });
		} else {
			finalCodeStatus = 'wrong';
			const ansChars = FINAL_CODE_ANSWER.split('');
			const guessChars = attempt.split('');
			finalCodeCells = ansChars.map((ch, i) => (guessChars[i] === ch ? ch : ''));
		}

		checkAllCompleted();
	}

	function checkCommonGuess() {
		if (!filmsAllCorrect) return;
		if (!commonGuess.trim()) return;

		if (filmTitleMatches(commonGuess, COMMON_ANSWER)) {
			commonFeedback = 'correct';
			commonStatus = 'correct';
			commonGuess = COMMON_ANSWER;
		} else {
			commonFeedback = 'wrong';
			commonStatus = 'wrong';
			commonGuess = '';
		}

		saveCommonProgress({
			status: commonStatus,
			feedback: commonFeedback,
			guess: commonGuess
		});

		checkAllCompleted();
	}

	onMount(() => {
		try {
			clipStates.forEach((st, index) => {
				const parsed = loadFilmProgress(index);
				if (!parsed) return;
				st.status = parsed.status;
				st.feedback = parsed.feedback;
				if (typeof parsed.guess === 'string') {
					st.guess = parsed.guess;
				} else if (st.status === 'correct') {
					st.guess = films[index].title;
				}
			});

			const commonParsed = loadCommonProgress();
			if (commonParsed) {
				commonStatus = commonParsed.status;
				commonFeedback = commonParsed.feedback ?? '';
				if (typeof commonParsed.guess === 'string') {
					commonGuess = commonParsed.guess;
				} else if (commonStatus === 'correct') {
					commonGuess = COMMON_ANSWER;
				}
			}

			const filmsOk = clipStates.every((s) => s.status === 'correct');
			if (commonStatus === 'correct' && !filmsOk) {
				commonStatus = 'not-started';
				commonFeedback = '';
				commonGuess = '';
				clearCommonProgress();
			}

			if (commonStatus === 'correct') {
				const finalParsed = loadFinalCodeProgress();
				if (
					finalParsed &&
					finalParsed.status === 'correct' &&
					Array.isArray(finalParsed.cells) &&
					finalParsed.cells.length === FINAL_CODE_LEN
				) {
					finalCodeStatus = 'correct';
					finalCodeCells = [...finalParsed.cells];
				}
			}

			if (commonStatus !== 'correct') {
				resetFinalCode();
			}

			clipStates = [...clipStates];
			checkAllCompleted();
		} catch {
			void 0;
		}

		const updateOrientation = () => {
			showRotateMessage = !checkOrientation(true);
		};
		updateOrientation();
		return setupOrientationListeners(updateOrientation);
	});
</script>

<svelte:head>
	<title>Indovina il film</title>
</svelte:head>

<BackButton href={resolve('/gcm26')} />

<RotateMessage show={showRotateMessage} encouragePortrait={true} />

{#if !showRotateMessage}
	<main>
		<div class="clip-list">
			{#each films as film, i (film.id)}
				<div class="clip-container">
					<div class="clip-preview">
						<!-- svelte-ignore a11y_media_has_caption -->
						<video
							class="clip-video"
							bind:this={clipStates[i].video}
							src={clipSrc(film.id)}
							playsinline
							preload="metadata"
							onended={() => onClipEnded(i)}
							onerror={() => onClipError(i)}
						></video>
					</div>
					<div class="clip-row {clipStates[i].status}">
						<button
							type="button"
							class="play-btn"
							onclick={() => playClip(i)}
							disabled={clipStates[i].playing || clipStates[i].videoError}
						>
							▶️ Riproduci
						</button>
						{#if clipStates[i].videoError}
							<span class="clip-hint"
								>Video assente — esegui <code>scripts/gcm26/extract_a.py</code></span
							>
						{/if}
						{#if clipStates[i].status !== 'correct'}
							<button
								type="button"
								onclick={() => checkGuess(i)}
								disabled={clipStates[i].playing ||
									!clipStates[i].guess.trim() ||
									clipStates[i].status === 'correct'}
							>
								Controlla
							</button>
						{:else}
							<span class="feedback correct"
								><span class="visually-hidden">Corretto. </span><span aria-hidden="true">✅</span
								></span
							>
						{/if}
					</div>
					<div class="input-row" class:input-row-solved={clipStates[i].status === 'correct'}>
						<input
							type="text"
							placeholder="Titolo del film"
							bind:value={clipStates[i].guess}
							autocomplete="off"
							readonly={clipStates[i].status === 'correct'}
							aria-invalid={clipStates[i].status === 'wrong'}
							aria-describedby="gcm26a-film-{i}-status"
							onkeydown={(e) =>
								clipStates[i].status !== 'correct' && e.key === 'Enter' && checkGuess(i)}
						/>
					</div>
					<p id="gcm26a-film-{i}-status" class="field-feedback" role="status" aria-live="polite">
						{#if clipStates[i].status === 'wrong'}
							Titolo non corretto. Riprova con il titolo esatto.
						{:else if clipStates[i].status === 'correct'}
							Titolo corretto.
						{/if}
					</p>
				</div>
			{/each}

			<div class="common-section" class:common-disabled={!filmsAllCorrect}>
				<p class="common-question">{COMMON_QUESTION}</p>
				<div
					class="clip-row {commonStatus === 'correct' ? 'correct' : ''} {commonStatus === 'wrong'
						? 'wrong'
						: ''}"
				>
					{#if commonStatus !== 'correct'}
						<button
							type="button"
							onclick={() => checkCommonGuess()}
							disabled={!filmsAllCorrect || !commonGuess.trim() || commonStatus === 'correct'}
						>
							Controlla
						</button>
					{:else}
						<span class="feedback correct"
							><span class="visually-hidden">Corretto. </span><span aria-hidden="true">✅</span
							></span
						>
					{/if}
				</div>
				<div class="input-row" class:input-row-solved={commonStatus === 'correct'}>
					<input
						type="text"
						placeholder={filmsAllCorrect ? 'La tua risposta' : 'Indovina prima tutti i film'}
						bind:value={commonGuess}
						autocomplete="off"
						disabled={!filmsAllCorrect}
						readonly={commonStatus === 'correct'}
						aria-invalid={commonStatus === 'wrong'}
						aria-describedby="gcm26a-common-status"
						onkeydown={(e) =>
							commonStatus !== 'correct' &&
							filmsAllCorrect &&
							e.key === 'Enter' &&
							checkCommonGuess()}
					/>
				</div>
				<p id="gcm26a-common-status" class="field-feedback" role="status" aria-live="polite">
					{#if commonStatus === 'wrong'}
						Risposta non corretta. Riprova.
					{:else if commonStatus === 'correct'}
						Risposta corretta.
					{/if}
				</p>
			</div>

			<div class="final-code-section" class:common-disabled={!commonComplete}>
				<p class="final-code-heading">Suggerimento</p>
				<div class="code-cells-row">
					{#each FINAL_HINT_SEGMENTS as seg, hi (hi)}
						<input
							type="text"
							class="code-cell hint-cell"
							class:code-cell-wide={seg.length > 1}
							value={seg}
							disabled
							aria-label="Suggerimento {hi + 1}"
						/>
					{/each}
				</div>
				<p class="final-code-heading">Codice</p>
			<div
				class="final-code-answer-row"
				class:final-code-solved={finalCodeStatus === 'correct'}
				class:answer-row-wrong={finalCodeStatus === 'wrong'}
			>
					{#each FINAL_CODE_CELL_INDEXES as ci (ci)}
						<input
							type="text"
							class="code-cell"
							maxlength="1"
							inputmode="text"
							autocomplete="off"
							autocorrect="off"
							spellcheck="false"
							bind:value={finalCodeCells[ci]}
							disabled={!commonComplete}
							readonly={finalCodeStatus === 'correct'}
							aria-label="Codice carattere {ci + 1}"
							aria-invalid={finalCodeStatus === 'wrong'}
							aria-describedby="gcm26a-code-status"
							oninput={() => onFinalCodeInput(ci)}
							onkeydown={(e) =>
								finalCodeStatus !== 'correct' &&
								commonComplete &&
								e.key === 'Enter' &&
								checkFinalCode()}
						/>
					{/each}
					{#if finalCodeStatus !== 'correct'}
						<button
							type="button"
							onclick={() => checkFinalCode()}
							disabled={!commonComplete || !finalCodeReady}
						>
							Controlla
						</button>
					{:else}
						<span class="feedback correct"
							><span class="visually-hidden">Corretto. </span><span aria-hidden="true">✅</span
							></span
						>
					{/if}
				</div>
				<p id="gcm26a-code-status" class="field-feedback" role="status" aria-live="polite">
					{#if finalCodeStatus === 'wrong'}
						Codice non corretto. Le lettere indovinate restano.
					{:else if finalCodeStatus === 'correct'}
						Codice corretto.
					{/if}
				</p>
			</div>

		{#if allCompleted}
			<ResultFullscreen src="{base}/gcm26/code/{gcm26HubImage.a}" />
		{/if}
		</div>
	</main>
{/if}

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		min-height: 100vh;
		background: var(--color-background);
		padding: 1rem 0.5rem 1rem 0.5rem;
		box-sizing: border-box;
		margin-top: 4rem;
	}

	.clip-list {
		width: 100%;
		max-width: 520px;
		margin-left: auto;
		margin-right: auto;
		box-sizing: border-box;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.clip-container {
		margin-bottom: 1.5em;
		width: 100%;
	}

	.field-feedback {
		margin: 0.35rem 0 0;
		min-height: 1.25em;
		font-size: 0.875rem;
		text-align: center;
		color: var(--color-text);
		line-height: 1.35;
	}

	.clip-row.wrong ~ .input-row + .field-feedback,
	.answer-row-wrong + .field-feedback {
		color: #b71c1c;
		font-weight: 600;
	}

	.input-row-solved + .field-feedback {
		color: #1b5e20;
		font-weight: 600;
	}

	.clip-preview {
		width: 100%;
		margin-bottom: 0.5rem;
		border-radius: 0.5rem;
		overflow: hidden;
		background: #0a0a0a;
		border: 2px solid var(--color-border);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
		aspect-ratio: 16 / 9;
		max-height: min(52vh, 280px);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.clip-row.correct {
		background: #a5d6a7;
		border-color: #388e3c;
		color: #1b5e20;
	}


	.clip-video {
		width: 100%;
		height: 100%;
		max-height: min(52vh, 280px);
		object-fit: contain;
		display: block;
	}

	.clip-hint {
		font-size: 0.75rem;
		color: var(--color-text);
		opacity: 0.85;
		max-width: 12rem;
		text-align: left;
	}

	.clip-hint code {
		font-size: 0.68rem;
	}

	.play-btn {
		font-size: 1.05em;
		padding: 0.6em 1.2em;
		border-radius: 0.5em;
		border: none;
		background: var(--color-theme-1);
		color: var(--color-white);
		font-weight: bold;
		cursor: pointer;
		transition: background 0.2s;
	}

	.play-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.clip-row button[type='button']:not(.play-btn) {
		font-size: 1.05em;
		padding: 0.55em 1em;
		border-radius: 0.5em;
		border: none;
		background: var(--color-theme-2);
		color: var(--color-white);
		font-weight: 600;
		cursor: pointer;
	}

	.clip-row button[type='button']:not(.play-btn):disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.feedback {
		font-size: 1.5em;
		margin-left: 0.5em;
	}

	.feedback.correct {
		color: #388e3c;
	}

	.common-section {
		width: 100%;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.common-section.common-disabled {
		opacity: 0.72;
	}

	.common-question {
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--color-text);
		text-align: center;
		margin: 0 0 0.75rem;
		line-height: 1.35;
	}

	.final-code-section {
		width: 100%;
		margin-top: 1.25rem;
		margin-bottom: 0.5rem;
	}

	.final-code-section.common-disabled {
		opacity: 0.72;
	}

	.final-code-heading {
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--color-text);
		text-align: center;
		margin: 0 0 0.45rem;
		letter-spacing: 0.02em;
	}

	.code-cells-row {
		display: flex;
		flex-wrap: nowrap;
		align-items: stretch;
		justify-content: center;
		gap: 0;
		margin: 0 auto 1rem;
		width: fit-content;
		max-width: 100%;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.code-cells-row .code-cell {
		flex: 0 0 auto;
		border-radius: 0;
		margin: 0;
		border-right-width: 0;
	}

	.code-cells-row .code-cell:first-child {
		border-top-left-radius: 0.4em;
		border-bottom-left-radius: 0.4em;
	}

	.code-cells-row .code-cell:last-child {
		border-top-right-radius: 0.4em;
		border-bottom-right-radius: 0.4em;
		border-right-width: 2px;
	}

	/* Beat global `input[type='text']` (width: 100%) so all hint cells stay visible in a row */
	.code-cells-row input[type='text'].code-cell {
		width: 2.35rem;
		max-width: none;
		min-width: 0;
		height: 2.45rem;
		padding: 0.15rem;
		flex: 0 0 2.35rem;
		border-width: 2px;
		border-radius: 0;
	}

	.code-cells-row input[type='text'].code-cell-wide {
		width: 2.85rem;
		flex: 0 0 2.85rem;
	}

	.code-cell {
		width: 2.35rem;
		height: 2.45rem;
		padding: 0.15rem;
		font-size: 1.2rem;
		font-family: var(--font-mono);
		font-weight: 600;
		text-align: center;
		border-radius: 0.4em;
		border: 2px solid var(--color-border);
		box-sizing: border-box;
		background: var(--color-white);
		color: var(--color-text);
		line-height: 1;
	}

	.code-cell-wide {
		width: 2.85rem;
	}

	.hint-cell {
		background: var(--color-lilac);
		color: var(--color-text);
		opacity: 1;
		cursor: default;
	}

	.final-code-answer-row {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.6em 1em;
		border-radius: 0.5em;
		background: var(--color-white);
		border: 2px solid var(--color-border);
		width: 100%;
		box-sizing: border-box;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.final-code-solved {
		background: #e8f5e9;
		border-color: #388e3c;
	}

	.final-code-answer-row .code-cell {
		flex: 0 0 auto;
	}

	.answer-row-wrong {
		background: #ffcdd2;
		border-color: #d32f2f;
		color: #b71c1c;
	}

	.answer-row-wrong .code-cell {
		border-color: rgba(211, 47, 47, 0.6);
	}

	.final-code-answer-row button[type='button'] {
		font-size: 1.05em;
		padding: 0.55em 1em;
		border-radius: 0.5em;
		border: none;
		background: var(--color-theme-2);
		color: var(--color-white);
		font-weight: 600;
		cursor: pointer;
		flex-shrink: 0;
	}

	.final-code-answer-row button[type='button']:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.final-code-answer-row input.code-cell[type='text'] {
		width: 2.35rem;
		max-width: none;
		min-width: 0;
		padding: 0.15rem;
		height: 2.45rem;
		text-align: center;
	}

	@media (max-width: 480px) {
		.play-btn {
			font-size: 0.95em;
		}
	}
</style>
