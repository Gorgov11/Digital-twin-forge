/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#080B0F',
          surface: '#0F1217',
          elevated: '#171B23',
        },
        border: {
          DEFAULT: '#1E2330',
          subtle: '#141820',
          bright: '#2A3040',
        },
        primary: {
          DEFAULT: '#6366F1',
          hover: '#5254CC',
          muted: '#6366F120',
        },
        accent: {
          DEFAULT: '#22D3EE',
          hover: '#06B6D4',
          muted: '#22D3EE20',
        },
        success: {
          DEFAULT: '#10B981',
          muted: '#10B98120',
        },
        warning: {
          DEFAULT: '#F59E0B',
          muted: '#F59E0B20',
        },
        danger: {
          DEFAULT: '#EF4444',
          muted: '#EF444420',
        },
        txt: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#64748B',
          disabled: '#374151',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #6366F140' },
          '100%': { boxShadow: '0 0 20px #6366F180, 0 0 40px #6366F130' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
