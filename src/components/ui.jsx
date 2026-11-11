import React from 'react';

export const STATUS = {
  assessment: ['Self-assessment', 'bg-yellow-100 text-yellow-800'],
  documents: ['Documents', 'bg-blue-100 text-blue-800'],
  doc_review: ['Document review', 'bg-indigo-100 text-indigo-800'],
  ready_for_inspection: ['Ready for inspection', 'bg-cyan-100 text-cyan-800'],
  inspection: ['Inspection', 'bg-orange-100 text-orange-800'],
  verification: ['Verification', 'bg-purple-100 text-purple-800'],
  corrective_actions: ['Corrective actions', 'bg-red-100 text-red-800'],
  decision: ['Awaiting decision', 'bg-pink-100 text-pink-800'],
  certified: ['Certified', 'bg-green-100 text-green-800'],
  rejected: ['Rejected', 'bg-gray-200 text-gray-700'],
  revoked: ['Revoked', 'bg-gray-200 text-gray-700'],
  expired: ['Expired', 'bg-gray-200 text-gray-700'],
  // misc
  pending: ['Pending', 'bg-yellow-100 text-yellow-800'],
  approved: ['Approved', 'bg-green-100 text-green-800'],
  changes_requested: ['Changes requested', 'bg-orange-100 text-orange-800'],
  scheduled: ['Scheduled', 'bg-blue-100 text-blue-800'],
  in_progress: ['In progress', 'bg-orange-100 text-orange-800'],
  submitted: ['Submitted', 'bg-purple-100 text-purple-800'],
  returned: ['Returned', 'bg-red-100 text-red-800'],
  verified: ['Verified', 'bg-green-100 text-green-800'],
  cancelled: ['Cancelled', 'bg-gray-200 text-gray-700'],
  open: ['Open', 'bg-red-100 text-red-800'],
  responded: ['Awaiting review', 'bg-purple-100 text-purple-800'],
  closed: ['Closed', 'bg-green-100 text-green-800'],
  active: ['Active', 'bg-green-100 text-green-800'],
  suspended: ['Suspended', 'bg-orange-100 text-orange-800'],
};

export const Badge = ({ status, label }) => {
  const [text, cls] = STATUS[status] || [status, 'bg-gray-100 text-gray-700'];
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}>{label || text}</span>;
};

export const Card = ({ title, actions, children, className = '' }) => (
  <section className={`bg-white rounded-lg shadow-card mb-6 ${className}`}>
    {(title || actions) && (
      <div className="px-5 py-3 border-b bg-gray-50 rounded-t-lg flex items-center justify-between gap-3">
        <h2 className="font-semibold text-gray-800">{title}</h2>
        <div className="flex gap-2">{actions}</div>
      </div>
    )}
    <div className="p-5">{children}</div>
  </section>
);

export const Page = ({ title, subtitle, actions, children, wide }) => (
  <div className={`${wide ? 'max-w-7xl' : 'max-w-5xl'} mx-auto p-4 sm:p-6`}>
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </div>
      <div className="flex gap-2">{actions}</div>
    </div>
    {children}
  </div>
);

const BTN = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-primary-700 hover:bg-primary-50',
};
export const Button = ({ variant = 'primary', busy, disabled, className = '', children, ...p }) => (
  <button
    {...p}
    disabled={disabled || busy}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${BTN[variant]} ${className}`}
  >
    {busy ? 'Working…' : children}
  </button>
);

export const Field = ({ label, hint, children }) => (
  <label className="block mb-4">
    <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
    {children}
    {hint && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
  </label>
);

export const inputCls =
  'block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500';

export const Empty = ({ children }) => <div className="py-8 text-center text-gray-500 text-sm">{children}</div>;

export const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

export const Table = ({ head, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>{head.map((h) => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-gray-100">{children}</tbody>
    </table>
  </div>
);

// Runs an async action and reports success/errors via toast; returns result or null.
import { toast } from 'react-toastify';
export const run = async (fn, okMsg) => {
  try {
    const r = await fn();
    if (okMsg) toast.success(okMsg);
    return r || true;
  } catch (e) {
    return null; // interceptor already toasted
  }
};
