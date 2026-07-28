# School Management System Rebuild Documentation

## 1. Project Goal

Rebuild the current School Management System website using plain HTML, CSS, and JavaScript with mock data only. The goal is to recreate the same user experience, dashboard structure, and role-based pages without using React, Next.js, or a backend.

This remake should focus on:
- a modern and responsive UI
- role-based navigation for admin, teacher, student, and parent
- realistic demo data shown directly in the browser
- interactive dashboard pages with tables, cards, forms, and tabs

---

## 2. Project Overview

The original website is a school management portal with the following main areas:
- landing page
- authentication pages
- admin dashboard
- teacher dashboard
- student dashboard
- parent dashboard
- management screens for users, students, classes, subjects, fees, announcements, and messages

The HTML/CSS/JS version should preserve the same overall structure and visual style while simplifying the implementation with mock data.

---

## 3. Target Users

### Admin
- manage users
- manage students
- manage teachers and parents
- manage classes and subjects
- monitor fees and announcements

### Teacher
- view announcements
- manage grades
- record attendance
- send or view messages

### Student
- view personal profile
- see grades and performance
- read announcements

### Parent
- view child-related information
- check fees
- receive announcements and messages

---

## 4. Main Pages to Recreate

### 4.1 Landing Page
Purpose:
- introduce the product
- explain system features
- provide navigation to login and register

Sections:
- hero section
- feature cards
- role overview cards
- call-to-action buttons

### 4.2 Authentication Pages
Pages:
- login
- register
- forgot password
- reset password

Features:
- form fields
- validation feedback
- demo login buttons
- success/error states

### 4.3 Dashboard Pages
Each role has a dashboard with a different layout and content.

#### Admin Dashboard
- overview stats
- users table
- students table
- quick action cards

#### Teacher Dashboard
- attendance summary
- grade overview
- announcements panel
- messages panel

#### Student Dashboard
- student profile card
- grade table
- announcements list

#### Parent Dashboard
- child summary
- fee status
- announcements and messages

### 4.4 Management Pages
- users management
- students management
- teachers management
- parents management
- classes management
- subjects management
- fees management
- announcements management

---

## 5. Recommended Website Structure

Use a static multi-page structure with shared CSS and JavaScript.

### Suggested File Structure

```text
project-root/
├── index.html
├── login.html
├── register.html
├── forgot-password.html
├── reset-password.html
├── dashboard-admin.html
├── dashboard-teacher.html
├── dashboard-student.html
├── dashboard-parent.html
├── users.html
├── students.html
├── teachers.html
├── parents.html
├── classes.html
├── subjects.html
├── fees.html
├── announcements.html
├── messages.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   └── mockData.js
└── assets/
```

Alternative approach:
- build a single-page app with sections and role switching
- easier for a small demo project
- less file organization but still acceptable

For this rebuild, the multi-page structure is recommended because it closely matches the original site structure.

---

## 6. UI/UX Requirements

### Layout
- modern dashboard layout
- sidebar on desktop
- top bar with page title and role badge
- content cards with spacing and shadows

### Visual Style
- clean school-themed interface
- soft blue and green color accents
- strong readable typography
- card-based content blocks
- consistent spacing system

### Responsive Behavior
- desktop: full sidebar + content area
- tablet: stacked layout
- mobile: collapsible sidebar and stacked cards

### Accessibility
- semantic HTML headings
- keyboard-friendly buttons and links
- visible focus states
- color contrast that remains readable

---

## 7. Design System

### Color Palette
Use these base colors:
- Primary: #4f7ef8
- Secondary: #6366f1
- Success: #10b981
- Warning: #f59e0b
- Danger: #ef4444
- Background: #f8fafc
- Text: #0f172a
- Muted text: #64748b
- Border: #e2e8f0

### Typography
- headings: Inter, Poppins, or Arial
- body text: system-ui, sans-serif

### Components
Build reusable UI components such as:
- buttons
- cards
- tables
- badges
- tabs
- alerts
- form inputs
- sidebar navigation
- stat cards

---

## 8. Mock Data Strategy

Since this remake will not connect to a real database, all content should come from JavaScript mock data files.

### Recommended Approach
Create a file named js/mockData.js that exports or declares data objects in a global structure.

### Suggested Data Categories
- users
- students
- teachers
- parents
- classes
- subjects
- grades
- attendance
- fees
- announcements
- messages

### Example Data Structure

```javascript
const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@schoolms.com',
    role: 'admin',
    status: 'active'
  },
  {
    id: 2,
    name: 'Alice Teacher',
    email: 'alice@schoolms.com',
    role: 'teacher',
    status: 'active'
  }
];

const mockStudents = [
  {
    id: 1,
    name: 'Daniel Kim',
    rollNumber: 'ST-101',
    className: 'Grade 10A',
    parentName: 'Sarah Kim',
    status: 'active'
  }
];
```

### Mock Data Rules
- keep the data realistic and structured
- include enough records for tables and stats
- make sure each role has relevant sample content
- use consistent naming and IDs

---

## 9. Data Model Requirements

### Users
Fields:
- id
- name
- email
- password (demo only)
- role
- status

### Students
Fields:
- id
- name
- rollNumber
- className
- parentName
- email
- status

### Teachers
Fields:
- id
- name
- email
- subject
- phone
- status

### Parents
Fields:
- id
- name
- email
- childName
- phone
- status

### Classes
Fields:
- id
- name
- section
- teacherName
- capacity

