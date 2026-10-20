import { Col, Row } from 'antd'
import { PageHeader } from '../../components/PageHeader'
import { platform } from '../../platform'
import { useSystemInfo } from '../../queries/content'
import { useToolchainStatus } from '../../queries/toolchain'
import { DriverCard } from './DriverCard'
import { LibraryCard } from './LibraryCard'
import { PortsCard } from './PortsCard'
import { SystemCard } from './SystemCard'
import { ToolchainCard } from './ToolchainCard'

/** 环境中心：系统检测、工具链一键安装、驱动指引、串口设备、第三方库管理 */
export default function EnvironmentPage() {
  const { data: system } = useSystemInfo()
  const { data: toolchain } = useToolchainStatus()
  // 工具链和串口都运行在后端所在的机器上，优先使用后端系统
  const os = system?.os ?? platform.os
  const cliInstalled = Boolean(toolchain?.cli.installed)

  return (
    <>
      <PageHeader
        title="环境中心"
        description="编译、烧录所需的一切都在这里准备：检测系统 → 安装工具链与开发板支持包 → 安装 USB 驱动 → 确认串口 → 按需安装第三方库。"
      />
      <Row gutter={[16, 16]}>
        <Col span={24}><SystemCard /></Col>
        <Col span={24}><ToolchainCard /></Col>
        <Col xs={24} xl={12}><DriverCard os={os} /></Col>
        <Col xs={24} xl={12}><PortsCard os={os} /></Col>
        <Col span={24}><LibraryCard cliInstalled={cliInstalled} /></Col>
      </Row>
    </>
  )
}
