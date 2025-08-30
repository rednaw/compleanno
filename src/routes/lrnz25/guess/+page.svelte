<script>
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import { checkOrientation, setupOrientationListeners, savePuzzleState, loadPuzzleState } from '../utils.js';
  import BackButton from '../components/BackButton.svelte';
  import RotateMessage from '../components/RotateMessage.svelte';

  const correctAnswer = 'extinction rebellion';
  const helpImages = [
    { src: `${base}/lrnz25/pumpjack.webp`, alt: 'Pumpjack' },
    { src: `${base}/lrnz25/politie.png`, alt: 'Politie' }
  ];
  
  let guess = '';
  let submitted = false;
  let isCorrect = false;
  let helpClicks = 0;
  let showRotateMessage = false;
  let isPortrait = false;





  function submitGuess() {
    if (!guess.trim()) return;
    
    const userGuess = guess.trim().toLowerCase();
    if (userGuess === correctAnswer) {
      isCorrect = true;
      submitted = true;
      // Save completion state to localStorage
      savePuzzleState('lrnz25_guess_done', '1');
    } else {
      isCorrect = false;
      guess = '';
      shakeScreen();
    }
  }

  function shakeScreen() {
    const main = document.querySelector('main');
    const body = document.body;
    
    let shakeCount = 0;
    const shakeInterval = setInterval(() => {
      if (shakeCount >= 8) {
        clearInterval(shakeInterval);
        main.style.transform = '';
        body.style.transform = '';
        return;
      }
      
      const offset = shakeCount % 2 === 0 ? -8 : 8;
      const rotation = shakeCount % 2 === 0 ? -0.3 : 0.3;
      main.style.transform = `translateX(${offset}px) rotate(${rotation}deg)`;
      body.style.transform = `translateX(${offset}px) rotate(${rotation}deg)`;
      shakeCount++;
    }, 60);
  }

  function showHelpImage() {
    if (helpClicks >= helpImages.length) return;
    
    const placeholders = document.querySelectorAll('.placeholder-image');
    const image = helpImages[helpClicks];
    
    // Replace placeholder with image using inline styles that work
    placeholders[helpClicks].innerHTML = `<img src="${image.src}" alt="${image.alt}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.5rem;" />`;
    helpClicks++;
    
    // Save help button state to localStorage
    try {
      localStorage.setItem('lrnz25_guess_help_clicks', helpClicks.toString());
    } catch {}
  }

  function resetGame() {
    guess = '';
    submitted = false;
    isCorrect = false;
    helpClicks = 0;
    
    // Clear help button state from localStorage
    try {
      localStorage.removeItem('lrnz25_guess_help_clicks');
    } catch {}
    
    const placeholders = document.querySelectorAll('.placeholder-image');
    placeholders.forEach(placeholder => {
      placeholder.innerHTML = '?';
    });
  }

  // Load and check orientation on mount
  onMount(() => {
    // Check if game was already completed
    if (loadPuzzleState('lrnz25_guess_done')) {
      submitted = true;
      isCorrect = true;
    }
      
      // Load help button state
      const savedHelpClicks = localStorage.getItem('lrnz25_guess_help_clicks');
      if (savedHelpClicks) {
        helpClicks = parseInt(savedHelpClicks);
        
        // Show the help images that were already revealed
        // Use setTimeout to ensure DOM is fully rendered
        setTimeout(() => {
          const placeholders = document.querySelectorAll('.placeholder-image');
          for (let i = 0; i < helpClicks && i < helpImages.length; i++) {
            if (placeholders[i]) {
              const image = helpImages[i];
              placeholders[i].innerHTML = `<img src="${image.src}" alt="${image.alt}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.5rem;" />`;
            }
          }
        }, 100);
      }
    
    // Check orientation on mount
    const updateOrientation = () => {
      const isPortraitMode = checkOrientation(true); // Encourage portrait for guess puzzle
      showRotateMessage = !isPortraitMode;
      isPortrait = isPortraitMode;
    };
    
    updateOrientation();
    
    // Listen for orientation changes
    const cleanup = setupOrientationListeners(updateOrientation);
    
    return cleanup;
  });
