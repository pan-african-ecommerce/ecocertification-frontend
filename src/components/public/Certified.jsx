import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/endpoints';
import { fmtDate } from '../ui';
import PublicShell from './PublicShell';

const SCHEMES = [['', 'All schemes'], ['eu-organic', 'EU Organic'], ['eudr', 'EUDR compliance'], ['fairtrade', 'Fairtrade']];

const Certified = () => {
  const [q, setQ] = useState('');
  const [scheme, setScheme] = useState('');
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [state, setState] = useState('loading'); // loading | ready | error | throttled
  const [more, setMore] = useState(false);

  const load = useCallback(async (offset = 0) => {
    offset ? setMore(true) : setState('loading');
    try {
      const d = await API.certifiedRegister({ q: q.trim() || undefined, scheme: scheme || undefined, offset });
      setRows((prev) => (offset ? [...prev, ...d.results] : d.results));
      setCount(d.count);
      setState('ready');
    } catch (e) {
      setState(e.response?.status === 429 ? 'throttled' : 'error');
    }
    setMore(false);
  }, [q, scheme]);

  useEffect(() => { load(0); /* eslint-disable-next-line */ }, [scheme]);

  return (
    <PublicShell>
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-16">
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] max-w-[18ch] leading-[1.05]">Operators certified by EcoCertification</h1>
        <p className="mt-4 text-[#3d5247] max-w-[58ch] leading-relaxed">
          This register lists operators whose certificate is valid today. Suspended, revoked and expired certificates are not shown.
          To confirm a single certificate, use <Link to="/verify" className="text-primary-700 underline">Verify a certificate</Link>.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); load(0); }} className="mt-8 flex flex-col sm:flex-row gap-3">
          <label htmlFor="reg-q" className="sr-only">Search by company, country or certificate number</label>
          <input id="reg-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by company, country or certificate number"
                 className="flex-1 border border-[#b9c8bf] bg-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600" />
          <label htmlFor="reg-scheme" className="sr-only">Scheme</label>
          <select id="reg-scheme" value={scheme} onChange={(e) => setScheme(e.target.value)}
                  className="border border-[#b9c8bf] bg-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600">
            {SCHEMES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button type="submit" className="bg-[#10261C] text-white text-sm font-semibold rounded-lg px-6 py-2.5 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600">Search</button>
        </form>

        <div className="mt-8" aria-live="polite">
          {state === 'loading' && <p className="text-sm text-[#6b7f74]">Loading the register…</p>}
          {state === 'throttled' && <p className="text-sm text-red-700">Too many requests. Wait a minute and try again.</p>}
          {state === 'error' && <p className="text-sm text-red-700">The register could not be loaded. Refresh the page or try again shortly.</p>}
          {state === 'ready' && rows.length === 0 && (
            <p className="text-[#3d5247]">No valid certificates match your search. Try a shorter name or choose All schemes.</p>
          )}
          {state === 'ready' && rows.length > 0 && (
            <>
              <p className="text-sm text-[#6b7f74] mb-3">{count} certified {count === 1 ? 'operator' : 'operators'}</p>
              <div className="bg-white border border-[#cfdad3] rounded-xl overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="text-left text-[#6b7f74] border-b border-[#e3eae5]">
                      <th className="font-medium px-4 py-3">Operator</th><th className="font-medium px-4 py-3">Country</th>
                      <th className="font-medium px-4 py-3">Scheme</th><th className="font-medium px-4 py-3">Certificate</th>
                      <th className="font-medium px-4 py-3">Valid until</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2ef]">
                    {rows.map((r) => (
                      <tr key={r.certificate_number}>
                        <td className="px-4 py-3 font-medium">{r.company_name}</td>
                        <td className="px-4 py-3">{r.country || '—'}</td>
                        <td className="px-4 py-3">{r.scheme}</td>
                        <td className="px-4 py-3"><Link className="font-mono text-primary-700 hover:underline" to={`/verify?q=${encodeURIComponent(r.certificate_number)}`}>{r.certificate_number}</Link></td>
                        <td className="px-4 py-3 whitespace-nowrap">{fmtDate(r.expires_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length < count && (
                <button onClick={() => load(rows.length)} disabled={more}
                        className="mt-5 border border-[#10261C] font-semibold text-sm rounded-lg px-5 py-2.5 hover:bg-white disabled:opacity-60">
                  {more ? 'Loading…' : 'Show more'}
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </PublicShell>
  );
};
export default Certified;
