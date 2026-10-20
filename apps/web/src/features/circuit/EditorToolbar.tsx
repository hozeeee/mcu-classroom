import type { ReactNode } from 'react'
import type { CircuitIssue } from '../simulator/circuitCheck'
import {
  AppstoreAddOutlined,
  CompressOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileImageOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { Button, Popover, Space, Tooltip } from 'antd'
import { CircuitIssuesButton } from './CircuitIssuesButton'

interface EditorToolbarProps {
  /** 紧凑模式下的元件库（弹出层） */
  palette?: ReactNode
  hasSelection: boolean
  issues: CircuitIssue[]
  extra?: ReactNode
  onDelete: () => void
  onFit: () => void
  onExportPng: () => void
  onExportJson: () => void
  onImportJson: () => void
}

export function EditorToolbar(props: EditorToolbarProps) {
  const { palette, hasSelection, issues, extra, onDelete, onFit, onExportPng, onExportJson, onImportJson } = props
  return (
    <Space size={4} wrap>
      {palette && (
        <Popover trigger="click" placement="bottomLeft" content={<div style={{ width: 230, maxHeight: 420, overflowY: 'auto' }}>{palette}</div>}>
          <Button size="small" type="primary" icon={<AppstoreAddOutlined />}>添加元件</Button>
        </Popover>
      )}
      <Tooltip title="删除选中（Delete）">
        <Button size="small" icon={<DeleteOutlined />} disabled={!hasSelection} onClick={onDelete} />
      </Tooltip>
      <Tooltip title="适应画布">
        <Button size="small" icon={<CompressOutlined />} onClick={onFit} />
      </Tooltip>
      <Tooltip title="导出 PNG 图片">
        <Button size="small" icon={<FileImageOutlined />} onClick={onExportPng} />
      </Tooltip>
      <Tooltip title="导出电路文件（JSON）">
        <Button size="small" icon={<DownloadOutlined />} onClick={onExportJson} />
      </Tooltip>
      <Tooltip title="导入电路文件">
        <Button size="small" icon={<UploadOutlined />} onClick={onImportJson} />
      </Tooltip>
      <CircuitIssuesButton issues={issues} />
      {extra}
    </Space>
  )
}
