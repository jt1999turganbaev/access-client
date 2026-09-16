import { createTheme, type MantineColorsTuple } from '@mantine/core';

const brandBlue: MantineColorsTuple = [
  '#eef5ff',
  '#dbe8fd',
  '#b5cefa',
  '#8bb2f8',
  '#689af6',
  '#528bf5',
  '#4583f5',
  '#3571da',
  '#2a64c3',
  '#0d5bd8',
];

const navy: MantineColorsTuple = [
  '#eef2fb',
  '#dae2f3',
  '#b2c1e6',
  '#879ed9',
  '#6480ce',
  '#4e6ec8',
  '#4265c6',
  '#3455af',
  '#2c4b9d',
  '#0e2a6b',
];

export const theme = createTheme({
  fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  headings: { fontFamily: 'Montserrat, sans-serif', fontWeight: '800' },
  primaryColor: 'brand',
  primaryShade: 9,
  defaultRadius: 'md',
  colors: { brand: brandBlue, navy },
  components: {
    Button: {
      defaultProps: { radius: 'md' },
      styles: { root: { fontWeight: 700 } },
    },
  },
});
