import { UserShell } from "@/components/layout/user-shell";
import { ProtectedRoute } from "@/components/protected-route";

export default function HistoryLayout({ children }) {
  return (
    <ProtectedRoute>
      <UserShell>{children}</UserShell>
    </ProtectedRoute>
  );
}
