import type { LibraryInfo } from '@mcu/shared'
import type { ReactNode } from 'react'
import { BookOutlined, SearchOutlined } from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import { App, Button, Card, Empty, Input, List, Tabs, Tag, Typography } from 'antd'
import { useState } from 'react'
import { api } from '../../api'
import { TaskLogPanel } from '../../components/TaskLogPanel'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useTaskRunner } from '../../hooks/useTaskRunner'
import { useInstalledLibraries, useLibrarySearch } from '../../queries/toolchain'

const POPULAR = ['Servo', 'DHT sensor library', 'Adafruit SSD1306', 'LiquidCrystal I2C', 'FastLED', 'PubSubClient']

function LibraryItem({ library, action }: { library: LibraryInfo, action?: ReactNode }) {
  return (
    <List.Item actions={action ? [action] : undefined}>
      <List.Item.Meta
        title={(
          <span>
            {library.name}
            {' '}
            {library.installedVersion && <Tag color="success">{`已安装 ${library.installedVersion}`}</Tag>}
          </span>
        )}
        description={(
          <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: 0, fontSize: 12 }}>
            {[library.author, library.sentence].filter(Boolean).join(' · ')}
          </Typography.Paragraph>
        )}
      />
    </List.Item>
  )
}

/** 第三方库：搜索并安装 Arduino 库（舵机、温湿度、OLED 等驱动） */
export function LibraryCard({ cliInstalled }: { cliInstalled: boolean }) {
  const { message } = App.useApp()
  const client = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const query = useDebouncedValue(keyword, 400)
  const search = useLibrarySearch(cliInstalled ? query : '')
  const installed = useInstalledLibraries(cliInstalled)
  const { run, taskId, running } = useTaskRunner()
  const [installing, setInstalling] = useState<string>()

  const install = async (name: string) => {
    setInstalling(name)
    try {
      const info = await run(() => api.installLibrary(name))
      if (info.status === 'success')
        void message.success(`${name} 安装完成`)
      else
        void message.error(info.error ?? '安装失败')
    }
    catch (error) {
      void message.error((error as Error).message)
    }
    finally {
      setInstalling(undefined)
      void client.invalidateQueries({ queryKey: ['libraries'] })
      void client.invalidateQueries({ queryKey: ['library-search'] })
    }
  }

  const installButton = (library: LibraryInfo) => (
    <Button size="small" loading={installing === library.name} disabled={running && installing !== library.name} onClick={() => void install(library.name)}>
      {library.installedVersion ? '重新安装' : '安装'}
    </Button>
  )

  if (!cliInstalled) {
    return (
      <Card
        title={(
          <span>
            <BookOutlined />
            {' '}
            第三方库
          </span>
        )}
        size="small"
      >
        <Empty description="请先安装 arduino-cli" />
      </Card>
    )
  }

  return (
    <Card
      title={(
        <span>
          <BookOutlined />
          {' '}
          第三方库
        </span>
      )}
      size="small"
    >
      <Tabs
        size="small"
        items={[
          {
            key: 'search',
            label: '搜索安装',
            children: (
              <>
                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder="输入库名，如 Servo、DHT、SSD1306"
                  value={keyword}
                  onChange={event => setKeyword(event.target.value)}
                />
                <div style={{ margin: '8px 0', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {POPULAR.map(name => <Tag key={name} style={{ cursor: 'pointer' }} onClick={() => setKeyword(name)}>{name}</Tag>)}
                </div>
                <List
                  size="small"
                  loading={search.isFetching}
                  dataSource={search.data ?? []}
                  locale={{ emptyText: query.trim().length > 1 ? '没有找到相关库' : '输入至少 2 个字符开始搜索' }}
                  renderItem={library => <LibraryItem library={library} action={installButton(library)} />}
                  style={{ maxHeight: 360, overflowY: 'auto' }}
                />
              </>
            ),
          },
          {
            key: 'installed',
            label: `已安装（${installed.data?.length ?? 0}）`,
            children: (
              <List
                size="small"
                loading={installed.isLoading}
                dataSource={installed.data ?? []}
                renderItem={library => <LibraryItem library={library} />}
                style={{ maxHeight: 420, overflowY: 'auto' }}
              />
            ),
          },
        ]}
      />
      {taskId && <div style={{ marginTop: 12 }}><TaskLogPanel taskId={taskId} height={160} /></div>}
    </Card>
  )
}
