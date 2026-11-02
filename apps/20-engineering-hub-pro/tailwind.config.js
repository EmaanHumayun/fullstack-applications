/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Core Semantic Tokens
        primary: 'var(--primary, #e07a5f)',
        'primary-hover': 'var(--primary-hover, #cc674c)',
        'primary-text': 'var(--primary-text, #ffffff)',
        secondary: 'var(--secondary, #3d405b)',
        accent: 'var(--accent, #81b29a)',
        'accent-warm': 'var(--accent-warm, #e07a5f)',
        gold: 'var(--gold, #f2cc8f)',
        'warm-cream': 'var(--warm-cream, #f2cc8f)',
        
        // Surfaces & Backgrounds
        background: 'var(--background, #f4f1de)',
        'secondary-background': 'var(--secondary-background, #e9e4cc)',
        surface: 'var(--surface, #fffef9)',
        'surface-elevated': 'var(--elevated-surface, #ffffff)',
        'card-bg': 'var(--card-bg, #fffef9)',

        // Typography & Text
        ink: 'var(--text, #1f2233)',
        text: 'var(--text, #1f2233)',
        muted: 'var(--text-muted, #606482)',
        'text-secondary': 'var(--text-secondary, #3d405b)',
        'text-muted': 'var(--text-muted, #606482)',
        'heading-text': 'var(--heading-text, #1f2233)',

        // Borders & Interactive
        border: 'var(--border, #d7d0ba)',
        'border-subtle': 'var(--border-subtle, #e6dfcb)',
        'hover-surface': 'var(--hover-surface, #eee9d3)',
        'selected-surface': 'var(--selected-surface, #e4dcbe)',
        'focus-ring': 'var(--focus-ring, #e07a5f)',
        'link-color': 'var(--link-color, #c85c40)',

        // Chart Series
        'chart-1': 'var(--chart-1, #e07a5f)',
        'chart-2': 'var(--chart-2, #3d405b)',
        'chart-3': 'var(--chart-3, #81b29a)',
        'chart-4': 'var(--chart-4, #f2cc8f)',
        'chart-5': 'var(--chart-5, #5e6488)',

        // Backwards compatibility aliases
        wine: 'var(--primary, #e07a5f)',
        espresso: 'var(--secondary, #3d405b)',
        clay: 'var(--accent, #81b29a)'
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0, 0, 0, 0.04)',
        elevated: '0 12px 36px rgba(0, 0, 0, 0.08)',
        popover: '0 20px 48px rgba(0, 0, 0, 0.14)'
      },
      borderRadius: {
        pill: '100px'
      }
    }
  },
  plugins: []
};