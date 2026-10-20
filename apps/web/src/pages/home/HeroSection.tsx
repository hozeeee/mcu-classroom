import { NodeIndexOutlined, RocketOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Typography } from 'antd'
import { useNavigate } from 'react-router'

export function HeroSection() {
  const navigate = useNavigate()
  return (
    <Card
      variant="borderless"
      style={{ background: 'linear-gradient(135deg, #0f9d8a 0%, #1677ff 100%)', color: '#fff', marginBottom: 24 }}
      styles={{ body: { padding: '36px 40px' } }}
    >
      <Typography.Title level={2} style={{ color: '#fff', marginTop: 0 }}>
        从零开始玩转单片机
      </Typography.Title>
      <Typography.Paragraph style={{ color: 'rgba(255,255,255,.88)', fontSize: 16, maxWidth: 720 }}>
        专为软件开发者设计的一站式单片机课堂：系统的学习路线 + 元件百科 + 可视化电路 + 浏览器内仿真 + 一键编译烧录 + 串口调试。
        没有开发板也能先在网页里把 LED 点亮。
      </Typography.Paragraph>
      <Flex gap={12} wrap>
        <Button size="large" icon={<NodeIndexOutlined />} onClick={() => navigate('/roadmap')}>
          查看学习路线
        </Button>
        <Button size="large" ghost icon={<RocketOutlined />} onClick={() => navigate('/projects/blink')}>
          5 分钟点亮第一颗 LED
        </Button>
      </Flex>
    </Card>
  )
}
