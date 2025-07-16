<script>
  import { words as correctOrder } from '../words.js';
  import { onMount } from 'svelte';

  let currentWords = [];
  let shake = false;
  let gameComplete = false;
  let transitionOut = false;

  onMount(() => {
    // Start with a shuffled list, but not the correct one
    do {
      currentWords = [...correctOrder].sort(() => Math.random() - 0.5);
    } while (isCorrect(currentWords));
  });

  function move(index, direction) {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === currentWords.length - 1) return;

    const newWords = [...currentWords];
    const [item] = newWords.splice(index, 1);
    newWords.splice(index + direction, 0, item);
    currentWords = newWords;
  }

  function isCorrect(arr) {
    return arr.every((word, i) => word === correctOrder[i]);
  }

  function checkOrder() {
    if (isCorrect(currentWords)) {
      gameComplete = true;
      // Start the transition sequence
      setTimeout(() => {
        transitionOut = true;
        // Redirect after the animation
        setTimeout(() => {
          window.location.href = 'https://www.ntk.nl/voorstelling/willem-van-oranje';
        }, 2000); // Duration of the animation
      }, 1500); // Wait a bit before starting the animation
    } else {
      shake = true;
      setTimeout(() => (shake = false), 500);
    }
  }
</script>

<div class="page-wrapper {transitionOut ? 'dramatic-out' : ''}">
  <main class:shake class:complete={gameComplete}>
    {#if !gameComplete}
      <h1 class="title">Zet nu de woorden in de juiste volgorde</h1>
    {/if}
    {#if gameComplete}
      <div class="congrats">
        <h2>Gewonnen!</h2>
        <p>Gefeliciteerd met je verjaardag!</p>
      </div>
    {:else if currentWords.length}
      <div class="word-list">
        {#each currentWords as word, i (word)}
          <div class="word-item">
            <span class="word">{word}</span>
            <div class="controls">
              <button class="arrow-btn" on:click={() => move(i, -1)} disabled={i === 0} aria-label="Verplaats omhoog">▲</button>
              <button class="arrow-btn" on:click={() => move(i, 1)} disabled={i === currentWords.length - 1} aria-label="Verplaats omlaag">▼</button>
            </div>
          </div>
        {/each}
      </div>
      <button class="check-btn" on:click={checkOrder}>Controleer</button>
    {/if}
  </main>
</div>

<style>
  .page-wrapper {
    width: 100vw;
    min-height: 100vh;
    background: var(--color-background);
    position: relative;
    overflow-x: hidden;
  }

  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    background: var(--color-background);
    padding: 2rem 1rem;
    box-sizing: border-box;
    transition: transform 0.4s ease;
  }

  main.shake {
    animation: shake 0.4s;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }

  .title {
    font-size: 1.5rem;
    color: white;
    text-align: center;
    margin: 2rem 0;
  }

  .word-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 400px;
    margin-bottom: 2.5rem;
  }

  .word-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--color-white);
    padding: 0.8rem 1.2rem;
    border-radius: 0.75rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .word {
    font-size: 1.6rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--color-text);
  }

  .controls {
    display: flex;
    gap: 0.5rem;
  }

  .arrow-btn {
    font-size: 1.8rem;
    line-height: 1;
    padding: 0.5rem;
    background: var(--color-background);
    border: 2px solid var(--color-border);
    border-radius: 50%;
    cursor: pointer;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text);
    transition: background-color 0.2s, border-color 0.2s;
  }

  .arrow-btn:hover:not(:disabled) {
    background-color: var(--color-hover-bg);
    border-color: var(--color-hover-border);
  }

  .arrow-btn:focus {
    outline: none;
    box-shadow: 0 0 0 2px #1976d2;
    border-color: #1976d2;
  }

  .arrow-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background-color: var(--color-border);
  }

  .check-btn {
    padding: 0.8rem 2.5rem;
    font-size: 1.3rem;
    border-radius: 0.5rem;
    border: none;
    background: #1976d2;
    color: white;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transition: background 0.2s;
  }

  .check-btn:hover {
    background-color: #1565c0;
  }

  .congrats {
    text-align: center;
    padding: 2rem;
    background: #a5d6a7; /* Using the 'found' color from game 1 */
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border: 2px solid #388e3c;
  }

  .congrats h2 {
    font-size: 2.5rem;
    color: #1b5e20;
    margin: 0 0 0.5rem;
  }

  .congrats p {
    font-size: 1.2rem;
    color: #1b5e20;
    margin: 0;
  }

  main.complete {
    justify-content: center;
  }

  .dramatic-out {
    animation: dramatic-fade-scale 2s forwards;
  }

  @keyframes dramatic-fade-scale {
    0% {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
    40% {
      opacity: 1;
      transform: scale(1.1) rotate(2deg);
    }
    70% {
      opacity: 0.7;
      transform: scale(1.2) rotate(-2deg);
    }
    100% {
      opacity: 0;
      transform: scale(2) rotate(8deg);
    }
  }
</style> 