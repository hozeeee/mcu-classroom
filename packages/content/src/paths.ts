import { fileURLToPath } from 'node:url'

/** 开发环境下 Markdown 文章所在目录（打包后由调用方通过参数传入） */
export const ARTICLES_DIR = fileURLToPath(new URL('../articles', import.meta.url))
