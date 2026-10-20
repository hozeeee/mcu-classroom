import { cpp } from '@codemirror/lang-cpp'
import CodeMirror from '@uiw/react-codemirror'
import { useSettings } from '../../stores/settings'

const EXTENSIONS = [cpp()]

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
}

/** Arduino（C/C++）代码编辑器 */
export function CodeEditor({ value, onChange, readOnly }: CodeEditorProps) {
  const theme = useSettings(state => state.theme)
  return (
    <CodeMirror
      className="code-editor"
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      theme={theme}
      height="100%"
      extensions={EXTENSIONS}
      basicSetup={{ tabSize: 2 }}
    />
  )
}
