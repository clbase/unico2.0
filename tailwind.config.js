/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paleta dark baseada no estilo visual da imagem
        dark: {
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#bdbdbd',
          300: '#9e9e9e',
          400: '#757575',
          500: '#616161',
          600: '#424242',
          700: '#2e2e33', // Cards e áreas intermediárias
          750: '#252529', // Cor de destaque para hover
          800: '#1a1a1d', // Fundo principal
          900: '#111112', // Fundo profundo
          950: '#0b0b0c', // Preto quase absoluto
        },

        // Cor principal: cinza escuro neutro
        primary: {
          DEFAULT: '#2e2e33', // Cards
          dark: '#1a1a1d',     // Fundo principal
          light: '#3a3a3f',    // Borda/sombras claras
        },

        // Cor secundária: para textos e ícones
        secondary: {
          DEFAULT: '#b0b0b5',
          dark: '#8a8a8f',
          light: '#d2d2d7',
        },

        // Cor de sucesso / destaque (teal)
        success: {
          DEFAULT: '#3CCFCF',
          dark: '#2CA5A5',
          light: '#59D6D6',
        },

        warning: {
          DEFAULT: '#f59e0b',
          dark: '#d97706',
          light: '#fbbf24',
        },
        danger: {
          DEFAULT: '#ef4444',
          dark: '#dc2626',
          light: '#f87171',
        },

        surface: {
          DEFAULT: '#2e2e33',
          dark: '#1a1a1d',
          light: '#3a3a3f',
        },

        background: {
          DEFAULT: '#1a1a1d',
          dark: '#111112',
          light: '#2e2e33',
        },
      },
    },
  },
  plugins: [],
};