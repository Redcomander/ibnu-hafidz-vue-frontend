import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('theme') === 'dark')

  function setTheme(value) {
    isDark.value = value
    localStorage.setItem('theme', value ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', value ? 'dark' : 'light')
  }

  function toggleTheme() {
    setTheme(!isDark.value)
  }

  function initTheme() {
    if (localStorage.getItem('theme')) {
      setTheme(localStorage.getItem('theme') === 'dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark)
    }
  }

  return { isDark, setTheme, toggleTheme, initTheme }
})
