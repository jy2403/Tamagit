/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: '#1B0F30',
          purple: '#31164F',
          violet: '#4C2380',
          violetLight: '#6E3FA8',
          mint: '#6AF2C2',
          mintSoft: '#A7F7D9',
          mintDeep: '#2FBF96',
          mintDark: '#1E8A6C',
          ink: '#14101E',
          inkSoft: '#26202F',
          dialog: '#EFEFF4',
          'dialog-text': '#2A2633',
          'dialog-line': '#C9C9D4',
          danger: '#FF6B7A',
        },
      },
    },
  },
  plugins: [],
};
