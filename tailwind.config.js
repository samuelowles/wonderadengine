/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Polymath Display"', 'sans-serif'], // Use Display for headings
                body: ['"Polymath Text"', 'sans-serif'],     // Use Text for body
            },
            fontWeight: {
                // Strict weights
                regular: '400',
                medium: '500',
                semibold: '600',
                bold: '700',
                heavy: '800',
            },
            colors: {
                page: '#000000', // Mobile app background outside container
                surface: {
                    DEFAULT: '#FFFFFF', // Strict White
                    subtle: '#F4F4F5',  // Inputs
                },
                text: {
                    primary: '#000000',
                    secondary: '#6E6E73', // IOS Gray
                    muted: '#8E8E93',
                    inverse: '#FFFFFF',
                    green: '#2E7D32',
                },
                brand: {
                    accent: '#2E7D32', // Dark Green
                    bg: '#E8F5E9',     // Pale Green
                },
                cta: {
                    DEFAULT: '#000000',
                    hover: '#1A1A1A',
                },
                border: {
                    subtle: '#E5E5EA',
                    input: 'transparent', // No borders on inputs
                },
            },
            borderRadius: {
                'card': '32px',
                'input': '16px', // Squircle
                'button': '9999px', // Pill
                'badge': '9999px', // Pill
            },
            boxShadow: {
                'premium': '0px 16px 40px rgba(0, 0, 0, 0.2), 0px 4px 12px rgba(0, 0, 0, 0.1)', // The Master Shadow
                'float': '0 8px 24px rgba(0,0,0,0.12)',
            },
            fontSize: {
                'h1': ['34px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
                'h2': ['20px', { lineHeight: '1.2', fontWeight: '700' }],
                'h3': ['18px', { lineHeight: '1.25', fontWeight: '700' }],
                'body': ['15px', { lineHeight: '1.5', fontWeight: '400' }],
                'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
                'micro': ['12px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '600', textTransform: 'uppercase' }],
            }
        },
    },
    plugins: [],
};
