import Link from "next/link";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";

type Confession = {
  id: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  created_at: string;
};

const colors: Record<string, string> = {
  Love: "text-pink-300 bg-pink-500/10 border-pink-500/20",
  Funny: "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
  Coding: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20",
  Rant: "text-red-300 bg-red-500/10 border-red-500/20",
  "College Life": "text-violet-300 bg-violet-500/10 border-violet-500/20",
  Other: "text-slate-300 bg-slate-500/10 border-slate-500/20",
};

export function ConfessionCard({ confession }: { confession: Confession }) {
  return (
    <article className="cg-card rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xs font-bold">🤫</div>
          <div>
            <div className="text-sm font-semibold">Anonymous</div>
            <div className="text-xs text-[#7f8aaa]">{new Date(confession.created_at).toLocaleDateString()}</div>
          </div>
        </div>
        <MoreHorizontal size={18} className="text-[#7f8aaa]" />
      </div>
      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${colors[confession.category] ?? colors.Other}`}>
        {confession.category}
      </span>
      <p className="mt-4 whitespace-pre-wrap leading-7 text-[#e8ebf6]">{confession.content}</p>
      <div className="mt-5 flex items-center justify-between border-t border-[#202947] pt-4 text-sm text-[#8f9ab8]">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><Heart size={16}/> {confession.likes}</span>
          <span className="flex items-center gap-1"><MessageCircle size={16}/> {confession.comments}</span>
        </div>
        <Link href={`/confession/${confession.id}`} className="font-semibold text-violet-400 hover:text-violet-300">View →</Link>
      </div>
    </article>
  );
}