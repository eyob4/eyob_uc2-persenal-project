# Learning Guide — Student Management System

This is a teaching walkthrough of the whole project, written so you can present it piece by piece and actually explain *why* each part exists, not just *what* it does. Each section below is self-contained enough to present on its own, and the sections are ordered so that later ones build on earlier ones — present in this order and it will make sense to an audience seeing it for the first time.

**Suggested presentation order:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10.

---

## 1. The big picture

**What it is:** a school management web app with four roles — Admin, Teacher, Student, Parent — each with their own dashboard and permissions.

**Stack, and why each piece was chosen:**

| Piece | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | One codebase for both the frontend (React pages) and the backend (API routes) — no separate Express server to run and deploy. |
| Language | JavaScript (no TypeScript) | Keeps the project approachable; every file is plain `.js`/`.jsx`. |
| Database | MongoDB + Mongoose | Document DB fits nicely with nested/related school data (students, classes, grades); Mongoose gives us schemas, validation, and relationships on top of it. |
| Auth | Custom JWT in an httpOnly cookie | No third-party auth service — you own and can explain every line of the login flow. httpOnly means client-side JavaScript can never read the token (defends against XSS token theft). |
| Styling | Hand-written CSS (`globals.css`) with CSS custom properties (design tokens) | No CSS framework dependency — every class (`.card`, `.btn`, `.badge`) is one you can point to and explain. |

**Demo accounts** (auto-seeded the first time the database is empty — see §4.3):

| Role | Email | Password |
|---|---|---|
| admin | admin@sms.com | admin123 |
| teacher | teacher@sms.com | teacher123 |
| student | student@sms.com | student123 |
| parent | parent@sms.com | parent123 |

---

## 2. Project structure tour

```
src/
├── app/                    # Next.js App Router: every folder here is a URL
│   ├── page.js             # "/" — public landing page
│   ├── layout.js            # Root HTML shell, wraps everything
│   ├── ClientShell.js        # Decides whether to show the public navbar/footer
│   ├── globals.css           # Design tokens + all shared CSS classes
│   ├── (auth)/                # Route GROUP — parentheses mean "organize files,
│   │   ├── login/page.js       #   but don't add this folder name to the URL"
│   │   ├── register/page.js    #   so this is just /login, not /auth/login
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (dashboard)/            # Another route group — the 4 role dashboards
│   │   ├── layout.js            # Shared shell for every dashboard page (see §7.3)
│   │   ├── admin/…
│   │   ├── teacher/…
│   │   ├── student/…
│   │   └── parent/…
│   └── api/                    # Every subfolder here is a backend endpoint
│       ├── auth/…
│       ├── students/…
│       └── … (one folder per resource)
├── models/                  # Mongoose schemas (the database "shape")
├── lib/                     # Backend helper functions (auth, db connection, etc.)
├── components/              # Reusable React pieces (Sidebar, Icons, shared widgets)
├── context/                 # React Context for client-side auth state
├── hooks/                   # Small custom React hooks
└── proxy.js                 # Runs before every page request — the security gate
```

**Key idea to explain up front:** in the Next.js *App Router*, the file system *is* the router. A file at `src/app/(dashboard)/admin/students/page.js` becomes the page at `/admin/students`, automatically. A file at `src/app/api/students/route.js` becomes a backend endpoint at `/api/students`. There's no separate routing config file to maintain.

---

## 3. The database layer

### 3.1 Connecting to MongoDB — `src/lib/mongodb.js`

