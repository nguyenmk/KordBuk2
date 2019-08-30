<template lang="html">

  <section class="character">
    <template v-if="sentenceType=='L'">
      <draggable :componentData="cdata" style="display:inline" :group="{ pull: false , put: false }">
        <span class="char">{{computedChar}}</span>
      </draggable>
    </template>
    <template v-else>
      <span class="char">{{computedChar}}</span>
    </template>
  </section>

</template>

<script lang="js">
  import draggable from 'vuedraggable';

  export default  {
    name: 'character',
    props: ['cdata','type'],
    mounted() {
      this.sentenceType = this.type;
    },
    data() {
      return {
        sentenceType: null,
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
      type: function(newValue) {
        this.sentenceType = newValue;
      }
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