### Subjects
Fields:
- id
- name
- code
- teacherName

### Grades
Fields:
- id
- studentName
- subject
- examType
- term
- marksObtained
- totalMarks
- remarks

### Fees
Fields:
- id
- studentName
- amount
- dueDate
- status

### Announcements
Fields:
- id
- title
- message
- date
- audience

### Messages
Fields:
- id
- sender
- receiver
- subject
- preview
- time

---

## 10. Functional Requirements

### Authentication
- login form with email and password
- register form with full name, email, password, role
- forgot password page with email input
- reset password page with new password fields
- no real backend needed; demo login should simply redirect based on role

### Navigation
- sidebar links depending on user role
- active link highlight
- top bar showing current page

### Dashboard Interaction
- tabs for switching profile/grades/announcements
- clickable buttons for actions such as delete, view, edit
- simple modal or alert for form submission feedback

### Data Rendering
- render tables from mock data arrays
- show cards and summary statistics dynamically
- filter content by role or category

---

## 11. HTML Structure Guidelines

### Page Layout Pattern
Every page should follow this general structure:

```html
<body>
  <div class="app-shell">
    <aside class="sidebar">
      <!-- navigation -->
    </aside>

    <main class="main-content">
      <header class="topbar">
        <!-- page title and user info -->
      </header>

      <section class="content-area">
        <!-- page content -->
      </section>
    </main>
  </div>
</body>
```

### Reusable Sections
- page header section
- stat cards row
- content card
- table wrapper
- form container

---

## 12. CSS Requirements

### CSS File
Create a single main stylesheet:
- css/styles.css

### CSS Organization
Use sections such as:
- reset and base styles
- layout styles
- component styles
- page-specific styles
- responsive styles

### Styling Principles
- use CSS variables for colors and spacing
- keep styles modular
- avoid repeated inline styles
- use reusable classes like card, btn, table, badge

### Example Variables

```css
:root {
  --primary: #4f7ef8;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --bg: #f8fafc;
  --text: #0f172a;
  --muted: #64748b;
  --border: #e2e8f0;
}
```

---

## 13. JavaScript Requirements

### Main Script
Use js/app.js for:
- rendering page content
- handling navigation
- switching tabs
- showing demo notifications
- simulating login and logout

### Mock Data Script
Use js/mockData.js for:
- static arrays of data
- helper functions for filtering and formatting

### Suggested JS Functions
- renderDashboardStats()
- renderUsersTable()
- renderStudentsTable()
- renderAnnouncements()
- renderFees()
- renderMessages()
- handleLogin()
- handleRegister()
- toggleSidebar()

---

## 14. Suggested Development Plan

### Phase 1: Setup Foundation
- create project files
- add HTML skeleton
- create CSS variables and base layout
- add responsive layout rules

### Phase 2: Build Static Pages
- landing page
- login and register pages
- dashboard shell
- sidebar and top bar

### Phase 3: Add Mock Data
- populate arrays for users, students, classes, and other entities
- connect data to existing HTML containers

### Phase 4: Add Interactivity
- tabs
- filter buttons
- form validation messages
- demo login flow

### Phase 5: Polish UI
- spacing refinement
- hover effects
- table styling
- responsive improvements
- accessibility fixes

---

## 15. Page-by-Page Implementation Notes

### Landing Page
- show hero section
- feature cards
- role cards
- large call-to-action buttons

### Login Page
- email and password fields
- remember me checkbox
- login button
- link to register and forgot password

### Register Page
- full name
- email
- password
- confirm password
- role selection

### Dashboard Pages
- show top summary cards
- render tables from mock data
- use role-specific content

### Management Pages
- use a consistent table layout
- include action buttons such as view/edit/delete
- show empty state if no data available

---

## 16. Example Content for Demo Pages

### Example Admin Stats
- Total Users: 24
- Total Students: 180
- Total Teachers: 14
- Pending Fees: 12

### Example Student Grades
- Mathematics: 88/100
- Science: 91/100
- English: 84/100

### Example Parent Fees
- Tuition Fee: Paid
- Lab Fee: Pending
- Transport Fee: Pending

---

## 17. Testing Checklist

Verify that the remake includes:
- working navigation between pages
- role-based dashboards
- correct rendering of mock data
- responsive behavior on mobile and desktop
- no broken links or missing layouts
- readable typography and consistent styling

### Basic QA Checklist
- [ ] landing page loads correctly
- [ ] login page works visually
- [ ] admin dashboard shows stat cards and tables
- [ ] student dashboard shows profile and grades
- [ ] parent dashboard shows fees and announcements
- [ ] mobile layout is usable
- [ ] buttons and forms are styled consistently

---

## 18. Deliverables

The final remake should include:
- a complete HTML/CSS/JS version of the website
- mock data for all major modules
- interactive UI for dashboard views
- a responsive layout ready for presentation or further development

---

## 19. Recommended Scope for a First Version

To keep the rebuild manageable, the first version should include:
- landing page
- login/register/forgot/reset pages
- admin dashboard
- student dashboard
- parent dashboard
- teacher dashboard
- 3–4 management pages such as users, students, announcements, and fees

This gives a strong and complete demo without making the build too large.

---

## 20. Final Notes

This project should be treated as a frontend prototype that simulates the real application experience using mock data. The main purpose is to demonstrate the UI, workflow, and information structure of the School Management System in a simple static web build.

The rebuild should remain visually close to the original product while being easier to develop, test, and present.
