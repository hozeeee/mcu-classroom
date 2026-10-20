import type { SerialClientMessage, SerialServerMessage } from '@mcu/shared'
import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context'
import { WS_PATHS } from '@mcu/shared'
import { errorMessage } from '../utils/errors'

interface SerialQuery {
  port?: string
  baud?: string
}

/** 串口桥接：WS /ws/serial?port=COM3&baud=9600 */
export async function serialSocket(app: FastifyInstance, ctx: AppContext): Promise<void> {
  app.get<{ Querystring: SerialQuery }>(WS_PATHS.serial, { websocket: true }, async (socket, request) => {
    const send = (message: SerialServerMessage) => {
      if (socket.readyState === socket.OPEN)
        socket.send(JSON.stringify(message))
    }

    const port = request.query.port
    const baud = Number.parseInt(request.query.baud ?? '9600', 10)
    if (!port || !Number.isFinite(baud)) {
      send({ type: 'error', message: '缺少 port 或 baud 参数' })
      socket.close()
      return
    }

    let handle: Awaited<ReturnType<typeof ctx.serial.attach>> | undefined
    let closed = false
    socket.on('close', () => {
      closed = true
      handle?.detach()
    })
    socket.on('message', (raw) => {
      try {
        const message = JSON.parse(raw.toString()) as SerialClientMessage
        if (message.type === 'send')
          handle?.send(message.data)
      }
      catch {
        send({ type: 'error', message: '无法解析的消息' })
      }
    })

    try {
      handle = await ctx.serial.attach(port, baud, {
        onData: chunk => send({ type: 'data', data: chunk.toString('base64') }),
        onStatus: (open, message) => {
          send({ type: 'status', open, message })
          if (!open)
            socket.close()
        },
      })
      if (closed)
        handle.detach()
    }
    catch (error) {
      send({ type: 'error', message: errorMessage(error) })
      socket.close()
    }
  })
}
