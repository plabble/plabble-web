<nav>
  <ul>
    <li>
      <span class="is-btn" on:click={() => console.log('menu toggled')}>
        <MenuIcon size="32" />
      </span>
    </li>
    
    <li><strong>Plabble</strong></li>
  </ul>
  <ul>
    <li>
      <input type="search" placeholder="Search...">
    </li>
  </ul>
</nav>

<style lang="scss">
  nav {
    margin-left: 1rem;
    margin-right: 1rem;
  }

  .is-btn {
    cursor: pointer;
  }
</style>

<script lang="ts">
  import { MenuIcon } from 'svelte-feather-icons';
</script>