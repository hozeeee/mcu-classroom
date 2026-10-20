/** Fastify JSON Schema：只校验结构关键字段，具体内容由业务层处理 */

const circuit = {
  type: 'object',
  required: ['version', 'parts', 'wires'],
  properties: {
    version: { const: 1 },
    parts: { type: 'array' },
    wires: { type: 'array' },
  },
} as const

export const projectInputSchema = {
  type: 'object',
  required: ['name', 'boardId'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    boardId: { type: 'string', minLength: 1 },
    code: { type: 'string' },
    circuit,
    exampleId: { type: ['string', 'null'] },
  },
} as const

export const projectPatchSchema = {
  type: 'object',
  properties: projectInputSchema.properties,
} as const

export const progressSchema = {
  type: 'object',
  required: ['targetType', 'targetId', 'status'],
  properties: {
    targetType: { enum: ['article', 'project'] },
    targetId: { type: 'string', minLength: 1 },
    status: { enum: ['todo', 'doing', 'done'] },
  },
} as const

export const noteInputSchema = {
  type: 'object',
  required: ['title', 'content'],
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    content: { type: 'string' },
    ref: { type: ['string', 'null'] },
  },
} as const

export const notePatchSchema = {
  type: 'object',
  properties: noteInputSchema.properties,
} as const

export const compileSchema = {
  type: 'object',
  required: ['boardId', 'code'],
  properties: {
    boardId: { type: 'string', minLength: 1 },
    code: { type: 'string' },
    fqbn: { type: 'string' },
  },
} as const

export const uploadSchema = {
  type: 'object',
  required: ['boardId', 'code', 'port'],
  properties: {
    ...compileSchema.properties,
    port: { type: 'string', minLength: 1 },
  },
} as const

export const nameSchema = {
  type: 'object',
  required: ['name'],
  properties: { name: { type: 'string', minLength: 1 } },
} as const

export const idSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', minLength: 1 } },
} as const
