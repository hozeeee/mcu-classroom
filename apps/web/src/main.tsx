import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { connectTaskSocket } from './api/taskSocket'
import { App } from './App'
import { platform } from './platform'
import './styles/global.css'

// 供样式按平台适配（如 macOS 桌面端的红绿灯留白与拖拽区域）
document.documentElement.dataset.os = platform.os
document.documentElement.dataset.desktop = String(platform.isDesktop)

connectTaskSocket()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
