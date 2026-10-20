/**
 * 复制文本到剪贴板。
 * navigator.clipboard 只在安全上下文（https / localhost / Electron）可用，
 * 通过局域网 IP 用 http 访问时回退到 execCommand。
 */
export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const ok = document.execCommand('copy')
  textarea.remove()
  if (!ok)
    throw new Error('复制失败，请手动选中文字复制')
}
