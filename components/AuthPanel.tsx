"use client";
import {useState} from 'react';
import {getBrowserSupabase} from '@/lib/supabase-browser';
import {Eye,EyeOff,LockKeyhole,Mail,UserRound} from 'lucide-react';
export default function AuthPanel(){
  const [signup,setSignup]=useState(false),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[username,setUsername]=useState(''),[msg,setMsg]=useState(''),[show,setShow]=useState(false),[busy,setBusy]=useState(false);
  const supabase=getBrowserSupabase();
  async function go(e:any){
    e.preventDefault();setMsg('');setBusy(true);
    if(signup&&!/^\S+@gmail\.com$/i.test(email)){setMsg('Please use a Gmail address.');setBusy(false);return}
    try{
      if(signup){
        const redirectTo=window.location.origin+'/auth/callback';
        const {error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:redirectTo,data:{display_name:username||'Student',username:(username||'student').toLowerCase().replace(/[^a-z0-9_]/g,'_')}}});
        if(!error)setMsg('Account created. Check your Gmail and click Verify Email. After verification, wait for admin approval.');
        else setMsg(error.message);
      }else{
        const {data,error}=await supabase.auth.signInWithPassword({email,password});
        if(error){setMsg(error.message);return}
        const {data:profile,error:profileError}=await supabase.from('profiles').select('approval_status').eq('id',data.user.id).single();
        if(profileError){await supabase.auth.signOut();setMsg('Account approval could not be verified. Please contact the admin.');return}
        if(profile?.approval_status==='rejected'){await supabase.auth.signOut();setMsg('Your account was not approved. Please contact the CodingGita admin.');return}
        if(profile?.approval_status!=='approved'){setMsg('Your account is waiting for admin approval. You can use the private Admin Chat while you wait.');location.href='/support?pending=1';return}
        location.href='/community'
      }
    }finally{setBusy(false)}
  }
  return <div className="auth-card"><div className="auth-icon"><LockKeyhole/></div><div className="auth-kicker">CODINGGITA COMMUNITY</div><h1>{signup?'Create your account':'Welcome back'}</h1><p>{signup?'Join the private student community.':'Sign in to continue to your community.'}</p><form onSubmit={go} className="auth-form">
    {signup&&<label><span><UserRound size={15}/> Name</span><input placeholder="Your display name" value={username} onChange={e=>setUsername(e.target.value)} required minLength={3}/></label>}
    <label><span><Mail size={15}/> Email</span><input type="email" placeholder="yourname@gmail.com" value={email} onChange={e=>setEmail(e.target.value)} required/></label>
    <label><span><LockKeyhole size={15}/> Password</span><div className="password-wrap"><input type={show?'text':'password'} placeholder="8+ characters" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8}/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
    {msg&&<div className="notice">{msg}</div>}<button className="btn primary btn-lg full" disabled={busy}>{busy?'Please wait…':signup?'Create account':'Sign in'}</button></form>
    <div className="auth-switch">{signup?'Already have an account?':'New here?'} <button onClick={()=>{setSignup(!signup);setMsg('')}}>{signup?'Sign in':'Create account'}</button></div></div>
}