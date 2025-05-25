<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { base } from '$app/paths';

  const CORRECT_CODE = '3920';
  let code = $state('');
  let error = $state(false);
  let success = $state(false);
  let fadeOut = $state(false);

  function handleDigit(digit) {
    if (code.length < 4) {
      code += digit;
      error = false;
    }
  }

  function handleBackspace() {
    code = code.slice(0, -1);
    error = false;
  }

  function handleEnter() {
    if (code.length === 4) {
      if (code.toLowerCase() === CORRECT_CODE.toLowerCase()) {
        success = true;
      } else {
        error = true;
        code = '';
      }
    }
  }

  function handleKey(e) {
    if (success) return;
    
    if (e.key === 'Enter') {
      handleEnter();
    } else if (e.key === 'Backspace') {
      handleBackspace();
    } else if (/^[0-9]$/.test(e.key)) {
      handleDigit(e.key);
    }
  }

  $effect(() => {
    if (success && browser) {
      fadeOut = true;
      setTimeout(() => {
        window.location.href = 'https://www.sherlocked.nl/nl/experiences/the-alchemist';
      }, 5000);
    }
  });

  onMount(() => {
    if (browser) {
      window.addEventListener('keydown', handleKey);
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('keydown', handleKey);
    }
  });
</script>

<svelte:head>
  <title>Enter Code</title>
</svelte:head>

<style>
  @keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
    100% { transform: translateX(0); }
  }

  .shake {
    animation: shake 0.2s 2;
  }

  @keyframes fadeOut {
    0% { 
      opacity: 1;
      transform: rotate(0deg) scale(1);
      background: var(--color-white);
      box-shadow: 0 4px 32px rgba(0,0,0,0.1);
    }
    5% {
      opacity: 1;
      transform: rotate(0deg) scale(1.2);
      background: #ffffff;
      box-shadow: 0 0 100px #ffffff, 0 0 150px #ffffff, 0 0 200px #ffffff, 0 0 250px #ffffff;
    }
    10% {
      opacity: 1;
      transform: rotate(0deg) scale(1);
      background: var(--color-white);
      box-shadow: 0 4px 32px rgba(0,0,0,0.1);
    }
    15% {
      opacity: 1;
      transform: rotate(0deg) scale(1.2);
      background: #ffffff;
      box-shadow: 0 0 100px #ffffff, 0 0 150px #ffffff, 0 0 200px #ffffff, 0 0 250px #ffffff;
    }
    20% {
      opacity: 1;
      transform: rotate(0deg) scale(1);
      background: var(--color-white);
      box-shadow: 0 4px 32px rgba(0,0,0,0.1);
    }
    100% { 
      opacity: 0;
      transform: rotate(5deg) scale(0.8);
      background: var(--color-white);
      box-shadow: 0 4px 32px rgba(0,0,0,0.1);
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
    box-shadow: 0 4px 32px rgba(0,0,0,0.1);
    padding: 2em;
    max-width: 320px;
    width: 100%;
    margin: 2em auto;
  }

  .code-display {
    font-size: 2em;
    letter-spacing: 0.5em;
    margin: 1em 0;
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

  button {
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

  button:hover {
    background: var(--color-hover-bg);
    border-color: var(--color-hover-border);
  }

  button:active {
    background: var(--color-theme-1);
    color: var(--color-white);
  }

  .back-button {
    position: fixed;
    top: 1em;
    left: 1em;
    font-size: 2em;
    color: var(--color-theme-1);
    text-decoration: none;
    font-weight: bold;
    z-index: 100;
  }

</style>

<a href="{base}/" class="back-button">←</a>
<main class="main-container" class:fade-out={success} class:shake={error}>
  <div class="code-display">
    {code.padEnd(4, '•')}
  </div>
  <div class="keypad">
    {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as digit}
      <button onclick={() => handleDigit(digit)}>{digit}</button>
    {/each}
    <button onclick={handleBackspace}>←</button>
    <button onclick={() => handleDigit(0)}>0</button>
    <button onclick={handleEnter}>Enter</button>
  </div>
</main> 