<template lang="html">

  <section class="sentence">
    <ChordLine v-if="type=='C' || type=='L'" :type="type" :cdata="cdata" :draggedName="'chordLine'" @drop="onDrop" @showChord="showChord"></ChordLine>
    <LyricsLine v-if="type=='L' || type == 'I'" :type="type" :cdata="cdata" :draggedName="'lyricsLine'" :sel="sel" @edit="onEdit" @drop="onDrop"></LyricsLine>
  </section>

</template>

<script lang="js">
  import ChordLine from './ChordLine'
  import LyricsLine from './LyricsLine';

  export default  {
    name: 'sentence',
    props: ['cdata', 'sel', 'type'],
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
