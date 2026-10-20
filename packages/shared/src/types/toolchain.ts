export interface CoreStatus {
  id: string
  name: string
  installed: boolean
  installedVersion?: string
  latestVersion?: string
}

export interface CliStatus {
  installed: boolean
  version?: string
  path?: string
  /** managed: 由本应用下载管理；system: 系统 PATH 中已有 */
  source?: 'managed' | 'system'
}

export interface ToolchainStatus {
  cli: CliStatus
  cores: CoreStatus[]
  /** 托管工具链所在目录 */
  toolchainDir: string
  downloadUrl: string
}

export interface LibraryInfo {
  name: string
  author?: string
  sentence?: string
  latestVersion?: string
  installedVersion?: string
}

export type TaskKind = 'install-cli' | 'install-core' | 'install-lib' | 'compile' | 'upload'

export type TaskStatus = 'pending' | 'running' | 'success' | 'failed'

export interface CompileArtifacts {
  /** AVR 平台的 Intel HEX 文本，用于浏览器仿真 */
  hex?: string
}

export interface CompileResult {
  fqbn: string
  artifacts: CompileArtifacts
  /** 程序存储 / 动态内存占用描述 */
  sizeSummary?: string
}

export interface TaskInfo {
  id: string
  kind: TaskKind
  title: string
  status: TaskStatus
  createdAt: string
  finishedAt?: string
  error?: string
  result?: CompileResult | null
}

export type TaskEvent
  = | { type: 'log', taskId: string, line: string, stream: 'stdout' | 'stderr' | 'info' }
    | { type: 'status', task: TaskInfo }

export interface CompileRequest {
  boardId: string
  code: string
  /** 覆盖默认 FQBN（如 ESP32 其他型号） */
  fqbn?: string
}

export interface UploadRequest extends CompileRequest {
  port: string
}
