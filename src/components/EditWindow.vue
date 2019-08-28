<template>
  <div v-if="lyrics">
    <SentenceExtended v-for="(item, index) in lyrics.data" :key="index" 
      :lyrics="lyrics"  :cdata="{lyrics: item.textLine, line:index}" :type="getSentenceType(item.type)" :sel="item.sel"/>
  </div>

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
import SentenceExtended from './SentenceExtended';

export default {
    name: 'EditWindow',
    props: ['song'],
    components: {
        SentenceExtended,
    },
    data () {
        return {
            lyrics: null,
            sheet: null,
            sentenceType: 'L',
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
    getSentenceType: function(type) {
      if (type === 'Info') return 'I';
      else if (type == 'Chord') return 'C';
      else return 'L';
    },
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
        if (arr.length > 0) {
          data.push({textLine: arr, sel: null, type: line.type});
        }
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
    setChord(posData, newChordName) {
      this.lyrics.line(posData.line)[posData.index].chord = newChordName;
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
    },
  }
}
</script>
