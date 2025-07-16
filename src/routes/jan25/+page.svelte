<script>
  import { words } from './words.js';
  import { onMount } from 'svelte';
  import { base } from '$app/paths';

  function joinBase(path) {
    // Ensures no double slashes and always works for both dev and prod
    if (!base || base === '/') return path.startsWith('/') ? path : '/' + path;
    return base.endsWith('/')
      ? (path.startsWith('/') ? base + path.slice(1) : base + path)
      : (path.startsWith('/') ? base + path : base + '/' + path);
  }
  // For debugging
  console.log('SvelteKit base path:', base);

  const gridSize = 9;

  function maskWord(word) {
    if (word.length < 2) return word;
    const idx = Math.floor(Math.random() * word.length);
    return word.substring(0, idx) + '_' + word.substring(idx + 1);
  }
  const maskedWords = words.map(maskWord);

  const directions = [
    [1, 0],   // right
    [0, 1],   // down
    [1, 1],   // diagonal down-right
    [-1, 1],  // diagonal down-left
    [-1, 0],  // left
    [0, -1],  // up
    [1, -1],  // diagonal up-right
    [-1, -1], // diagonal up-left
  ];

  function createEmptyGrid(size) {
    return Array.from({ length: size }, () => Array(size).fill(''));
  }

  function canPlace(grid, word, x, y, dx, dy) {
    for (let i = 0; i < word.length; i++) {
      const nx = x + dx * i;
      const ny = y + dy * i;
      if (
        nx < 0 || nx >= gridSize ||
        ny < 0 || ny >= gridSize ||
        (grid[ny][nx] && grid[ny][nx] !== word[i])
      ) {
        return false;
      }
    }
    return true;
  }

  function placeWord(grid, word, x, y, dx, dy) {
    for (let i = 0; i < word.length; i++) {
      const nx = x + dx * i;
      const ny = y + dy * i;
      grid[ny][nx] = word[i];
    }
  }

  function removeWord(grid, word, x, y, dx, dy) {
    for (let i = 0; i < word.length; i++) {
      const nx = x + dx * i;
      const ny = y + dy * i;
      grid[ny][nx] = '';
    }
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function backtrack(grid, wordList, wordIdx = 0) {
    if (wordIdx === wordList.length) {
      return []; // Success, return empty array for placements
    }

    const word = wordList[wordIdx];
    const availableDirections = word.length >= 7
        ? directions.filter(([dx, dy]) => !(dx === 1 && dy === 0))
        : directions;

    const positions = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        for (const [dx, dy] of availableDirections) {
          positions.push({ x, y, dx, dy });
        }
      }
    }
    shuffle(positions);

    for (const { x, y, dx, dy } of positions) {
      if (canPlace(grid, word, x, y, dx, dy)) {
        // Memorize the state of the path before placing the new word.
        const originalChars = [];
        for (let i = 0; i < word.length; i++) {
          originalChars.push(grid[y + dy * i][x + dx * i]);
        }
        
        placeWord(grid, word, x, y, dx, dy);
        const subsequentPlacements = backtrack(grid, wordList, wordIdx + 1);

        if (subsequentPlacements !== null) {
          // Found a valid solution down the line
          return [{ word, dx, dy }, ...subsequentPlacements];
        }

        // Backtrack: Restore the path to its exact previous state.
        for (let i = 0; i < word.length; i++) {
          grid[y + dy * i][x + dx * i] = originalChars[i];
        }
      }
    }

    return null; // No placement found for this word
  }

  function checkDistribution(placements) {
    if (!placements || placements.length < words.length) return false;

    const counts = {
      horizontal: 0,
      vertical: 0,
      diag_main: 0, // Top-left to bottom-right axis (\)
      diag_anti: 0, // Top-right to bottom-left axis (/)
      backward: 0
    };
    const uniqueVectors = new Set();

    for (const p of placements) {
      uniqueVectors.add(`${p.dx},${p.dy}`);
      // p.dx and p.dy are either -1, 0, or 1
      if (p.dy === 0) { // Horizontal
        counts.horizontal++;
        if (p.dx < 0) counts.backward++;
      } else if (p.dx === 0) { // Vertical
        counts.vertical++;
        if (p.dy < 0) counts.backward++;
      } else if (p.dx === p.dy) { // Main diagonal (\)
        counts.diag_main++;
        if (p.dx < 0) counts.backward++;
      } else { // Anti-diagonal (/)
        counts.diag_anti++;
        if (p.dx < 0 || p.dy < 0) counts.backward++;
      }
    }

    const numWords = placements.length;

    // Rule 1: Must have at least one of each major orientation type.
    if (counts.horizontal === 0 || counts.vertical === 0 || (counts.diag_main + counts.diag_anti) === 0) {
      return false;
    }

    // Rule 2: Must have at least one 'backward' word.
    if (counts.backward === 0) {
      return false;
    }

    // Rule 3: Avoid over-concentration. No orientation can have more than ceil(N/2) words.
    const maxInType = Math.ceil(numWords / 2);
    if (counts.horizontal > maxInType || counts.vertical > maxInType || (counts.diag_main + counts.diag_anti) > maxInType) {
      return false;
    }

    // Rule 4: Must use a good number of unique direction vectors.
    const minUniqueVectors = Math.floor(numWords / 2);
    if (uniqueVectors.size < minUniqueVectors) {
      return false;
    }

    return true; // All strict checks passed
  }

  function generateGrid() {
    let grid;
    let placements;
    let tries = 0;
    const maxTries = 200;

    do {
      grid = createEmptyGrid(gridSize);
      placements = backtrack(grid, words);
      tries++;
    } while ((!placements || !checkDistribution(placements)) && tries < maxTries);

    if (tries >= maxTries) {
      console.warn(`Could not generate a well-distributed grid after ${maxTries} attempts. Using the last valid (but possibly unbalanced) grid.`);
      // In the extremely unlikely case no solution is found at all, we must regenerate
      // a basic grid to avoid shipping a broken puzzle.
      if (!placements) {
        console.error("CRITICAL: Failed to place all words with backtracking. Generating a failsafe grid.");
        grid = createEmptyGrid(gridSize);
        // This is a failsafe and might not be well-distributed.
        backtrack(grid, words);
      }
    }

    // Fill empty cells with random letters
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (!grid[y][x]) {
          grid[y][x] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }
    return grid;
  }

  let grid = [];
  let displayedWords = [];

  onMount(() => {
    grid = generateGrid();
    displayedWords = shuffle([...words]);
  });

  let selected = [];
  function toggleCell(y, x) {
    const idx = selected.findIndex(([sy, sx]) => sy === y && sx === x);
    if (idx === -1) {
      selected = [...selected, [y, x]];
    } else {
      selected = selected.filter(([sy, sx]) => !(sy === y && sx === x));
    }
  }
  function isSelected(y, x) {
    return selected.some(([sy, sx]) => sy === y && sx === x);
  }

  let foundWords = [];
  $: foundWordsSet = new Set(foundWords.map(w => w.toUpperCase()));
  let foundCoords = new Set(); // Use a Set for unique coordinates
  let shake = false;
  let transitionOut = false;

  function checkSelection() {
    if (selected.length < 2) {
      selected = [];
      return;
    }
    
    // Get the letters in the order they were selected
    const letters = selected.map(([y, x]) => grid[y][x]).join('');
    
    // Check if the selected letters can form any word (in any order)
    const matchIdx = words.findIndex(w => {
      if (foundWordsSet.has(w)) return false;
      
      // Check if the letters can be rearranged to form this word
      const selectedLetters = letters.split('').sort().join('');
      const wordLetters = w.split('').sort().join('');
      return selectedLetters === wordLetters;
    });

    if (matchIdx !== -1) {
      // Word found
      foundWords = [...foundWords, words[matchIdx]];
      
      // Add the new coordinates to our Set
      selected.forEach(([y, x]) => foundCoords.add(`${y}-${x}`));
      foundCoords = foundCoords; // Trigger Svelte reactivity

      // Check for game completion
      if (foundWords.length === words.length) {
        localStorage.setItem('game1Complete', 'true');
        setTimeout(() => {
          transitionOut = true;
          setTimeout(() => {
            window.location.href = joinBase('/game2');
          }, 2000);
        }, 500);
      }
    } else {
      // Word not found
      shake = true;
      setTimeout(() => {
        shake = false;
        selected = [];
      }, 400);
      return;
    }
    
    selected = []; // Clear selection on success
  }

  function isCellFound(y, x) {
    return foundCoords.has(`${y}-${x}`);
  }
