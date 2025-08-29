<script>
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  
  let connectionsDone = false;
  let guessDone = false;
  let pictureDone = false;
  let musicDone = false;
  let showRotateMessage = false;
  let isPortrait = false;

  // Check if all puzzles are completed
  $: allPuzzlesCompleted = connectionsDone && guessDone && pictureDone && musicDone;

  // Check device orientation
  function checkOrientation() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Simply check if device is in landscape mode
    const isLandscapeMode = width > height;
    
    // Show rotate message only if in landscape mode (encourage portrait for home page)
    if (isLandscapeMode) {
      showRotateMessage = true;
      isPortrait = false;
    } else {
      showRotateMessage = false;
      isPortrait = true;
    }
  }

  onMount(() => {
    try { 
      connectionsDone = sessionStorage.getItem('lrnz25_connections_done') === '1'; 
      guessDone = sessionStorage.getItem('lrnz25_guess_done') === '1';
      pictureDone = sessionStorage.getItem('lrnz25_picture_done') === '1';
      musicDone = sessionStorage.getItem('lrnz25_music_done') === '1';
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

  function clearGlobalState() {
    try {
      // Clear all lrnz25 game progress
      sessionStorage.removeItem('lrnz25_connections_done');
      sessionStorage.removeItem('lrnz25_connections_solved');
      sessionStorage.removeItem('lrnz25_music_done');
      sessionStorage.removeItem('lrnz25_picture_done');
      sessionStorage.removeItem('lrnz25_guess_done');
      sessionStorage.removeItem('lrnz25_code_done');
      
      // Reset local state
      connectionsDone = false;
      guessDone = false;
      pictureDone = false;
      musicDone = false;
    } catch {}
  }
</script>

{#if showRotateMessage}
  <div class="rotate-message">
    <div class="rotate-icon">📱↕️</div>
  </div>
{:else}
  <main>
    <button class="clear-button" on:click={clearGlobalState} title="Clear progress">🗑️</button>
    <div class="content">
      <div class="games-grid">
        <a href="{base}/lrnz25/music" class="game-button" data-key="music">{musicDone ? '2' : '?'}</a>
        <a href="{base}/lrnz25/connections" class="game-button" data-key="connections">{connectionsDone ? '5' : '?'}</a>
        <a href="{base}/lrnz25/picture" class="game-button" data-key="picture">{pictureDone ? '3' : '?'}</a>
        <a href="{base}/lrnz25/guess" class="game-button" data-key="guess">{guessDone ? '7' : '?'}</a>
      </div>
      <div class="arrow">↓</div>
      <div class="code-section">
        {#if allPuzzlesCompleted}
          <div class="final-image-container">
            <img src="{base}/lrnz25/final.png" alt="Final reward" class="final-image" />
          </div>
        {:else}
          <a href="{base}/lrnz25/code" class="code-button">?</a>
        {/if}
      </div>
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

  main {
    text-align: center;
    min-height: 105vh;
    display: flex;
    background: var(--color-background);
  }

  .content {
    width: 100%;
    padding: 8rem 2rem 2rem 2rem;
    display: flex;
    flex-direction: column;
    margin-top: auto;
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    max-width: 400px;
    width: 100%;
    margin: 0 auto;
  }

  .code-section {
    margin-top: 2rem;
    margin-bottom: 6rem;
  }

  .game-button, .code-button {
    color: var(--color-text);
    text-decoration: none;
    font-size: 2rem;
    padding: 2rem;
    background: var(--color-white);
    border: 2px solid var(--color-border);
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .code-button {
    font-size: 3rem;
    padding: 3rem;
    max-width: 200px;
    margin: 0 auto;
  }

  .final-image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }

  .final-image {
    width: 100%;
    height: auto;
    max-width: 400px;
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 2px solid var(--color-border);
  }

  .game-button:hover, .code-button:hover {
    background: var(--color-hover-bg);
    border-color: var(--color-hover-border);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .game-button:active, .code-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 500px) {
    .content {
      padding: 6rem 1rem 2rem 1rem;
    }
    
    .games-grid {
      gap: 0.75rem;
    }

    .game-button {
      padding: 1.5rem;
      font-size: 1.75rem;
    }

    .code-button {
      padding: 2rem;
      font-size: 2.5rem;
    }
  }

  .arrow {
    font-size: 6rem;
    color: var(--color-text);
    margin: 1rem 0;
  }

  .clear-button {
    position: fixed;
    top: 0;
    left: 1rem;
    font-size: 2rem;
    background: none;
    border: none;
    color: #dc3545;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    z-index: 100;
  }

  .clear-button:hover {
    background: rgba(220, 53, 69, 0.1);
    transform: scale(1.1);
  }

  .clear-button:active {
    transform: scale(0.95);
  }
</style>
