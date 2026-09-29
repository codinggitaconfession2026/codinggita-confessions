"use client";
import { useState } from "react";
export function CommentForm({confessionId}:{confessionId:string}) {
  const [content,setContent]=useState(""); const [msg,setMsg]=useState("");
  async function submit(e:React.FormEvent){e.preventDefault();setMsg("");const r=await fetch("/api/comments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({confessionId,content})});const d=await r.json();if(!r.ok)return setMsg(d.error||"Failed");setContent("");setMsg("Comment submitted for moderation.");}
  return <form onSubmit={submit} className="mt-6 border-t border-[#202947] pt-5"><textarea value={content} onChange={e=>setContent(e.target.value.slice(0,500))} className="cg-input min-h-24" placeholder="Add an anonymous comment..."/><div className="mt-3 flex items-center justify-between"><span className="text-xs text-[#71809f]">{msg}</span><button className="cg-btn cg-primary">Comment</button></div></form>;
}