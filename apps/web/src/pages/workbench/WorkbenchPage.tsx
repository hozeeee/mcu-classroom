import { DEFAULT_BOARD_ID } from '@mcu/shared'
import { useState } from 'react'
import { useLocation, useSearchParams } from 'react-router'
import { QueryState } from '../../components/QueryState'
import { Workbench } from '../../features/workbench/Workbench'
import { createDraft, loadDraft, projectToDoc } from '../../features/workbench/workbenchDraft'
import { useProject } from '../../queries/projects'

function ProjectWorkbench({ id }: { id: string }) {
  const { data, isLoading, error, refetch } = useProject(id)
  return (
    <QueryState loading={isLoading} error={error} onRetry={() => void refetch()}>
      {data && <Workbench key={data.id} initial={projectToDoc(data)} projectId={data.id} />}
    </QueryState>
  )
}

/** 草稿模式；从文章“在工作台打开”时带入示例代码 */
function DraftWorkbench({ code }: { code?: string }) {
  const [initial] = useState(() => (code ? { ...createDraft(DEFAULT_BOARD_ID, code), name: '文章示例代码' } : loadDraft()))
  return <Workbench initial={initial} />
}

/**
 * 工作台：
 * /workbench?project=xxx 打开已保存项目；/workbench 打开本地草稿
 */
export default function WorkbenchPage() {
  const [params] = useSearchParams()
  const location = useLocation()
  const projectId = params.get('project')
  const code = (location.state as { code?: string } | null)?.code

  if (projectId)
    return <ProjectWorkbench key={projectId} id={projectId} />
  return <DraftWorkbench key={location.key} code={code} />
}
