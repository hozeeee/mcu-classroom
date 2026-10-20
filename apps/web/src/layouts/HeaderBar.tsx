import { DesktopOutlined, GlobalOutlined, MenuFoldOutlined, MenuUnfoldOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { OS_LABELS } from '@mcu/shared'
import { Button, Layout, Space, Tag, Tooltip } from 'antd'
import { platform } from '../platform'
import { useSettings } from '../stores/settings'
import { GlobalSearch } from './GlobalSearch'

interface HeaderBarProps {
  collapsed: boolean
  onToggleCollapsed: () => void
}

export function HeaderBar({ collapsed, onToggleCollapsed }: HeaderBarProps) {
  const theme = useSettings(state => state.theme)
  const toggleTheme = useSettings(state => state.toggleTheme)
  const runtimeLabel = platform.isDesktop ? '桌面端' : '浏览器'

  return (
    <Layout.Header
      className="app-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        height: 56,
        lineHeight: 'normal',
        padding: '0 24px 0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        background: 'var(--app-panel)',
        borderBottom: '1px solid var(--app-border)',
      }}
    >
      <Space size={8}>
        <Tooltip title={collapsed ? '展开侧边栏' : '收起侧边栏'} placement="bottomLeft">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggleCollapsed}
          />
        </Tooltip>
        <GlobalSearch />
      </Space>
      <Space>
        <Tooltip title={`当前运行在${runtimeLabel}中，系统：${OS_LABELS[platform.os]} ${platform.arch}`}>
          <Tag icon={platform.isDesktop ? <DesktopOutlined /> : <GlobalOutlined />} color={platform.isDesktop ? 'blue' : 'default'}>
            {runtimeLabel}
            {' · '}
            {OS_LABELS[platform.os]}
          </Tag>
        </Tooltip>
        <Tooltip title={theme === 'dark' ? '切换到亮色' : '切换到暗色'}>
          <Button type="text" icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />} onClick={toggleTheme} />
        </Tooltip>
      </Space>
    </Layout.Header>
  )
}
