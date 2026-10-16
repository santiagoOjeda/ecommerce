import { createTheme, MantineColorsTuple } from '@mantine/core';

const brandViolet: MantineColorsTuple = [
  '#f5f0ff',
  '#eae2fb',
  '#d1c2f2',
  '#b79fe9',
  '#a181e2',
  '#936fde',
  '#8c65dd',
  '#7954c4',
  '#6b4aae',
  '#5d3f99'
];

export const theme = createTheme({
  primaryColor: 'violet',
  colors: {
    violet: brandViolet,
  },
  defaultRadius: 'md',
  fontFamily: 'var(--font-google-sans), "Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily: 'var(--font-google-sans), "Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '700',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        withBorder: true,
      },
    },
  },
});
