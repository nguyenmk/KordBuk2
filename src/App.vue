<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="glossy">
      <q-toolbar>
        <q-btn flat dense round @click="leftDrawerOpen = !leftDrawerOpen" aria-label="Menu" icon="menu"/>
        
        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>

        <Toolbar @instrumentChanged="onInstrumentChanged" @transpose="transpose" />
      </q-toolbar>
    </q-header>

    <q-footer elevated>
      <q-toolbar>
        <draggable style="display:inline" :componentData="{draggedName:'trashbin', chord: ' '}" :group="{ pull: false, put:false }">
          <q-btn class="left-button" round color="deep-orange" icon="far fa-trash-alt" />
        </draggable>
        <Selection :options="chordKeys" v-model="selectedKey" color="deep-orange" icon="fas fa-key"/>         
        <q-toolbar-title>

        </q-toolbar-title>
        <ChordBar class="col-10" :chordKey="selectedKey" :instrument="instrument" />
        
      </q-toolbar>
    </q-footer>    
    
    <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-grey-2">
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
      <EditWindow :lyrics="lyrics" style="padding:20px" />
    </q-page-container>

  </q-layout>
</template>

<script>
import Toolbar from './components/Toolbar';
import ChordBar from './components/ChordBar';
import Selection from './components/Selection';
import EditWindow from './components/EditWindow';
import draggable from 'vuedraggable';

export default {
  name: 'LayoutDefault',

  components: {
    Toolbar, ChordBar, Selection, EditWindow, draggable,
  },
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      instrument: 'ukulele',
      chordKeys: null,
      selectedKey: null,
      lyrics: null,
      sheet: null,
    }
  },
  mounted() {
    this.computeChordKeys(this.instrument);
    if (this.chordSheet) {
        this.sheet = this.sheetParser.parse(this.chordSheet);
        this.lyrics = this.parseSong(this.sheet);
    }  
  },
  methods: {
    parseSong: function(song) {
      let data = [];
      for (let line of song.lines) {
        let arr = [];
        if (line.type === "Info") {
          for (let ch of line.data) {
            arr.push({char:ch, chord:null});
          }
        } else if (line.type === "Chord") {
          for (let chord of line.chords) {
            arr.push({char:" ", chord: this.chordParser.parse(chord.chord)});
            arr.push({char:" ", chord:null});
          }
        } else if (line.type === "ChordLyrics") {
          let lastChordPos = 0;
          for (let chord of line.chords) {
            for (let i = lastChordPos; i < chord.pos; ++i) arr.push({char: line.lyrics[i], chord: null});
            arr.push({char: line.lyrics[chord.pos], chord: this.chordParser.parse(chord.chord)});
            lastChordPos = chord.pos + 1;
          }
          for (let i = lastChordPos; i < line.lyrics.length; ++i) arr.push({char: line.lyrics[i], chord: null});
        }
        if (arr.length > 0) {
          data.push({textLine: arr, sel: null, type: line.type});
        }
      }
      let result = {data: data};
      result.line = function(line) {
        if (line >= this.data.length) line = this.data.length -1;
        if (line < 0) line = 0;
        return this.data[line].textLine;
      }
      result.setSel = function(sel) {
        if (sel.line >= this.data.length || sel.line < 0) return;
        this.data[sel.line].sel = sel;
      }
      result.remSel = function(sel) {
        if (sel.end != -1)
          this.line(sel.line).splice(sel.start, sel.end - sel.start);
        else
          this.line(sel.line).splice(sel.start);
      }
      result.remLine = function(lineNumber) {
        this.data.splice(lineNumber, 1);
      }
      result.addLine = function(lineNumber, newItem) {
        this.data.splice(lineNumber, 0, newItem);
      }
      return result;
    },
    transpose(num_semitones) {
      for (let line of this.lyrics.data) {
        for (let elm of line.textLine) {
          elm.chord = this.chordParser.transpose(elm.chord, num_semitones);
        }
      }        
    },
    onInstrumentChanged(value) {
      this.instrument = value;
      this.computeChordKeys(this.instrument);
    },
    computeChordKeys(instrument) {
      this.chordKeys = [];
      if (!instrument) return;
      for (var key of this.chordParser.db[instrument].keys) {
          this.chordKeys.push({text: key, value: key});
      }
    }
  }
}
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Roboto+Mono&display=swap');
  .left-button {
    margin: 2px;
  }
</style>
