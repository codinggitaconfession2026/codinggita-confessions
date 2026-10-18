import { getSupabaseAdmin } from "@/lib/supabase";
import { ConfessionCard } from "@/components/ConfessionCard";

export const dynamic = "force-dynamic";

export default async function Confessions({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const category = params.category;
  let rows: any[] = [];
  try {
    const supabase = getSupabaseAdmin();
    let q = supabase.from("confessions").select("id,content,category,likes,comments,created_at").eq("status","approved").order("created_at",{ascending:false}).limit(50);
    if (category && category !== "All") q = q.eq("category", category);
    const { data } = await q;
    rows = data ?? [];
  } catch {}

  const cats = ["All","Love","Funny","Coding","Rant","College Life","Other"];
  return (
    <section className="mx-auto max-w-7xl px-5 py-12">
      <div className="page-hero">
        <div>
          <span className="section-kicker">PUBLIC CONFESSIONS</span>
          <h1 className="text-4xl font-black">Confessions</h1>
          <p className="mt-2 text-[#8f9ab8]">Approved anonymous posts are visible to everyone — no account required.</p>
        </div>
      </div>
      <div className="my-7 flex flex-wrap gap-2">
        {cats.map(c => <a key={c} href={c==="All"?"/confessions":`/confessions?category=${encodeURIComponent(c)}`} className={`rounded-full border px-4 py-2 text-sm ${category===c || (!category && c==="All") ? "border-violet-500 bg-violet-500/15 text-violet-200":"border-[#202947] bg-[#0b1022] text-[#9da8c3]"}`}>{c}</a>)}
      </div>
      {rows.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{rows.map(c=><ConfessionCard key={c.id} confession={c}/>)}</div> :
        <div className="cg-card rounded-2xl p-10 text-center text-[#8f9ab8]">No approved confessions yet. Be the first to submit one.</div>}
    </section>
  );
}
