import { API_PREFIX } from '@mcu/shared'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_PREFIX}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (response.status === 204)
    return undefined as T
  const data = await response.json().catch(() => null)
  if (!response.ok)
    throw new ApiError(response.status, data?.message ?? `请求失败（HTTP ${response.status}）`)
  return data as T
}

export const http = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: <T = void>(path: string) => request<T>('DELETE', path),
}

/** 构造 WebSocket 地址：与页面同源（开发时由 Vite 代理到后端） */
export function wsUrl(path: string, params?: Record<string, string | number>): string {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}` : ''
  return `${protocol}//${location.host}${path}${query}`
}
