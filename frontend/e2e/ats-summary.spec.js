import { test, expect } from '@playwright/test';

// The ATS summary used to render only counts, so the layout warnings produced by
// the PDF service reached the browser and were displayed as the digit "1". These
// assert the messages themselves are reachable.

const CRITICAL = 'Multi-column layout detected — many ATS parsers read straight across columns, interleaving unrelated lines.';
const WARNING = 'Scanned or image-based PDF detected';

// startTask stores `res.data` directly, so the feedback fields sit at the top
// level of the response body rather than under a `data` envelope.
const FEEDBACK = {
  score: 72,
  summary: 'Solid resume with a few structural problems.',
  critical: [],
  suggested: [],
  good: [],
  atsAnalysis: {
    overallScore: 64,
    checks: [
      { category: 'parseability', passed: true, detail: 'ok' },
      { category: 'format', passed: false, detail: 'nope' },
    ],
    criticalIssues: [CRITICAL],
    warnings: [WARNING],
  },
};

async function signIn(page) {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'e2e-fake-token');
    localStorage.setItem(
      'user',
      JSON.stringify({ _id: 'e2e-user', name: 'E2E', email: 'e2e@example.com' })
    );
  });
}

test.describe('ATS compliance summary', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);

    // Everything is stubbed: no real backend, no AI spend, no database writes.
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      if (url.includes('/resume/improve')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FEEDBACK) });
      }
      if (url.includes('/auth/me')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { _id: 'e2e-user', name: 'E2E', email: 'e2e@example.com' } }),
        });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) });
    });
  });

  test('issue text is hidden until asked for, then readable', async ({ page }) => {
    await page.goto('/resume-ai');
    await page.getByRole('button', { name: /analyze my resume/i }).click();

    // The label flips between "View details" and "Hide details", so match both
    // and keep one stable handle on the element.
    const trigger = page.getByRole('button', { name: /(view|hide) details/i });
    await expect(trigger).toBeVisible({ timeout: 15000 });

    // Collapsed by default — the row stays a compact summary.
    await expect(page.getByText(CRITICAL)).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();

    // The whole point: the message itself, not a count.
    await expect(page.getByText(CRITICAL)).toBeVisible();
    await expect(page.getByText(WARNING)).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.screenshot({ path: 'e2e-ats-expanded.png', fullPage: false });

    // And it collapses again.
    await trigger.click();
    await expect(page.getByText(CRITICAL)).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('counts still summarise, with correct singular wording', async ({ page }) => {
    await page.goto('/resume-ai');
    await page.getByRole('button', { name: /analyze my resume/i }).click();
    await expect(page.getByText('1 critical issue', { exact: false })).toBeVisible({ timeout: 15000 });
    // Previously hard-coded to "warnings" regardless of count.
    await expect(page.getByText('1 warning', { exact: false })).toBeVisible();
  });
});