</script>

<div class="page-wrapper {transitionOut ? 'dramatic-out' : ''}">
  <main>
    {#if grid.length}
      {#key foundCoords.size}
        <div class="grid {shake ? 'shake' : ''}">
          {#each grid as row, y}
            <div class="row">
              {#each row as letter, x}
                <button
                  type="button"
                  class="cell"
                  class:selected={isSelected(y, x)}
                  class:found={isCellFound(y, x) && !isSelected(y, x)}
                  aria-label={`Letter ${letter} at row ${y + 1}, column ${x + 1}`}
                  on:click={() => toggleCell(y, x)}
                >
                  {letter}
                </button>
              {/each}
            </div>
          {/each}
        </div>
      {/key}
      <div class="word-list">
        {#each displayedWords as word}
          {@const i = words.indexOf(word)}
          <span class="word {foundWordsSet.has(word.toUpperCase()) ? 'found' : ''}">{foundWordsSet.has(word.toUpperCase()) ? word : maskedWords[i]}</span>
        {/each}
      </div>
      <button class="check-btn" on:click={checkSelection} disabled={selected.length === 0}>Controleer</button>
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
    padding-top: 0.5rem;
  }
  .grid {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    background: var(--color-white);
    padding: 0.8rem;
    border-radius: 1rem;
    box-shadow: 0 4px 32px rgba(0,0,0,0.1);
    margin-bottom: 1rem;
    margin-top: 1rem;
    max-width: 100vw;
    max-height: 80vw;
    box-sizing: border-box;
  }
  .row {
    display: flex;
    gap: 0.3rem;
  }
  .cell {
    width: 2.2rem;
    height: 2.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    background: var(--color-background);
    border: 2px solid var(--color-border);
    border-radius: 0.5rem;
    user-select: none;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    outline: none;
  }
  .cell.selected {
    background: #ffe082;
    border-color: #ffb300;
  }
  .cell.found {
    background: #a5d6a7;
    border-color: #388e3c;
    color: #1b5e20;
  }
  .cell:focus {
    box-shadow: 0 0 0 2px #1976d2;
    border-color: #1976d2;
  }
  .check-btn {
    margin: 1rem 0;
    padding: 0.7rem 2.2rem;
    font-size: 1.2rem;
    border-radius: 0.5rem;
    border: none;
    background: #1976d2;
    color: white;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transition: background 0.2s;
    align-self: center;
    display: block;
  }
  .check-btn:disabled {
    background: #b0bec5;
    cursor: not-allowed;
  }
  .grid.shake {
    animation: shake 0.4s;
  }
  @keyframes shake {
    0% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-8px); }
    80% { transform: translateX(8px); }
    100% { transform: translateX(0); }
  }
  .word-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    width: 100%;
    max-width: 400px;
  }
  .word {
    font-size: 1.1rem;
    letter-spacing: 0.1em;
    color: var(--color-text);
    background: var(--color-white);
    padding: 0.3rem 0.8rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    margin-bottom: 0.2rem;
    white-space: nowrap;
    transition: background 0.2s, color 0.2s;
  }
  .word.found {
    background: #a5d6a7;
    color: #1b5e20;
    text-decoration: line-through;
    font-weight: bold;
    border: 2px solid #388e3c;
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
      transform: scale(1.1) rotate(-2deg);
    }
    70% {
      opacity: 0.7;
      transform: scale(1.2) rotate(2deg);
    }
    100% {
      opacity: 0;
      transform: scale(2) rotate(-8deg);
    }
  }
  @media (max-width: 500px) {
    .grid {
      max-width: 98vw;
      max-height: 98vw;
      padding: 0.5rem;
      gap: 0.2rem;
    }
    .cell {
      width: 9vw;
      height: 9vw;
      font-size: 1rem;
      min-width: 0;
      min-height: 0;
      padding: 0;
    }
  }
</style> 