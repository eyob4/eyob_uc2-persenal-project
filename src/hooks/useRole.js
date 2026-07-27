import { useAuth } from "@/hooks/useAuth";

export function useRole() {
  return useAuth().user?.role ?? null;
}
