# School Management System (SMS)

## Project Overview

This project is a school management system built with Next.js, React, Tailwind CSS, Express-style API routing, and MongoDB data models. It supports role-based access for admins, teachers, students, and parents.

The goal is to provide a complete school portal experience that includes:
- admin user and student management
- class, subject, fee, grade, attendance, announcement, and messaging workflows
- role-specific dashboards for each user type
- JWT authentication and secure login/register flows
- a modern user interface with responsive layout

> Note: This project is currently implemented in Next.js with backend-style API routes and database models. A separate `document.md` file exists for a planned HTML/CSS/JavaScript remake with mock data.

---

## Key Features

- Role-based dashboards for Admin, Teacher, Student, and Parent
- User authentication and session handling
- Student and parent profile management
- Grade tracking and attendance reporting
- Fee management and announcements
- Messaging between users
- Clean UI components and dashboard navigation

---

## Project Structure

```text
src/
  app/
    (auth)/            # auth pages: login, register, forgot/reset password
    (dashboard)/       # dashboard and role-specific pages
    api/               # Next.js API route handlers
    lib/               # shared client utilities
  components/          # reusable UI components
  context/             # auth context and hooks
  hooks/               # custom React hooks
  lib/                 # server-side utilities and helpers
  models/              # Mongoose data models
```

### Important files

- `src/app/page.js` - public landing page
- `src/app/(auth)/login/page.js` - login page
- `src/app/(auth)/register/page.js` - registration page
- `src/app/(dashboard)` - role-based dashboard pages
- `src/app/api/*/route.js` - API route handlers for entities
- `src/lib/mongodb.js` - MongoDB client connection helper
- `src/models/*.js` - database schemas and models
- `document.md` - design and remake documentation for HTML/CSS/JS version

---

## Installation

Install dependencies from the project root:

```bash
npm install
```

> If you use `yarn`, you can run `yarn install` instead.

---

## Running the App

Start the development server:

```bash
npm run dev
```

Then open the app at:

```text
http://localhost:3000
```

---

## Available Scripts

- `npm run dev` - run the Next.js development server
- `npm run build` - build the production app
- `npm run start` - start the production server
- `npm run lint` - run ESLint on the project

---

## How to Use the Project

### Public pages
- `index` - landing page showing features and role descriptions
- `login` - sign in with existing credentials
- `register` - create a new account
- `forgot-password` - recover an account by email
- `reset-password` - set a new password after recovery

### Dashboard pages
Each signed-in role has a separate dashboard layout:
- `admin` - manage users, students, classes, subjects, fees, announcements
- `teacher` - record grades, attendance, messages, announcements
- `student` - view grades, profile, announcements
- `parent` - view child data, fees, announcements, messages

### API routes
Mock or real API routes are available for:
- `users`
- `students`
- `teachers`
- `parents`
- `classes`
- `subjects`
- `fees`
- `grades`
- `attendance`
- `announcements`
- `messages`

These routes live under `src/app/api` and are used by the client to fetch and manage data.

---

## Data and Auth

The application is designed to work with MongoDB and JWT authentication.
- `src/models` contains all database schemas
- `src/lib/jwt.js` handles token creation and validation
- `src/lib/auth.js` includes helpers for password hashing and auth checks

If you want to run the app with a local database, configure your `.env` file with the appropriate MongoDB URI and secret keys.

---

## Dark Mode and UI

The project uses a dark dashboard theme by default. UI elements are styled with a modern card-based layout and consistent color system.

If you want to make a full light/dark theme toggle, add CSS mode variables and a theme switcher in the layout component.

---

## Development Notes

- The repo is built using Next.js 16 and React 19.
- Tailwind CSS is configured via `tailwindcss` and `@tailwindcss/postcss`.
- The app uses a hybrid approach: static pages and dynamic API routes.

---

## Recommended Next Steps

- Review `document.md` to see the HTML/CSS/JS remake plan
- Add a real backend or mock API for rapid prototyping
- Implement role-based routing and auth state persistence
- Add theme toggling if you want both dark and light modes

---

## Contact

If you need help extending or adapting this project, use the codebase structure in `src/` as the starting point. The `document.md` file also provides a full rebuild plan for a static version.
