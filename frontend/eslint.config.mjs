import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

const config = [
  ...nextVitals,
  ...nextTypeScript,
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      'src/generated/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      'next-env.d.ts',
    ],
  },
  { rules: { '@next/next/no-html-link-for-pages': 'off' } },
];

export default config;
