/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Основные Narrative цвета
        narrative: {
          blue: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',    // Основной синий Narrative
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
          },
          purple: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7',
            600: '#9333ea',    // Основной фиолетовый Narrative
            700: '#7e22ce',
            800: '#6b21a8',
            900: '#581c87',
          },
          paper: {
            50: '#fafaf9',
            100: '#f5f5f4',    // Цвет бумаги
            200: '#e7e5e4',
            300: '#d6d3d1',
            400: '#a8a29e',
            500: '#78716c',
          },
          gold: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',    // Акцентный золотой
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          },
          ink: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',    // Цвет чернил
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
          }
        }
      },
      fontFamily: {
        'display': ['"Playfair Display"', 'Georgia', 'serif'], // Элегантные заголовки
        'body': ['"Inter"', 'system-ui', 'sans-serif'],        // Читабельный текст
        'mono': ['"JetBrains Mono"', 'monospace'],            // Для кода/цитат
      },
      animation: {
        'page-turn': 'pageTurn 0.6s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'book-open': 'bookOpen 0.8s ease-out',
      },
      keyframes: {
        pageTurn: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(-180deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        bookOpen: {
          '0%': { transform: 'rotateY(90deg)', opacity: 0 },
          '100%': { transform: 'rotateY(0)', opacity: 1 },
        }
      },
      backgroundImage: {
        'paper-texture': "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\" fill=\"%239C92AC\" fill-opacity=\"0.05\" fill-rule=\"evenodd\"/%3E%3C/svg%3E')",
        'book-cover': 'linear-gradient(145deg, var(--tw-gradient-stops))',
        'ink-blot': 'radial-gradient(circle at 30% 30%, rgba(30, 64, 175, 0.1) 0%, transparent 50%)',
      },
      boxShadow: {
        'narrative': '0 10px 40px rgba(30, 64, 175, 0.08), 0 2px 10px rgba(147, 51, 234, 0.06)',
        'narrative-lg': '0 20px 60px rgba(30, 64, 175, 0.12), 0 4px 20px rgba(147, 51, 234, 0.08)',
        'narrative-inner': 'inset 0 2px 4px 0 rgba(30, 64, 175, 0.06)',
        'book': '0 15px 50px -10px rgba(0, 0, 0, 0.15), 0 0 20px rgba(147, 51, 234, 0.1)',
      },
      borderRadius: {
        'narrative': '1rem',
        'narrative-lg': '1.5rem',
      }
    },
  },
  plugins: [],
}