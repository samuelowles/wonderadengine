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
                // Base palette
                'brand-dark': '#141414',
                'brand-light': '#F8F8F8',
                'brand-accent': '#00875A',
                'brand-accent-hover': '#006B48',

                // Text colors
                'text-primary': '#141414',
                'text-secondary': '#5C5C5C',
                'text-muted': '#8A8A8A',
                'text-inverse': '#FFFFFF',

                // Border colors
                'border-subtle': '#E5E5E5',
                'border-dark': '#333333',

                // Surface colors
                'surface-light': '#FFFFFF',
                'surface-dark': '#1A1A1A',
                'surface-elevated': '#FCFCFC',

                // Legacy (for compatibility)
                paper: '#F8F8F8',
                surface: '#FFFFFF',
                ink: '#141414',
                primary: '#141414',
                secondary: '#5C5C5C',
                inverse: '#FFFFFF',
                brand: {
                    forest: '#00875A',
                    clay: '#BC5D3F',
                    mist: '#E5E5E5',
                }
            },
            borderRadius: {
                'xl': '16px',
                'lg': '12px',
                'md': '8px',
            },
            boxShadow: {
                'card': '0px 2px 8px rgba(0, 0, 0, 0.04)',
                'card-hover': '0px 12px 32px rgba(0, 0, 0, 0.12)',
                'button': '0px 4px 12px rgba(0, 135, 90, 0.25)',
            },
            fontSize: {
                'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
                'display-lg': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
                'display-md': ['1.75rem', { lineHeight: '1.2' }],
                'body-lg': ['1.125rem', { lineHeight: '1.6' }],
                'body': ['1rem', { lineHeight: '1.6' }],
                'body-sm': ['0.875rem', { lineHeight: '1.5' }],
                'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
            }
        }
    },
    plugins: [],
}
