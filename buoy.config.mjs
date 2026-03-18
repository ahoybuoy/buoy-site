/** @type {import('@buoy-design/cli').BuoyConfig} */
export default {
  project: {
    name: 'buoy-site',
  },
  sources: {
    astro: {
      enabled: true,
      include: ['src/components/*.astro'],
      exclude: ['**/*.test.*', '**/*.spec.*', '**/*.sync-conflict*'],
    },
    react: {
      enabled: true,
      include: ['src/components/**/*.tsx'],
      exclude: ['**/*.test.*', '**/*.spec.*', '**/PlumbDemos.tsx'],
    },
    tailwind: {
      enabled: true,
      include: ['src/**/*.astro', 'src/**/*.tsx', 'src/**/*.ts'],
      exclude: ['**/*.sync-conflict*'],
    },
    figma: {
      enabled: false,
    },
  },
  output: {
    format: 'table',
    colors: true,
  },
};
