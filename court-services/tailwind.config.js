/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#3B82F6',
        surface: '#FFFFFF',
        background: '#F0F4FF',
        'text-main': '#1F2937',
        muted: '#6B7280',
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
      },
      borderRadius: {
        clay: '20px',
        'clay-lg': '24px',
        btn: '12px',
      },
      boxShadow: {
        clay: '0 4px 24px rgba(37,99,235,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'clay-hover': '0 16px 40px rgba(37,99,235,0.18), 0 4px 12px rgba(0,0,0,0.06)',
        'clay-xl': '0 24px 80px rgba(37,99,235,0.20), 0 4px 20px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}
