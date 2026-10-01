import { getSupabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/CommentForm";
import { Heart, MessageCircle } from "lucide-react";
import { ReportButton } from "@/components/ReportButton";

export const dynamic = "force-dynamic";

export default async function Detail({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  let confession:any=null, comments:any[]=[];
  try {
    const s=getSupabaseAdmin();
    const [c,cm]=await Promise.all([
      s.from("confessions").select("id,content,category,likes,comments,created_at").eq("id",id).eq("status","approved").single(),
      s.from("comments").select("id,content,created_at").eq("confession_id",id).eq("status","approved").order("created_at",{ascending:true})
    ]);
    confession=c.data; comments=cm.data??[];
  } catch {}
  if(!confession) notFound();

  return <section className="mx-auto max-w-3xl px-5 py-12">
    <div className="cg-card rounded-3xl p-6 md:p-8">
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">{confession.category}</span>
        <span className="text-xs text-[#71809f]">{new Date(confession.created_at).toLocaleString()}</span>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500">🤫</div>
        <div className="font-semibold">Anonymous</div>
      </div>
      <p className="mt-6 whitespace-pre-wrap text-lg leading-8 text-[#e8ebf6]">{confession.content}</p>
      <div className="mt-6 flex gap-5 border-t border-[#202947] pt-5 text-sm text-[#9aa5bf]">
        <span className="flex gap-1"><Heart size={17}/> {confession.likes}</span>
        <span className="flex gap-1"><MessageCircle size={17}/> {comments.length}</span>
      </div>
      <ReportButton id={id}/>
    </div>
    <div className="mt-6 cg-card rounded-3xl p-6">
      <h2 className="text-xl font-bold">Anonymous comments ({comments.length})</h2>
      <div className="mt-5 space-y-4">
        {comments.map(c=><div key={c.id} className="rounded-2xl bg-[#080d1d] p-4">
          <div className="text-xs text-[#71809f]">Anonymous · {new Date(c.created_at).toLocaleDateString()}</div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#dbe0ed]">{c.content}</p>
        </div>)}
      </div>
      <CommentForm confessionId={id}/>
    </div>
  </section>;
}