</script>

<BackButton />

<RotateMessage show={showRotateMessage} encouragePortrait={true} />

{#if !showRotateMessage}
  <main class="container">
  <div class="images-section">
    <div class="images-container">
      <div class="image-wrapper">
        <img src="{base}/lrnz25/dodo.jpg" alt="Dodo" class="game-image" />
      </div>
      <div class="image-wrapper">
        <img src="{base}/lrnz25/che.webp" alt="Che Guevara" class="game-image" />
      </div>
    </div>
    
    <div class="images-container">
      <div class="image-wrapper">
        <div class="placeholder-image">?</div>
      </div>
      <div class="image-wrapper">
        <div class="placeholder-image">?</div>
      </div>
    </div>

    {#if submitted && isCorrect}
      <div class="result-section">
        <p class="result-text">🎉 7</p>
      </div>
    {/if}

    <div class="input-section">
      {#if !submitted}
        <form on:submit|preventDefault={submitGuess} class="guess-form">
          <input 
            type="text" 
            bind:value={guess} 
            placeholder="" 
            class="guess-input"
            autocomplete="off"
          />
          <div class="buttons-container">
            <button type="submit" disabled={!guess.trim()} class="submit-btn">
              Submit
            </button>
            <button type="button" class="help-btn" on:click={showHelpImage}>
              Help
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
</main>
{/if}

<style>




  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    background: var(--color-background);
    padding: 4rem 1rem 2rem 1rem;
    box-sizing: border-box;
    justify-content: space-between;
  }

  .images-section {
    max-width: 600px;
    width: 100%;
    text-align: center;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 2rem;
  }

  .images-container {
    display: flex;
    gap: 2rem;
    justify-content: center;
    margin-bottom: 3rem;
    flex-wrap: wrap;
  }

  .image-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .game-image {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 0.5rem;
    border: 3px solid var(--color-border);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }



  .placeholder-image {
    width: 200px;
    height: 200px;
    border-radius: 0.5rem;
    border: 3px dashed var(--color-border);
    background: var(--color-white);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    color: var(--color-border);
    font-weight: bold;
  }

  .input-section {
    margin-top: 1rem;
    padding-bottom: 2rem;
    width: 100%;
    max-width: 600px;
    position: relative;
  }

  .guess-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
    align-items: center;
  }

  .guess-input {
    font-size: 1.2rem;
    padding: 0.8rem 1rem;
    border: 2px solid var(--color-border);
    border-radius: 0.5rem;
    min-width: 250px;
    background: var(--color-white);
    color: var(--color-text);
  }

  .guess-input:focus {
    outline: none;
    border-color: var(--color-theme-1);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .buttons-container {
    display: flex;
    gap: 1rem;
    justify-content: center;
    align-items: center;
  }

  .submit-btn, .help-btn {
    font-size: 1.2rem;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--color-white);
  }

  .submit-btn {
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

  .help-btn {
    background: var(--color-theme-1);
  }

  .help-btn:hover {
    background: var(--color-theme-2);
    transform: translateY(-2px);
  }

  .result-section {
    text-align: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 0.5rem;
    border: 2px solid var(--color-border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 1.2rem 1.5rem;
    width: fit-content;
    min-width: 140px;
    margin: 0 auto;
    margin-top: 3rem;
  }

  .result-text {
    font-size: 2.2rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text);
  }

  @media (max-width: 600px) {
    .container {
      padding: 3rem 1rem 1rem 1rem;
    }

    .images-section {
      padding-top: 1rem;
    }
    
    .images-container {
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .game-image {
      width: 150px;
      height: 150px;
    }
    

    
    .placeholder-image {
      width: 150px;
      height: 150px;
      font-size: 2.5rem;
    }
    
    .placeholder-image {
      font-size: 2.5rem;
    }

    .guess-form {
      flex-direction: row;
      gap: 0.8rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .guess-input {
      min-width: 200px;
      font-size: 1.1rem;
      padding: 0.7rem 0.9rem;
    }

    .submit-btn, .help-btn {
      font-size: 1.1rem;
      padding: 0.7rem 1.3rem;
    }
  }
</style>

