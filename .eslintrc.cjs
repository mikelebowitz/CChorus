module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // shadcn/ui Compliance Rules
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@mui/*', '@mui/**'],
            message: 'Material-UI is prohibited. Use shadcn/ui components from @/components/ui/ instead.'
          },
          {
            group: ['antd', 'antd/*'],
            message: 'Ant Design is prohibited. Use shadcn/ui components from @/components/ui/ instead.'
          },
          {
            group: ['react-bootstrap', 'react-bootstrap/*'],
            message: 'React Bootstrap is prohibited. Use shadcn/ui components from @/components/ui/ instead.'
          }
        ]
      }
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ImportDeclaration[source.value="styled-components"]',
        message: 'styled-components is prohibited. Use Tailwind CSS with shadcn/ui patterns instead.'
      },
      {
        selector: 'TaggedTemplateExpression > Identifier[name="styled"]',
        message: 'styled-components template literals are prohibited. Use Tailwind CSS classes instead.'
      }
    ]
  },
}