<template lang="html">

  <tr class="chord-line">          
    <td v-for="(item, index) of cdata.lyrics">
      <Chord ref="Chord" @showChord="showChord" :type="type"
        :cdata="{index: index, line: cdata.line, draggedName: computedDraggedName, 
        chord: item.chord, call:triggerDrop}" 
      />
    </td>
  </tr>

</template>

<script lang="js">
  import Chord from './Chord';

  export default  {
    name: 'chord-line',
    props: ['cdata', 'draggedName', 'type'],
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
      computedDraggedName() {
        if (this.type === "C") return "chordOnlyLine";
        else return this.draggedName;
      }
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
