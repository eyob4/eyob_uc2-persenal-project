@AGENTS.md

# Student Management System

Next.js 16 (App Router, JavaScript) · MongoDB/Mongoose · custom JWT auth via httpOnly cookies. No NextAuth, no TypeScript.

## Environment variables (`.env.local`, gitignored — see `.env.local.example` for the template)

- `MONGODB_URI` — MongoDB connection string.
- `JWT_SECRET` — signing secret for auth tokens. Required; `lib/jwt.js` throws if missing.

## Auth architecture

- **Tokens**: `src/lib/jwt.js` — `signToken({ userId, role })` / `verifyToken(token)`, `jsonwebtoken`-based. Cookie name `sms_token` (`AUTH_COOKIE`), 7-day expiry (`COOKIE_MAX_AGE`).
- **Cookie**: set httpOnly by `POST /api/auth/login` (see `src/app/api/auth/login/route.js`), cleared by `POST /api/auth/logout`. Never exposed to client JS — no `localStorage`, no `Authorization` header.
- **Server-side identity**: `src/lib/auth.js` → `getAuthUser(request)`. Pass the `NextRequest` inside a Route Handler; call with no args inside a Server Component (reads `next/headers` `cookies()` instead). Returns the Mongoose `User` doc (password stripped) or `null`. Does **not** check role — that's `lib/permissions.js`'s job.
- **Route protection**: `src/proxy.js` (Next.js **16** renamed `middleware.js` → `proxy.js` — the file must be named `proxy.js` and export a function named `proxy`; it always runs in the Node.js runtime, so `jsonwebtoken` works directly in it). It does an optimistic JWT-only check (no DB hit) against flattened role prefixes (`/admin`, `/teacher`, `/student`, `/parent`) and redirects to `/login`. `/api/*` is excluded from its matcher on purpose — every API route must call `getAuthUser` + `requireRole` itself regardless (defense in depth, not either/or). The `(dashboard)/layout.js` Server Component does a second, authoritative DB-backed check via `getAuthUser()` (no request arg — reads cookies from `next/headers`) and `redirect("/login")`s if there's no user.
- **API permission helper**: `src/lib/permissions.js` — `requireRole(user, allowedRoles)` returns an error `NextResponse` or `null` (`null` = access granted); `ownsChild(parentDoc, studentId)`; `isSelf(user, otherUserId)`.
- **Response envelope**: every API route returns `{ success, data, message }` via `src/lib/utils.js`'s `successResponse` / `errorResponse`.
- **Client-side**: `src/app/lib/api.js` — `apiFetch(path, options)` always sends `credentials: "include"`; on a `401` it redirects to `/login` client-side. `logout()` POSTs to `/api/auth/logout` then redirects. There is no client-readable token — role is learned via `GET /api/auth/me` (see `src/context/AuthContext.js` + `src/hooks/useAuth.js` / `useRole.js`), seeded into the dashboard shell.
- **Password reset**: full token flow — `PasswordResetToken` model (hashed token + expiry), `api/auth/forgot-password` (issues token, **logs the reset link to the server console** — no email provider is wired up), `api/auth/reset-password` (validates + updates password). Pages at `/forgot-password` and `/reset-password`.

## Data models (`src/models/`)

Field names follow the project's original spec exactly — don't rename these without checking that spec first (a previous session invented different field names here and had to redo this work):

- **User**: `name, email, password (bcrypt pre-save hook), role (admin|teacher|student|parent), avatar, isActive, timestamps`.
- **Student**: `userId (ref User), rollNumber, classId (ref Class), parentId (ref Parent), dateOfBirth, gender, address, admissionDate`.
- **Teacher**: `userId, subjects[] (ref Subject), classesAssigned[] (ref Class), qualification, joiningDate`.
- **Parent**: `userId, children[] (ref Student), phone, occupation`.
- **Class**: `name, classTeacherId (ref Teacher), students[] (ref Student), subjects[] (ref Subject)`.
- **Subject**: `name, code (unique), classId, teacherId`.
- **Attendance**: `studentId, classId, date, status (present|absent|late), markedBy (ref Teacher)`.
- **Grade**: `studentId, subjectId, examType, marksObtained, totalMarks, term, remarks` — **not** a single 0–100 score.
- **Fee**: `studentId, amount, dueDate, status (paid|unpaid|overdue), paymentDate, receiptNo`.
- **Announcement**: `title, message, targetRole (all|students|teachers|parents), createdBy`.
- **Message**: `senderId, receiverId, content, read`.
- **PasswordResetToken**: `user, tokenHash, expiresAt` — not part of the original spec, added for the forgot-password flow.

A `User` with role `student`/`teacher`/`parent` always gets a matching profile doc auto-created via `src/lib/profiles.js`'s `createRoleProfile(role, userId)` — called from both `POST /api/auth/register` and `POST /api/users`. Creating a Student/Teacher/Parent profile always goes through creating the `User` first; there's no standalone "create bare profile" flow.

`src/lib/mongodb.js` is the only DB connection helper (cached-promise pattern via `global._mongoose`). It also imports `@/models` (side-effect only) so every model is registered before any `.populate()` call runs — **this matters**: Mongoose only registers a model when its file is actually `import`ed somewhere in the process, and populate-by-name (`.populate("subjects")` etc.) throws `MissingSchemaError` if that model was never loaded. This bit us once (a route worked by accident because some *other* route had already imported the model it needed). Any new model must be added to `src/models/index.js`, or route ordering will eventually break in production.

`src/lib/seed.js`'s `ensureDemoUsers()` seeds 4 demo accounts (see below) the first time `User.countDocuments()` is 0; only runs outside production; called from the login route.

