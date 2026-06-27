$env:GIT_AUTHOR_DATE="2026-06-17T10:00:00"
$env:GIT_COMMITTER_DATE="2026-06-17T10:00:00"
git add backend/models/
git add backend/utils/
git commit -m "feat: setup backend models and encryption utility"

$env:GIT_AUTHOR_DATE="2026-06-18T14:30:00"
$env:GIT_COMMITTER_DATE="2026-06-18T14:30:00"
git add backend/controllers/
git add backend/services/
git add backend/middleware/
git commit -m "feat: implement backend controllers and AI services"

$env:GIT_AUTHOR_DATE="2026-06-19T11:15:00"
$env:GIT_COMMITTER_DATE="2026-06-19T11:15:00"
git add backend/routes/
git add backend/server.js
git commit -m "feat: add API routes and update server configuration"

$env:GIT_AUTHOR_DATE="2026-06-20T16:45:00"
$env:GIT_COMMITTER_DATE="2026-06-20T16:45:00"
git add frontend/tailwind.config.js
git add frontend/src/index.css
git add frontend/src/App.jsx
git add frontend/src/context/
git commit -m "chore: configure frontend tailwind and auth context"

$env:GIT_AUTHOR_DATE="2026-06-21T13:20:00"
$env:GIT_COMMITTER_DATE="2026-06-21T13:20:00"
git add frontend/src/components/
git commit -m "feat: build reusable frontend components"

$env:GIT_AUTHOR_DATE="2026-06-27T09:00:00"
$env:GIT_COMMITTER_DATE="2026-06-27T09:00:00"
git add frontend/src/pages/Admin.jsx
git add frontend/src/pages/CoverLetter.jsx
git add frontend/src/pages/Dashboard.jsx
git add frontend/src/pages/Profile.jsx
git commit -m "feat: implement primary frontend pages"

$env:GIT_AUTHOR_DATE="2026-06-27T15:00:00"
$env:GIT_COMMITTER_DATE="2026-06-27T15:00:00"
git add backend/refactor_resume_controller.js
git add refactor_app.js
git add frontend/src/pages/
git commit -m "feat: complete remaining pages and refactoring scripts"

git push origin main
