<script>
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		checkOrientation,
		setupOrientationListeners,
		savePuzzleState,
		loadPuzzleState
	} from '$lib/puzzle-utils.js';
	import BackButton from '$lib/components/BackButton.svelte';
	import RotateMessage from '$lib/components/RotateMessage.svelte';
	import { gcm26HubDigit } from '../hub-digits.js';
	import { gcm26Keys } from '../storage-keys.js';
	import {
		MAZE_LINES,
		parseMaze,
		cellCenterPx,
		resolveWallCollisions,
		mazeHasPath
	} from './maze.js';

	const CELL_PX = 22;
	const maze = parseMaze(MAZE_LINES, CELL_PX);
	if (!mazeHasPath(maze.wall, maze.rows, maze.cols, maze.start, maze.goal)) {
		throw new Error('Maze has no path from S to G');
	}

	const startCenter = cellCenterPx(maze.start, maze.cellPx);
	const goalCenter = cellCenterPx(maze.goal, maze.cellPx);
	const BALL_R = maze.cellPx * 0.32;
	const WIN_R = maze.cellPx * 0.42;
	const FRICTION = 0.988;
	const ACCEL_PER_DEG = 55;
	const MAX_SPEED = maze.cellPx * 14;
	const SMOOTH = 0.14;
	const KEY_ACCEL = maze.cellPx * 28;

	/** @type {HTMLCanvasElement | undefined} */
	let canvasEl = $state();
	let showRotateMessage = $state(false);
	let alreadySolved = $state(false);
	let won = $state(false);
	let started = $state(false);
	let permissionHint = $state('');
	let showPermissionGate = $state(false);

	/** @type {number | null} */
	let neutralBeta = null;
	/** @type {number | null} */
	let neutralGamma = null;
	let calibrateNextSample = false;

	let smoothTx = 0;
	let smoothTy = 0;
	let rawBeta = 0;
	let rawGamma = 0;

	let ballX = startCenter.x;
	let ballY = startCenter.y;
	let ballVx = 0;
	let ballVy = 0;

	/** @type {number | undefined} */
	let rafId;
	let lastT = 0;

	/** @type {CanvasRenderingContext2D | null} */
	let ctxCache = null;

	/** @type {Record<string, boolean>} */
	const keyHeld = {};

	function resetBall() {
		ballX = startCenter.x;
		ballY = startCenter.y;
		ballVx = 0;
		ballVy = 0;
		smoothTx = 0;
		smoothTy = 0;
		renderFrame();
	}

	function calibrateNeutral() {
		calibrateNextSample = true;
		if (neutralBeta === null && started) {
			permissionHint = 'Tieni fermo il telefono per un attimo…';
		}
	}

	function onDeviceOrientation(/** @type {DeviceOrientationEvent} */ ev) {
		rawBeta = typeof ev.beta === 'number' ? ev.beta : 0;
		rawGamma = typeof ev.gamma === 'number' ? ev.gamma : 0;
		if (calibrateNextSample) {
			neutralBeta = rawBeta;
			neutralGamma = rawGamma;
			calibrateNextSample = false;
			permissionHint = '';
		}
	}

	function renderFrame() {
		const c = canvasEl;
		if (!c) return;
		if (!ctxCache) ctxCache = c.getContext('2d');
		const ctx = ctxCache;
		if (!ctx) return;

		const dpr = Math.min(2, window.devicePixelRatio || 1);
		const W = maze.widthPx;
		const H = maze.heightPx;
		c.width = Math.round(W * dpr);
		c.height = Math.round(H * dpr);
		c.style.width = `${W}px`;
		c.style.height = `${H}px`;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		const wood = '#8b5943';
		const woodDark = '#5c3628';
		const woodLight = '#c48060';
		ctx.fillStyle = wood;
		ctx.fillRect(0, 0, W, H);

		for (let i = 0; i < maze.rows; i++) {
			for (let j = 0; j < maze.cols; j++) {
				if (!maze.wall[i][j]) continue;
				const x = j * maze.cellPx;
				const y = i * maze.cellPx;
				const s = maze.cellPx;
				ctx.fillStyle = woodDark;
				ctx.fillRect(x, y, s, s);
				ctx.strokeStyle = woodLight;
				ctx.lineWidth = 1;
				ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
			}
		}

		ctx.fillStyle = 'rgba(40, 120, 60, 0.35)';
		ctx.beginPath();
		ctx.arc(goalCenter.x, goalCenter.y, maze.cellPx * 0.38, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = 'rgba(30, 90, 45, 0.9)';
		ctx.lineWidth = 2;
		ctx.stroke();

		ctx.fillStyle = '#f0e6d8';
		ctx.font = `bold ${Math.round(maze.cellPx * 0.7)}px ui-serif, Georgia, serif`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('G', goalCenter.x, goalCenter.y);

		const bx = ballX;
		const by = ballY;
		const grd = ctx.createRadialGradient(
			bx - BALL_R * 0.35,
			by - BALL_R * 0.35,
			BALL_R * 0.1,
			bx,
			by,
			BALL_R
		);
		grd.addColorStop(0, '#f5f5f5');
		grd.addColorStop(0.45, '#b8b8b8');
		grd.addColorStop(1, '#4a4a4a');
		ctx.fillStyle = grd;
		ctx.beginPath();
		ctx.arc(bx, by, BALL_R, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = '#2a2a2a';
		ctx.lineWidth = 1.5;
		ctx.stroke();
	}

	function gameLoop() {
		if (!started || won) return;

		const now = performance.now();
		const dt = Math.min(0.045, (now - lastT) / 1000) || 1 / 60;
		lastT = now;

		let tiltAx = 0;
		let tiltAy = 0;
		if (neutralBeta !== null && neutralGamma !== null) {
			const db = rawBeta - neutralBeta;
			let dg = rawGamma - neutralGamma;
			while (dg > 180) dg -= 360;
			while (dg < -180) dg += 360;
			const maxDeg = 28;
			const cb = Math.max(-maxDeg, Math.min(maxDeg, db));
			const cg = Math.max(-maxDeg, Math.min(maxDeg, dg));
			smoothTx += (cg - smoothTx) * SMOOTH;
			smoothTy += (cb - smoothTy) * SMOOTH;
			tiltAx = smoothTx * ACCEL_PER_DEG;
			tiltAy = -smoothTy * ACCEL_PER_DEG;
		}

		let kx = 0;
		let ky = 0;
		if (keyHeld.ArrowLeft || keyHeld.a || keyHeld.A) kx -= 1;
		if (keyHeld.ArrowRight || keyHeld.d || keyHeld.D) kx += 1;
		if (keyHeld.ArrowUp || keyHeld.w || keyHeld.W) ky -= 1;
		if (keyHeld.ArrowDown || keyHeld.s || keyHeld.S) ky += 1;

		ballVx += (tiltAx + kx * KEY_ACCEL) * dt;
		ballVy += (tiltAy + ky * KEY_ACCEL) * dt;
		ballVx *= FRICTION;
		ballVy *= FRICTION;
		const sp = Math.hypot(ballVx, ballVy);
		if (sp > MAX_SPEED) {
			const s = MAX_SPEED / sp;
			ballVx *= s;
			ballVy *= s;
		}

		ballX += ballVx * dt;
		ballY += ballVy * dt;

		const resolved = resolveWallCollisions(
			ballX,
			ballY,
			BALL_R,
			ballVx,
			ballVy,
			maze.wall,
			maze.rows,
			maze.cols,
			maze.cellPx
		);
		ballX = resolved.x;
		ballY = resolved.y;
		ballVx = resolved.vx;
		ballVy = resolved.vy;

		const gdx = ballX - goalCenter.x;
		const gdy = ballY - goalCenter.y;
		if (gdx * gdx + gdy * gdy < WIN_R * WIN_R) {
			won = true;
			started = false;
			savePuzzleState(gcm26Keys.gameEDone, '1');
			window.removeEventListener('deviceorientation', onDeviceOrientation, true);
			if (rafId) cancelAnimationFrame(rafId);
			renderFrame();
			return;
		}

		renderFrame();
		rafId = requestAnimationFrame(gameLoop);
	}

	async function startGame() {
		if (started && !won) return;

		permissionHint = '';
		if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
			try {
				const r = await DeviceOrientationEvent.requestPermission();
				if (r !== 'granted') {
					permissionHint =
						'Orientamento non disponibile: usa le frecce o WASD (su desktop funziona bene).';
				}
			} catch {
				permissionHint = 'Sensore non attivato: usa tastiera.';
			}
		}

		window.removeEventListener('deviceorientation', onDeviceOrientation, true);
		window.addEventListener('deviceorientation', onDeviceOrientation, true);

		started = true;
		resetBall();
		neutralBeta = null;
		neutralGamma = null;
		calibrateNextSample = true;
		lastT = performance.now();
		if (rafId) cancelAnimationFrame(rafId);
		renderFrame();
		rafId = requestAnimationFrame(gameLoop);
	}

	function onKeyDown(/** @type {KeyboardEvent} */ e) {
		if (
			[
				'ArrowUp',
				'ArrowDown',
				'ArrowLeft',
				'ArrowRight',
				'w',
				'a',
				's',
				'd',
				'W',
				'A',
				'S',
				'D'
			].includes(e.key)
		) {
			keyHeld[e.key] = true;
			if (e.key.startsWith('Arrow')) e.preventDefault();
		}
	}

	function onKeyUp(/** @type {KeyboardEvent} */ e) {
		delete keyHeld[e.key];
	}

	$effect(() => {
		if (!browser || !canvasEl || won || alreadySolved) return;
		ctxCache = null;
		renderFrame();
	});

	onMount(() => {
		showPermissionGate =
			typeof DeviceOrientationEvent !== 'undefined' &&
			typeof DeviceOrientationEvent.requestPermission === 'function';

		try {
			if (loadPuzzleState(gcm26Keys.gameEDone)) {
				alreadySolved = true;
				won = true;
			}
		} catch {
			void 0;
		}

		const updateOrientation = () => {
			showRotateMessage = !checkOrientation(true);
		};
		updateOrientation();
		const removeOrientation = setupOrientationListeners(updateOrientation);

		window.addEventListener('keydown', onKeyDown, true);
		window.addEventListener('keyup', onKeyUp, true);

		return () => {
			removeOrientation();
			window.removeEventListener('keydown', onKeyDown, true);
			window.removeEventListener('keyup', onKeyUp, true);
			window.removeEventListener('deviceorientation', onDeviceOrientation, true);
			if (rafId) cancelAnimationFrame(rafId);
		};
	});
</script>

<svelte:head>
	<title>GCM 26 — Labirinto</title>
</svelte:head>

<RotateMessage show={showRotateMessage} encouragePortrait={true} />

{#if !showRotateMessage}
	<main>
		<BackButton href={resolve('/gcm26')} />
		<div class="content">
			<h1 class="title">Labirinto di legno</h1>
			<p class="lede">
				Inclina il telefono per far rotolare la sfera fino alla <strong>G</strong> verde. Su computer
				usa le frecce o WASD.
			</p>

			{#if won || alreadySolved}
				<div class="result-section">
					<p class="result-text">
						<span class="result-emoji" aria-hidden="true">🎉</span>
						<span class="result-digit">{gcm26HubDigit.e}</span>
					</p>
					<p class="result-hint">Torna all’hub per continuare.</p>
				</div>
			{:else}
				{#if showPermissionGate && !started}
					<p class="perm-hint">
						Su iPhone, premi <strong>Inizia</strong> per consentire l’uso dell’orientamento.
					</p>
				{/if}
				{#if permissionHint}
					<p class="warn" role="status">{permissionHint}</p>
				{/if}

				<div class="canvas-wrap">
					<canvas bind:this={canvasEl} class="maze-canvas"></canvas>
				</div>

				<div class="actions">
					{#if !started}
						<button type="button" class="btn primary" onclick={startGame}>Inizia</button>
					{:else}
						<button type="button" class="btn secondary" onclick={calibrateNeutral}
							>Calibra orizzonte</button
						>
						<button type="button" class="btn secondary" onclick={() => resetBall()}
							>Riposiziona sfera</button
						>
					{/if}
				</div>
			{/if}
		</div>
	</main>
{/if}

<style>
	main {
		min-height: 100vh;
		margin: 0;
		padding: 5rem 1.25rem 2rem;
		box-sizing: border-box;
		background: var(--color-background);
	}

	.content {
		max-width: 28rem;
		margin: 0 auto;
	}

	.title {
		font-size: 1.65rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 0.75rem;
	}

	.lede {
		font-size: 1rem;
		line-height: 1.45;
		color: var(--color-text);
		margin: 0 0 1.25rem;
	}

	.perm-hint,
	.warn {
		font-size: 0.9rem;
		color: var(--color-text);
		margin: 0 0 0.75rem;
		opacity: 0.9;
	}

	.warn {
		color: var(--color-theme-1, #a51);
	}

	.canvas-wrap {
		display: flex;
		justify-content: center;
		margin: 0 auto 1rem;
		border-radius: 0.5rem;
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
		border: 2px solid var(--color-border, #ccc);
		background: #3d2418;
		max-width: 100%;
	}

	.maze-canvas {
		display: block;
		max-width: 100%;
		height: auto;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.btn {
		font-size: 1rem;
		padding: 0.65rem 1.1rem;
		border-radius: 0.4rem;
		border: 2px solid var(--color-border);
		cursor: pointer;
		font-weight: 600;
		background: var(--color-white);
		color: var(--color-text);
	}

	.btn.primary {
		background: var(--color-theme-1);
		color: #fff;
		border-color: transparent;
	}

	.btn.secondary {
		background: var(--color-white);
	}

	.btn:hover {
		filter: brightness(0.97);
	}

	.result-section {
		text-align: center;
		margin: 1rem 0 1.5rem;
	}

	.result-text {
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.result-digit {
		font-variant-numeric: tabular-nums;
	}

	.result-hint {
		margin: 0.5rem 0 0;
		font-size: 1rem;
		color: var(--color-text);
		opacity: 0.85;
	}
</style>
