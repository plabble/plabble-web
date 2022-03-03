<style lang="scss">
  @import '../../assets/scss/_variables.scss';

  .wrapper {
    position: relative;
    display: flex;
    margin-left: 0.5em;
    margin-right: 0.5em;
    overflow-y: hidden;
  }

  .item {
    overflow-y: auto;
    width: 100%;
  }

  @if map-get($breakpoints, 'sm') {
    @media (max-width: map-get($breakpoints, 'md')) {
      .sm-hide:not(.active) {
        display: none;
      }

      .item {
        flex: 100% !important;
      }
    }
  }

  @if map-get($breakpoints, 'md') {
    @media (min-width: map-get($breakpoints, 'md')) and (max-width: map-get($breakpoints, 'lg')) {
      .md-hide:not(.active) {
        display: none;
      }

      #contacts,
      #topics {
        flex: 35%;
      }

      #chat {
        flex: 65%;
      }
    }
  }

  @if map-get($breakpoints, 'lg') {
    @media (min-width: map-get($breakpoints, 'lg')) and (max-width: map-get($breakpoints, 'xl')) {
      .lg-hide {
        display: none;
      }

      #contacts {
        flex: 25%;
      }

      #topics {
        flex: 20;
      }

      #chat {
        flex: 55%;
      }
    }
  }

  @if map-get($breakpoints, 'xl') {
    @media (min-width: map-get($breakpoints, 'xl')) {
      #contacts {
        flex: 25%;
      }

      #topics {
        flex: 15%;
      }

      #chat {
        flex: 60%;
      }
    }
  }

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

  .topic {
    font-size: large;
    margin: 0.3em 0.5em 0.3em 0.5em;
    padding: 0.5em;
  }

  .chat-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    margin-top: 0;
    padding-top: 0.5em;
    margin-bottom: 0.1em;
    //max-height: 80vh;
  }

  .chat-actions {
    //background-color: red;
    margin-top: 0.5em;

    &>input {
      margin-bottom: 0;
      padding-bottom: 0;
    }
  }

  .chat {
    //background-color: yellow;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    flex-grow: 1;
  }

  .bubble {
    position: relative;
    max-width: 70%;
    background: #fff;
    border-radius: 1em;
    padding: 0.5rem 0.75rem 0.5rem 0.75rem;
    margin-right: 0.5em;
    margin-left: 0.5em;
    text-align: left;
    color: #000;
    margin-bottom: 1em;
    background-color: grey;
  }

  .bubble-right {
    align-self: flex-end;
    border-bottom-right-radius: 0;
  }

  .bubble-left {
    align-self: flex-start;
    border-bottom-left-radius: 0;
  }

  // Other style chat bubbles with half-triangle

  /*.bubble-left:before {
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    border-left: 1rem solid #fff;
    border-right: 0.5rem solid transparent;
    border-top: 0.7rem solid #fff;
    border-bottom: 1.2rem solid transparent;
    left: 15%;
    bottom: -1.5rem;
  }

  .bubble-right:before {
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    border-right: 1rem solid #fff;
    border-left: 0.5rem solid transparent;
    border-top: 0.7rem solid #fff;
    border-bottom: 1.2rem solid transparent;
    right: 15%;
    bottom: -1.5rem;
  }*/
</style>

<script lang="ts">
  import Icon from '../Icon.svelte';
</script>

<div class="wrapper">
  <div id="contacts" class="item sm-hide">
    {#each Array(100) as i}
      <article class="contact">
        <img alt="test" src="https://www.w3schools.com/howto/img_avatar.png" class="rounded" />
        <div>
          <h6>Henk</h6>
          <p>
            <Icon size="{16}" name="check" /> Ja, weet ik niet. Ik ben er nog over aan het nadenken! Ik zal je laten weten
            of en wanneer ik een oplossing heb gevonden en wat het beste idee is
          </p>
        </div>
      </article>
      <article class="contact">
        <img alt="test" src="https://www.w3schools.com/howto/img_avatar2.png" class="rounded" />
        <div>
          <h6>Mama</h6>
          <p><Icon size="{16}" name="send" /> Nee hoor, komt goed!</p>
        </div>
      </article>
    {/each}
  </div>
  <!--div id="topics" class="item sm-hide md-hide">
    <article class="topic">
      # Plabble
    </article>
    <article class="topic">
      # General
    </article>
    <article class="topic">
      # Infrastructure
    </article>
    <article class="topic">
      # Memes
    </article>
    <article class="topic">
      # Other
    </article>
  </div-->
  <div id="chat" class="item">
    <div class="chat-wrapper">
      <div class="chat">
        {#each Array(100) as i}
        <div class="bubble bubble-left">Hallo, wereld! Dit is een chat bubble</div>
        <div class="bubble bubble-right">Hallo, wereld! Dit is een chat bubble</div>
        <div class="bubble bubble-right">Jow</div>
        <div class="bubble bubble-left">Hallo, wereld! Dit is een chat bubble</div>
        <div class="bubble bubble-right">Hallo, wereld! Dit is een chat bubble</div>
        <div class="bubble bubble-left">Hallo, wereld! Dit is een chat bubble</div>
        {/each}
      </div>
      <div class="chat-actions">
        <input type="text" name="" id="" />
      </div>
    </div>
  </div>
</div>
