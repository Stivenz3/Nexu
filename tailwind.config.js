/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          DEFAULT: '#005c55',
          light: '#0f766e',
          dark: '#00504a',
          container: '#0f766e',
        },
        secondary: {
          DEFAULT: '#855300',
          light: '#fea619',
          container: '#fea619',
        },
        // Surface colors
        surface: {
          DEFAULT: '#fff8f5',
          dim: '#e2d8d2',
          bright: '#fff8f5',
          container: {
            lowest: '#ffffff',
            low: '#fcf2eb',
            DEFAULT: '#f6ece6',
            high: '#f0e6e0',
            highest: '#eae1da',
          },
        },
        // Semantic colors
        success: {
          DEFAULT: '#22c55e',
          light: '#dcfce7',
        },
        error: {
          DEFAULT: '#ba1a1a',
          light: '#ffdad6',
          container: '#ffdad6',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fef3c7',
        },
        // Text colors
        foreground: {
          DEFAULT: '#1f1b17',
          muted: '#6e7977',
          inverse: '#f9efe8',
        },
        // Border colors
        outline: {
          DEFAULT: '#6e7977',
          variant: '#bdc9c6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['30px', { lineHeight: '38px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '700' }],
        'button': ['16px', { lineHeight: '24px', fontWeight: '600' }],
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        'full': '9999px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.10)',
      },
      maxWidth: {
        'container': '1280px',
      },
    },
  },
  plugins: [],
}
