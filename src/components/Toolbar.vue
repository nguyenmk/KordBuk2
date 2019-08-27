<template>
  <section>
    <q-btn class="left-button" round color="deep-orange" icon="fa fa-info" />
    <q-btn class="left-button" round color="deep-orange" icon="folder_open" />
    <q-btn class="left-button" round color="deep-orange" icon="save" />
    <q-btn class="left-button" round color="deep-orange" icon="file_copy" />
    <q-btn class="left-button" round color="deep-orange" icon="fas fa-brush" />
    <q-btn class="left-button" round color="deep-orange" icon="fas fa-undo" />
    <q-btn class="left-button" round color="deep-orange" icon="fas fa-redo" />
    <Selection :options="scales" v-model="scale" icon="fas fa-sliders-h"/>
    <Selection :options="instruments" v-model="instrument"  icon="fas fa-guitar"/>    
    <q-btn class="left-button" round color="deep-orange" icon="fas fa-music" />
  </section>
</template>

<style>
</style>

<script>
import Selection from './Selection';

export default {
  name: 'Toolbar',
  components: {
    Selection,
  },
  data () {
    return {
      instruments: [],
      instrument: 'ukulele',
      scales: [],
      scale: 0,
    }
  },
  mounted() {
      this.instruments = [{text:"ukulele", value:"ukulele"}, {text:"guitar", value:"guitar"}];
      this.scales = [{text:"-6", value:-6},{text:"-5", value:-5},{text:"-4", value:-4},
                    {text:"-3", value:-3},{text:"-2", value:-2},{text:"-1", value:-1},
                    {text:"0", value:0},{text:"+1", value:1},{text:"+2", value:2},
                    {text:"+3", value:3},{text:"+4", value:4},{text:"+5", value:5},{text:"+6", value:6},]
  },
  methods: {

  },
  watch: {
    scale: function(newValue, oldValue) {
      console.log("scale changed: ", newValue);
    },
    instrument: function(newValue) {
      this.$emit('instrumentChanged', newValue);
    }
  }  
}
</script>
