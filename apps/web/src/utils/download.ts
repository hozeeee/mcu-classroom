/** 触发浏览器下载（桌面端 Electron 同样适用） */
export function downloadUrl(url: string, fileName: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
}

export function downloadText(text: string, fileName: string, type = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([text], { type }))
  downloadUrl(url, fileName)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** 读取用户选择的文本文件 */
export function pickTextFile(accept: string): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file)
        return resolve(null)
      file.text().then(resolve, () => resolve(null))
    }
    input.click()
  })
}
