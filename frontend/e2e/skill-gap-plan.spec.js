import { test, expect } from '@playwright/test';

// The roadmap and project-recommendation endpoints existed on the backend with
// no caller, while the README advertised "Career Roadmaps". These assert the
// feature is actually reachable, and that the AI calls behind it stay
// user-initiated rather than firing on page load.

const ROLE_ID = '507f1f77bcf86cd799439011';

const STORED_ANALYSIS = {
  roleId: ROLE_ID,
  roleName: 'Backend Developer',
  updatedAt: '2026-08-01T00:00:00.000Z',
  analysis: {
    matchPercentage: 60,
    totalRequired: 5,
    matchedSkills: [{ skill: 'node.js', proficiency: 'strong', evidence: 'Used in two projects.' }],
    missingSkills: [
      { skill: 'kubernetes', priority: 'critical', recommendation: 'Learn pod scheduling.' },
      { skill: 'kafka', priority: 'important', recommendation: 'Learn event streaming.' },
    ],
    overallReadinessVerdict: 'Close, but missing infrastructure depth.',
  },
  scoring: { totalJobReadinessScore: 62, skillsScore: 60, experienceScore: 55, consistencyScore: 70 },
  roadmap: {},
};

const ROADMAP = {
  role: 'Backend Developer',
  beginner: [{ skill: 'kubernetes basics', isMissing: true, timeEstimate: '1 week', resource: 'https://kubernetes.io/docs/' }],
  intermediate: [{ skill: 'kafka consumers', isMissing: true, timeEstimate: '2 weeks', resource: 'https://kafka.apache.org/' }],
  advanced: [{ skill: 'multi-cluster deploys', isMissing: true, timeEstimate: '3 weeks' }],
};

const PROJECTS = [
  {
    title: 'Event-Driven Order Pipeline',
    difficulty: 'Advanced',
    deployTarget: 'Fly.io',
    requiredSkills: ['kafka', 'kubernetes'],
    description: 'A checkout pipeline that survives consumer restarts without losing events.',
  },
];

test.describe('Skill Gap learning plan', () => {
  let roadmapCalls;
  let projectCalls;

  test.beforeEach(async ({ page }) => {
    roadmapCalls = 0;
    projectCalls = 0;

    await page.addInitScript(() => {
      localStorage.setItem('token', 'e2e-fake-token');
      localStorage.setItem('user', JSON.stringify({ _id: 'e2e-user', name: 'E2E', email: 'e2e@example.com' }));
    });

    // Count on the request event rather than inside a route handler: a later
    // page.route for the same URL would shadow a counting catch-all.
    page.on('request', (req) => {
      if (req.url().includes('/roadmap/generate')) roadmapCalls += 1;
      if (req.url().includes('/projects/recommend')) projectCalls += 1;
    });

    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      const json = (body, status = 200) =>
        route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

      if (url.includes('/analysis/roles')) return json([{ _id: ROLE_ID, roleName: 'Backend Developer' }]);
      if (url.includes('/analysis/history')) return json([{ roleId: ROLE_ID, roleName: 'Backend Developer', updatedAt: STORED_ANALYSIS.updatedAt }]);
      if (url.includes('/analysis/latest')) return json(STORED_ANALYSIS);
      if (url.includes('/roadmap/generate')) return json(ROADMAP);
      if (url.includes('/projects/recommend')) return json(PROJECTS);
      if (url.includes('/auth/me')) return json({ _id: 'e2e-user', name: 'E2E', email: 'e2e@example.com' });
      return json({ success: true, data: {} });
    });
  });

  test('plan is opt-in, then renders phases and projects', async ({ page }) => {
    await page.goto('/skill-gap');

    await expect(page.getByRole('heading', { name: /learning plan/i })).toBeVisible({ timeout: 15000 });

    // Loading the page must not spend AI calls.
    expect(roadmapCalls).toBe(0);
    expect(projectCalls).toBe(0);
    await expect(page.getByText(/uses two AI calls/i)).toBeVisible();

    await page.getByRole('button', { name: /build learning plan/i }).click();

    // All three phases render.
    await expect(page.getByText('kubernetes basics')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('kafka consumers')).toBeVisible();
    await expect(page.getByText('multi-cluster deploys')).toBeVisible();

    // And the projects.
    await expect(page.getByText('Event-Driven Order Pipeline')).toBeVisible();
    await expect(page.getByText('Fly.io', { exact: false })).toBeVisible();

    expect(roadmapCalls).toBe(1);
    expect(projectCalls).toBe(1);

    // Button flips to the rebuild affordance once a plan exists.
    await expect(page.getByRole('button', { name: /rebuild plan/i })).toBeVisible();

    await page.screenshot({ path: 'e2e-skill-gap-plan.png', fullPage: false });
  });

  test('a failing projects call still shows the roadmap', async ({ page }) => {
    await page.route('**/api/projects/recommend', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'AI failed' }) })
    );

    await page.goto('/skill-gap');
    await page.getByRole('button', { name: /build learning plan/i }).click();

    // Promise.allSettled means one failure must not take the other down.
    await expect(page.getByText('kubernetes basics')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Event-Driven Order Pipeline')).toBeHidden();
  });
});
