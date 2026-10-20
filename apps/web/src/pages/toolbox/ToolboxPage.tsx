import { Col, Row } from 'antd'
import { PageHeader } from '../../components/PageHeader'
import { CapacitorCode } from '../../features/toolbox/CapacitorCode'
import { LedResistorCalc } from '../../features/toolbox/LedResistorCalc'
import { NumberBaseConverter } from '../../features/toolbox/NumberBaseConverter'
import { OhmsLawCalc } from '../../features/toolbox/OhmsLawCalc'
import { PinoutViewer } from '../../features/toolbox/PinoutViewer'
import { ResistorColorCode } from '../../features/toolbox/ResistorColorCode'
import { VoltageDividerCalc } from '../../features/toolbox/VoltageDividerCalc'

export default function ToolboxPage() {
  return (
    <>
      <PageHeader title="工具箱" description="搭电路、选元件、写寄存器时常用的小工具。" />
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}><LedResistorCalc /></Col>
        <Col xs={24} xl={12}><OhmsLawCalc /></Col>
        <Col xs={24} xl={12}><ResistorColorCode /></Col>
        <Col xs={24} xl={12}><VoltageDividerCalc /></Col>
        <Col xs={24} xl={12}><NumberBaseConverter /></Col>
        <Col xs={24} xl={12}><CapacitorCode /></Col>
        <Col xs={24}><PinoutViewer /></Col>
      </Row>
    </>
  )
}
