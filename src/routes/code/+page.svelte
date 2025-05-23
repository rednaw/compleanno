<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';

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

  $effect(() => {
    if (success) {
      const timer = setTimeout(() => {
        window.location.href = 'https://www.sherlocked.nl/nl/experiences/the-alchemist';
      }, 1000);
      return () => clearTimeout(timer);
    }
  });

  onMount(() => {
    document.body.classList.add('code-page');
  });

  onDestroy(() => {
    document.body.classList.remove('code-page');
  });
</script>

<svelte:head>
  <title>Enter Code</title>
  <meta name="description" content="Enter the code to proceed" />
</svelte:head>

<style>
  :global(body.code-page) {
    min-height: 100vh;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1a1a1a;
    color: white;
  }

  .main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.1);
    border-radius: 1em;
    box-shadow: 0 4px 32px rgba(0,0,0,0.12);
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
    border: none;
    background: #333;
    color: white;
    cursor: pointer;
    border-radius: 0.5em;
    transition: background 0.2s;
  }

  button:hover {
    background: #444;
  }

  button:active {
    background: #555;
  }

  .error {
    color: #ff4444;
    margin: 1em 0;
    min-height: 1.5em;
  }

  .success {
    color: #44ff44;
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