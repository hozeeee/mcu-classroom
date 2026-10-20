import type { CircuitIssue } from '../simulator/circuitCheck'
import { CheckCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { Badge, Button, Flex, List, Popover, Tag, Tooltip } from 'antd'

const LEVEL_META: Record<CircuitIssue['level'], { color: string, label: string }> = {
  error: { color: 'red', label: '错误' },
  warning: { color: 'orange', label: '警告' },
  info: { color: 'blue', label: '提示' },
}

/** 电路检查：短路、LED 未限流、接反、未接线等 */
export function CircuitIssuesButton({ issues }: { issues: CircuitIssue[] }) {
  const serious = issues.filter(issue => issue.level !== 'info').length
  const content = issues.length
    ? (
        <List
          size="small"
          style={{ width: 360, maxHeight: 360, overflowY: 'auto' }}
          dataSource={issues}
          renderItem={issue => (
            <List.Item>
              <Flex gap={8} align="flex-start">
                <Tag color={LEVEL_META[issue.level].color} style={{ flex: 'none' }}>{LEVEL_META[issue.level].label}</Tag>
                <span>{issue.message}</span>
              </Flex>
            </List.Item>
          )}
        />
      )
    : (
        <span>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          {' '}
          没有发现问题
        </span>
      )

  return (
    <Popover title="电路检查" trigger="click" content={content}>
      <Tooltip title="电路检查">
        <Badge count={serious} size="small">
          <Button size="small" icon={<SafetyCertificateOutlined />} danger={issues.some(issue => issue.level === 'error')} />
        </Badge>
      </Tooltip>
    </Popover>
  )
}
