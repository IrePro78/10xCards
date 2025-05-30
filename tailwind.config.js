/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
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
				airbnb: {
					primary: '#FF385C',
					primaryDark: '#D70466',
					secondary: '#222222',
					accent: '#00A699',
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
			keyframes: {
				'scale-down': {
					'0%': { transform: 'scale(1)' },
					'100%': { transform: 'scale(0.98)' },
				},
			},
			animation: {
				'scale-down': 'scale-down 100ms ease-in-out forwards',
			},
		},
	},
	plugins: [],
};
