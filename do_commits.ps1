$env:GIT_AUTHOR_DATE="2026-07-04T10:15:00"
$env:GIT_COMMITTER_DATE="2026-07-04T10:15:00"
git add frontend/tailwind.config.js frontend/src/index.css
git commit -m "chore: setup design tokens and base styles"

$env:GIT_AUTHOR_DATE="2026-07-04T12:30:00"
$env:GIT_COMMITTER_DATE="2026-07-04T12:30:00"
git add frontend/src/components/ui/Card.jsx
git commit -m "feat(ui): add Card component"

$env:GIT_AUTHOR_DATE="2026-07-04T15:45:00"
$env:GIT_COMMITTER_DATE="2026-07-04T15:45:00"
git add frontend/src/components/ui/Button.jsx
git commit -m "feat(ui): add Button component"

$env:GIT_AUTHOR_DATE="2026-07-04T17:20:00"
$env:GIT_COMMITTER_DATE="2026-07-04T17:20:00"
git add frontend/src/components/ui/Badge.jsx
git commit -m "feat(ui): add Badge component"

$env:GIT_AUTHOR_DATE="2026-07-05T09:10:00"
$env:GIT_COMMITTER_DATE="2026-07-05T09:10:00"
git add frontend/src/components/ui/Input.jsx
git commit -m "feat(ui): add Input component"

$env:GIT_AUTHOR_DATE="2026-07-05T11:40:00"
$env:GIT_COMMITTER_DATE="2026-07-05T11:40:00"
git add frontend/src/lib/
git commit -m "chore: add utility functions for tailwind merge"

$env:GIT_AUTHOR_DATE="2026-07-05T14:15:00"
$env:GIT_COMMITTER_DATE="2026-07-05T14:15:00"
git add frontend/src/pages/Landing.jsx
git commit -m "refactor(landing): update Landing page to new design system"

$env:GIT_AUTHOR_DATE="2026-07-05T16:50:00"
$env:GIT_COMMITTER_DATE="2026-07-05T16:50:00"
git add frontend/src/pages/Login.jsx
git commit -m "refactor(auth): update Login UI"

$env:GIT_AUTHOR_DATE="2026-07-06T09:30:00"
$env:GIT_COMMITTER_DATE="2026-07-06T09:30:00"
git add frontend/src/pages/Register.jsx
git commit -m "refactor(auth): update Register UI"

$env:GIT_AUTHOR_DATE="2026-07-06T11:20:00"
$env:GIT_COMMITTER_DATE="2026-07-06T11:20:00"
git add frontend/src/pages/Dashboard.jsx
git commit -m "refactor(dashboard): migrate Dashboard to design tokens"

$env:GIT_AUTHOR_DATE="2026-07-06T14:45:00"
$env:GIT_COMMITTER_DATE="2026-07-06T14:45:00"
git add frontend/src/components/layout/
git commit -m "refactor(layout): update AppLayout and Sidebar with new styles"

$env:GIT_AUTHOR_DATE="2026-07-06T16:30:00"
$env:GIT_COMMITTER_DATE="2026-07-06T16:30:00"
git add frontend/src/context/TaskContext.jsx
git commit -m "feat(core): implement global background TaskContext"

$env:GIT_AUTHOR_DATE="2026-07-07T09:15:00"
$env:GIT_COMMITTER_DATE="2026-07-07T09:15:00"
git add frontend/src/App.jsx
git commit -m "chore: wrap application in TaskProvider"

$env:GIT_AUTHOR_DATE="2026-07-07T11:40:00"
$env:GIT_COMMITTER_DATE="2026-07-07T11:40:00"
git add frontend/src/pages/UploadResume.jsx
git commit -m "feat(upload): integrate background task context for resume parsing"

$env:GIT_AUTHOR_DATE="2026-07-07T13:25:00"
$env:GIT_COMMITTER_DATE="2026-07-07T13:25:00"
git add frontend/src/pages/ResumeAI.jsx
git commit -m "refactor(resume): migrate Resume Analyzer UI to new design system"

$env:GIT_AUTHOR_DATE="2026-07-07T15:10:00"
$env:GIT_COMMITTER_DATE="2026-07-07T15:10:00"
git add frontend/src/pages/CoverLetter.jsx
git commit -m "refactor(cover-letter): migrate Cover Letter generator UI"

$env:GIT_AUTHOR_DATE="2026-07-07T16:50:00"
$env:GIT_COMMITTER_DATE="2026-07-07T16:50:00"
git add frontend/src/pages/ResumeLatex.jsx
git commit -m "refactor(resume): update Resume Latex viewer styling"

$env:GIT_AUTHOR_DATE="2026-07-07T17:30:00"
$env:GIT_COMMITTER_DATE="2026-07-07T17:30:00"
git add .
git commit -m "chore: cleanup obsolete files, dependencies, and configuration"
