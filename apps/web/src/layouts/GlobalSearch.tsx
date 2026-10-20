import { SearchOutlined } from '@ant-design/icons'
import { AutoComplete, Input } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useSearch } from '../queries/content'

function OptionLabel({ title, desc }: { title: string, desc: string }) {
  return (
    <div style={{ lineHeight: 1.4, padding: '2px 0' }}>
      <div>{title}</div>
      <div className="muted" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis' }}>{desc}</div>
    </div>
  )
}

/** 顶栏全局搜索：文章、物料、实战项目 */
export function GlobalSearch() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const q = useDebouncedValue(keyword.trim())
  const { data } = useSearch(q)

  const options = useMemo(() => {
    if (!data || !q)
      return []
    return [
      {
        label: '知识库',
        options: data.articles.map(item => ({
          value: `/library/${item.category}/${item.slug}`,
          label: <OptionLabel title={item.title} desc={item.summary} />,
        })),
      },
      {
        label: '物料',
        options: data.materials.map(item => ({
          value: `/materials?category=${item.category}&id=${item.id}`,
          label: <OptionLabel title={`${item.icon} ${item.name}`} desc={item.summary} />,
        })),
      },
      {
        label: '实战项目',
        options: data.projects.map(item => ({
          value: `/projects/${item.id}`,
          label: <OptionLabel title={item.title} desc={item.summary} />,
        })),
      },
    ].filter(group => group.options.length > 0)
  }, [data, q])

  return (
    <AutoComplete
      value={keyword}
      options={options}
      onChange={setKeyword}
      onSelect={(path: string) => {
        setKeyword('')
        navigate(path)
      }}
      style={{ width: 'min(400px, 45vw)' }}
      notFoundContent={q && data ? '没有找到相关内容' : null}
    >
      <Input
        className="app-search"
        variant="filled"
        prefix={<SearchOutlined className="muted" />}
        placeholder="搜索文章、元件、项目，如：LED、I2C、舵机"
        allowClear
      />
    </AutoComplete>
  )
}
