<template lang="html">

  <section class="chord" style="position:relative" >
    <template v-if="sentenceType=='C' || sentenceType=='L'">
      <draggable :componentData="cdata" style="display:inline" 
          :group="{ pull: onPull , put: false }" 
          @end=onEnd>
        <span v-show="cdata.chord" @mouseover="showChordImage(true)" @mouseleave="showChordImage(false)">{{chordText}}</span>
      </draggable>
    </template>
    <template v-else>
      <span v-show="cdata.chord" @mouseover="showChordImage(true)" @mouseleave="showChordImage(false)">{{chordText}}</span>
    </template>
  </section>

</template>

<script lang="js">
  import draggable from 'vuedraggable';

  export default  {
    name: 'chord',
    props: ['cdata', 'type'],
    mounted() {
      if (this.type) {
        this.sentenceType = this.type;
      } else {
        this.sentenceType = 'C';
      }
    },
    data() {
      return {
        chordValue: this.value,
        chordIndex: this.index,
        to: null,
        sentenceType: 'C',
      }
    },
    methods: {
      onPull(to) {
        this.to = to.el.__vue__;
        return 'clone';
      },      
      onEnd(ev) {
        if (ev.originalEvent.type === "drop" || ev.originalEvent.type==="touchend") {
          if (this.to && this.to.componentData) {
            if (this.to.componentData.call) 
              this.to.componentData.call(this.to.componentData, this.cdata);
            if (this.cdata.call) 
              this.cdata.call(this.to.componentData, this.cdata);
          }
        }
      },
      showChordImage(value) {
        this.$emit('showChord', {cdata: this.cdata, show: value});
      },
    },
    computed: {
      chordText() {
        return this.chordParser.text(this.cdata.chord);
      }
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
  .chord {
    display: inline;
  }
</style>
