/** 带 HTTP 状态码的业务错误，由全局错误处理器转为 JSON 响应 */
export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'HttpError'
  }
}

export function notFound(message = '资源不存在'): HttpError {
  return new HttpError(404, message)
}

export function badRequest(message: string): HttpError {
  return new HttpError(400, message)
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
