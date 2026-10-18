"use client";
import { useEffect, useState } from "react";

export default function Admin() {
  const [posts, setPosts] = useState<any[]>([]);
  const [confessions, setConfessions] = useState<any[]>([]);
  const [approvedConfessions, setApprovedConfessions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [kind, setKind] = useState("post");
  const [asset, setAsset] = useState("");
  const [caption, setCaption] = useState("");
  const [supportUser, setSupportUser] = useState<any>(null);
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [supportText, setSupportText] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    const r = await fetch("/api/admin/data");
    if (r.ok) { const j = await r.json(); setPosts(j.posts || []); setConfessions(j.confessions || []); setApprovedConfessions(j.approvedConfessions || []); setReports(j.reports || []); setPendingUsers(j.pendingUsers || []); }
  }
  useEffect(() => { load(); }, []);

  async function moderate(id: string, status: string) {
    const r = await fetch("/api/admin/moderate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action: status === "approved" ? "approve" : "reject", type: "post" }) });
    if (r.ok) setPosts(posts.filter(p => p.id !== id)); else setNotice((await r.json()).error || "Moderation failed");
  }

  async function moderateUser(id: string, status: string) {
    const r = await fetch("/api/admin/moderate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action: status === "approved" ? "approve" : "reject", type: "user" }) });
    if (r.ok) setPendingUsers(pendingUsers.filter(u => u.id !== id)); else setNotice((await r.json()).error || "Account update failed");
  }

  async function openSupport(user: any, label?: string) {
    if (!user?.id) { setNotice("This account has no linked user ID."); return; }
    setSupportUser({ id: user.id, label: label || user.display_name || user.username || "Student" });
    const r = await fetch(`/api/admin/support?user_id=${encodeURIComponent(user.id)}`);
    const j = await r.json(); setSupportMessages(j.messages || []); setNotice("You can message this student privately.");
  }

  async function sendSupport() {
    if (!supportUser || !supportText.trim()) return;
    const r = await fetch("/api/admin/support", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ user_id: supportUser.id, content: supportText.trim() }) });
    const j = await r.json();
    if (!r.ok) { setNotice(j.error || "Message failed"); return; }
    setSupportText(""); const rr = await fetch(`/api/admin/support?user_id=${encodeURIComponent(supportUser.id)}`); const jj = await rr.json(); setSupportMessages(jj.messages || []);
  }

  function generate(p: any) { setAsset(p.content); setCaption(`Anonymous CodingGita confession #${p.id.slice(0, 6)}\n\n${p.content}\n\n#CodingGita #Confessions`); }
  function download() {
    const text = asset || "CodingGita Confessions";
    const width = 1080;
    const height = kind === "story" ? 1920 : 1080;
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setNotice("Could not create the image on this browser."); return; }
    ctx.fillStyle = "#070914"; ctx.fillRect(0, 0, width, height);
    const glowA = ctx.createRadialGradient(180, 210, 10, 180, 210, 430);
    glowA.addColorStop(0, "#6d28d9aa"); glowA.addColorStop(1, "#6d28d900");
    ctx.fillStyle = glowA; ctx.fillRect(0, 0, width, height);
    const glowB = ctx.createRadialGradient(970, height * 0.72, 10, 970, height * 0.72, 420);
    glowB.addColorStop(0, "#0891b255"); glowB.addColorStop(1, "#0891b200");
    ctx.fillStyle = glowB; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#ffffff28"; ctx.lineWidth = 2; ctx.strokeRect(54, 54, width - 108, height - 108);
    const accent = ctx.createLinearGradient(90, 0, 430, 0);
    accent.addColorStop(0, "#8b5cf6"); accent.addColorStop(0.55, "#ec4899"); accent.addColorStop(1, "#22d3ee");
    ctx.fillStyle = accent; ctx.fillRect(90, 105, 135, 9);
    ctx.fillStyle = "#c4b5fd"; ctx.font = "800 28px Arial"; ctx.fillText("CODINGGITA CONFESSIONS", 90, kind === "story" ? 310 : 235);
    ctx.fillStyle = "#f8fafc"; ctx.font = "900 " + (kind === "story" ? "64px" : "58px") + " Arial";
    ctx.fillText("Someone had to say it.", 90, kind === "story" ? 410 : 320);
    const words = text.split(/\s+/);
    const fontSize = kind === "story" ? 48 : 42;
    ctx.font = "600 " + fontSize + "px Arial";
    const maxWidth = width - 180; let line = ""; const lines: string[] = [];
    for (const word of words) {
      const candidate = line ? line + " " + word : word;
      if (ctx.measureText(candidate).width > maxWidth && line) { lines.push(line); line = word; }
      else line = candidate;
    }
    if (line) lines.push(line);
    const maxLines = kind === "story" ? 15 : 8;
    const visibleLines = lines.slice(0, maxLines);
    ctx.fillStyle = "#f8fafc";
    visibleLines.forEach((value, index) => ctx.fillText(value, 90, (kind === "story" ? 535 : 415) + index * (kind === "story" ? 72 : 58)));
    if (lines.length > maxLines) { ctx.fillStyle = "#c4b5fd"; ctx.font = "600 32px Arial"; ctx.fillText("…", 90, (kind === "story" ? 535 : 415) + maxLines * (kind === "story" ? 72 : 58)); }
    ctx.fillStyle = "#a1a1aa"; ctx.font = "26px Arial";
    ctx.fillText("@codinggitaconfessions  ·  ANONYMOUS", 90, height - 125);
    canvas.toBlob((blob) => {
      if (!blob) { setNotice("Image export failed. Please try another browser."); return; }
      const url = URL.createObjectURL(blob); const a = document.createElement("a");
      a.href = url; a.download = "codinggita-" + kind + ".png"; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  function reel() {
    const text = asset || "CodingGita Confessions";
    const c=document.createElement("canvas"); c.width=1080;c.height=1920;
    const x=c.getContext("2d")!;
    const stream=c.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1") ? "video/mp4;codecs=avc1" : "video/webm";
    const rec=new MediaRecorder(stream,{mimeType});
    const chunks:Blob[]=[];
    rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
    rec.onstop=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(chunks,{type:"video/webm"}));a.download=mimeType.startsWith("video/mp4")?"codinggita-confession-reel.mp4":"codinggita-confession-reel.webm";a.click();};
    rec.start();
    let frame=0;
    const lines=(text.match(/.{1,27}(?:\s|$)/g)||[text]).slice(0,15).map(v=>v.trim());
    const timer=setInterval(()=>{
      const g=x.createLinearGradient(0,0,1080,1920);g.addColorStop(0,"#070914");g.addColorStop(.5,"#17102e");g.addColorStop(1,"#061a25");
      x.fillStyle=g;x.fillRect(0,0,1080,1920);
      x.globalAlpha=.18;x.fillStyle="#a855f7";x.beginPath();x.arc(170,360,260,0,Math.PI*2);x.fill();
      x.fillStyle="#22d3ee";x.beginPath();x.arc(930,1400,300,0,Math.PI*2);x.fill();x.globalAlpha=1;
      x.fillStyle="#a78bfa";x.fillRect(70,115,940,8);
      x.fillStyle="white";x.font="900 64px Arial";x.fillText("CodingGita Confessions",70,260);
      x.font="900 42px Arial";x.fillStyle="#a78bfa";x.fillText("SOMEONE HAD TO SAY IT.",70,345);
      x.font="600 48px Arial";x.fillStyle="#f8fafc";lines.forEach((line,i)=>x.fillText(line,70,500+i*78));
      x.fillStyle="#94a3b8";x.font="28px Arial";x.fillText("@codinggitaconfessions · Anonymous",70,1780);
      frame++;if(frame>180){clearInterval(timer);rec.stop();}
    },33);
  }

  return <main className="shell admin-page">
    <div className="admin-header">
      <div><span className="section-kicker">MODERATOR CONSOLE</span><h1>Admin dashboard</h1><p>Review new accounts and submissions, handle reports and prepare approved content.</p></div>
      <a className="btn" href="/api/admin/logout">Logout</a>
    </div>
    {notice && <div className="notice">{notice}</div>}
    <div className="admin-stat-grid">
      <div className="stat-card"><span>PENDING ACCOUNTS</span><b>{pendingUsers.length}</b></div>
      <div className="stat-card"><span>PENDING CONFESSIONS</span><b>{confessions.length}</b></div>
      <div className="stat-card"><span>OPEN REPORTS</span><b>{reports.length}</b></div>
      <div className="stat-card"><span>CONTENT STUDIO</span><b>Ready</b></div>
    </div>

    <section className="card admin-section" style={{marginBottom:16}}>
      <div className="split"><div><h2>Pending accounts</h2><p className="muted">New student accounts must be approved before they can sign in.</p></div></div>
      {pendingUsers.length === 0 && <p className="muted">No pending accounts.</p>}
      {pendingUsers.map(u => <div className="moditem" key={u.id}>
        <span className="pill">Pending</span>
        <p><b>{u.display_name || u.username}</b> <span className="muted">@{u.username}</span><br/><span className="muted">{u.email || "Email hidden"} · {new Date(u.created_at).toLocaleString()}</span></p>
        <div className="row"><button className="btn primary small" onClick={() => moderateUser(u.id, "approved")}>Approve</button><button className="btn danger small" onClick={() => moderateUser(u.id, "rejected")}>Reject</button><button className="btn small" onClick={() => openSupport(u, `${u.display_name || "Student"} (@${u.username})`)}>Chat</button></div>
      </div>)}
    </section>

    <div className="admin-grid">
      <section className="card admin-section">
        <div className="split"><div><h2>Pending anonymous confessions</h2><p className="muted">Approve a confession to make it public. Only approved content should go to Instagram.</p></div></div>
        {confessions.length === 0 && <p className="muted">No pending confessions.</p>}
        {confessions.map(p => <div className="moditem" key={p.id}>
          <span className="pill">{p.category}{p.status === "flagged" ? " · Flagged" : ""}</span><p>{p.content}</p>
          <div className="row">
            <button className="btn primary small" onClick={async()=>{const r=await fetch("/api/admin/moderate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:p.id,action:"approve",type:"confession"})});if(r.ok){setConfessions(confessions.filter(x=>x.id!==p.id));setApprovedConfessions([{id:p.id,content:p.content,category:p.category,created_at:p.created_at},...approvedConfessions.filter(x=>x.id!==p.id)])}else setNotice((await r.json()).error||"Approval failed")}}>Approve & publish</button>
            <button className="btn danger small" onClick={async()=>{const r=await fetch("/api/admin/moderate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:p.id,action:"reject",type:"confession"})});if(r.ok)setConfessions(confessions.filter(x=>x.id!==p.id));else setNotice((await r.json()).error||"Rejection failed")}}>Reject</button>
            
          </div>
        </div>)}
      </section>
      <section className="card admin-section"><h2>Private student chat</h2><p className="muted">Chat privately with a pending or post author when context is needed.</p>
        {!supportUser ? <div className="empty"><p>Select “Chat” from a pending account or “Chat with author” from a pending post.</p></div> : <><div className="notice"><b>{supportUser.label}</b></div><div className="support-thread">{supportMessages.map(m => <div className={`bubble ${m.sender_role === "admin" ? "adminbubble" : ""}`} key={m.id}><b>{m.sender_role === "admin" ? "You / Admin" : "Student"}</b><div>{m.content}</div><small className="muted">{new Date(m.created_at).toLocaleString()}</small></div>)}</div><div className="row"><input className="grow" value={supportText} onChange={e => setSupportText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendSupport(); }} placeholder="Message the student privately..." maxLength={2000}/><button className="btn primary" onClick={sendSupport}>Send</button></div></>}
      </section>
    </div>

    <section className="card admin-section" style={{marginTop:16}}>
      <h2>Instagram content studio</h2><p className="muted">Pick an approved confession, choose a format, then generate an aesthetic downloadable asset. Publishing to Instagram itself stays manual until official Meta API credentials are configured.</p>
      <div className="grid two">
        <select value={kind} onChange={e => setKind(e.target.value)}><option value="post">Square Post · 1080×1080</option><option value="story">Story · 1080×1920</option><option value="reel">Reel · 1080×1920</option></select>
        <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption"/>
      </div>
      <div className="mt-4"><p className="muted">Approved confessions · select one to design a post/story/reel</p>{approvedConfessions.length === 0 ? <p className="muted">Approve a confession above first. It will appear here.</p> : <div className="mt-3 grid gap-2">{approvedConfessions.map(p => <div key={p.id} className="moditem"><p>{p.content}</p><div className="row"><span className="pill">{p.category}</span><button className="btn small" onClick={() => generate(p)}>Use this confession</button></div></div>)}</div>}</div><textarea value={asset} onChange={e => setAsset(e.target.value)} placeholder="Select an approved confession above or edit the text here"/>
      <div className="row"><button className="btn primary" onClick={kind === "reel" ? reel : download}>Generate & download</button><span className="muted">Post/story downloads as PNG. Reel downloads as MP4 when this browser supports it, otherwise WebM.</span></div>
    </section>
    <section className="card admin-section" style={{marginTop:16}}><h2>Reports</h2><p className="muted">User-submitted reports waiting for review.</p>{reports.length === 0 && <p className="muted">No open reports.</p>}{reports.map(r => <div className="moditem" key={r.id}><b>{r.reason}</b><p>{r.details}</p></div>)}</section>
  </main>;
}
