<style lang="scss">
  @import '../../assets/scss/custom.scss';

  main {
    padding: 0 0.5em 0 0.5em; //override pico spacing
    flex-grow: 1; //fill flex from parent (<body>)
    display: flex;
    flex-direction: row;

    margin-top: -0.5em;
  }

  @include respondTo('sm') {
    .item {
      flex: 100% !important;
    }

    .hide-sm {
      display: none !important;
    }
  }

  @include respondTo('md') {
    #contacts,
    #topics {
      flex: 40%;
    }

    #chat-window {
      flex: 60%;
    }

    .hide-md {
      display: none !important;
    }
  }

  @include respondTo('lg') {
    #contacts {
      flex: 25%;
    }

    #topics {
      flex: 20%;
    }

    #chat-window {
      flex: 55%;
    }

    .hide-lg {
      display: none !important;
    }
  }

  @include respondTo('xl') {
    #contacts {
      flex: 25%;
    }

    #topics {
      flex: 15%;
    }

    #chat-window {
      flex: 60%;
    }

    .hide-xl {
      display: none !important;
    }
  }

  /* scrollable list */
  .scrollable-wrapper {
    display: flex;
    flex-direction: column;
  }

  .scrollable-list {
    flex-grow: 1;

    //overflow and height are set to make it scrollable
    overflow-y: auto;
    height: 0px;
  }
</style>

<script lang="ts">
  import ChatMessage, { BubbleType } from './components/ChatMessage.svelte';
  import Contact from './components/Contact.svelte';
  import MessageHolder from './components/MessageHolder.svelte';
  //import Topic from './components/Topic.svelte';
</script>

<main>
  <div class="item hide-sm scrollable-wrapper" id="contacts">
    <div class="scrollable-list">
      {#each Array(100) as _}
        <Contact />
      {/each}
    </div>
  </div>
  <!--div class="item hide-md hide-sm scrollable-wrapper" id="topics">
    <div class="scrollable-list">
      <Topic>Plabble</Topic>
    </div>
  </div-->
  <div class="item scrollable-wrapper" id="chat-window">
    <div class="scrollable-list">
      <MessageHolder>
        <ChatMessage type="{BubbleType.YOU}">Hallo</ChatMessage>
        <ChatMessage type="{BubbleType.YOU}">Hoe gaat het?</ChatMessage>
        <ChatMessage type="{BubbleType.ME}">Hi, wel goed hoor</ChatMessage>
        <ChatMessage type="{BubbleType.ME}">Met jou?</ChatMessage>
        <ChatMessage type="{BubbleType.INFO}">Je chat nu encrypted</ChatMessage>
      </MessageHolder>
    </div>
    <div id="chat-edit-panel">
      <input type="text" />
    </div>
  </div>
</main>