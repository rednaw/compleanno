<script>
  import { base } from '$app/paths';
</script>

<slot />

<style>
  :global(body) {
    min-height: 100vh;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fdb750 0%, #fc2e20 100%);
    color: #010100;
  }

  :global(h1) {
    font-family: "Computer Modern", "Times New Roman", serif;
    font-weight: normal;
    font-size: 2em;
    margin-bottom: 1em;
  }
</style> 