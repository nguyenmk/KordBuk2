<template lang="html">

  <tr class="chord-line">          
    <td v-for="(item, index) of cdata.lyrics">
      <Chord ref="Chord" @showChord="showChord"
        :cdata="{index: index, line: cdata.line, name: draggedName, 
        chord: item.chord, call:triggerDrop}" 
      />
    </td>
  </tr>

</template>

<script lang="js">
  import Chord from './Chord';

  export default  {
    name: 'chord-line',
    props: ['cdata', 'draggedName'],
    mounted() {

    },
    data() {
      return {
        
      }
    },
    methods: {
      triggerDrop(to, from) {
        this.$emit('drop', { type:'drop', from: from, to: to } );
      },
      showChord(ev) {
        this.$emit('showChord', ev);
      }
    },
    computed: {

    },
    components: {
      Chord,
    }
}
</script>

<style>
  .chord-line {

  }
</style>
