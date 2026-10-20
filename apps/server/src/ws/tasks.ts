import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context'
import { WS_PATHS } from '@mcu/shared'

/** 任务事件广播：所有连接都会收到全部任务的日志与状态，前端按 taskId 过滤 */
export async function taskSocket(app: FastifyInstance, ctx: AppContext): Promise<void> {
  app.get(WS_PATHS.tasks, { websocket: true }, (socket) => {
    const unsubscribe = ctx.tasks.subscribe((event) => {
      if (socket.readyState === socket.OPEN)
        socket.send(JSON.stringify(event))
    })
    socket.on('close', unsubscribe)
  })
}
