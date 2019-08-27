<template lang="html">
  <q-scroll-area horizontal v-if="chordKey" style="height:50px">        
    <!--div class="row no-wrap">
      <div v-for="suffix of chordParser.db[instrument].suffixes" :key="suffix.id" class="q-pa-sm">
        <Chord :cdata="{name: 'chordList', chord:computeChord(suffix)}" />
      </div>

    </div-->

    <q-list dense padding class="row no-wrap">
      <q-item v-for="suffix of chordParser.db[instrument].suffixes" :key="suffix.id" clickable v-ripple>
          <Chord :cdata="{name: 'chordList', chord:computeChord(suffix)}" />
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

    },
    computed: {

    },
    watch: {
        instrument: function(newValue, oldValue) {
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
