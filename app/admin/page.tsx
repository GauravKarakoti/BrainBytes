import { getIsAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import LoadingSVG from "@/public/img/icons/loader.svg";

const AdminApp = dynamic(() => import("@/components/admin/App"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <LoadingSVG className="size-8 animate-spin" />
    </div>
  ),
});

const AdminPage = async () => {
  const isAdmin = await getIsAdmin();

  if (!isAdmin) {
    redirect("/");
  }

  return <AdminApp />;
};

export default AdminPage;