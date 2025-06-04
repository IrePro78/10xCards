import type { Config } from 'tailwindcss';

const config: Config = {
	darkMode: 'class',
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				border: 'var(--border)',
				input: 'var(--input)',
				ring: 'var(--ring)',
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-foreground)',
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					foreground: 'var(--secondary-foreground)',
				},
				destructive: {
					DEFAULT: 'var(--destructive)',
					foreground: 'var(--destructive-foreground)',
				},
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-foreground)',
				},
				accent: {
					DEFAULT: 'var(--accent)',
					foreground: 'var(--accent-foreground)',
				},
				popover: {
					DEFAULT: 'var(--popover)',
					foreground: 'var(--popover-foreground)',
				},
				card: {
					DEFAULT: 'var(--card)',
					foreground: 'var(--card-foreground)',
				},
				error: 'var(--destructive)',
				airbnb: {
					primary: '#FF385C',
					primaryDark: '#D70466',
					secondary: '#222222',
					neutral: {
						50: '#F7F7F7',
						100: '#EBEBEB',
						200: '#DDDDDD',
						300: '#CCCCCC',
						400: '#BBBBBB',
						500: '#717171',
						600: '#484848',
						700: '#333333',
						800: '#222222',
						900: '#000000',
					},
				},
			},
			borderRadius: {
				lg: 'var(--radius-lg)',
				md: 'var(--radius-md)',
				sm: 'var(--radius-sm)',
				xl: 'var(--radius-xl)',
			},
			boxShadow: {
				card: 'var(--card-shadow)',
				'card-hover': 'var(--card-shadow-hover)',
				input: 'var(--input-shadow)',
				button: 'var(--button-shadow)',
				'button-hover': 'var(--button-shadow-hover)',
				toast: 'var(--toast-shadow)',
			},
			fontSize: {
				'card-title': '1.125rem',
			},
			fontWeight: {
				'card-title': '600',
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				wiggle: 'wiggle 1s ease-in-out infinite',
				'scale-down': 'scale-down 100ms ease-in-out forwards',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
				wiggle: {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' },
				},
				'scale-down': {
					'0%': { transform: 'scale(1)' },
					'100%': { transform: 'scale(0.98)' },
				},
			},
			spacing: {
				'card-spacing': 'var(--card-spacing)',
			},
			transitionProperty: {
				card: 'var(--card-transition)',
			},
		},
	},
	plugins: [],
};

export default config;
