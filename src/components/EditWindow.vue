<template>
  <div v-if="lyrics">
    <q-banner v-for="(item, index) in lyrics.data" :key="index" inline-actions class="text-lback banner">
      <Sentence ref="Sentence" :cdata="{lyrics: item.textLine, line:index}" 
                :sel="item.sel" @drop=onDrop @edit=onEdit @showChord="showChord">
      </Sentence>
      <template v-slot:action>
        <div>
          <q-btn flat label="L" />
          <q-btn flat label="C" />
          <q-btn flat icon="close" />
        </div>
      </template>
    </q-banner>
  </div>

</template>  

<style>
  .banner {
    border-bottom: solid 1px;
  }
</style>

<script>
import Sentence from './Sentence';

export default {
    name: 'EditWindow',
    props: ['song'],
    components: {
        Sentence,
    },
    data () {
        return {
            lyrics: null,
            sheet: null,
        }
    },
    mounted() {
        if (this.song) {
            this.sheet = this.sheetParser.parse(this.song);
            this.lyrics = this.parseSong(this.sheet);
        }
        console.log('song: ', this.song);
        console.log('sheet: ', this.sheet);
        console.log('lyrics: ', this.lyrics);
        
    },
  methods: {
    parseSong: function(song) {
        console.log("song", song);
        var data = [];
        for (var line of song.lines) {
          var arr = [];
          if (line.type === "Info") {
            for (var ch of line.data) {
              arr.push({char:ch, chord:null});
            }
          } else if (line.type === "Chord") {
            for (var chord of line.chords) {
              arr.push({char:" ", chord: this.chordParser.parse(chord.chord)});
              arr.push({char:" ", chord:null});
            }
          } else if (line.type === "ChordLyrics") {
            var lastChordPos = 0;
            for (var chord of line.chords) {
              for (var i = lastChordPos; i < chord.pos; ++i) arr.push({char: line.lyrics[i], chord: null});
              arr.push({char: line.lyrics[chord.pos], chord: this.chordParser.parse(chord.chord)});
              lastChordPos = chord.pos + 1;
            }
            for (var i = lastChordPos; i < line.lyrics.length; ++i) arr.push({char: line.lyrics[i], chord: null});
          }
          if (arr.length > 0) data.push({textLine: arr, sel: null});
        }
        var result = {data: data};
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
      showChord(ev) {
        this.chord = ev.cdata.chord;
      },
      transpose(num_semitones) {
        for (var line of this.lyrics.data) {
          for (var elm of line.textLine) {
            elm.chord = this.chordParser.transpose(elm.chord, num_semitones);
          }
        }        
      },
      instrumentChanged(newInstrument) {
        this.instrument = newInstrument;
      },
      changeChordSheet(newChordSheet) {
        this.sheet = this.sheetParser.parse(newChordSheet);
        this.lyrics = this.parseSong(this.sheet);
      }
  },
  watch: {
    song: function(newValue) {
        this.sheet = this.sheetParser.parse(newValue);
        this.lyrics = this.parseSong(this.sheet);
    },
  },
  computed: {
    songMetaData: function() {
        if (!this.sheet || !this.sheet.metaData) return "";
        var str = "";
        for (const [key, value] of Object.entries(this.sheet.metaData)) {
            str = str + key + ":" + value + ",";
        }
        return str;
    },
    songTitle: function() {
        if (!this.sheet || !this.sheet.metaData || !this.sheet.metaData.title) return "";
        return this.sheet.metaData.title;
    }
  }
}
</script>
