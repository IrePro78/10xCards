import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
	readonly page: Page;
	readonly heading: Locator;
	readonly themeToggle: Locator;
	readonly navigation: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.getByRole('heading', { level: 1 });

		// Próbujemy kilku selektorów, aby zwiększyć szanse na znalezienie przycisku
		// Najpierw próbujemy data-testid (najlepsza praktyka)
		// Jeśli to nie zadziała, próbujemy aria-label (również dobra praktyka)
		// Jeśli i to nie zadziała, używamy selektora CSS jako ostateczność
		this.themeToggle = page.locator(
			[
				'[data-testid="theme-toggle"]',
				'button[aria-label="Przełącz na ciemny motyw"], button[aria-label="Przełącz na jasny motyw"], button[aria-label="Ładowanie motywu"]',
				'button.h-9.w-9.rounded-full',
			].join(', '),
		);

		this.navigation = page.locator('nav');
	}

	async goto() {
		await this.page.goto('/');
	}

	async toggleTheme() {
		await this.themeToggle.click();
	}

	async expectPageLoaded() {
		await expect(this.page).toHaveTitle(/10xCards/);
		await expect(this.heading).toBeVisible();
	}

	async expectNavigationVisible() {
		await expect(this.navigation).toBeVisible();
	}
}
