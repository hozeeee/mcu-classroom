import { Card, Col, Row, Typography } from 'antd'
import { useNavigate } from 'react-router'
import { MENU_GROUPS } from '../../layouts/menuConfig'

const DESCRIPTIONS: Record<string, string> = {
  '/roadmap': '7 个阶段，从电子基础到物联网',
  '/library': '电子、编程、协议、平台知识库',
  '/materials': '元件长什么样、怎么接、去哪买',
  '/projects': '带接线图和代码的实战案例',
  '/workbench': '写代码、编译、仿真、烧录',
  '/circuit': '拖拽元件、连线、实时仿真',
  '/serial': '查看开发板串口输出',
  '/toolbox': '电阻计算、色环、引脚图',
  '/environment': '一键安装编译工具链和驱动',
  '/troubleshooting': '烧录失败、识别不到串口怎么办',
}

export function QuickEntries() {
  const navigate = useNavigate()
  const groups = MENU_GROUPS.filter(group => group.key === 'learn' || group.key === 'practice' || group.key === 'help')

  return (
    <>
      {groups.map(group => (
        <div key={group.key} style={{ marginBottom: 24 }}>
          <Typography.Title level={5}>{group.label}</Typography.Title>
          <Row gutter={[16, 16]}>
            {group.items.map(item => (
              <Col key={item.path} xs={24} sm={12} lg={6}>
                <Card hoverable size="small" onClick={() => navigate(item.path)} style={{ height: '100%' }}>
                  <Card.Meta
                    avatar={<span style={{ fontSize: 22, color: '#0f9d8a' }}>{item.icon}</span>}
                    title={item.label}
                    description={DESCRIPTIONS[item.path]}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </>
  )
}
