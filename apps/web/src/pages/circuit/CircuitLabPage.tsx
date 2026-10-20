import type { CircuitDoc } from '@mcu/shared'
import type { CircuitSource } from './CircuitSourceBar'
import { useQueryClient } from '@tanstack/react-query'
import { App } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { api } from '../../api'
import { CircuitEditor } from '../../features/circuit/CircuitEditor'
import { createBoardCircuit } from '../../features/circuit/circuitOps'
import { useSaveShortcut } from '../../features/workbench/useSaveShortcut'
import { useUpdateProject } from '../../queries/projects'
import { loadCircuitDraft, saveCircuitDraft } from './circuitDraft'
import { CircuitSourceBar } from './CircuitSourceBar'
import './circuitLab.css'

const DRAFT_SAVE_DELAY = 500

/** 电路实验室：全屏画电路，可编辑本地草稿或某个项目的电路 */
export default function CircuitLabPage() {
  const { message, modal } = App.useApp()
  const navigate = useNavigate()
  const client = useQueryClient()
  const updateProject = useUpdateProject()
  const [source, setSource] = useState<CircuitSource>({ type: 'draft' })
  const [doc, setDoc] = useState(loadCircuitDraft)
  const [savedJson, setSavedJson] = useState('')
  const [editorKey, setEditorKey] = useState(0)
  const dirty = source.type === 'project' && savedJson !== JSON.stringify(doc)

  useEffect(() => {
    if (source.type !== 'draft')
      return
    const timer = setTimeout(saveCircuitDraft, DRAFT_SAVE_DELAY, doc)
    return () => clearTimeout(timer)
  }, [doc, source.type])

  const load = (next: CircuitDoc, nextSource: CircuitSource) => {
    setDoc(next)
    setSource(nextSource)
    setSavedJson(JSON.stringify(next))
    setEditorKey(key => key + 1)
  }

  /** 有未保存修改时先确认 */
  const guard = (action: () => void) => {
    if (!dirty)
      return action()
    modal.confirm({ title: '当前电路还没保存', content: '继续操作将丢弃未保存的修改。', okText: '丢弃并继续', onOk: action })
  }

  const run = (task: () => Promise<void>) => {
    task().catch((error: Error) => void message.error(error.message))
  }

  const openProject = (id: string) => guard(() => run(async () => {
    const project = await client.fetchQuery({ queryKey: ['project', id], queryFn: () => api.project(id) })
    load(project.circuit, { type: 'project', id: project.id, name: project.name })
  }))

  const openExample = (id: string) => guard(() => run(async () => {
    const example = await client.fetchQuery({ queryKey: ['example', id], queryFn: () => api.example(id) })
    load(example.circuit, { type: 'draft' })
    void message.success(`已载入示例「${example.title}」，修改会保存为本地草稿`)
  }))

  const save = () => {
    if (source.type !== 'project')
      return
    run(async () => {
      await updateProject.mutateAsync({ id: source.id, patch: { circuit: doc } })
      setSavedJson(JSON.stringify(doc))
      void message.success('已保存到项目')
    })
  }

  useSaveShortcut(save)

  return (
    <div className="circuit-lab">
      <CircuitSourceBar
        source={source}
        dirty={dirty}
        saving={updateProject.isPending}
        onNew={boardId => guard(() => load(createBoardCircuit(boardId), { type: 'draft' }))}
        onOpenProject={openProject}
        onOpenExample={openExample}
        onSave={save}
        onOpenWorkbench={() => source.type === 'project' && guard(() => navigate(`/workbench?project=${source.id}`))}
      />
      <div className="circuit-lab-editor">
        <CircuitEditor
          key={editorKey}
          defaultValue={doc}
          onChange={setDoc}
          fileName={source.type === 'project' ? source.name : 'circuit'}
        />
      </div>
    </div>
  )
}
