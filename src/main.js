import Vue from 'vue'
import App from './App.vue'
import './quasar'

Vue.config.productionTip = false


// This is a global mixin, it is applied to every vue instance
Vue.mixin({
  data: function() {
    return {
      chordParser: require('./scripts/ChordParser').default,
      sheetParser: require('./scripts/SheetParser').default,
      chordSheet:`{title: Let it be}
                {subtitle: ChordSheetJS example version}
                {Chorus}
                [Intro]
                G

                [Verse 1]
                A         G        Em
                I found a love for me
                            C                            D
                Darling just dive right in, and follow my lead 
                [C]Ngồi nhặt chiếc [Am]lá tôi nhớ [Em]về 
                Cô [F]bé đáng yêu của [G]tôi `,
    }
  }
})

new Vue({
  render: h => h(App),
}).$mount('#app')
