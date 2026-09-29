"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck, LockKeyhole } from 'lucide-react';

export default function AdminLogin(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [show,setShow]=useState(false); const [busy,setBusy]=useState(false); const router=useRouter();
  async function go(e:React.FormEvent){e.preventDefault();setError('');setBusy(true);try{const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const d=await r.json();if(!r.ok){setError(d.error||'Login failed');return}router.push('/admin')}finally{setBusy(false)}}
  return <form onSubmit={go} className="auth-card">
    <div className="auth-icon"><ShieldCheck/></div><div className="auth-kicker">AUTHORIZED ACCESS</div><h1>Admin sign in</h1><p>Moderate community content and manage reports.</p>
    <label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="admin@example.com" required/></label>
    <label>Password<div className="password-wrap"><input value={password} onChange={e=>setPassword(e.target.value)} type={show?'text':'password'} placeholder="Your password" required/><button type="button" onClick={()=>setShow(!show)} aria-label="Show password">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
    {error&&<div className="form-error"><LockKeyhole size={15}/>{error}</div>}
    <button className="btn primary btn-lg full" disabled={busy}>{busy?'Signing in…':'Sign in to dashboard'}</button>
    <small className="auth-foot">Authorized moderators only. Keep your credentials private.</small>
  </form>
}
