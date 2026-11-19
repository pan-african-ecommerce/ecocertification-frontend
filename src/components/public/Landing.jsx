import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/endpoints';
import { Badge, fmtDate } from '../ui';
import LoadingSpinner from '../common/LoadingSpinner';
import PublicShell from './PublicShell';

const STEPS = [
  ['Self-assessment', 'Answer the scheme questions. You see your score straight away and know if you can proceed.'],
  ['Documents', 'Upload the records the scheme asks for: registration, plans, maps, supplier lists.'],
  ['Document review', 'A reviewer checks each file and asks for changes where something is missing or unclear.'],
  ['Inspection', 'An approved inspector with no conflict of interest visits and records evidence against the checklist.'],
  ['Verification', 'A second person, who did not inspect, reviews the report. Non-conformities go back to you to fix.'],
  ['Decision', 'A certification manager decides, and the reasons are kept on the record.'],
  ['Certificate', 'You receive a PDF with a number anyone can check on this page.'],
];

const PATHS = [
  ['Operators who want to be certified', 'Create an account for your company or cooperative, choose a scheme and send your request. You follow every step and see what we need from you.', '/operators', 'How it works'],
  ['Inspectors, verifiers and managers', 'Sign in to see your assigned inspections, the review queue, non-conformities and the pipeline. Staff accounts are created by EcoCertification.', '/staff', 'Work on the platform'],
  ['Buyers and the public', 'See which operators hold a valid certificate today, or check one certificate by its number.', '/certified', 'See certified operators'],
];

const SCHEMES = [
  ['EU Organic', 'Regulation 2018/848', 'Organic production, processing and trade for the EU market.'],
  ['EUDR compliance', 'Regulation 2023/1115', 'Deforestation-free, legal and traceable supply of in-scope commodities.'],
  ['Fairtrade', 'Producer organisation and trader standard', 'Fair terms and working conditions for producers and traders.'],
];

const Seal = ({ valid }) => (
  <svg className="seal-stamp shrink-0" width="76" height="76" viewBox="0 0 76 76" aria-hidden="true">
    <circle cx="38" cy="38" r="35" fill="none" stroke={valid ? '#b7791f' : '#9ca3af'} strokeWidth="2" strokeDasharray="2 4" />
    <circle cx="38" cy="38" r="27" fill={valid ? '#fef3c7' : '#f3f4f6'} stroke={valid ? '#b7791f' : '#9ca3af'} strokeWidth="2" />
    <path d="M26 39l8 8 16-17" fill="none" stroke={valid ? '#92400e' : '#6b7280'} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckCard = () => {
  const [q, setQ] = useState('');
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);

  const check = async (e) => {
    e.preventDefault();
    const v = q.trim();
    if (!v) return;
    setBusy(true);
    try {
      const r = await API.verifyCertificate(v);
      setRes({ found: true, cert: r.data.certificate });
    } catch (err) {
      setRes({ found: false, throttled: err.response?.status === 429 });
    }
    setBusy(false);
  };

  const c = res?.found ? res.cert : null;
  const rows = [
    ['Holder', c?.company_name], ['Country', c?.country], ['Scheme', c?.scheme],
    ['Scope', c?.scope], ['Valid until', c ? fmtDate(c.expires_at) : null],
  ];

  return (
    <div className="bg-white rounded-xl border border-[#cfdad3] shadow-[0_18px_40px_-24px_rgba(16,38,28,0.45)] p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#10261C]">Check a certificate</h2>
          <p className="text-sm text-[#4b5f55] mt-1 max-w-[30ch]">Type the number printed on the certificate.</p>
        </div>
        <Seal valid={!res || !res.found || c?.status === 'active'} />
      </div>

      <form onSubmit={check} className="mt-5 flex gap-2">
        <label htmlFor="cert-number" className="sr-only">Certificate number</label>
        <input id="cert-number" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ECO-2026-1A2B3C4D"
               className="min-w-0 flex-1 font-mono text-sm border border-[#b9c8bf] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600" />
        <button type="submit" disabled={busy}
                className="bg-[#10261C] text-white text-sm font-semibold rounded-lg px-5 hover:bg-primary-800 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600">
          {busy ? 'Checking…' : 'Check'}
        </button>
      </form>

      <div aria-live="polite">
        {res && !res.found && (
          <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {res.throttled ? 'Too many checks. Wait a minute and try again.' : 'No certificate has that number. Check the spelling against the printed certificate.'}
          </p>
        )}
        <dl className="mt-5 grid grid-cols-[6.5rem_1fr] gap-y-2.5 text-sm">
          {rows.map(([k, v]) => (
            <React.Fragment key={k}>
              <dt className="text-[#6b7f74]">{k}</dt>
              <dd className={c ? 'font-medium text-[#10261C]' : 'text-[#b9c8bf]'}>{v || '—'}</dd>
            </React.Fragment>
          ))}
        </dl>
        {c && (
          <div className="mt-4 flex items-center gap-3">
            <Badge status={c.status} />
            {c.status !== 'active' && <span className="text-sm text-red-700">This certificate is not currently valid.</span>}
          </div>
        )}
      </div>
    </div>
  );
};

