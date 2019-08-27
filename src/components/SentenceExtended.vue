<template>
  <q-banner inline-actions class="text-lback banner">
    <Sentence :cdata="cdata" :type="sentenceType"
              :sel="sel" @drop="onDrop" @edit="onEdit" @showChord="showChord">
    </Sentence>
    <template v-slot:action>
      <div>
        <q-btn-toggle
          v-model="sentenceType"
          class="my-custom-toggle"
          no-caps
          rounded
          unelevated
          toggle-color="primary"
          color="white"
          text-color="primary"
          :options="[
            {label: 'L', value: 'L'},
            {label: 'C', value: 'C'},
            {label: 'I', value: 'I'},
          ]"
        />
        <q-btn flat icon="close" />
      </div>
    </template>
  </q-banner>

</template>  

<style>
  .banner {
    border-bottom: solid 1px;
  }
  .my-custom-toggle {
    border: 1px solid #027be3;
  }
</style>

<script>
import Sentence from './Sentence';

export default {
    name: 'EditWindow',
    props: ['cdata', 'sel', 'type','lyrics'],
    components: {
      Sentence,
    },
    data () {
      return {
        sentenceType: 'L',
      }
    },
    mounted() {
      this.sentenceType = this.type;
    },
  methods: {    
    onDrop(ev) {
      if (ev.from.name === "chordList" && ev.to.name === "lyricsCharacter") {
        this.setChord(ev.to, ev.from.chord);
      } else if (ev.from.name === "lyricsChord" && ev.to.name === "lyricsCharacter") {
        this.setChord(ev.to, ev.from.chord);
        this.setChord(ev.from, null);
      } else if (ev.from.name === "lyricsChord" && ev.to.name === "trashbin") {
        this.setChord(ev.from, null);
      }
    },
    setChord(posData, newChordName) {
      this.lyrics.line(posData.line)[posData.index].chord = newChordName;
    },
    onEdit(ev) {
      if (ev.type === 'backspace') {
        if (ev.sel.start == ev.sel.end) {
          if (ev.sel.start > 0) {
            this.lyrics.remSel({line: ev.sel.line, start:ev.sel.start - 1, end:ev.sel.start});
            this.moveCaret(ev.sel.line, ev.sel.start - 1);
          } else {
            //combine with the line above
            if (ev.sel.line > 0) {
              this.lyrics.line(ev.sel.line - 1).push(...this.lyrics.line(ev.sel.line));
              this.remLine(ev.sel.line);
            }
          }
        } else {
          this.lyrics.remSel(ev.sel);
          this.moveCaret(ev.sel.line, ev.sel.start);
        }
        if (this.lyrics.line(ev.sel.line).length === 0) this.remLine(ev.sel.line);

      } else if (ev.type == 'delete') {

        if (ev.sel.start == ev.sel.end) {
          this.lyrics.remSel({line:ev.sel.line, start:ev.sel.start, end:ev.sel.start+1});
        } else {
          this.lyrics.remSel(ev.sel);
          this.moveCaret(ev.sel.line, ev.sel.start);
        }
        if (this.lyrics.line(ev.sel.line).length === 0) this.remLine(ev.sel.line);

      } else if (ev.type === 'enter') {
        var newLine = this.lyrics.line(ev.sel.line).slice(ev.sel.end);
        this.lyrics.remSel({line: ev.sel.line, start: ev.sel.end, end: -1});
        this.lyrics.addLine(ev.sel.line + 1, {textLine: newLine, sel: null});
        this.moveCaret(ev.sel.line + 1, 0);          
      } else if (ev.type === 'move') {          
        if (ev.sel.line < 0 || ev.sel.line >= this.lyrics.line(ev.sel.line).length) return;
        this.select(ev.sel);
      }
    },      
    showChord(ev) {
      this.chord = ev.cdata.chord;
    },
  },
  watch: {

  },
  computed: {

  }
}
</script>
