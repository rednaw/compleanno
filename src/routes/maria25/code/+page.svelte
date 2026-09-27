<script>
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import CodeKeypad from '$lib/components/CodeKeypad.svelte';

	const CORRECT_CODE = '3920';
	let success = $state(false);

	$effect(() => {
		if (success && browser) {
			setTimeout(() => {
				window.location.href = 'https://www.sherlocked.nl/nl/experiences/the-alchemist';
			}, 5000);
		}
	});
</script>

<svelte:head>
	<title>Enter Code</title>
</svelte:head>

<a href={resolve('/maria25')} class="back-button">←</a>

{#if !success}
	<CodeKeypad
		correctCode={CORRECT_CODE}
		onCorrect={() => {
			success = true;
		}}
	/>
{:else}
	<main class="main-container fade-out" aria-hidden="true"></main>
{/if}

<style>
	@keyframes fadeOut {
		0% {
			opacity: 1;
			transform: rotate(0deg) scale(1);
			background: var(--color-white);
			box-shadow: 0 4px 32px rgba(0, 0, 0, 0.1);
		}
		5% {
			opacity: 1;
			transform: rotate(0deg) scale(1.2);
			background: #ffffff;
			box-shadow:
				0 0 100px #ffffff,
				0 0 150px #ffffff,
				0 0 200px #ffffff,
				0 0 250px #ffffff;
		}
		10% {
			opacity: 1;
			transform: rotate(0deg) scale(1);
			background: var(--color-white);
			box-shadow: 0 4px 32px rgba(0, 0, 0, 0.1);
		}
		15% {
			opacity: 1;
			transform: rotate(0deg) scale(1.2);
			background: #ffffff;
			box-shadow:
				0 0 100px #ffffff,
				0 0 150px #ffffff,
				0 0 200px #ffffff,
				0 0 250px #ffffff;
		}
		20% {
			opacity: 1;
			transform: rotate(0deg) scale(1);
			background: var(--color-white);
			box-shadow: 0 4px 32px rgba(0, 0, 0, 0.1);
		}
		100% {
			opacity: 0;
			transform: rotate(5deg) scale(0.8);
			background: var(--color-white);
			box-shadow: 0 4px 32px rgba(0, 0, 0, 0.1);
		}
	}

	.fade-out {
		animation: fadeOut 6s forwards;
		transform-origin: center center;
	}

	.main-container {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: var(--color-white);
		border-radius: 1em;
		box-shadow: 0 4px 32px rgba(0, 0, 0, 0.1);
		padding: 2em;
		max-width: 320px;
		width: 100%;
		margin: 2em auto;
		min-height: 12rem;
	}

	.back-button {
		position: fixed;
		top: 0em;
		left: 1em;
		font-size: 3em;
		color: var(--color-theme-1);
		text-decoration: none;
		font-weight: bold;
		z-index: 100;
	}
</style>
