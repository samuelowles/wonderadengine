/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                serif: ['"Fraunces"', '"Playfair Display"', 'serif'],
                sans: ['"Inter"', '"Geist Sans"', 'sans-serif'],
            },
            colors: {
                paper: '#F9F8F4',
                surface: '#FFFFFF',
                ink: '#121212',
                primary: '#1A1C19',
                secondary: '#5C5C58',
                inverse: '#F2F2F0',
                brand: {
                    forest: '#2D3A28',
                    clay: '#BC5D3F',
                    mist: '#DCE0E5',
                }
            },
            borderRadius: {
                'xl': '1.5rem',
                'lg': '0.75rem',
            },
            boxShadow: {
                'sm': '0px 2px 8px rgba(0,0,0,0.04)',
                'hover': '0px 8px 24px rgba(45, 58, 40, 0.08)',
            }
        }
    },
    plugins: [],
}
