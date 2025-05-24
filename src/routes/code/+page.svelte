<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  const CORRECT_CODE = '1234';
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
      if (code === CORRECT_CODE) {
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
      }, 1000);
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
  <meta name="description" content="Enter the code to proceed" />
</svelte:head>

<style>
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  .fade-out {
    animation: fadeOut 1s forwards;
  }

  .main-container {
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

  .error {
    color: var(--color-theme-1);
    margin: 1em 0;
    min-height: 1.5em;
  }

  .success {
    color: var(--color-theme-2);
    margin: 1em 0;
    min-height: 1.5em;
  }
</style>

<main class="main-container" class:fade-out={success}>
  <h1>Enter Code</h1>
  <div class="code-display">
    {code.padEnd(4, '•')}
  </div>
  {#if error}
    <div class="error">Wrong code!</div>
  {/if}
  {#if success}
    <div class="success">Correct! Redirecting...</div>
  {/if}
  <div class="keypad">
    {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as digit}
      <button onclick={() => handleDigit(digit)}>{digit}</button>
    {/each}
    <button onclick={handleBackspace}>←</button>
    <button onclick={() => handleDigit(0)}>0</button>
    <button onclick={handleEnter}>Enter</button>
  </div>
</main> 