"use client";
import { useState } from "react";
import { Send, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

const categories = ["Love","Funny","Coding","Rant","College Life","Other"];

export function SubmitForm() {
  const router = useRouter();
  const [content,setContent] = useState("");
  const [category,setCategory] = useState("Other");
  const [agree,setAgree] = useState(false);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (content.trim().length < 10) return setMessage("Please write at least 10 characters.");
    if (!agree) return setMessage("Please accept the Terms and Community Guidelines.");
    setBusy(true);
    try {
      const res = await fetch("/api/confessions", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content,category})});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit.");
      setContent("");
      setMessage("Submitted successfully. Your confession is pending moderation.");
      router.refresh();
    } catch(e:any) { setMessage(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <form onSubmit={submit} className="cg-card rounded-3xl p-6 md:p-8">
        <div className="mb-7">
          <div className="text-3xl">📨</div>
          <h1 className="mt-3 text-3xl font-black">Share Your Confession</h1>
          <p className="mt-2 text-[#8f9ab8]">It’s anonymous publicly. Be honest, respectful and responsible.</p>
        </div>
        <label className="text-sm font-semibold">Your confession *</label>
        <textarea value={content} onChange={e=>setContent(e.target.value.slice(0,1000))} className="cg-input mt-2 min-h-44 resize-y" placeholder="Type your confession here..." />
        <div className="mt-1 text-right text-xs text-[#71809f]">{content.length}/1000</div>
        <label className="mt-5 block text-sm font-semibold">Category *</label>
        <select value={category} onChange={e=>setCategory(e.target.value)} className="cg-input mt-2">{categories.map(c=><option key={c}>{c}</option>)}</select>
        <label className="mt-5 flex gap-3 text-sm text-[#aeb7cf]"><input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} className="mt-1"/>I agree to the <a href="/terms" className="text-violet-400">Terms</a> and <a href="/guidelines" className="text-violet-400">Community Guidelines</a>.</label>
        {message && <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/10 p-3 text-sm text-violet-200">{message}</div>}
        <button disabled={busy} className="cg-btn cg-primary mt-6 flex w-full items-center justify-center gap-2 disabled:opacity-50">{busy?"Submitting...":<><Send size={17}/> Submit Anonymously</>}</button>
      </form>
      <aside className="cg-card h-fit rounded-3xl p-6">
        <ShieldCheck className="text-violet-400"/>
        <h2 className="mt-4 font-bold">Keep in mind</h2>
        <ul className="mt-4 space-y-4 text-sm leading-6 text-[#929db8]">
          <li>• Be respectful and kind.</li><li>• No harassment, threats or hate.</li><li>• Do not share private personal information.</li><li>• No explicit or illegal content.</li><li>• Posts can be moderated or removed.</li>
        </ul>
      </aside>
    </div>
  );
}