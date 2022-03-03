<!-- sadly we can't have two style tags, one global and one local. So local is nested inside <main> -->
<style lang="scss" global>
  @import './src/assets/scss/pico/pico.scss';
  @import './src/assets/scss/custom.scss';

  html,
  body {
    height: 100%;
    margin: 0;
    overflow: hidden;
  }

  body {
    display: flex;
    flex-direction: column;
  }
</style>

<script lang="ts">
  import { swipe } from 'svelte-gestures';

  import Main from './lib/interface/Main.svelte';
  import NavBar from './lib/navigation/NavBar.svelte';
  import SideNav from './lib/navigation/SideNav.svelte';

  let dark = true;
  let open = false;

  $: theme = dark ? 'dark' : 'light';

  $: {
    console.log('Switching theme. Was: ' + theme);
    document.documentElement.dataset['theme'] = theme;
  }

  // Disable scrolling when sideNav is open
  // Sadly, it is not possible (yet) to change body properties via the <svelte:body> attribute
  $: {
    if (open) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }

  // Swipe right for menu
  function handleSwipe(event) {
    if (event.detail?.direction === 'right') {
      open = true;
    }
  }

  function handleSearch(term: string) {
    console.log('searching:', term);
  }
</script>

<!-- touchAction 'pan-y' enables normal scrolling behavior on touch devices -->
<svelte:body use:swipe="{{ minSwipeDistance: 100, timeframe: 300, touchAction: 'pan-y' }}" on:swipe="{handleSwipe}" />

<SideNav bind:open>
  <p>Hello</p>
</SideNav>

<NavBar on:search="{e => handleSearch(e.detail)}" on:menu-click="{() => (open = true)}" />

<Main />
