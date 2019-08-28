<template>
  <q-banner inline-actions class="text-lback banner">
    <Sentence :cdata="cdata" :type="sentenceType"
              :sel="sel" @drop="onDrop" @edit="onEdit" @showChord="showChord">
    </Sentence>
    <template v-slot:action>
      <div>
        <Selection :options="sentenceTypes" v-model="sentenceType" color="blue"/>
        <q-btn color="primary" icon="fas fa-ellipsis-v">
          <q-menu fit anchor="bottom middle" self="top middle">
            <q-list>
              <q-item clickable v-close-popup>
                <q-item-section><q-icon color="blue" name="fas fa-plus" /></q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section><q-icon color="blue" name="fas fa-times" /></q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>        
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
import Selection from './Selection';

export default {
    name: 'EditWindow',
    props: ['cdata', 'sel', 'type','lyrics'],
    components: {
      Sentence, Selection,
    },
    data () {
      return {
        sentenceType: this.type,
        sentenceTypes: [],
      }
    },
    mounted() {
      this.sentenceTypes = [{text:"L", value:"L"},{text:"C", value:"C"},{text:"I", value:"I"}];
    },
  methods: {    
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
    remLine(lineNumber) {
      this.lyrics.remLine(lineNumber);
      if (lineNumber == 0) return;
      this.moveCaret(lineNumber - 1, this.lyrics.line(lineNumber-1).length + 1);
    },
    select(sel) {
      //this.lyrics[sel.line].sel = sel;
      this.lyrics.setSel(sel);
    },
    moveCaret(line, pos) {
      this.select({line: line, start:pos, end: pos});
    },
  },
  watch: {

  },
  computed: {

  }
}
</script>
