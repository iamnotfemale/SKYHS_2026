/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        signal: '#00BF8F',
        void: '#060C1A',
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['"Noto Sans KR"', '"Apple SD Gothic Neo"', 'Malgun Gothic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
