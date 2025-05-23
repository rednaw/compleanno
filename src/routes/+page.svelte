<script>
  import { base } from '$app/paths';
</script>

<main>
  <nav>
    <a href="{base}/wordle">Wordle</a>
    <a href="{base}/code">Enter Code</a>
  </nav>
</main>

<style>
  main {
    text-align: center;
    padding: 2rem;
  }

  nav {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  a {
    color: #4CAF50;
    text-decoration: none;
    font-size: 1.2rem;
  }

  a:hover {
    text-decoration: underline;
  }
</style> 