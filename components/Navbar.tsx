"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBrowserSupabase } from '@/lib/supabase-browser';
import { Home, MessageCircle, Sparkles, LogIn, UserCircle, Shield, Menu, X, PenLine, LogOut } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const s = getBrowserSupabase();
    s.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = s.auth.onAuthStateChange((_e, session) => setUser(session?.user || null));
    return () => data.subscription.unsubscribe();
  }, []);

  const close = () => setOpen(false);
  async function logout() { const s = getBrowserSupabase(); await s.auth.signOut(); location.href = '/'; }

  return (
    <header className="topbar">
      <div className="nav-inner">
        <Link href="/" className="brand" onClick={close}>
          <span className="brand-mark">CG</span>
          <span><b>CodingGita</b><small>Community</small></span>
        </Link>
        <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X/> : <Menu/>}</button>
        <nav className={`nav-panel ${open ? 'open' : ''}`}>
          <Link href="/community" onClick={close}><Home size={17}/> Community</Link>
          <Link href="/chat" onClick={close}><MessageCircle size={17}/> Chat</Link>
          <Link href="/ai" onClick={close}><Sparkles size={17}/> CG Buddy</Link>
          {user && <Link href="/support" onClick={close}><MessageCircle size={17}/> Support</Link>}
          {user ? <Link href="/profile" onClick={close}><UserCircle size={17}/> Profile</Link> : <Link href="/login" onClick={close}><LogIn size={17}/> Login</Link>}
          <Link href="/admin/login" onClick={close}><Shield size={17}/> Admin</Link>
          {user && <button className="nav-logout" onClick={logout}><LogOut size={17}/> Logout</button>}
          <Link href="/submit" className="nav-cta" onClick={close}><PenLine size={17}/> Confess</Link>
        </nav>
      </div>
    </header>
  );
}
