<style lang="scss">
  .contact {
    margin: 0.5em;
    padding: 0.5em 0.5em 0 0.5em;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;

    & > div {
      & > h6 {
        margin-bottom: 0;
      }

      & > p {
        font-size: medium;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 14rem;
      }
    }
  }

  img.rounded {
    border-radius: 50%;
    max-height: 3em;
    margin-right: 0.5em;
  }
</style>

<script lang="ts">
  import Icon from '../../Icon.svelte';
</script>

<article class="contact">
  <img alt="test" src="https://www.w3schools.com/howto/img_avatar.png" class="rounded" />
  <div>
    <h6>Henk</h6>
    <p>
      <Icon size="{16}" name="check" /> Ja, weet ik niet. Ik ben er nog over aan het nadenken! Ik zal je laten weten of en
      wanneer ik een oplossing heb gevonden en wat het beste idee is
    </p>
  </div>
</article>
