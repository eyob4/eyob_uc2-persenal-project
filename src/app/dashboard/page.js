import Link from "next/link";

const roles = [
  { key: "admin", label: "Admin Dashboard" },
  { key: "teacher", label: "Teacher Dashboard" },
  { key: "student", label: "Student Dashboard" },
  { key: "parent", label: "Parent Dashboard" },
];

export default function DashboardRoot() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-orange-50">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-orange-800 bg-slate-950/95 p-10 shadow-2xl shadow-black/70">
        <h1 className="text-3xl font-semibold text-white">SMS Dashboards</h1>
        <p className="mt-3 text-orange-300">Choose the role you want to preview, or login to see real data.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {roles.map((role) => (
            <Link
              key={role.key}
              href={`/dashboard/${role.key}`}
              className="rounded-3xl border border-orange-700 bg-orange-950/80 px-6 py-5 text-center text-lg font-medium text-orange-100 transition hover:bg-orange-900"
            >
              {role.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
