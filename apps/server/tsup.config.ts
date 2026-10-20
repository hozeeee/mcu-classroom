import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  clean: true,
  sourcemap: true,
  // 内部 workspace 包导出的是 TS 源码，需要一起打包
  noExternal: [/^@mcu\//],
  // node:sqlite 只能带 node: 前缀导入
  removeNodeProtocol: false,
})
