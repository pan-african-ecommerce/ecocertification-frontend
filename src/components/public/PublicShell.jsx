import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LINKS = [['/about', 'About'], ['/schemes', 'Schemes'], ['/operators', 'For operators'], ['/staff', 'For staff'], ['/certified', 'Certified operators']];

export const PublicShell = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const cls = ({ isActive }) => `block py-2 lg:py-0 text-sm ${isActive ? 'text-primary-700 font-semibold' : 'hover:text-primary-700'}`;
  const cta = 'bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600';
  return (
    <div className="min-h-screen bg-[#F4F7F5] text-[#10261C] font-sans">
      <header className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="font-display text-xl font-extrabold tracking-tight">EcoCertification</Link>
        <nav className="hidden lg:flex items-center gap-6" aria-label="Main">
          {LINKS.map(([to, l]) => <NavLink key={to} to={to} className={cls}>{l}</NavLink>)}
        </nav>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link to="/dashboard" className={cta}>Go to dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline text-sm font-medium hover:text-primary-700">Sign in</Link>
              <Link to="/register" className={cta}>Apply</Link>
            </>
          )}
          <button className="lg:hidden p-2 -mr-2" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>☰</button>
        </div>
      </header>
      {open && (
        <nav className="lg:hidden max-w-6xl mx-auto px-5 sm:px-8 pb-3 border-b border-[#dbe4de]" aria-label="Mobile">
          {LINKS.map(([to, l]) => <NavLink key={to} to={to} className={cls} onClick={() => setOpen(false)}>{l}</NavLink>)}
          {!isAuthenticated && <NavLink to="/login" className={cls} onClick={() => setOpen(false)}>Sign in</NavLink>}
        </nav>
      )}
      <main>{children}</main>
      <footer className="border-t border-[#dbe4de] mt-8">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 grid sm:grid-cols-[1fr_auto] gap-6 text-sm text-[#4b5f55]">
          <div>
            <div className="font-display font-extrabold text-[#10261C] text-lg">EcoCertification</div>
            <p className="mt-1 max-w-[40ch]">Certification for EU Organic, EUDR and Fairtrade.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {LINKS.map(([to, l]) => <Link key={to} to={to} className="hover:text-primary-700">{l}</Link>)}
            <Link to="/verify" className="hover:text-primary-700">Verify a certificate</Link>
            <Link to="/privacy" className="hover:text-primary-700">Data protection</Link>
            <Link to="/login" className="hover:text-primary-700">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const PageHead = ({ title, intro, children }) => (
  <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-10">
    <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.05] max-w-[20ch]">{title}</h1>
    {intro && <p className="mt-5 text-lg text-[#3d5247] max-w-[58ch] leading-relaxed">{intro}</p>}
    {children}
  </section>
);

export const Band = ({ title, children, white }) => (
  <section className={white ? 'bg-white border-y border-[#dbe4de]' : ''}>
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
      {title && <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mb-8">{title}</h2>}
      {children}
    </div>
  </section>
);

export const CtaRow = ({ title, text, children }) => (
  <section className="bg-[#10261C] text-white">
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h2>
        {text && <p className="mt-2 text-[#b9d3c4] max-w-[46ch]">{text}</p>}
      </div>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  </section>
);

export const BtnLight = ({ to, children }) => <Link to={to} className="bg-white text-[#10261C] font-semibold rounded-lg px-6 py-3 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-white">{children}</Link>;
export const BtnOutlineLight = ({ to, children }) => <Link to={to} className="border border-white/50 font-semibold rounded-lg px-6 py-3 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white">{children}</Link>;
export const BtnPrimary = ({ to, children }) => <Link to={to} className="bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-lg px-6 py-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600">{children}</Link>;
export const BtnOutline = ({ to, children }) => <Link to={to} className="border border-[#10261C] font-semibold rounded-lg px-6 py-3 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600">{children}</Link>;

export default PublicShell;
