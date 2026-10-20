import type { Options } from 'tsup'
import { defineConfig } from 'tsup'

const shared: Options = {
  platform: 'node',
  target: 'node22',
  sourcemap: true,
  // 后端及其依赖全部打进主进程产物，安装包里无需携带 node_modules；electron 由运行时提供
  // noExternal 优先级高于 external，所以在正则里直接排除 electron
  noExternal: [/^(?!electron$).+/],
  external: ['electron'],
  // node:sqlite 只能带 node: 前缀导入
  removeNodeProtocol: false,
}

export default defineConfig([
  {
    ...shared,
    entry: { main: 'src/main.ts' },
    format: ['esm'],
    // 打包进来的 CommonJS 依赖会调用 require，ESM 产物里需要手动提供
    banner: {
      js: 'import { createRequire as __createRequire } from \'node:module\'; const require = __createRequire(import.meta.url);',
    },
  },
  {
    ...shared,
    // 开启 sandbox 的预加载脚本必须是 CommonJS
    entry: { preload: 'src/preload.ts' },
    format: ['cjs'],
    outExtension: () => ({ js: '.cjs' }),
  },
])
