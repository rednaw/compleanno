<script>
  import { base } from '$app/paths';
  import { onMount } from 'svelte';

  let showRotateMessage = false;
  let isLandscape = false;

  // Check device orientation and screen size
  function checkOrientation() {
    const isMobile = window.innerWidth <= 768;
    const isPortrait = window.innerHeight > window.innerWidth;
    
    if (isMobile && isPortrait) {
      showRotateMessage = true;
      isLandscape = false;
    } else {
      showRotateMessage = false;
      isLandscape = true;
    }
  }

  // Load and check orientation on mount
  onMount(() => {
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
    padding: 4rem 1rem 2rem 1rem;
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
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  /* Responsive design for small screens */
  @media (max-width: 768px) {
    .container {
      padding: 3rem 0.5rem 1rem 0.5rem;
    }
    
    .puzzle-image {
      max-width: 98vw;
      max-height: 75vh;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 2rem 0.5rem 1rem 0.5rem;
    }
    
    .puzzle-image {
      max-width: 100vw;
      max-height: 80vh;
    }
  }
</style>

