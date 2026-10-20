import { Card, Steps } from 'antd'

const FLOW = [
  { title: '学原理', content: '路线 + 知识库 + 物料百科' },
  { title: '画电路', content: '电路实验室拖拽连线' },
  { title: '写程序', content: '工作台编写 Arduino C++' },
  { title: '仿真验证', content: 'Uno 浏览器内运行' },
  { title: '编译烧录', content: '本机 arduino-cli 一键完成' },
  { title: '串口调试', content: '监视输出、发送指令' },
]

/** 首页「学 → 做」的完整流程示意 */
export function LearningFlow() {
  return (
    <Card title="一个项目的完整流程" style={{ marginBottom: 24 }}>
      <Steps current={-1} items={FLOW} size="small" responsive />
    </Card>
  )
}
