<template>
  <q-banner inline-actions class="text-lback sentence">
    <ChordLine :cdata="cdata" :draggedName="'chordLine'" @drop="onDrop" @showChord="showChord"></ChordLine>
    <LyricsLine :cdata="cdata" :draggedName="'lyricsLine'" :sel="sel" 
        @edit="onEdit" @drop="onDrop" @paste="onPaste" />
  </q-banner>

</template>  

<style>
  .sentence {
    border-bottom: solid 1px;    
  }
  .my-custom-toggle {
    border: 1px solid #027be3;
  }
</style>

<script>
import ChordLine from './ChordLine'
import LyricsLine from './LyricsLine';
let LyricSelection = require('../scripts/LyricSelection').default;

export default {
  name: 'EditWindow',
  props: ['cdata', 'sel', 'lyrics'],
  components: {
    ChordLine, LyricsLine,
  },
  data () {
    return {

    }
  },
  mounted() {
    
  },
  methods: {
    onPaste(ev) {      
      let lyricsData = ev.lyricsData;
      this.lyrics.copy(lyricsData.source, lyricsData.target);
      console.log('lyrics data', ev.lyricsData);
      console.log('paste', ev);
    },
    onDrop(ev) {
      if (ev.from.draggedName === "chordList" && (ev.to.draggedName === "lyricsLine" || ev.to.draggedName ==="chordOnlyLine")) {
        this.setChord(ev.to, ev.from.chord);
      } else if ((ev.from.draggedName === "chordLine" || ev.from.draggedName === "chordOnlyLine") && ev.to.draggedName === "lyricsLine") {
        this.setChord(ev.to, ev.from.chord);
        this.setChord(ev.from, null);
      } else if (ev.from.draggedName === "chordLine" && ev.to.draggedName === "chordOnlyLine") {
        this.setChord(ev.to, ev.from.chord);
        this.setChord(ev.from, null);
      } else if ((ev.from.draggedName === "chordLine" || ev.from.draggedName === "chordOnlyLine") && ev.to.draggedName === "trashbin") {
        this.setChord(ev.from, null);
      }
    },
    setChord(posData, newChordName) {
      this.lyrics.setChord(posData.line, posData.index, newChordName);
    },
    onEdit(ev) {
      let sel = ev.sel;
      let start = sel.start;
      let end = sel.end;
      let line = sel.lineStart;
      if (ev.type === 'delete' || ev.type === 'backspace') {
        let lineOffset = 0, startOffset = start;
        if (ev.type === 'backspace') {
          lineOffset = -1;
          startOffset = start -1;
        }
        if (start === end) { //delete only one character
          if (this.atLimit(sel, ev.type)) { //combine with the line above or below
            this.reduceNextLine(line + lineOffset);
          } else {
            this.removeSelection(new LyricSelection(line, startOffset, line, startOffset + 1), ev.type);
          }
        } else this.removeSelection(sel, ev.type);        
      } else if (ev.type === 'enter') {
        this.lyrics.splitLine(ev.sel.lineStart, ev.sel.end);
        this.moveCaret(ev.sel.lineStart + 1, 0); 
      } else if (ev.type === 'move') {
        this.select(ev.sel);
      }
    },      
    showChord(ev) {
      this.chord = ev.cdata.chord;
    },
    remLine(lineNumber, action) {
      if (action === -1) this.moveCaret(lineNumber - 1, -1);
      else if (action === 1) this.moveCaret(lineNumber + 1, 0);
      this.lyrics.remLine(lineNumber);
    },
    reduceNextLine(lineNumber) { //append next line to the lineNumber and remove the next line
      let currentLine = this.lyrics.line(lineNumber);
      this.moveCaret(lineNumber, -1);              
      if (currentLine && currentLine.append(this.lyrics.line(lineNumber + 1))) {
        this.remLine(lineNumber + 1, 0);
      }  
    },
    atLimit(sel, action) {
      if (action === "delete") {
        return sel.end === this.lyrics.lineData(sel.lineStart).length
      } else {
        return sel.start === 0;
      }
    },
    removeSelection(sel, action) {      
      this.lyrics.remSelection(sel);          
      if (this.lyrics.lineData(sel.lineStart).length === 0) {
        this.remLine(sel.lineStart, (action==="delete"? 1 : -1));            
      } else this.moveCaret(sel.lineStart, sel.start);
    },
    select(sel) {
      this.lyrics.setSelection(sel);
    },
    moveCaret(line, pos) {
      this.select(new LyricSelection(line, pos, line, pos));
    },
  },
  watch: {

  },
  computed: {

  }
}
</script>