```js
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m.connection);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

**Why this looks weird (caching on `global`):** in development, Next.js hot-reloads your code on every file save — which would normally re-run this file and open a *new* database connection every time, quickly exhausting MongoDB's connection limit. Stashing the connection on Node's `global` object means it survives the hot-reload and gets reused. This is the standard, documented pattern for using Mongoose inside Next.js.

### 3.2 Data models — `src/models/*.js`

Each file defines one Mongoose **schema** — the shape of one collection. Example, `Grade.js`:

```js
const gradeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  examType: String,
  marksObtained: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  term: String,
  remarks: String,
}, { timestamps: true });
```

Things worth pointing out when presenting this:
- `ref: "Student"` doesn't store the student's data — it stores just their MongoDB `_id`. To get the actual student name, you `.populate("studentId")` later (§6.3).
- `{ timestamps: true }` auto-adds `createdAt`/`updatedAt` — one line instead of managing those fields by hand.
- `mongoose.models.Grade || mongoose.model("Grade", gradeSchema)` at the bottom of every model file — this guards against Next.js's hot-reload trying to register the same model twice (which Mongoose throws an error on).

**The 11 models and how they relate:**

```
User ──┬── Student ──┬── Class (via classId)
       │             ├── Parent (via parentId)
       │             ├── Grade (via studentId)
       │             ├── Attendance (via studentId)
       │             └── Fee (via studentId)
       ├── Teacher ──── Subject / Class
       └── Parent ───── children[] (array of Student refs)

Class ── Subject ── Grade
Announcement, Message, PasswordResetToken — standalone, ref User
```

Every real person (`admin`, `teacher`, `student`, `parent`) is a **`User`** first — `User` holds login credentials and the `role` field. Then, depending on the role, they *also* get a matching **profile document** (`Student`, `Teacher`, or `Parent`) that holds role-specific data. This is a deliberate design choice worth explaining: *"why not just put student fields directly on User?"* — because a `User` is about **who can log in**, and a `Student`/`Teacher`/`Parent` profile is about **domain data**. Keeping them separate means the login/auth system never has to know or care about school-specific fields.

### 3.3 The password hash — `models/User.js`

```js
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

A **Mongoose middleware hook**: this function runs automatically right before any `User` document is saved. `isModified("password")` means it only re-hashes when the password actually changed (so updating someone's name doesn't re-hash an already-hashed password). This is *why* every route in the app can just do `User.create({ password: "plaintext123" })` — the hook hashes it transparently. Good talking point: **never write your own crypto** — `bcryptjs` handles the salting and hashing correctly so you don't have to.

### 3.4 A subtle bug we hit: model registration order

`src/models/index.js`:

```js
import "@/models/User";
import "@/models/Student";
// ...one line per model, imported purely for its side effect
```

This file does nothing except *import* every model. It's imported once, at the top of `lib/mongodb.js`. **The bug this fixes**: Mongoose only knows about a model (like `"Subject"`) once its defining file has actually run somewhere in the app. If Route A calls `.populate("subjectId")` but nothing has ever imported `models/Subject.js` yet, Mongoose throws `MissingSchemaError` — even though the `Subject` collection exists in the database! It's a great real bug to present: it "worked" in testing purely by accident (some other route happened to import `Subject` first), then broke the moment the server restarted and a different route ran first. The fix — a single file that imports everything — makes model registration no longer depend on request order.

---

## 4. Authentication & security

This is the part worth spending the most presentation time on — it's the architectural core of the app.

### 4.1 Signing and verifying tokens — `src/lib/jwt.js`

```js
export const AUTH_COOKIE = "sms_token";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}
export function verifyToken(token) {
  try { return jwt.verify(token, getSecret()); }
  catch { return null; }
}
```

A JWT (JSON Web Token) is a signed string containing a small payload (here: `{ userId, role }`). "Signed" means: anyone can *read* it, but nobody can *forge or alter* it without knowing `JWT_SECRET` — the server checks the signature on every request. `verifyToken` returns `null` on any failure (expired, tampered, wrong secret) rather than throwing, so callers can just do `if (!payload) { …not logged in… }`.

### 4.2 Where the token lives: an httpOnly cookie, not `localStorage`

`src/app/api/auth/login/route.js` (the login endpoint), after checking the password:

```js
const token = signToken({ userId: user._id.toString(), role: user.role });
const res = successResponse({ user: {...} }, "Logged in");
res.cookies.set(AUTH_COOKIE, token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: COOKIE_MAX_AGE,
  path: "/",
});
return res;
```

**This is the single most important security decision in the app, and worth explaining carefully:** `httpOnly: true` means the cookie is invisible to JavaScript (`document.cookie` cannot see it). If this app were vulnerable to an XSS attack (malicious script injected into a page), that script *still* couldn't steal the session token, because it can't read it — only the browser can, and only when it automatically attaches it to requests. Compare this to storing a token in `localStorage` (which many tutorials do): any injected script can read `localStorage` directly and steal the token. This project deliberately avoids that.

### 4.3 Resolving "who is this request from?" — `src/lib/auth.js`

```js
export async function getAuthUser(request) {
  const tokenValue = request?.cookies
    ? request.cookies.get(AUTH_COOKIE)?.value      // inside an API route
    : (await cookies()).get(AUTH_COOKIE)?.value;   // inside a Server Component

  if (!tokenValue) return null;
  const payload = verifyToken(tokenValue);
  if (!payload?.userId) return null;

  await connectToDatabase();
  const user = await User.findById(payload.userId).select("-password");
  if (!user || user.isActive === false) return null;
  return user;
}
```

Notice this function is called two different ways in the codebase: `getAuthUser(request)` inside an API route, and `getAuthUser()` with no arguments inside a Server Component layout. That's because Next.js exposes cookies differently in those two contexts — this function hides that difference so every other file can just call it the same way. Also notice `.select("-password")` — even though we already have the hash from the JWT-verified user ID, we deliberately strip it back out before returning, so a mistake elsewhere in the code can never accidentally leak it (see §4.6 for why this matters).

### 4.4 The route gate — `src/proxy.js`

```js
const ROUTE_ROLE_MAP = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/teacher", roles: ["teacher"] },
  { prefix: "/student", roles: ["student"] },
  { prefix: "/parent", roles: ["parent"] },
];

export function proxy(request) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const payload = token ? verifyToken(token) : null;

  const protectedMatch = ROUTE_ROLE_MAP.find(r => pathname.startsWith(r.prefix));
  if (protectedMatch) {
    if (!payload) return NextResponse.redirect("/login");                 // not logged in
    if (!protectedMatch.roles.includes(payload.role))                     // wrong role
      return NextResponse.redirect("/login");
  }
  return NextResponse.next();
}
```

This function runs **before** almost every page request reaches your app (it's configured via `export const config = { matcher: [...] }` at the bottom of the file). It's a fast, cheap, "optimistic" check — it only verifies the JWT signature, it does **not** hit the database (no `await`, no DB call). That's an intentional trade-off: proxy-level checks run on *every single request*, so they need to be fast; a slower, authoritative check happens later (§4.5).

Fun fact worth mentioning if presenting to people who've used older Next.js tutorials: **this file must be named `proxy.js`, not `middleware.js`.** Next.js 16 renamed the file convention (the old name is deprecated). Small thing, but a good example of "always check the actual installed version's docs, not just what you remember from a tutorial."

### 4.5 Defense in depth: two checks, not one

The proxy check above is *optimistic* — good for blocking obviously-unauthorized page loads fast, but not the final word. Two more checks back it up:

1. **`(dashboard)/layout.js`** (a Server Component, runs on the actual server before rendering any dashboard page) calls `getAuthUser()` for real — hits the database, confirms the user still exists and `isActive` is true — and redirects if not.
2. **Every single API route** calls `getAuthUser(request)` + `requireRole(...)` itself, regardless of whether the proxy already checked. Why duplicate this? Because `/api/*` routes are deliberately *excluded* from the proxy's matcher — if a future refactor changes the proxy's matcher pattern and accidentally stops covering some path, an API route that didn't check for itself would be left completely open. This is called **defense in depth**: never rely on a single layer of security.

### 4.6 Role permission helper — `src/lib/permissions.js`

```js
export function requireRole(user, allowedRoles = []) {
  if (!user) return errorResponse("Unauthorized", 401);
  if (allowedRoles.length && !allowedRoles.includes(user.role))
    return errorResponse("Forbidden", 403);
  return null; // null means "access granted"
}
```

Used at the top of nearly every API route like this:

```js
const user = await getAuthUser(request);
const denied = requireRole(user, ["admin"]);
if (denied) return denied;
// ...only admins reach this line
```

`ownsChild(parentDoc, studentId)` is the same idea for a finer-grained check: not just "is this a parent," but "is this *specifically their own* child" — used everywhere a parent asks for grades/attendance/fees, so Parent A can never fetch Parent B's child's data just by guessing an ID.

**A real bug this project hit, worth presenting as a cautionary tale:** several routes did `.populate({ path: "studentId", populate: "userId" })` to fetch a student's name — but forgot to *restrict which fields* come back. Populate-without-a-field-list pulls the **entire** document, including the bcrypt password hash, straight into the JSON API response. It was caught during manual testing (a parent's fee list literally contained their child's password hash in the response). Fixed by always writing `populate: { path: "userId", select: "name email" }` — is a good example of why you re-test your own APIs by literally reading the raw response, not just checking that the page "looks right."

### 4.7 Password reset flow

`api/auth/forgot-password` generates a random token, stores only its **hash** in a `PasswordResetToken` document (never the raw token — same principle as passwords), with a 1-hour expiry, and — since there's no email service wired up — logs the reset link to the server console. `api/auth/reset-password` looks up that hash, checks it hasn't expired, and updates the password (which re-triggers the bcrypt hook from §3.3).

---

## 5. The API design pattern

### 5.1 One response shape, everywhere — `src/lib/utils.js`

```js
export function successResponse(data = null, message = "", init = {}) {
  return NextResponse.json({ success: true, data, message }, init);
}
export function errorResponse(message = "Error", status = 400) {
  return NextResponse.json({ success: false, data: null, message }, { status });
}
```

Every single API route in the app returns one of these two shapes. This means every frontend fetch call can be written the same way, without guessing the response shape route by route:

```js
const res  = await apiFetch("/api/grades");
const json = await res.json();
if (res.ok && json.success) { /* use json.data */ }
```

### 5.2 REST resource pattern

Each backend "resource" gets its own folder under `src/app/api/`:

```
api/students/route.js        → GET (list) / POST (create) on /api/students
api/students/[id]/route.js   → PUT (update) / DELETE on /api/students/:id
```

The `[id]` folder name is a **dynamic route segment** — whatever the actual ID is in the URL becomes available as `params.id` inside the file. In Next.js 16, `params` is a `Promise`, so every handler does `const { id } = await params;`.

### 5.3 Role-scoped queries — the same endpoint, different data per role

`GET /api/grades` is a single endpoint, but what it returns depends entirely on who's asking (walk through the actual code in §3.2/§4.6's `grades/route.js` snippet): a **student** only ever sees their own grades (their `Student._id` is looked up from their own login, not taken from user input); a **parent** must supply a `?studentId=` and it's checked against `ownsChild`; an **admin/teacher** can see everything or filter by `studentId`. This "one endpoint, role determines the query" pattern repeats across `attendance`, `fees`, `announcements` — good to point out as a reusable pattern rather than one-off code.

---

## 6. Frontend architecture

### 6.1 Route groups, explained visually

```
src/app/(auth)/login/page.js        → URL: /login
src/app/(dashboard)/admin/page.js   → URL: /admin
```

Parentheses around a folder name (`(auth)`, `(dashboard)`) tell Next.js: "group these files for my own organization, but don't add this name to the URL." This is purely a code-organization tool — `(auth)` groups the public-facing forms together, `(dashboard)` groups all 4 role dashboards together, each with their own shared `layout.js`.

### 6.2 The chrome-switching trick — `ClientShell.js`

```js
const DASHBOARD_PREFIXES = ["/admin", "/teacher", "/student", "/parent"];
const isDashboard = DASHBOARD_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"));
```

The public site (landing page, login, register) has a navbar + footer. The dashboards have their own sidebar and don't want that navbar/footer duplicated. `ClientShell` wraps the entire app once, at the root, and decides which chrome to show based on the current URL — one component instead of duplicating the navbar/footer logic per route group.

### 6.3 Server Component + Client Component handoff — `(dashboard)/layout.js` and `Sidebar.jsx`

```js
// (dashboard)/layout.js — a Server Component (no "use client")
export default async function DashboardLayout({ children }) {
  const user = await getAuthUser();          // real DB check, server-side
  if (!user) redirect("/login");
  return <Sidebar role={user.role} name={user.name}>{children}</Sidebar>;
}
```

```jsx
// Sidebar.jsx — a Client Component ("use client" at the top)
export default function Sidebar({ role, name, children }) {
  const pathname = usePathname();   // only works client-side
  // renders the nav links, highlights the active one, has a working "Sign out" button
}
```

This is a good one to slow down on if your audience is learning React/Next.js: `layout.js` is a **Server Component** — it runs only on the server, can directly call `await getAuthUser()` (touching cookies and the database), and never ships its code to the browser. It can't use `onClick` or `useState`, though. So it does the security-sensitive work (confirm who's logged in) and then hands the *result* (`role`, `name`) down as plain props to `Sidebar`, which **is** a Client Component — it runs in the browser, so it can use `usePathname()` to highlight the current nav link and attach a real `onClick` to the sign-out button. Neither component could do the other's job; splitting the work this way is the idiomatic Next.js pattern.

### 6.4 Client-side data fetching pattern

Nearly every dashboard page follows this shape:

```jsx
"use client";
export default function SomePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/whatever").then(async (res) => {
      const json = await res?.json();
      if (res?.ok) setData(json.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;
  return (/* render data */);
}
```

`apiFetch` (in `app/lib/api.js`) is a thin wrapper around `fetch` that always sends `credentials: "include"` (so the httpOnly cookie is sent along automatically) and redirects to `/login` if the server ever responds `401`. Worth mentioning: because this is a **Client Component** fetching its own data in `useEffect`, the very first HTML sent from the server shows the *loading* state — the actual data only appears after the browser runs the JavaScript and the fetch resolves. That's a deliberate simplicity trade-off for this project (vs. fetching data directly in a Server Component, which is more efficient but was out of scope here).

---

## 7. A feature walkthrough, end to end

Pick **Grades** to walk through live — it touches every layer:

1. **Model** (`models/Grade.js`, §3.2) — defines the shape.
2. **API route** (`api/grades/route.js`, §5.3) — `GET` is role-scoped, `POST` requires `teacher`/`admin`.
3. **Teacher UI** (`(dashboard)/teacher/grades/page.js`) — picks a student, picks a `Subject` from a dropdown (fetched from `/api/subjects`), fills in `examType`/`marksObtained`/`totalMarks`/`remarks`, submits → `POST /api/grades`.
4. **Student UI** (`(dashboard)/student/grades/page.js`) — calls `GET /api/grades` with no `studentId` (the API infers "my own" from the logged-in user), shows a percentage-colored table.
5. **Parent UI** (`(dashboard)/parent/page.js`) — picks a child from a list, calls `GET /api/grades?studentId=<childId>` — this is the one that goes through the `ownsChild` check.

Other complete features you can walk the same way: **Attendance** (near-identical pattern), **Fees** (admin creates/marks-paid, parent views read-only), **Announcements** (one shared `AnnouncementsList` component, §8, powers all 4 roles' views), **Messages** (a small 1:1 chat system between teachers and parents).

---

## 8. Shared UI components (don't repeat yourself)

- **`components/ui/Icons.jsx`** — every icon in the app is a small hand-written inline SVG component (no icon library dependency). Point out `OverviewIcon`, `UsersIcon`, etc. — each is ~5 lines of SVG path data wrapped in a shared `<Icon>` helper that sets consistent stroke width/size.
- **`components/shared/AnnouncementsList.jsx`** — one component, used by *all four* role dashboards. A `canManage` boolean prop toggles whether the create-form and delete buttons show up. This is worth highlighting as a "don't repeat yourself" example: instead of 4 nearly-identical announcement pages, there's 1 shared component + 4 one-line wrapper pages that just render it with different props.
- **`components/shared/MessagesPanel.jsx`** — same idea for the messaging UI: one chat component, and each role's page just resolves *who it's allowed to message* differently (teachers → parents of their students; parents → any teacher) before handing that contact list to the shared panel.

---

## 9. Design system — `globals.css`

Everything visual is driven by CSS custom properties defined once at the top:

```css
:root {
  --bg: #0d1117;       /* page background */
  --surface: #161b22;  /* card background */
  --accent: #4f7ef8;   /* primary blue */
  --text: #e6edf3;     /* primary text */
  --radius-lg: 14px;
  /* ...etc */
}
```

Every component then uses `var(--accent)` instead of hardcoding `#4f7ef8`. Worth explaining: this is what makes it possible to change the entire app's color scheme by editing ~15 lines in one place, instead of hunting through every file. Below the tokens, classes like `.card`, `.btn`, `.badge`, `.table-wrap`, `.stat-card` are the actual reusable visual building blocks used across every dashboard page — point out how the same `.card` class looks identical whether it's wrapping a form, a stat number, or a table.

