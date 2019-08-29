<template lang="html">
  <q-scroll-area horizontal v-if="chordKey" style="height:50px">        
    <!--div class="row no-wrap">
      <div v-for="suffix of chordParser.db[instrument].suffixes" :key="suffix.id" class="q-pa-sm">
        <Chord :cdata="{name: 'chordList', chord:computeChord(suffix)}" />
      </div>

    </div-->

    <q-list dense padding class="row no-wrap">
      <q-item v-for="suffix of chordParser.db[instrument].suffixes" :key="suffix.id" clickable v-ripple>
          <Chord :cdata="{draggedName: 'chordList', chord:computeChord(suffix)}" />
      </q-item>
    </q-list>
  </q-scroll-area>
</template>

<script lang="js">
  import Chord from "./Chord"

  export default  {
    name: 'ChordBar',
    props: ['chordKey', 'instrument'],
    mounted() {
    },
    data() {
      return {
      }
    },
    methods: {
      computeChord(suffix) { 
        if (!this.chordKey) return null;
        return this.chordParser.getChord( this.instrument, this.chordKey, suffix);
      },

      computeChordKeys(instrument) {
        this.chordKeys = [];
        if (!instrument) return;
        for (var key of this.chordParser.db[instrument].keys) {
            this.chordKeys.push({text: key, value: key});
        }
      }
    },
    computed: {

    },
    watch: {
        instrument: function(newValue) {
          this.computeChordKeys(newValue);
        },
    },
    components: {
        Chord,
    }
}
</script>

<style>
  .chord-bar {
     
  }

</style>
