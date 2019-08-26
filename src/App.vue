<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="glossy">
      <q-toolbar>
        <q-btn flat dense round @click="leftDrawerOpen = !leftDrawerOpen" aria-label="Menu" icon="menu"/>
        
        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>

        <Toolbar @instrumentChanged="onInstrumentChanged" />
      </q-toolbar>
    </q-header>

    <q-footer elevated>
      <q-toolbar>
        <q-toolbar-title>Footer</q-toolbar-title>
        <ChordBar :instrument="instrument"/>
      </q-toolbar>
    </q-footer>    
    
    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      content-class="bg-grey-2"
    >
      <q-list>
        <q-item-label header>Essential Links</q-item-label>
        <q-item clickable tag="a" target="_blank" href="https://quasar.dev">
          <q-item-section avatar>
            <q-icon name="school" />
          </q-item-section>
          <q-item-section>
            <q-item-label>My favorites</q-item-label>
            <q-item-label caption>favorite songs with chords</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://github.com/quasarframework/">
          <q-item-section avatar>
            <q-icon name="code" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Help</q-item-label>
            <q-item-label caption>help information</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://chat.quasar.dev">
          <q-item-section avatar>
            <q-icon name="chat" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Settings</q-item-label>
            <q-item-label caption>change theme, language, etc.</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://forum.quasar.dev">
          <q-item-section avatar>
            <q-icon name="forum" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Feedback</q-item-label>
            <q-item-label caption>help us to improve the app</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://twitter.com/quasarframework">
          <q-item-section avatar>
            <q-icon name="rss_feed" />
          </q-item-section>
          <q-item-section>
            <q-item-label>About</q-item-label>
            <q-item-label caption>app &amp; developer info</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <HelloWorld />
    </q-page-container>

  </q-layout>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';
import Toolbar from './components/Toolbar';
import ChordBar from './components/ChordBar';

export default {
  name: 'LayoutDefault',

  components: {
    HelloWorld, Toolbar, ChordBar,
  },
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      instrument: 'ukulele',
    }
  },
  mounted() {
  },
  methods: {
    onTranspose(value) {
      this.scale = value;
    },
    onSelectInstrument(value) {
      this.instrument = value;
    },
    onInstrumentChanged(value) {
      this.instrument = value;
    }
  }
}
</script>

<style>
  .left-button {
    margin: 2px;
  }
</style>
