import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark'

interface SettingsState {
  theme: ThemeMode
  siderCollapsed: boolean
  toggleTheme: () => void
  setSiderCollapsed: (value: boolean) => void
}

const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches

/** 界面偏好，保存在 localStorage */
export const useSettings = create<SettingsState>()(persist(
  set => ({
    theme: prefersDark ? 'dark' : 'light',
    siderCollapsed: false,
    toggleTheme: () => set(state => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    setSiderCollapsed: value => set({ siderCollapsed: value }),
  }),
  { name: 'mcu-settings' },
))
