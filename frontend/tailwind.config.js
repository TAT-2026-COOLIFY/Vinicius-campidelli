/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Superficies escuras (sidebar / area de navegacao)
        tinta: {
          900: '#080B10',
          800: '#0D1219',
          700: '#141B24',
          600: '#1C2531',
          500: '#2A3644',
        },
        // Azul-ciano de marca (acoes e destaques)
        marca: {
          50: '#EAF4FE',
          100: '#CFE7FC',
          300: '#7CC0F7',
          400: '#4FA9F2',
          500: '#2A8CF0',
          600: '#1670CC',
          700: '#0F559C',
          900: '#0A3A6B',
        },
        // Neutros da area de conteudo
        neve: '#F4F6F9',
        borda: '#E3E8F0',
        grafite: {
          400: '#94A3B8',
          500: '#64748B',
          700: '#334155',
          900: '#0E1726',
        },
      },
      boxShadow: {
        cartao: '0 1px 2px rgba(14, 23, 38, 0.04), 0 1px 3px rgba(14, 23, 38, 0.06)',
        elevado: '0 8px 24px rgba(14, 23, 38, 0.10)',
      },
      keyframes: {
        surgir: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        surgir: 'surgir 0.28s ease-out both',
      },
    },
  },
  plugins: [],
};
