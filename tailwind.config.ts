import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			// Quiz App Custom Colors
  			'primary-green': {
  				DEFAULT: '#2D9F7C',
  				dark: '#238968',
  				light: '#E8F5F1',
  			},
  			'primary-orange': {
  				DEFAULT: '#F39C6B',
  				dark: '#E88A56',
  				light: '#FFF4EE',
  			},
  			'bg-peach': '#F5E6D3',
  			'bg-cream': '#FFF9F0',
  			'bg-white': '#FFFFFF',
  			'text-primary': '#2C1810',
  			'text-secondary': '#6B5847',
  			'text-muted': '#9B8A7A',
  			'accent-yellow': '#FFD166',
  			'accent-red': '#E07856',
  			success: '#2D9F7C',
  			error: '#E07856',
  			warning: '#F39C6B',
  			
  			// shadcn/ui colors
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'pulse-border': {
  				'0%, 100%': { 
  					transform: 'scale(1)',
  					opacity: '0.8'
  				},
  				'50%': { 
  					transform: 'scale(1.08)',
  					opacity: '1'
  				}
  			},
  			'pulse-subtle': {
  				'0%, 100%': { 
  					transform: 'scale(1)',
  					opacity: '0.9'
  				},
  				'50%': { 
  					transform: 'scale(1.03)',
  					opacity: '1'
  				}
  			},
  			'rotate-gradient': {
  				'0%': { 
  					transform: 'rotate(0deg) scale(1)',
  					opacity: '0.8'
  				},
  				'25%': { 
  					transform: 'rotate(90deg) scale(1.05)',
  					opacity: '1'
  				},
  				'50%': { 
  					transform: 'rotate(180deg) scale(1.08)',
  					opacity: '0.9'
  				},
  				'75%': { 
  					transform: 'rotate(270deg) scale(1.05)',
  					opacity: '1'
  				},
  				'100%': { 
  					transform: 'rotate(360deg) scale(1)',
  					opacity: '0.8'
  				}
  			}
  		},
  		animation: {
  			'pulse-border': 'pulse-border 2.5s ease-in-out infinite',
  			'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
  			'rotate-gradient': 'rotate-gradient 3s ease-in-out infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
