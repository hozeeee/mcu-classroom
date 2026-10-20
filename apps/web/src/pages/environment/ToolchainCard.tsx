import type { CoreStatus, TaskInfo } from '@mcu/shared'
import { CheckCircleTwoTone, CloudDownloadOutlined, ToolOutlined } from '@ant-design/icons'
import { getCore } from '@mcu/shared'
import { useQueryClient } from '@tanstack/react-query'
import { Alert, App, Button, Card, Descriptions, Table, Tag, Typography } from 'antd'
import { api } from '../../api'
import { QueryState } from '../../components/QueryState'
import { TaskLogPanel } from '../../components/TaskLogPanel'
import { useTaskRunner } from '../../hooks/useTaskRunner'
import { useToolchainStatus } from '../../queries/toolchain'

/** 工具链：arduino-cli + 各芯片的开发板支持包，一键安装 */
export function ToolchainCard() {
  const { message } = App.useApp()
  const client = useQueryClient()
  const { data, isLoading, error, refetch } = useToolchainStatus()
  const { run, taskId, running } = useTaskRunner()

  const install = async (start: () => Promise<TaskInfo>, success: string) => {
    try {
      const info = await run(start)
      if (info.status === 'success')
        void message.success(success)
      else
        void message.error(info.error ?? '安装失败，请查看日志')
    }
    catch (err) {
      void message.error((err as Error).message)
    }
    finally {
      void client.invalidateQueries({ queryKey: ['toolchain'] })
      void client.invalidateQueries({ queryKey: ['ports'] })
    }
  }

  const cli = data?.cli
  const columns = [
    {
      title: '开发板支持包',
      key: 'name',
      render: (_: unknown, core: CoreStatus) => (
        <div>
          <Typography.Text strong>{core.name}</Typography.Text>
          {' '}
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>{core.id}</Typography.Text>
          <div style={{ fontSize: 12 }} className="muted">{getCore(core.id)?.description}</div>
        </div>
      ),
    },
    { title: '大小', key: 'size', width: 110, render: (_: unknown, core: CoreStatus) => getCore(core.id)?.sizeHint },
    {
      title: '状态',
      key: 'status',
      width: 150,
      render: (_: unknown, core: CoreStatus) => (core.installed
        ? <Tag color="success">{`已安装 ${core.installedVersion ?? ''}`}</Tag>
        : <Tag>未安装</Tag>),
    },
    {
      title: '',
      key: 'action',
      width: 110,
      render: (_: unknown, core: CoreStatus) => {
        const outdated = core.installed && core.latestVersion && core.latestVersion !== core.installedVersion
        if (core.installed && !outdated)
          return <CheckCircleTwoTone twoToneColor="#52c41a" />
        return (
          <Button size="small" disabled={!cli?.installed || running} onClick={() => void install(() => api.installCore(core.id), `${core.name} 安装完成`)}>
            {outdated ? '更新' : '安装'}
          </Button>
        )
      },
    },
  ]

  return (
    <Card
      title={(
        <span>
          <ToolOutlined />
          {' '}
          工具链
        </span>
      )}
      size="small"
    >
      <QueryState loading={isLoading} error={error} onRetry={() => void refetch()}>
        {data && (
          <>
            {!cli?.installed && (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 12 }}
                title="还没有安装 arduino-cli"
                description="arduino-cli 是 Arduino 官方的命令行工具，负责编译和烧录，所有芯片（AVR / ESP32 / STM32 / RP2040）都通过它支持。点击右侧按钮会自动下载到本应用的数据目录，不影响系统环境。"
                action={(
                  <Button type="primary" icon={<CloudDownloadOutlined />} loading={running} onClick={() => void install(api.installCli, 'arduino-cli 安装完成')}>
                    一键安装
                  </Button>
                )}
              />
            )}
            <Descriptions
              size="small"
              column={{ xs: 1, md: 2 }}
              items={[
                { key: 'cli', label: 'arduino-cli', children: cli?.installed ? <Tag color="success">{cli.version}</Tag> : <Tag>未安装</Tag> },
                { key: 'source', label: '来源', children: cli?.source === 'system' ? '系统 PATH' : cli?.source === 'managed' ? '本应用托管' : '-' },
                { key: 'path', label: '路径', children: <code>{cli?.path ?? '-'}</code> },
                { key: 'dir', label: '工具链目录', children: <code>{data.toolchainDir}</code> },
              ]}
            />
            <Table
              style={{ marginTop: 12 }}
              size="small"
              rowKey="id"
              pagination={false}
              dataSource={data.cores}
              columns={columns}
            />
            {taskId && <div style={{ marginTop: 12 }}><TaskLogPanel taskId={taskId} height={220} /></div>}
          </>
        )}
      </QueryState>
    </Card>
  )
}
