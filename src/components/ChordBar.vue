<template lang="html">

  <section class="chord-bar">
    <Selection :options="chordKeys" v-model="chordKey" />
    <q-scroll-area
      horizontal
      style="height: 210px; width: 230px;"
      class="bg-grey-1 scroll-area"
    >
      <div class="row no-wrap">
        <div v-for="n in 10" :key="n" style="width: 150px" class="q-pa-sm">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto fuga quae veritatis blanditiis sequi id expedita amet esse aspernatur! Iure, doloribus!
        </div>
      </div>
    </q-scroll-area>
  </section>

</template>

<script lang="js">
  import draggable from 'vuedraggable';
  import Chord from "./Chord"
  import Selection from "./Selection";

  export default  {
    name: 'ChordBar',
    props: ['instrument'],
    mounted() {
        this.computeChordKeys(this.instrument);
    },
    data() {
      return {
        chordKeys: [],
        chordKey: null,
      }
    },
    methods: {
      computeChord(chordkey, suffix) { 
        if (!chordkey) return null;
        return this.chordParser.getChord( this.instrument, chordkey, suffix);
      },
      computeChordKeys(instrument) {
        this.chordKeys = [];
        if (!this.instrument) return;
        for (var key of this.chordParser.db[this.instrument].keys) {
            this.chordKeys.push({text: key, value: key});
        }
      }
    },
    computed: {

    },
    watch: {
        instrument: function(newValue, oldValue) {
            this.computeChordKeys(newValue);
        }
    },
    components: {
        Chord,
        draggable,
        Selection,
    }
}
</script>

<style>
  .chord-bar {
     
  }
  .scroll-area {
      display:inline;
  }
</style>
