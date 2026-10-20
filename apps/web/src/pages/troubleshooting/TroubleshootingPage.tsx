import type { OsPlatform, TroubleshootItem } from '@mcu/shared'
import { OS_LABELS } from '@mcu/shared'
import { Alert, Collapse, Empty, Flex, Input, Select, Tabs } from 'antd'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { PageHeader } from '../../components/PageHeader'
import { QueryState } from '../../components/QueryState'
import { platform } from '../../platform'
import { useCategories, useTroubleshooting } from '../../queries/content'
import { TroubleshootBody, TroubleshootHeader } from './TroubleshootEntry'

type OsFilter = OsPlatform | 'all'

function matchKeyword(item: TroubleshootItem, q: string): boolean {
  if (!q)
    return true
  return [item.title, ...item.symptoms, ...item.causes, ...item.solutions].some(text => text.toLowerCase().includes(q))
}

export default function TroubleshootingPage() {
  const { data = [], isLoading, error, refetch } = useTroubleshooting()
  const { data: categories } = useCategories()
  const [category, setCategory] = useState('all')
  const [os, setOs] = useState<OsFilter>(platform.os === 'unknown' ? 'all' : platform.os)
  const [keyword, setKeyword] = useState('')
  const categoryNames = new Map((categories?.troubleshooting ?? []).map(item => [item.id, item.name]))

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return data.filter(item =>
      (category === 'all' || item.category === category)
      && (os === 'all' || !item.os || item.os.includes(os as Exclude<OsPlatform, 'unknown'>))
      && matchKeyword(item, q),
    )
  }, [data, category, os, keyword])

  return (
    <>
      <PageHeader
        title="排障手册"
        description="烧录失败、找不到串口、编译报错、电路不工作……按现象查找原因和解决步骤。已根据你的系统自动筛选。"
        extra={(
          <Flex gap={12} wrap>
            <Select<OsFilter>
              value={os}
              onChange={setOs}
              style={{ width: 140 }}
              options={[{ value: 'all', label: '全部系统' }, ...(['windows', 'macos', 'linux'] as const).map(value => ({ value, label: OS_LABELS[value] }))]}
            />
            <Input.Search allowClear placeholder="搜索报错信息或现象" value={keyword} onChange={e => setKeyword(e.target.value)} style={{ width: 260 }} />
          </Flex>
        )}
      />
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        title={(
          <>
            驱动与串口权限问题，可以先去
            <Link to="/environment">环境中心</Link>
            查看本机的自动检测结果。
          </>
        )}
      />
      <Tabs
        activeKey={category}
        onChange={setCategory}
        items={[{ key: 'all', label: '全部' }, ...(categories?.troubleshooting ?? []).map(item => ({ key: item.id, label: item.name }))]}
      />
      <QueryState loading={isLoading} error={error} onRetry={refetch}>
        {filtered.length === 0
          ? <Empty description="没有匹配的条目，试试换个关键词" />
          : (
              <Collapse
                items={filtered.map(item => ({
                  key: item.id,
                  label: <TroubleshootHeader item={item} categoryName={categoryNames.get(item.category) ?? item.category} />,
                  children: <TroubleshootBody item={item} />,
                }))}
              />
            )}
      </QueryState>
    </>
  )
}
