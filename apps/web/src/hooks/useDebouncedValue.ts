import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(setDebounced, delay, value)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
