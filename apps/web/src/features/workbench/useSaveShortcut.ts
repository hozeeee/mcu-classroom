import { useEffect, useRef } from 'react'

/** Ctrl+S / ⌘+S 保存 */
export function useSaveShortcut(onSave: () => void) {
  const latestRef = useRef(onSave)

  useEffect(() => {
    latestRef.current = onSave
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        latestRef.current()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
