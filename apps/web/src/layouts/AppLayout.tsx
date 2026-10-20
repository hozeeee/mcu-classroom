import type { MenuProps } from 'antd'
import { Layout, Menu, Spin } from 'antd'
import { Suspense } from 'react'
import { Outlet, useLocation, useMatches, useNavigate } from 'react-router'
import { useSettings } from '../stores/settings'
import { HeaderBar } from './HeaderBar'
import { matchMenuPath, MENU_GROUPS } from './menuConfig'

const menuItems: MenuProps['items'] = MENU_GROUPS.map(group => group.key === 'home'
  ? { key: group.items[0]!.path, icon: group.items[0]!.icon, label: group.items[0]!.label }
  : {
      type: 'group',
      key: group.key,
      label: group.label,
      children: group.items.map(item => ({ key: item.path, icon: item.icon, label: item.label })),
    })

export interface RouteHandle {
  /** 页面铺满内容区（工作台、电路编辑器等） */
  full?: boolean
}

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const matches = useMatches()
  const collapsed = useSettings(state => state.siderCollapsed)
  const setCollapsed = useSettings(state => state.setSiderCollapsed)
  const theme = useSettings(state => state.theme)
  const full = matches.some(match => (match.handle as RouteHandle | undefined)?.full)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        theme={theme}
        width={208}
        className="app-sider"
        style={{ position: 'sticky', top: 0, height: '100vh', borderRight: '1px solid var(--app-border)' }}
      >
        <div
          className="app-logo"
          onClick={() => navigate('/')}
          style={{ height: 56, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontWeight: 600 }}
        >
          <img src="/favicon.svg" alt="logo" width={28} height={28} />
          {!collapsed && <span style={{ fontSize: 16 }}>MCU 课堂</span>}
        </div>
        <div className="app-sider-menu">
          <Menu
            mode="inline"
            theme={theme}
            selectedKeys={[matchMenuPath(location.pathname)]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderInlineEnd: 'none' }}
          />
        </div>
      </Layout.Sider>
      <Layout>
        <HeaderBar collapsed={collapsed} onToggleCollapsed={() => setCollapsed(!collapsed)} />
        <Layout.Content className={full ? 'app-content full' : 'app-content'}>
          <Suspense fallback={<Spin style={{ display: 'block', margin: '120px auto' }} />}>
            <Outlet />
          </Suspense>
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
