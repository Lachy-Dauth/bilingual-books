import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(255, 234, 203)',
        surface: 'rgb(255, 246, 230)',
        ink: 'rgb(53, 39, 0)',
        muted: 'rgb(120, 92, 40)',
        accent: 'rgb(140, 82, 20)',
        'accent-hover': 'rgb(110, 62, 10)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
