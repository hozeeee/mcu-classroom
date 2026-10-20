import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'app',
  react: true,
  typescript: true,
  ignores: [
    '**/dist/**',
    '**/release/**',
    '**/.data/**',
    'packages/content/articles/**',
  ],
}, {
  rules: {
    'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
  },
})