**Populate + security note**: any `.populate()` that reaches the `User` model must always pass a `select` (e.g. `"name email"` or `{ path: "userId", select: "name email" }` for nested populates) — an unrestricted populate pulls the full document, including the bcrypt password hash, into an API response. Caught and fixed once in `fees`/`grades`/`attendance` routes; check new routes for the same mistake.

## Demo accounts (auto-seeded)

| Role | Email | Password |
|---|---|---|
| admin | admin@sms.com | admin123 |
| teacher | teacher@sms.com | teacher123 |
| student | student@sms.com | student123 |
| parent | parent@sms.com | parent123 |

## API routes (`src/app/api/`)

All under `getAuthUser` + `requireRole`. Role-aware GETs (student/parent see only their own data; ownership checked via `ownsChild`):

- `auth/{login,register,logout,me,forgot-password,reset-password}`
- `users` (+ `[id]`) — admin only
- `students` (+ `[id]`) — admin/teacher list all; student gets own record as a 1-item array
- `teachers` (+ `[id]`), `parents` (+ `[id]`) — GET: admin sees all, teacher/student/parent can also GET `teachers` (needed for the parent-to-teacher messaging picker); parent's own `GET /api/parents` returns their profile + populated `children`. `[id]` PUT/DELETE admin-only (profile field edits, e.g. qualification/phone).
- `classes` (+ `[id]`), `subjects` (+ `[id]`) — any authenticated user can GET (needed for pickers), admin-only write
- `grades`, `attendance` — GET accepts `?studentId=`; POST is teacher/admin only
- `fees` — GET is role-scoped (student: own; parent: all children's fees, or one via `?studentId=`; admin/teacher: all or by `?studentId=`); POST/PUT/`[id]` admin only
- `announcements` — GET filtered by `targetRole` matching the caller's role (or `all`); admin sees everything; POST/DELETE admin only
- `messages` — GET returns all messages involving the caller, or a single thread via `?with=<userId>` (auto-marks that thread read); POST `{ receiverId, content }`, any authenticated role

`api/students/[id]` PUT keeps `Student.parentId` and `Parent.children` in sync both ways (pulls the student from the old parent's `children`, pushes to the new one) — this is the only place a student-parent link is created/changed; there's no separate "add child" flow on the Parent side.

## Folder structure

Route groups are in place: `src/app/(auth)/{login,register,forgot-password,reset-password}/page.js` and `src/app/(dashboard)/{admin,teacher,student,parent}/...`. Route groups don't appear in the URL, so these resolve to `/login`, `/admin`, `/teacher/attendance`, etc. — flat, no `/dashboard` or `/auth` prefix. `src/app/page.js` (landing) sits outside both groups.

- `src/app/(dashboard)/layout.js` — async Server Component: `getAuthUser()` → `redirect("/login")` if absent, otherwise renders `<Sidebar role={user.role} name={user.name}>{children}</Sidebar>`.
- `src/components/layout/Sidebar.jsx` — the actual sidebar/topbar chrome (`"use client"`), takes `role`/`name` as props (no more client-side `localStorage`/context read for role). `NAV` hrefs are root-level (`/admin/students`, not `/dashboard/admin/students`).
- `src/app/ClientShell.js` — wraps the root `layout.js`, shows the public Navbar/Footer everywhere **except** paths matching `DASHBOARD_PREFIXES` (`/admin`, `/teacher`, `/student`, `/parent`). Deliberately not split into a separate `(auth)` layout — one prefix-check component covers both the landing page and the auth pages, avoiding double-wrapping.
- `dashboard/[role]/page.js` (unknown-role fallback) and `dashboard/page.js` (role-picker demo) were deleted — no longer reachable/needed once proxy + the server layout own routing.

## UI system

- `src/components/ui/Icons.jsx` — hand-rolled inline SVG icon set (stroke-based, `currentColor`, 24x24 viewBox). Used instead of emoji/unicode glyphs everywhere (Sidebar nav, landing page feature cards) — don't reintroduce emoji for icons, use/extend this file instead.
- `src/components/layout/Sidebar.jsx` — dashboard chrome, NAV map per role.
- `src/components/shared/AnnouncementsList.jsx` + `AnnouncementCard.jsx` — one shared component powers all 4 roles' `/announcements` pages (`canManage` prop toggles the create form + delete button for admin); don't duplicate this per role.
- `src/components/shared/MessagesPanel.jsx` — shared contact-list + thread UI for `teacher/messages` and `parent/messages`; each role's page just resolves its own list of valid recipients (teacher → parents of their students; parent → all teachers) and passes them in.

## Known gaps / next steps (in priority order)

1. No email provider wired up for password reset — reset links are logged to the server console in dev.
2. No UI yet for assigning a `Teacher.subjects`/`classesAssigned` or building out a `Class.schedule` — the `Subject`/`Class` admin pages only cover the fields needed elsewhere (name, code, classId link), not full relationship management.
3. Messaging is a flat 1:1 model — no group threads, no read-receipts UI beyond the auto-mark-read-on-open behavior.

## Gotchas specific to this Next.js version (16.2.10)

- `middleware.js` doesn't exist in this version — it's `proxy.js`, exporting a function named `proxy`. See `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`.
- Route Handler `{ params }` is a `Promise` — must `await params`.
- `cookies()` from `next/headers` is async — must `await cookies()`.
- Per `AGENTS.md`: check `node_modules/next/dist/docs/` before relying on training-data knowledge of Next.js APIs for this project — this version has real breaking changes from older Next.js.
