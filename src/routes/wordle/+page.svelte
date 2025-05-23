<script>
import { onMount, onDestroy } from 'svelte';
import { Game } from './game-client.js';
import { browser } from '$app/environment';

let game;
let guesses = [];
let answers = [];
let answer = null;
let currentGuess = '';
let won = false;
let badGuess = false;
let gameOver = false;

function loadGame() {
  const saved = localStorage.getItem('wordle');
  game = new Game(saved);
  guesses = [...game.guesses];
  answers = [...game.answers];
  answer = answers.length >= 6 ? game.answer : null;
  currentGuess = guesses[answers.length] || '';
  won = answers.at(-1) === 'xxxxx';
  gameOver = won || answers.length >= 6;
}

function saveGame() {
  localStorage.setItem('wordle', game.toString());
}

function handleKey(key) {
  if (gameOver) return;
  if (key === 'backspace') {
    currentGuess = currentGuess.slice(0, -1);
    badGuess = false;
  } else if (key === 'enter') {
    if (currentGuess.length === 5) {
      const valid = game.enter(currentGuess.split(''));
      if (!valid) {
        badGuess = true;
        return;
      }
      saveGame();
      loadGame();
      currentGuess = '';
    }
  } else if (/^[a-z]$/.test(key) && currentGuess.length < 5) {
    currentGuess += key;
    badGuess = false;
  }
}

function restart() {
  localStorage.removeItem('wordle');
  loadGame();
  badGuess = false;
}

onMount(() => {
  if (browser) {
    window.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Enter') handleKey('enter');
      else if (e.key === 'Backspace') handleKey('backspace');
      else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toLowerCase());
    });
  }
  loadGame();
});

onDestroy(() => {
  if (browser) {
    window.removeEventListener('keydown', handleKey);
  }
});

$: won = answers.at(-1) === 'xxxxx';
$: gameOver = won || answers.length >= 6;
$: answer = answers.length >= 6 ? game.answer : null;
</script>

<svelte:head>
  <title>Wordle</title>
  <meta name="description" content="A Wordle clone written in SvelteKit" />
</svelte:head>

<style>
:global(body.wordle-page) {
  min-height: 100vh;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('/questionmark.jpg') no-repeat center center fixed;
  background-size: cover;
}

.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1em;
  box-shadow: 0 4px 32px rgba(0,0,0,0.1);
  padding: 2em 2em 1em 2em;
  max-width: 420px;
  width: 100%;
  margin: 5em auto 2em auto;
}

.game {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  margin-bottom: 1em;
  align-items: center;
}
.row {
  display: flex;
  gap: 0.25em;
}
.letter {
  width: 2em;
  height: 2em;
  border: 2px solid #fd7f20;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
  background: white;
  text-transform: uppercase;
  color: #010100;
  font-weight: 600;
  border-radius: 0.5em;
}
.exact {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}
.close {
  background: #ffc107;
  color: white;
  border-color: #ffc107;
}
.missing {
  background: #90a4ae;
  color: white;
  border-color: #90a4ae;
}
.current {
  border-bottom: 2px solid #fc2e20;
}
.bad-guess {
  animation: shake 0.2s 2;
}
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}
.keyboard {
  display: flex;
  flex-direction: column;
  gap: 0.25em;
  align-items: center;
}
.kb-row {
  display: flex;
  gap: 0.25em;
}
button {
  padding: 0.5em 1em;
  font-size: 1em;
  border: 2px solid #fd7f20;
  background: white;
  color: #010100;
  cursor: pointer;
  border-radius: 0.5em;
  transition: all 0.2s;
  font-weight: 500;
}
button:hover {
  background: #fdb750;
  border-color: #fc2e20;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.result {
  margin-top: 1em;
  font-size: 1.2em;
  text-align: center;
  color: #2c3e50;
}

@media (max-width: 500px) {
  .main-container {
    max-width: 98vw;
    padding: 1em 0.2em 0.5em 0.2em;
  }
  .game {
    width: 100%;
  }
  .row {
    width: 100%;
    justify-content: center;
  }
  .letter {
    width: 2.2em;
    height: 2.2em;
    font-size: 1.1em;
  }
  .keyboard {
    width: 100%;
    max-width: 100vw;
  }
  .kb-row {
    width: 100%;
    justify-content: center;
  }
  button {
    padding: 0.3em 0.5em;
    font-size: 0.95em;
    min-width: 2.2em;
  }
}
</style>

<main class="main-container">
  <h1>Dove si trova?</h1>
  <div class="game">
    {#each Array.from({ length: 6 }) as _, row}
      <div class="row {row === answers.length && !gameOver ? 'current' : ''} {badGuess && row === answers.length ? 'bad-guess' : ''}">
        {#each Array.from({ length: 5 }) as _, col}
          {#if row < answers.length}
            <div class="letter {answers[row][col] === 'x' ? 'exact' : answers[row][col] === 'c' ? 'close' : answers[row][col] === '_' ? 'missing' : ''}">
              {guesses[row][col] || ''}
            </div>
          {:else if row === answers.length && !gameOver}
            <div class="letter">{currentGuess[col] || ''}</div>
          {:else}
            <div class="letter"></div>
          {/if}
        {/each}
      </div>
    {/each}
  </div>

  {#if gameOver}
    <div class="result">
      {#if won}
        <p>🎉 Hai vinto, vai a guardare velocemente! 🎉</p>
      {:else}
        <p>Game over, riprova!</p>
      {/if}
      <button on:click={restart}>Riprova</button>
    </div>
  {:else}
    <div class="keyboard">
      {#each ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'] as row}
        <div class="kb-row">
          {#each row.split('') as key}
            <button on:click={() => handleKey(key)} disabled={gameOver}>{key}</button>
          {/each}
          {#if row === 'zxcvbnm'}
            <button on:click={() => handleKey('backspace')} disabled={gameOver}>←</button>
            <button on:click={() => handleKey('enter')} disabled={gameOver || currentGuess.length !== 5}>Enter</button>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</main> 