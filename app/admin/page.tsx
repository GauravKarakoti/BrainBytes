import { redirect } from "next/navigation";

import { getIsAdmin } from "@/lib/admin";

const AdminPage = () => {
  const isAdmin = getIsAdmin();

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Admin panel coming soon...
      </p>
    </div>
  );
};

export default AdminPage;
