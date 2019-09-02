<template lang="html">

  <section class="sentence">
    <ChordLine :cdata="cdata" :draggedName="'chordLine'" @drop="onDrop" @showChord="showChord"></ChordLine>
    <LyricsLine :cdata="cdata" :draggedName="'lyricsLine'" :sel="sel" @edit="onEdit" @drop="onDrop"></LyricsLine>
  </section>

</template>

<script lang="js">
  import ChordLine from './ChordLine'
  import LyricsLine from './LyricsLine';

  export default  {
    name: 'sentence',
    props: ['cdata', 'sel'],
    mounted() {

    },
    data() {
      return {
      }
    },
    methods: {
      onDrop(ev) {
        this.$emit('drop', ev);
      },
      onEdit(ev) {
        this.$emit('edit', ev);
      },
      showChord(ev) {
        this.$emit('showChord', ev);
      }
    },
    computed: {
      
    },
    watch: {

    },
    components: {
      ChordLine,
      LyricsLine,
    }
}
</script>

<style>
  .sentence {
    display: table
  }
</style>
