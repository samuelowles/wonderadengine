/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Polymath Display"', 'Georgia', 'serif'],
                body: ['"Polymath Text"', 'system-ui', 'sans-serif'],
            },
            colors: {
                page: '#F7F7F5',
                surface: {
                    DEFAULT: '#FFFFFF',
                    elevated: '#FAFAF8',
                },
                text: {
                    primary: '#1A1A1A',
                    secondary: '#6B6B6B',
                    muted: '#9CA3AF',
                    inverse: '#FFFFFF',
                },
                brand: {
                    accent: '#16A34A',
                    'accent-light': 'rgba(22,163,74,0.12)',
                    'accent-border': 'rgba(22,163,74,0.2)',
                },
                cta: {
                    dark: '#1A1A1A',
                    'dark-hover': '#2D2D2D',
                },
                border: {
                    subtle: 'rgba(0,0,0,0.06)',
                    card: 'rgba(0,0,0,0.08)',
                    divider: 'rgba(0,0,0,0.04)',
                },
            },
            fontSize: {
                // token:       [size, { lineHeight, letterSpacing, fontWeight }]
                'hero': ['36px', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '700' }],
                'h1': ['28px', { lineHeight: '1.12', letterSpacing: '-0.02em', fontWeight: '700' }],
                'h2': ['22px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
                'h3': ['18px', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '600' }],
                'body': ['16px', { lineHeight: '1.65', letterSpacing: '0', fontWeight: '400' }],
                'body-sm': ['14px', { lineHeight: '1.55', letterSpacing: '0', fontWeight: '400' }],
                'body-xs': ['13px', { lineHeight: '1.45', letterSpacing: '0', fontWeight: '400' }],
                'caption': ['11px', { lineHeight: '1.2', letterSpacing: '0.08em', fontWeight: '600' }],
                'metric': ['20px', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '600' }],
                'metric-sm': ['15px', { lineHeight: '1.2', letterSpacing: '0', fontWeight: '600' }],
                'badge': ['11px', { lineHeight: '1', letterSpacing: '0.02em', fontWeight: '600' }],
                'button': ['16px', { lineHeight: '1', letterSpacing: '0', fontWeight: '600' }],
                'button-sm': ['13px', { lineHeight: '1', letterSpacing: '0', fontWeight: '600' }],
            },
            spacing: {
                'xs': '4px',
                'sm': '8px',
                'md': '16px',
                'lg': '24px',
                'xl': '32px',
                '2xl': '48px',
                '3xl': '64px',
                'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
            },
            borderRadius: {
                'card': '28px',
                'card-inner': '16px',
                'button': '9999px',
                'input': '14px',
                'badge': '9999px',
                'icon-bg': '12px',
            },
            boxShadow: {
                'rest': '0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.04)',
                'hover': '0 4px 8px rgba(0,0,0,0.04), 0 12px 28px rgba(0,0,0,0.08)',
                'glass': '0 8px 32px rgba(0,0,0,0.25)',
                'nav': '0 -1px 0 rgba(0,0,0,0.04), 0 -8px 24px rgba(0,0,0,0.03)',
            },
            keyframes: {
                'slide-up': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'scale-in': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
            animation: {
                'slide-up': 'slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                'fade-in': 'fade-in 0.35s ease-out forwards',
                'scale-in': 'scale-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            },
            transitionTimingFunction: {
                'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
        },
    },
    plugins: [],
};
