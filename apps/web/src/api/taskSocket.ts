import type { TaskEvent } from '@mcu/shared'
import { WS_PATHS } from '@mcu/shared'
import { useTaskStore } from '../stores/tasks'
import { wsUrl } from './client'

let socket: WebSocket | null = null
let retryTimer: ReturnType<typeof setTimeout> | undefined

/** 全局唯一的任务事件连接，断线 3 秒后自动重连 */
export function connectTaskSocket(): void {
  if (socket && socket.readyState <= WebSocket.OPEN)
    return
  socket = new WebSocket(wsUrl(WS_PATHS.tasks))
  socket.onmessage = (message) => {
    try {
      useTaskStore.getState().apply(JSON.parse(message.data) as TaskEvent)
    }
    catch {}
  }
  socket.onclose = () => {
    socket = null
    clearTimeout(retryTimer)
    retryTimer = setTimeout(connectTaskSocket, 3000)
  }
}
