import type { CircuitDoc } from '@mcu/shared'
import type { WorkbenchDoc } from './workbenchDraft'
import { getBoard } from '@mcu/shared'
import { App } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useCreateProject, useUpdateProject } from '../../queries/projects'
import { boardIdOf, replaceBoard } from '../circuit/circuitOps'
import { saveDraft } from './workbenchDraft'

const DRAFT_SAVE_DELAY = 500

/**
 * 工作台的编辑状态：
 * - 有 projectId：编辑数据库中的项目，手动保存（Ctrl+S）
 * - 无 projectId：草稿模式，自动存到 localStorage，可“保存为项目”
 */
export function useWorkbenchState(initial: WorkbenchDoc, projectId?: string) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [doc, setDoc] = useState(initial)
  /** 切换板子时整体替换电路，需要让电路编辑器重新挂载 */
  const [circuitKey, setCircuitKey] = useState(0)
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initial))
  const updateProject = useUpdateProject()
  const createProject = useCreateProject()
  const dirty = Boolean(projectId) && JSON.stringify(doc) !== savedJson

  useEffect(() => {
    if (projectId)
      return
    const timer = setTimeout(saveDraft, DRAFT_SAVE_DELAY, doc)
    return () => clearTimeout(timer)
  }, [doc, projectId])

  const setCode = useCallback((code: string) => setDoc(current => ({ ...current, code })), [])

  const setName = useCallback((name: string) => setDoc(current => ({ ...current, name })), [])

  /** 电路变化：若在属性面板里换了板子型号，同步 boardId */
  const setCircuit = useCallback((circuit: CircuitDoc) => {
    setDoc((current) => {
      const boardId = boardIdOf(circuit)
      return { ...current, circuit, boardId: boardId && getBoard(boardId) ? boardId : current.boardId }
    })
  }, [])

  const changeBoard = useCallback((boardId: string) => {
    setDoc(current => ({ ...current, boardId, circuit: replaceBoard(current.circuit, boardId) }))
    setCircuitKey(key => key + 1)
  }, [])

  const save = useCallback(async () => {
    try {
      if (projectId) {
        await updateProject.mutateAsync({ id: projectId, patch: doc })
        setSavedJson(JSON.stringify(doc))
        void message.success('已保存')
      }
      else {
        const name = doc.name === '未命名草稿' ? `我的项目 ${new Date().toLocaleString()}` : doc.name
        const created = await createProject.mutateAsync({ ...doc, name })
        void message.success('已保存为项目，可在「实战项目 → 我的项目」中找到')
        navigate(`/workbench?project=${created.id}`, { replace: true })
      }
    }
    catch (error) {
      void message.error(`保存失败：${(error as Error).message}`)
    }
  }, [createProject, doc, message, navigate, projectId, updateProject])

  return {
    doc,
    circuitKey,
    dirty,
    saving: updateProject.isPending || createProject.isPending,
    setCode,
    setName,
    setCircuit,
    changeBoard,
    save,
  }
}
