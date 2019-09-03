<template>
  <div v-if="lyrics">
    <Sentence v-for="(item, index) in lyrics.content" :key="index" 
      :lyrics="lyrics" :cdata="{lyrics: item, line:index}" :sel="item.sel"/>
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
import Sentence from './Sentence';

export default {
    name: 'EditWindow',
    props: ['lyrics'],
    components: {
        Sentence,
    },
    data () {
      return {
      }
    },
    mounted() {
    },
  methods: {
    setChord(posData, newChordName) {
      this.lyrics.line(posData.line)[posData.index].chord = newChordName;
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
        let str = "";
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
