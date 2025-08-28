<script>
  import { base } from '$app/paths';

  const correctAnswer = 'rome';
  let guess = '';
  let attempts = 0;
  let success = false;
  let error = false;

  function submitGuess() {
    if (success) return;
    const user = guess.trim().toLowerCase();
    if (!user) return;
    attempts += 1;
    if (user === correctAnswer) {
      success = true;
      error = false;
    } else {
      error = true;
    }
  }
  function resetError() { if (error) error = false; }
</script>

<a href="{base}/lrnz25/" class="back-button">←</a>
<main class="main-container" class:shake={error}>
  <h1>Guess the Place</h1>
  <div class="hints">
    <p>Hint 1: Capital city in Europe.</p>
    {#if attempts >= 1}
      <p>Hint 2: Famous for ancient ruins.</p>
    {/if}
    {#if attempts >= 2}
      <p>Hint 3: The Colosseum is here.</p>
    {/if}
  </div>
  {#if success}
    <div class="result success">✅ Correct! The answer is ROME.</div>
  {:else}
    <form class="guess-form" on:submit|preventDefault={submitGuess}>
      <input type="text" bind:value={guess} on:input={resetError} placeholder="Type your guess..." autocomplete="off" />
      <button type="submit" disabled={!guess.trim()}>Check</button>
    </form>
    {#if error}
      <div class="result error">❌ Try again.</div>
    {/if}
  {/if}
</main>

<style>
  .back-button { position: fixed; top: 0em; left: 1em; font-size: 3em; color: var(--color-theme-1); text-decoration: none; font-weight: bold; z-index: 100; }
  .main-container { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 100vh; background: var(--color-background); padding: 2em; box-sizing: border-box; }
  h1 { margin: 0 0 1rem 0; color: var(--color-theme-1); }
  .hints { background: var(--color-white); border: 2px solid var(--color-border); border-radius: 0.75rem; padding: 1rem; max-width: 480px; width: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
  .guess-form { display: flex; gap: 0.5rem; margin-top: 1rem; }
  input[type="text"] { font-size: 1.1em; padding: 0.6em 1em; border-radius: 0.5em; border: 1px solid var(--color-border); min-width: 200px; }
  button[type="submit"] { font-size: 1.1em; padding: 0.6em 1.2em; border-radius: 0.5em; border: none; background: var(--color-theme-2); color: var(--color-white); font-weight: bold; cursor: pointer; transition: background 0.2s; }
  button[type="submit"]:disabled { opacity: 0.5; cursor: not-allowed; }
  .result { margin-top: 0.75rem; font-weight: 600; }
  .result.success { color: #2e7d32; }
  .result.error { color: #d32f2f; }
  .shake { animation: shake 0.2s 2; }
  @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-5px); } 100% { transform: translateX(0); } }
</style>

