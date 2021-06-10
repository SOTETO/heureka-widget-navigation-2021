import Vue from 'vue'
import VueI18n from 'vue-i18n'
import App from './App.vue'
import TopNavigation from './components/TopNavigation';
import BottomNavigation from './components/BottomNavigation';
import en from '@/lang/en.json';
import de from '@/lang/de.json';
import store from './store'

Vue.use(VueI18n)

Vue.config.productionTip = false

const locale = navigator.language
const i18n = new VueI18n({
  locale: locale,
  messages: {
    'en-US': en, // Object.assign(en, enElement),
    'de-DE': de, // Object.assign(de, deElement),
    'de': de, // Object.assign(de, deElement),
    'en': en // Object.assign(en, enElement)
  }
})

Vue.prototype.$vcaI18n = i18n

Vue.use(BottomNavigation, { 'i18n': i18n })
Vue.use(TopNavigation, { 'i18n': i18n })

new Vue({
  i18n,
  store,
  components: { TopNavigation, BottomNavigation },
  mounted() {
    /**
     * Required workaround for routing in IE
     * @type {mounted}
     */
    var app = this;

    if ("-ms-scroll-limit" in document.documentElement.style && "-ms-ime-align" in document.documentElement.style) {
      window.addEventListener("hashchange",
          function () {
            var currentPath = window.location.hash.slice(1);
            if (app.$route.path !== currentPath) {
              app.$router.replace(currentPath);
            }
          },
          false);
    }
  },
  render: h => h(App),
}).$mount('#app')
