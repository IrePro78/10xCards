import { test, expect } from '@playwright/test';
import { HomePage } from './pom/home-page';

test.describe('Testy strony głównej', () => {
	test('Strona główna powinna się załadować poprawnie', async ({
		page,
	}) => {
		const homePage = new HomePage(page);
		await homePage.goto();
		await expect(page).toHaveTitle(/10xCards/);
	});

	test('Test nawigacji - podstawowy', async ({ page }) => {
		const homePage = new HomePage(page);
		await homePage.goto();
		await homePage.expectNavigationVisible();
	});

	test('Przełącznik motywu powinien działać', async ({ page }) => {
		const homePage = new HomePage(page);
		await homePage.goto();

		// Sprawdź czy przełącznik motywu istnieje
		await expect(homePage.themeToggle).toBeVisible();

		// Kliknij przełącznik motywu
		await homePage.toggleTheme();

		// Można też dodać asercje dla zmiany motywu,
		// np. sprawdzając klasę CSS na elemencie body
	});
});
