<script>
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import { checkOrientation, setupOrientationListeners, loadPuzzleState, clearPuzzleState } from './utils.js';
  import RotateMessage from './components/RotateMessage.svelte';
  
  let connectionsDone = false;
  let guessDone = false;
  let pictureDone = false;
  let musicDone = false;
  let codeDone = false;
  let showRotateMessage = false;
  let isPortrait = false;

  // Check if all main puzzles are completed (excluding code puzzle)
  $: allPuzzlesCompleted = connectionsDone && guessDone && pictureDone && musicDone;



  onMount(() => {
    try { 
      connectionsDone = loadPuzzleState('lrnz25_connections_done');
      guessDone = loadPuzzleState('lrnz25_guess_done');
      pictureDone = loadPuzzleState('lrnz25_picture_done');
      musicDone = loadPuzzleState('lrnz25_music_done');
      codeDone = loadPuzzleState('lrnz25_code_done');
    } catch {}
    
    // Check orientation on mount
    const updateOrientation = () => {
      const isPortraitMode = checkOrientation(true); // Encourage portrait for home page
      showRotateMessage = !isPortraitMode;
      isPortrait = isPortraitMode;
    };
    
    updateOrientation();
    
    // Listen for orientation changes
    const cleanup = setupOrientationListeners(updateOrientation);
    
    return cleanup;
  });

  function clearGlobalState() {
    try {
      // Clear all lrnz25 game progress
      clearPuzzleState('lrnz25_connections_done');
      clearPuzzleState('lrnz25_connections_solved');
      clearPuzzleState('lrnz25_music_done');
      clearPuzzleState('lrnz25_picture_done');
      clearPuzzleState('lrnz25_guess_done');
      clearPuzzleState('lrnz25_code_done');
      
      // Clear individual music song states
      for (let i = 0; i < 4; i++) {
        clearPuzzleState(`lrnz25_music_song_${i}`);
      }
      
      // Clear guess puzzle help button state
      clearPuzzleState('lrnz25_guess_help_clicks');
      
      // Reset local state
      connectionsDone = false;
      guessDone = false;
      pictureDone = false;
      musicDone = false;
      codeDone = false;
    } catch {}
  }
</script>

<RotateMessage show={showRotateMessage} encouragePortrait={true} />

{#if !showRotateMessage}
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
          <a href="{base}/lrnz25/code" class="final-image-container">
            <img src="{base}/lrnz25/final.png" alt="Final reward" class="final-image" />
          </a>
        {:else}
          <a href="{base}/lrnz25/code" class="code-button">?</a>
        {/if}
      </div>
    </div>
  </main>
{/if}

<style>

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
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .final-image {
    width: 100%;
    height: auto;
    max-width: 400px;
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 2px solid var(--color-border);
    transition: all 0.2s ease;
  }

  .final-image-container:hover .final-image {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: var(--color-hover-border);
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
