import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }) {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <Sidebar role={user.role} name={user.name}>
      {children}
    </Sidebar>
  );
}
