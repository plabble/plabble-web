<style lang="scss" global>
  @import './src/assets/scss/pico.scss';
  @import './src/assets/scss/custom.scss';
</style>

<script lang="ts">
  let dark = true;
  $: theme = dark ? 'dark' : 'light';
  $: {
    console.log('Switching theme. current: ' + theme);
    document.documentElement.dataset['theme'] = theme;
  }

  import NavBar from './lib/navigation/NavBar.svelte';
</script>

<NavBar />

<main>
  <style lang="scss">
    main {
      padding: 1em;
    }
  </style>

  <h1>Hello Plabble!</h1>
  <div class="buttons">
    <a role="button" href="#!" on:click="{() => (dark = !dark)}">Toggle dark/light theme</a>
    <a role="button" href="#!" class="secondary">Secondary</a>
    <a role="button" href="#!" class="outline">Primary outline</a>
    <a role="button" href="#!" class="secondary outline">Secondary outline</a>
  </div>

  <br />

  <div class="grid">
    <div>
      <fieldset>
        <legend>Plabble Security</legend>
        <label for="small">
          <input type="radio" id="small" name="size" value="small" />
          Extreme
        </label>
        <label for="medium">
          <input type="radio" id="medium" name="size" value="medium" />
          Very extreme
        </label>
        <label for="large">
          <input type="radio" id="large" name="size" value="large" checked />
          Insane
        </label>
      </fieldset>

      <fieldset>
        <label for="terms">
          <input type="checkbox" id="terms" name="terms" />
          I agree to the Terms and Conditions
        </label>
        <label for="terms_sharing">
          <input type="checkbox" id="terms_sharing" name="terms_sharing" checked />
          I agree to share my information with Google
        </label>
      </fieldset>

      <!-- Switches -->
      <fieldset>
        <label for="switch">
          <input type="checkbox" id="switch" name="switch" role="switch" />
          Enable session hijacking on my teacher
        </label>
        <label for="switch_disabled">
          <input type="checkbox" id="switch_disabled" name="switch_disabled" role="switch_disabled" disabled checked />
          Publish on my profile my accomplishments
        </label>
      </fieldset>
    </div>

    <div>
      <!-- Date -->
      <label for="date"
        >Date
        <input type="date" id="date" name="date" />
      </label>

      <!-- Time -->
      <label for="time"
        >Time
        <input type="time" id="time" name="time" />
      </label>

      <!-- Range slider -->
      <label for="range"
        >Range slider
        <input type="range" min="0" max="100" value="50" id="range" name="range" />
      </label>

      <label for="firstname">
        First name
        <input type="text" id="firstname" name="firstname" placeholder="First name" required />
      </label>
    </div>
  </div>
</main>
