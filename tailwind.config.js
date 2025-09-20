/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./App.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {
			colors: {
				// LIGHT
				background: 'hsl(250, 39%, 95%)',
				foreground: 'hsl(250, 20%, 15%)',
				'background-replace': 'hsl(250, 39%, 15%)',
				'foreground-replace': 'hsl(250, 100%, 99%)',
				muted: 'hsl(250, 20%, 80%)',
				'muted-foreground': 'hsl(250, 15%, 40%)',
				popover: 'hsl(250, 39%, 90%)',
				'popover-foreground': 'hsl(250, 20%, 15%)',
				card: 'hsl(280, 18%, 98%)',
				'card-foreground': 'hsl(265, 11%, 30%)',
				primary: 'hsl(190, 75%, 55%)',
				'primary-foreground': 'hsl(190, 85%, 15%)',
				secondary: 'hsl(332, 19%, 70%)',
				'secondary-foreground': 'hsl(8, 35%, 40%)',
				input: 'hsl(248, 21%, 95%)',
				border: 'hsl(217, 19%, 70%)',
				destructive: 'hsl(0, 85%, 60%)',
				accent: 'hsl(260, 85%, 65%)',
				'accent-foreground': 'hsl(250, 30%, 20%)',

				// DARK
				'background-dark': 'hsl(250, 28%, 10%)',
				'foreground-dark': 'hsl(250, 100%, 98%)',
				'card-dark': 'hsl(252, 24%, 17%)',
				'card-foreground-dark': 'hsl(250, 100%, 97%)',
				'primary-dark': 'hsl(260, 85%, 65%)',
				'primary-foreground-dark': 'hsl(250, 100%, 98%)',
				'secondary-dark': 'hsl(16, 85%, 55%)',
				'secondary-foreground-dark': 'hsl(20, 100%, 95%)',
				'muted-dark': 'hsl(248, 20%, 20%)',
				'muted-foreground-dark': 'hsl(250, 15%, 60%)',
				'input-dark': 'hsl(248, 22%, 18%)',
				'border-dark': 'hsl(250, 15%, 30%)',
				'popover-dark': 'hsl(252, 22%, 14%)',
				'popover-foreground-dark': 'hsl(250, 100%, 98%)'
			},
			borderRadius: {
				DEFAULT: 8,
				md: 12
			},
			fontFamily: {
				'geist-sans': ['Geist Sans', 'sans-serif']
			},
			keyframes: {
				'caret-blink': {
					'0%, 70%, 100%': { opacity: '1' },
					'20%, 50%': { opacity: '0' }
				}
			},
			animation: {
				'caret-blink': 'caret-blink 1.25s ease-out infinite'
			}
		}
	},
	plugins: []
}
