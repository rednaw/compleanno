<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  const CORRECT_CODE = '1234';
  let code = $state('');
  let error = $state(false);
  let success = $state(false);

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
      window.location.href = 'https://www.sherlocked.nl/nl/experiences/the-alchemist';
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
  .main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
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
    font-family: monospace;
    color: #010100;
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
    border: 2px solid #fd7f20;
    background: white;
    color: #010100;
    cursor: pointer;
    border-radius: 0.5em;
    transition: all 0.2s;
    font-weight: 500;
  }

  button:hover {
    background: #fdb750;
    border-color: #fc2e20;
  }

  button:active {
    background: #fc2e20;
    color: white;
  }

  .error {
    color: #fc2e20;
    margin: 1em 0;
    min-height: 1.5em;
  }

  .success {
    color: #fd7f20;
    margin: 1em 0;
    min-height: 1.5em;
  }
</style>

<main class="main-container">
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