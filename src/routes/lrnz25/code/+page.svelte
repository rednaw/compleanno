<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { base } from '$app/paths';

  const CORRECT_CODE = '7253';
  let code = '';
  let error = false;
  let success = false;
  let showFinalImage = false;
  let transitionPhase = 'none'; // 'none', 'start', 'zoom', 'final'

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
        // Start the spectacular transition
        startSpectacularTransition();
      } else {
        error = true;
        code = '';
      }
    }
  }

  function startSpectacularTransition() {
    transitionPhase = 'start';
    
    // Phase 1: Start transition
    setTimeout(() => {
      transitionPhase = 'zoom';
    }, 500);
    
    // Phase 2: Zoom effect and show final image
    setTimeout(() => {
      showFinalImage = true;
      // Save completion state to localStorage
      try {
        localStorage.setItem('lrnz25_code_done', '1');
      } catch {}
    }, 1500);
  }

  function handleKey(e) {
    if (success) return;
    if (e.key === 'Enter') handleEnter();
    else if (e.key === 'Backspace') handleBackspace();
    else if (/^[0-9]$/.test(e.key)) handleDigit(e.key);
  }

  onMount(() => {
    if (browser) {
      window.addEventListener('keydown', handleKey);
      
      // Check if puzzle was already completed
      try {
        if (localStorage.getItem('lrnz25_code_done') === '1') {
          success = true;
          showFinalImage = true;
        }
      } catch {}
    }
  });
  onDestroy(() => {
    if (browser) window.removeEventListener('keydown', handleKey);
  });
</script>

<svelte:head>
  <title>Enter Code</title>
</svelte:head>

<style>
  @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-5px); } 100% { transform: translateX(0); } }
  .shake { animation: shake 0.2s 2; }

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
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  .code-display { font-size: 2em; letter-spacing: 0.5em; margin: 1em 0; min-height: 1.5em; font-family: var(--font-mono); color: var(--color-text); }
  .keypad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5em; width: 100%; max-width: 300px; }
  button { padding: 1em; font-size: 1.5em; border: 2px solid var(--color-border); background: var(--color-white); color: var(--color-text); cursor: pointer; border-radius: 0.5em; transition: all 0.2s; font-weight: 500; }
  button:hover { background: var(--color-hover-bg); border-color: var(--color-hover-border); }
  button:active { background: var(--color-theme-1); color: var(--color-white); }
  .back-button { position: fixed; top: 0em; left: 1em; font-size: 3em; color: var(--color-theme-1); text-decoration: none; font-weight: bold; z-index: 1001; }

  .main-container.transition-phase-start {
    transform: scale(1.1) rotate(5deg);
    filter: brightness(1.2) saturate(1.3);
  }

  .main-container.transition-phase-zoom {
    transform: scale(0.1) rotate(720deg);
    filter: brightness(2) saturate(2) blur(2px);
    opacity: 0;
  }

  .final-image-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-background);
    z-index: 1000;
  }

  /* Hide main container when final image is shown */
  .main-container.hidden {
    opacity: 0;
    pointer-events: none;
  }

  .final-image {
    max-width: 90vw;
    max-height: 90vh;
    width: auto;
    height: auto;
    border-radius: 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: finalImageGlow 2s ease-in-out infinite alternate;
  }

  @keyframes finalImageGlow {
    0% {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      filter: brightness(1);
    }
    100% {
      box-shadow: 0 8px 32px rgba(255, 255, 255, 0.4), 0 0 40px rgba(255, 255, 255, 0.2);
      filter: brightness(1.1);
    }
  }
</style>

<a href="{base}/lrnz25/" class="back-button">←</a>

<main class="main-container {transitionPhase !== 'none' ? `transition-phase-${transitionPhase}` : ''}" class:shake={error} class:hidden={showFinalImage}>
  <div class="code-display">{code.padEnd(4, '•')}</div>
  <div class="keypad">
    {#each [1,2,3,4,5,6,7,8,9] as digit}
      <button onclick={() => handleDigit(digit)}>{digit}</button>
    {/each}
    <button onclick={handleBackspace}>←</button>
    <button onclick={() => handleDigit(0)}>0</button>
    <button onclick={handleEnter}>Enter</button>
  </div>
</main>

{#if showFinalImage}
  <div class="final-image-container">
    <img src="{base}/lrnz25/igorrr.png" alt="Final reward" class="final-image" />
  </div>
{/if}

