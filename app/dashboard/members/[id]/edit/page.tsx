import MemberForm from "@/components/MemberForm";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMemberPage({ params }: PageProps) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin - strict check for editing
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-800">
            Truy cập bị từ chối
          </h1>
          <p className="text-stone-600 mt-2">
            Bạn không có quyền chỉnh sửa thành viên.
          </p>
        </div>
      </div>
    );
  }

  // Fetch Public Data
  const { data: person, error } = await supabase
    .from("persons")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !person) {
    notFound();
  }

  // Fetch Private Data
  const { data: privateData } = await supabase
    .from("person_details_private")
    .select("*")
    .eq("person_id", id)
    .single();

  const initialData = { ...person, ...privateData };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] -right-[10%] w-[400px] h-[400px] bg-stone-300/20 rounded-full blur-[100px] pointer-events-none" />

      <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-md border-b border-stone-200/60 shadow-sm transition-all duration-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-800">
            Chỉnh Sửa Thành Viên
          </h1>
          <a
            href={`/dashboard/members/${id}`}
            className="text-stone-500 hover:text-stone-800 font-medium text-sm transition-colors"
          >
            Hủy
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 w-full">
        <MemberForm initialData={initialData} isEditing={true} isAdmin={true} />
      </main>
    </div>
  );
}
