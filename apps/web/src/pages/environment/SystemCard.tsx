import { DesktopOutlined } from '@ant-design/icons'
import { OS_LABELS } from '@mcu/shared'
import { Alert, Card, Descriptions, Tag } from 'antd'
import { QueryState } from '../../components/QueryState'
import { platform } from '../../platform'
import { useSystemInfo } from '../../queries/content'

/** 系统信息：后端所在系统（工具链、串口都在这里运行）+ 浏览器检测到的系统 */
export function SystemCard() {
  const { data, isLoading, error, refetch } = useSystemInfo()
  const mismatch = data && platform.os !== 'unknown' && data.os !== platform.os

  return (
    <Card
      title={(
        <span>
          <DesktopOutlined />
          {' '}
          运行环境
        </span>
      )}
      size="small"
    >
      <QueryState loading={isLoading} error={error} onRetry={() => void refetch()}>
        {data && (
          <>
            <Descriptions
              size="small"
              column={{ xs: 1, md: 2 }}
              items={[
                { key: 'os', label: '操作系统', children: `${OS_LABELS[data.os]} ${data.osRelease}（${data.arch}）` },
                { key: 'runtime', label: '运行方式', children: data.runtime === 'electron' ? <Tag color="purple">{`桌面端 Electron ${data.electronVersion ?? ''}`}</Tag> : <Tag color="blue">网页 + 本机后端</Tag> },
                { key: 'node', label: 'Node.js', children: data.nodeVersion },
                { key: 'version', label: '应用版本', children: data.appVersion },
                { key: 'client', label: '浏览器所在系统', children: `${OS_LABELS[platform.os]}（${platform.arch}）` },
                { key: 'data', label: '数据目录', children: <code>{data.dataDir}</code> },
              ]}
            />
            <Alert
              style={{ marginTop: 12 }}
              showIcon
              type={data.serialPermission.ok ? 'success' : 'warning'}
              title={data.serialPermission.ok ? '串口权限正常' : '串口权限可能不足'}
              description={data.serialPermission.message}
            />
            {mismatch && (
              <Alert
                style={{ marginTop: 12 }}
                showIcon
                type="info"
                title="浏览器与后端不在同一台电脑上"
                description="编译、烧录、串口都在后端所在电脑执行，开发板请插在那台电脑上。下方驱动指引按后端系统显示。"
              />
            )}
          </>
        )}
      </QueryState>
    </Card>
  )
}
