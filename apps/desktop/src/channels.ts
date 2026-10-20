/** 主进程与预加载脚本之间的 IPC 通道名 */
export const IPC = {
  openExternal: 'mcu:open-external',
  openPath: 'mcu:open-path',
} as const

/** 通过 additionalArguments 传给预加载脚本的参数前缀 */
export const APP_VERSION_ARG = '--mcu-app-version='
