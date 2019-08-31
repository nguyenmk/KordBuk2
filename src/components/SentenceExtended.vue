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
      this.lyrics.setChord(posData.line, posData.index, newChordName);
    },
    onEdit(ev) {
      if (ev.type === 'backspace') {
        if (ev.sel.start == ev.sel.end) { //delete only one character
          if (ev.sel.start > 0) {
            this.lyrics.remSelection({line: ev.sel.line, start:ev.sel.start - 1, end:ev.sel.start});
            if (this.lyrics.lineData(ev.sel.line).length === 0) {              
              let prevLine = this.lyrics.line(ev.sel.line - 1);
              if (prevLine) {
                if (this.remLine(ev.sel.line)) this.moveCaret(ev.sel.line - 1, -1);
              }
            } else {
              this.moveCaret(ev.sel.line, ev.sel.start - 1);
            }
          } else {
            //combine with the line above
            if (ev.sel.line > 0) {
              let prevLine = this.lyrics.line(ev.sel.line - 1);
              if (prevLine) {
                let prevLineLength = prevLine.data.length;
                if (prevLine.append(this.lyrics.line(ev.sel.line))) {
                  if (this.remLine(ev.sel.line)) this.moveCaret(ev.sel.line - 1,prevLineLength);
                }
              }

            }
          }
        } else {
          this.lyrics.remSelection(ev.sel);
          this.moveCaret(ev.sel.line, ev.sel.start);
        }
      } else if (ev.type == 'delete') {

        if (ev.sel.start == ev.sel.end) {
          if (ev.sel.end === this.lyrics.lineData(ev.sel.line).length) { //cursor is at the end, so append the next line to this line
            let line = this.lyrics.line(ev.sel.line);
            if (line) {
              let lineLength = line.data.length;
              if (line.append(this.lyrics.line(ev.sel.line + 1))) {
                if (this.remLine(ev.sel.line + 1)) this.moveCaret(ev.sel.line, lineLength);
              }
            }
          } else { // just remove the character at the cursor
            this.lyrics.remSelection({line:ev.sel.line, start:ev.sel.start, end:ev.sel.start+1});
          }
        } else {
          this.lyrics.remSelection(ev.sel);
          this.moveCaret(ev.sel.line, ev.sel.start);
          if (this.lyrics.lineData(ev.sel.line).length === 0) {
            if (this.remLine(ev.sel.line)) {
              let line = this.lyrics.line(ev.sel.line);
              if (line) {
                this.moveCaret(ev.sel.line, 0);
              } else {
                let prevLine = this.lyrics.line(ev.sel.line - 1);
                  if (prevLine) {
                    this.moveCaret(ev.sel.line - 1, -1);                    
                  }
              }
            }
          }
        }
        

      } else if (ev.type === 'enter') {
        this.lyrics.splitLine(ev.sel.line, ev.sel.end);
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
      return this.lyrics.remLine(lineNumber);      
    },
    select(sel) {
      //this.lyrics[sel.line].sel = sel;
      this.lyrics.setSelection(sel);
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
