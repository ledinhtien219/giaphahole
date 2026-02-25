import MemberForm from "@/components/MemberForm";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function NewMemberPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-stone-200/40 rounded-full blur-[100px] pointer-events-none" />

      <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-md border-b border-stone-200/60 shadow-sm transition-all duration-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-800">
            Thêm Thành Viên Mới
          </h1>
          <a
            href="/dashboard"
            className="text-stone-500 hover:text-stone-800 font-medium text-sm transition-colors"
          >
            Hủy
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 w-full">
        <MemberForm isAdmin={isAdmin} />
      </main>
    </div>
  );
}
