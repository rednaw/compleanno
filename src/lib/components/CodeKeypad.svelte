<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	/**
	 * 4-digit code pad with keyboard support, auto-submit at 4 digits, shake on wrong.
	 * @typedef {object} Props
	 * @property {string} correctCode
	 * @property {boolean} [locked] when true, ignore input (already solved)
	 * @property {(code: string) => void} [onCorrect]
	 * @property {import('svelte').Snippet} [children] content above the display (e.g. prize list)
	 */
	/** @type {Props} */
	let { correctCode, locked = false, onCorrect, children } = $props();

	let code = $state('');
	let error = $state(false);

	/** @type {(e: KeyboardEvent) => void} */
	let onKeyDown;

	/** @param {string | number} digit */
	function handleDigit(digit) {
		if (locked || code.length >= 4) return;
		code += String(digit);
		error = false;
		if (code.length === 4) handleEnter();
	}

	function handleBackspace() {
		if (locked) return;
		code = code.slice(0, -1);
		error = false;
	}

	function handleEnter() {
		if (locked || code.length !== 4) return;
		if (code.toLowerCase() === correctCode.toLowerCase()) {
			onCorrect?.(code);
		} else {
			error = true;
			code = '';
		}
	}

	onMount(() => {
		if (!browser) return;
		onKeyDown = (e) => {
			if (locked) return;
			if (e.key === 'Enter') handleEnter();
			else if (e.key === 'Backspace') handleBackspace();
			else if (/^[0-9]$/.test(e.key)) handleDigit(e.key);
		};
		window.addEventListener('keydown', onKeyDown);
	});

	onDestroy(() => {
		if (browser && onKeyDown) {
			window.removeEventListener('keydown', onKeyDown);
		}
	});
</script>

<main class="main-container" class:shake={error}>
	{#if children}
		{@render children()}
	{/if}

	<div class="code-display" aria-live="polite">
		{code.padEnd(4, '•')}
	</div>

	<div class="keypad">
		{#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as digit (digit)}
			<button type="button" onclick={() => handleDigit(digit)}>{digit}</button>
		{/each}
		<button type="button" onclick={handleBackspace}>←</button>
		<button type="button" onclick={() => handleDigit(0)}>0</button>
		<button type="button" onclick={handleEnter}>Enter</button>
	</div>
</main>

<style>
	@keyframes shake {
		0% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-5px);
		}
		50% {
			transform: translateX(5px);
		}
		75% {
			transform: translateX(-5px);
		}
		100% {
			transform: translateX(0);
		}
	}

	.shake {
		animation: shake 0.2s 2;
	}

	.main-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: var(--color-white);
		border-radius: 1em;
		box-shadow: 0 4px 32px rgba(0, 0, 0, 0.1);
		padding: 2em 1.5em;
		max-width: 320px;
		width: 100%;
		margin: 5em auto 2em;
		box-sizing: border-box;
	}

	.code-display {
		font-size: 2em;
		letter-spacing: 0.5em;
		margin: 0.25em 0 1em;
		min-height: 1.5em;
		font-family: var(--font-mono);
		color: var(--color-text);
	}

	.keypad {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5em;
		width: 100%;
		max-width: 300px;
	}

	.keypad button {
		padding: 1em;
		font-size: 1.5em;
		border: 2px solid var(--color-border);
		background: var(--color-white);
		color: var(--color-text);
		cursor: pointer;
		border-radius: 0.5em;
		transition: all 0.2s;
		font-weight: 500;
	}

	.keypad button:hover {
		background: var(--color-hover-bg);
		border-color: var(--color-hover-border);
	}

	.keypad button:active {
		background: var(--color-theme-1);
		color: var(--color-white);
	}
</style>
