<template lang="html">

  <section class="character">
    <draggable :componentData="cdata" style="display:inline" :group="{ pull: false , put: false }">
      <span class="char">{{computedChar}}</span>
    </draggable>
  </section>

</template>

<script lang="js">
  import draggable from 'vuedraggable';

  export default  {
    name: 'character',
    props: ['cdata'],
    mounted() {

    },
    data() {
      return {
      }
    },
    methods: {
    },
    computed: {
      computedChar: function() {
        let str = this.cdata.char;
        let chordText = this.chordParser.text(this.cdata.chord);
        for (let i = str.length; i < chordText.length; ++i) str += "-";        
        return str;
      },
    },
    components: {
      draggable,
    },
    watch: {
    }
}
</script>

<style>
  .char {
    white-space: pre;
    font-family:'Courier New', Courier, monospace;
    display: block
  }
</style>
