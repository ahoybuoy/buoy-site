/** @type {import('@buoy-design/cli').BuoyConfig} */
export default {
  project: {
    name: 'buoy-site',
  },
  sources: {
    astro: {
      enabled: true,
      include: ['src/**/*.astro'],
      exclude: ['**/*.test.*', '**/*.spec.*'],
    },
    tailwind: {
      enabled: true,
      include: ['src/**/*.astro', 'src/**/*.tsx', 'src/**/*.ts'],
    },
    figma: {
      enabled: false,
      // accessToken: process.env.FIGMA_ACCESS_TOKEN,
      // fileKeys: [],
    },
  },
  output: {
    format: 'table',
    colors: true,
  },
};
