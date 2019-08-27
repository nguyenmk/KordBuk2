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
        var str = this.cdata.char;
        var chordText = this.chordParser.text(this.cdata.chord);
        for (var i = str.length; i < chordText.length; ++i) str += "-";        
        return str;
      },
    },
    components: {
      draggable,
    },
    watch: {
      chord: function(newValue, oldValue) {
        console.log("Character chord is changed: ", newValue + "," + oldValue);
        if (newValue !== oldValue) this.chordData = newValue;
      },

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
