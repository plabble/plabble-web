<style lang="scss">
  nav {
    /*position: sticky;
    top: 0;
    left: 0;*/
    background-color: var(--background-color);
    z-index: 1;
    width: 100%;

    & > ul {
      margin-left: 1rem;
      margin-right: 1rem;
    }
  }

  .is-btn {
    cursor: pointer;
  }
</style>

<script lang="ts">
  import Icon from '../Icon.svelte';
  import { createEventDispatcher } from 'svelte';

  let timeout: number;

  const emit = createEventDispatcher();

  function update(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    window.clearTimeout(timeout);

    if (val.length > 1) {
      timeout = window.setTimeout(() => {
        console.log(val);
        emit('search', val);
      }, 850);
    } else {
      emit('cancel');
    }
  }
</script>

<nav>
  <ul>
    <li>
      <span class="is-btn" on:click="{() => emit('menu-click')}">
        <Icon name="menu" size="{32}" />
      </span>
    </li>
    <li><strong>Plabble</strong></li>
  </ul>
  <ul>
    <li>
      <input on:input="{update}" type="search" placeholder="Search..." />
    </li>
  </ul>
</nav>
