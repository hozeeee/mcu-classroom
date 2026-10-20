import { Col, Empty, Flex, Input, Row, Switch, Tabs } from 'antd'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { PageHeader } from '../../components/PageHeader'
import { QueryState } from '../../components/QueryState'
import { useCategories, useMaterials } from '../../queries/content'
import { MaterialCard } from './MaterialCard'
import { MaterialDrawer } from './MaterialDrawer'

const ALL = 'all'

export default function MaterialsPage() {
  const [params, setParams] = useSearchParams()
  const { data: materials = [], isLoading, error, refetch } = useMaterials()
  const { data: categories } = useCategories()
  const [keyword, setKeyword] = useState('')
  const [essentialOnly, setEssentialOnly] = useState(false)
  const category = params.get('category') ?? ALL
  const selected = materials.find(item => item.id === params.get('id'))

  const updateParams = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined)
        next.delete(key)
      else
        next.set(key, value)
    }
    setParams(next, { replace: true })
  }

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return materials.filter(item =>
      (category === ALL || item.category === category)
      && (!essentialOnly || item.essential)
      && (!q || item.name.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q)),
    )
  }, [materials, category, essentialOnly, keyword])

  return (
    <>
      <PageHeader
        title="物料百科"
        description="开发板、元件、传感器、模块和工具：长什么样、参数是什么、怎么接线、买哪种。标记「必备」的是入门套件推荐清单。"
        extra={(
          <Flex gap={16} align="center" wrap>
            <span>
              <Switch size="small" checked={essentialOnly} onChange={setEssentialOnly} />
              {' 只看必备'}
            </span>
            <Input.Search allowClear placeholder="搜索元件" value={keyword} onChange={e => setKeyword(e.target.value)} style={{ width: 220 }} />
          </Flex>
        )}
      />
      <Tabs
        activeKey={category}
        onChange={key => updateParams({ category: key === ALL ? undefined : key })}
        items={[{ key: ALL, label: `全部 (${materials.length})` }, ...(categories?.materials ?? []).map(item => ({
          key: item.id,
          label: `${item.name} (${materials.filter(material => material.category === item.id).length})`,
        }))]}
      />
      <QueryState loading={isLoading} error={error} onRetry={refetch}>
        {filtered.length === 0
          ? <Empty description="没有匹配的物料" />
          : (
              <Row gutter={[16, 16]}>
                {filtered.map(material => (
                  <Col key={material.id} xs={24} md={12} xl={8} xxl={6}>
                    <MaterialCard material={material} onClick={() => updateParams({ id: material.id })} />
                  </Col>
                ))}
              </Row>
            )}
      </QueryState>
      <MaterialDrawer material={selected} onClose={() => updateParams({ id: undefined })} />
    </>
  )
}
