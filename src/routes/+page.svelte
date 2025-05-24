<script>
  import { base } from '$app/paths';
</script>

<main>
  <div class="content">
    <div class="games-grid">
      <a href="{base}/wordle" class="game-button">?</a>
      <button class="game-button">?</button>
      <button class="game-button">?</button>
      <button class="game-button">?</button>
    </div>
    <div class="arrow">↓</div>
    <div class="code-section">
      <a href="{base}/code" class="code-button">?</a>
    </div>
  </div>
</main>

<style>
  main {
    text-align: center;
    min-height: 100vh;
    display: flex;
    background: var(--color-background);
  }

  .content {
    width: 100%;
    padding: 8rem 2rem 4rem 2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
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
</style> 