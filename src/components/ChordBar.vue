<template lang="html">
  <q-scroll-area horizontal v-if="chordKey" style="height:50px">        
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

    },
    computed: {

    },
    watch: {

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