const Landing = () => {
  const { loading, isAuthenticated } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <PublicShell>
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-16 sm:pb-24 grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 items-start">
          <div>
            <h1 className="font-display text-[2.6rem] leading-[1.02] sm:text-6xl font-extrabold tracking-[-0.03em] max-w-[14ch]">
              Certification you can check.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-[#3d5247] max-w-[48ch]">
              EcoCertification certifies operators against the EU Organic, EUDR and Fairtrade schemes.
              Operators apply and follow their file online, our inspectors and verifiers do the audit work here,
              and anyone can see who holds a valid certificate.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-lg px-6 py-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600">Request certification</Link>
              <Link to="/certified" className="border border-[#10261C] font-semibold rounded-lg px-6 py-3 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600">See certified operators</Link>
            </div>
          </div>
          <CheckCard />
        </section>

        <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-20">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Where do you want to go?</h2>
          <ul className="mt-8 border-t border-[#cfdad3]">
            {PATHS.map(([who, text, to, cta]) => (
              <li key={who} className="py-6 border-b border-[#cfdad3] grid md:grid-cols-[15rem_1fr_auto] gap-x-8 gap-y-3 items-center">
                <h3 className="font-display text-xl font-bold">{who}</h3>
                <p className="text-[#3d5247] leading-relaxed max-w-[55ch]">{text}</p>
                <Link to={to} className="justify-self-start md:justify-self-end font-semibold border border-[#10261C] rounded-lg px-5 py-2.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 whitespace-nowrap">{cta}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border-y border-[#dbe4de]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20 grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16">
            <div className="lg:sticky lg:top-8 self-start">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight max-w-[16ch]">How certification works</h2>
              <p className="mt-4 text-[#3d5247] max-w-[40ch] leading-relaxed">
                Operators always see where their application stands and what is needed next.
              </p>
            </div>
            <ol className="divide-y divide-[#e3eae5] border-y border-[#e3eae5]">
              {STEPS.map(([title, text], i) => (
                <li key={title} className="py-4 grid grid-cols-[2.25rem_1fr] gap-x-3">
                  <span className="font-display font-bold text-primary-700 text-lg">{i + 1}</span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-[#4b5f55] mt-0.5 leading-relaxed max-w-[60ch]">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Schemes you can apply for</h2>
          <ul className="mt-8 border-t border-[#cfdad3]">
            {SCHEMES.map(([name, ref, text]) => (
              <li key={name} className="py-5 border-b border-[#cfdad3] grid sm:grid-cols-[16rem_1fr] gap-1 sm:gap-8">
                <div>
                  <h3 className="font-display text-xl font-bold">{name}</h3>
                  <p className="text-sm text-[#6b7f74]">{ref}</p>
                </div>
                <p className="text-[#3d5247] leading-relaxed max-w-[55ch]">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-[#10261C] text-white">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-16 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight">Ready to request certification?</h2>
              <p className="mt-2 text-[#b9d3c4] max-w-[44ch]">Create an account for your company or cooperative. You choose a scheme after you sign in.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="bg-white text-[#10261C] font-semibold rounded-lg px-6 py-3 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#10261C] focus:ring-white">Create an account</Link>
              <Link to="/login" className="border border-white/50 font-semibold rounded-lg px-6 py-3 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white">Sign in</Link>
            </div>
          </div>
        </section>
    </PublicShell>
  );
};

export default Landing;
