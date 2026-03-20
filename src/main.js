import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

const themeStore = useThemeStore()
themeStore.initTheme()

// Global Click Outside Directive
app.directive('click-outside', {
  mounted(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event, el);
      }
    };

    // Delay listener registration so the same click that opens a dropdown
    // does not immediately trigger outside-close.
    el.__clickOutsideTimer = setTimeout(() => {
      document.addEventListener('mousedown', el.clickOutsideEvent);
    }, 0);
  },
  unmounted(el) {
    if (el.__clickOutsideTimer) {
      clearTimeout(el.__clickOutsideTimer);
    }
    document.removeEventListener('mousedown', el.clickOutsideEvent);
  },
});

app.mount('#app')
