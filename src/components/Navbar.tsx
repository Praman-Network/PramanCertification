'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, Lock, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/status');
        const data = await res.json();
        setIsLoggedIn(!!data.loggedIn);
      } catch {
        setIsLoggedIn(false);
      }
    }
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsLoggedIn(false);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isAdminPage = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/login';

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 28px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(6, 6, 12, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none',
          color: 'var(--text)',
        }}
      >
        <img
          src="/praman-logo.png"
          alt="Praman Network"
          style={{ width: '175px', height: 'auto', display: 'block', objectFit: 'contain' }}
        />
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {isAdminPage ? (
          <>
            <Link
              href="/verify"
              className="btn btn-ghost"
              style={{ padding: '8px 16px', fontSize: '11px' }}
            >
              <ShieldCheck size={14} />
              Public Verify
            </Link>
            <span className="badge pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cyan)',
                  boxShadow: '0 0 6px var(--cyan)',
                }}
              />
              Admin Console
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-ghost"
              style={{ padding: '8px 16px', fontSize: '11px', color: 'var(--rose)' }}
            >
              <LogOut size={14} />
              Log Out
            </button>
          </>
        ) : isLoginPage ? (
          <>
            <Link
              href="/verify"
              className="btn btn-ghost"
              style={{ padding: '8px 16px', fontSize: '11px' }}
            >
              <ShieldCheck size={14} />
              Verify Certificate
            </Link>
            <span className="badge pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={12} />
              Admin Portal
            </span>
          </>
        ) : (
          <>
            <span className="badge pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={13} />
              Public Verification
            </span>
            {isLoggedIn ? (
              <Link
                href="/admin"
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '11px' }}
              >
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn btn-ghost"
                style={{ padding: '8px 16px', fontSize: '11px' }}
              >
                <Lock size={14} />
                Admin Sign In
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