---

## 10. Bugs we found and fixed (good "war stories" to present)

These are worth telling as stories, not just facts — they show *how* the code was hardened, which is often more interesting to an audience than the finished result:

1. **Leaked password hashes via `populate()`** (§4.6) — an unrestricted `.populate("userId")` pulled the entire `User` document, hash included, into a parent's fee list. Fixed by always specifying `select` on any populate that touches `User`.
2. **`MissingSchemaError` from model-registration order** (§3.4) — a route calling `.populate("subjects")` crashed with "Schema hasn't been registered," but only when it happened to be the *first* route hit after a server restart. Fixed with a single side-effect-only import file (`models/index.js`) that guarantees every model is registered before any query runs, regardless of request order.
3. **A leaked real database credential** — early in the project, a real MongoDB Atlas connection string ended up in `.env.local.example` (a file meant to be safely committed to git as a template). Caught before it was ever committed; fixed by moving the real value to the gitignored `.env.local` and replacing the example file with placeholder text.

---

## Quick reference: where to look for X

| I want to explain… | Open this file |
|---|---|
| How login works | `api/auth/login/route.js` + `lib/jwt.js` |
| How a page decides "you're not allowed here" | `proxy.js` |
| How the database is structured | `src/models/*.js` |
| How one API endpoint is built | `api/grades/route.js` (good all-rounder example) |
| How the sidebar/dashboard shell works | `(dashboard)/layout.js` + `components/layout/Sidebar.jsx` |
| The visual design system | `app/globals.css` |
| A shared component reused across roles | `components/shared/AnnouncementsList.jsx` |
