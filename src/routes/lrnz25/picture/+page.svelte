<script>
  import { base } from '$app/paths';
  import { onMount } from 'svelte';

  let showRotateMessage = false;
  let isLandscape = false;
  let guess = '';
  let submitted = false;
  let isCorrect = false;

  function submitGuess() {
    if (!guess.trim()) return;
    
    const userGuess = guess.trim().toLowerCase();
    if (userGuess === 'drie') {
      isCorrect = true;
      submitted = true;
      // Save completion state to localStorage
      try {
        localStorage.setItem('lrnz25_picture_done', '1');
      } catch {}
    } else {
      isCorrect = false;
      guess = '';
    }
  }

  // Check device orientation
  function checkOrientation() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Simply check if device is in portrait mode
    const isPortrait = height > width;
    
    // Show rotate message only if in portrait mode (encourage landscape for this puzzle)
    if (isPortrait) {
      showRotateMessage = true;
      isLandscape = false;
    } else {
      showRotateMessage = false;
      isLandscape = true;
    }
  }

  // Load and check orientation on mount
  onMount(() => {
    // Check if game was already completed
    try {
      if (localStorage.getItem('lrnz25_picture_done') === '1') {
        submitted = true;
        isCorrect = true;
      }
    } catch {}
    
    // Check orientation on mount
    checkOrientation();
    
    // Listen for orientation changes
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  });
</script>

<a href="{base}/lrnz25/" class="back-button">←</a>

{#if showRotateMessage}
  <div class="rotate-message">
    <div class="rotate-icon">📱↔️</div>
  </div>
{:else}
  <main class="container">
    <div class="image-section">
      <img src="{base}/lrnz25/wiskunde.png" alt="Wiskunde Puzzle" class="puzzle-image" />
    </div>
    
    <div class="input-section">
      <form on:submit|preventDefault={submitGuess} class="guess-form">
        <input 
          type="text" 
          bind:value={guess} 
          class="guess-input"
          autocomplete="off"
        />
        {#if submitted && isCorrect}
          <div class="result-section">
            <p class="result-text">🎉 3</p>
          </div>
        {:else}
          <button type="submit" disabled={!guess.trim()} class="submit-btn">
            Submit
          </button>
        {/if}
      </form>
    </div>
  </main>
{/if}

<style>
  .rotate-message {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: var(--color-background);
  }

  .rotate-icon {
    font-size: 8rem;
    animation: rotate 3s ease-in-out infinite;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }

  @keyframes rotate {
    0%, 100% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(-15deg) scale(1.1); }
    75% { transform: rotate(15deg) scale(1.1); }
  }

  .back-button {
    position: fixed;
    top: 0;
    left: 1rem;
    font-size: 3rem;
    color: var(--color-theme-1);
    text-decoration: none;
    font-weight: bold;
    z-index: 100;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    background: var(--color-background);
    padding: 2rem 1rem 1rem 1rem;
    box-sizing: border-box;
    justify-content: center;
  }

  .image-section {
    max-width: 800px;
    width: 100%;
    text-align: center;
  }

  .puzzle-image {
    width: auto;
    height: auto;
    max-width: 95vw;
    max-height: 70vh;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0.1);
  }

  .input-section {
    margin-top: 1rem;
    padding-bottom: 1rem;
    width: 100%;
    max-width: 600px;
    position: relative;
  }

  .guess-form {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
  }

  .guess-input {
    font-size: 1.1rem;
    padding: 0.6rem 0.8rem;
    border: 2px solid var(--color-border);
    border-radius: 0.5rem;
    min-width: 200px;
    background: var(--color-white);
    color: var(--color-text);
  }

  .guess-input:focus {
    outline: none;
    border-color: var(--color-theme-1);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .submit-btn {
    font-size: 1.1rem;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--color-white);
    background: var(--color-theme-2);
  }

  .submit-btn:hover:not(:disabled) {
    background: var(--color-theme-1);
    transform: translateY(-2px);
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .result-section {
    text-align: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 0.5rem;
    border: 2px solid var(--color-border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 0.6rem 0.8rem;
    width: fit-content;
    min-width: 100px;
    height: 3.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  .result-text {
    font-size: 2.2rem;
    margin: 0;
    font-weight: bold;
    color: var(--color-text);
  }

  /* Responsive design for small screens */
  @media (max-width: 768px) {
    .container {
      padding: 1.5rem 0.5rem 0.5rem 0.5rem;
    }
    
    .input-section {
      margin-top: 0.5rem;
    }
    
    .puzzle-image {
      max-width: 95vw;
      max-height: 70vh;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 1rem 0.5rem 0.5rem 0.5rem;
    }
    
    .input-section {
      margin-top: 0.5rem;
    }
    
    .guess-input {
      min-width: 150px;
      font-size: 1rem;
      padding: 0.5rem 0.6rem;
    }
    
    .submit-btn {
      font-size: 1rem;
      padding: 0.5rem 1rem;
    }
    
    .result-section {
      height: 2.8rem;
      padding: 0.5rem 0.6rem;
      min-width: 80px;
    }
    
    .puzzle-image {
      max-width: 100vw;
      max-height: 75vh;
    }
  }
</style>

