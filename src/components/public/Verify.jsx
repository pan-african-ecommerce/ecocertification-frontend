import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../../api/endpoints';
import { Badge, fmtDate, Button, inputCls } from '../ui';

const Verify = () => {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);

  const search = async (value) => {
    if (!value.trim()) return;
    setBusy(true);
    try {
      const r = await API.verifyCertificate(value.trim());
      setRes({ found: true, cert: r.data.certificate });
    } catch (e) {
      setRes({ found: false, throttled: e.response?.status === 429 });
    }
    setBusy(false);
  };

  useEffect(() => { if (params.get('q')) search(params.get('q')); /* eslint-disable-next-line */ }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-card">
        <h1 className="text-2xl font-bold text-gray-900">Verify a certificate</h1>
        <p className="text-sm text-gray-600 mb-5">Enter the exact certificate number printed on the certificate.</p>
        <form onSubmit={(e) => { e.preventDefault(); search(q); }} className="flex gap-2">
          <input className={inputCls} placeholder="e.g. ECO-2026-1A2B3C4D" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button type="submit" busy={busy}>Check</Button>
        </form>

        {res && !res.found && (
          <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
            {res.throttled ? 'Too many requests. Please wait a minute.' : 'No certificate was found with that number.'}
          </div>
        )}
        {res?.found && (
          <div className="mt-5 border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm">{res.cert.certificate_number}</span>
              <Badge status={res.cert.status} />
            </div>
            <dl className="text-sm grid grid-cols-3 gap-y-2">
              <dt className="text-gray-500">Holder</dt><dd className="col-span-2 font-medium">{res.cert.company_name}</dd>
              <dt className="text-gray-500">Country</dt><dd className="col-span-2">{res.cert.country || '—'}</dd>
              <dt className="text-gray-500">Scheme</dt><dd className="col-span-2">{res.cert.scheme}</dd>
              <dt className="text-gray-500">Scope</dt><dd className="col-span-2">{res.cert.scope || '—'}</dd>
              <dt className="text-gray-500">Issued</dt><dd className="col-span-2">{fmtDate(res.cert.issued_at)}</dd>
              <dt className="text-gray-500">Valid until</dt><dd className="col-span-2">{fmtDate(res.cert.expires_at)}</dd>
            </dl>
            {res.cert.status !== 'active' && (
              <p className="mt-3 text-sm text-red-700">This certificate is not currently valid.</p>
            )}
          </div>
        )}
        <p className="text-center text-sm text-gray-500 mt-6"><Link to="/login" className="text-primary-600">Back to sign in</Link></p>
      </div>
    </div>
  );
};
export default Verify;
