import Vue from 'vue'

import './styles/quasar.styl'
import 'quasar/dist/quasar.ie.polyfills'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'
import '@quasar/extras/ionicons-v4/ionicons-v4.css'
import '@quasar/extras/mdi-v3/mdi-v3.css'
import '@quasar/extras/eva-icons/eva-icons.css'

import {
  ClosePopup,
  Ripple,
  Quasar,
  QAvatar,
  QBanner,
  QBtn,
  QBtnDropdown,
  QBtnGroup,
  QBtnToggle,
  QDrawer,
  QFooter,
  QHeader,  
  QIcon,
  QInput,
  QItem,
  QItemLabel,
  QItemSection,
  QLayout,    
  QList,
  QMenu,
  QPage,
  QPageContainer,
  QSelect,
  QScrollArea,  
  QToolbar,
  QToolbarTitle,
} from 'quasar'

Vue.use(Quasar, {
  config: {},
  components: {
    QAvatar,
    QBanner,
    QBtn,
    QBtnDropdown,
    QBtnGroup,
    QBtnToggle,
    QDrawer,
    QFooter,
    QHeader,      
    QIcon,
    QInput,
    QItem,
    QItemLabel,    
    QItemSection,    
    QLayout,
    QList,
    QMenu,
    QPage,
    QPageContainer,
    QSelect,
    QScrollArea,    
    QToolbar,
    QToolbarTitle,
  },
  directives: {
    ClosePopup,
    Ripple,
  },
  plugins: {
  }
 })