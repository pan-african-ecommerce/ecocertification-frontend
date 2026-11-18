import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = {
  client: [['/dashboard', 'My applications']],
  inspector: [['/dashboard', 'My inspections']],
  verifier: [['/dashboard', 'Review queue']],
  manager: [['/dashboard', 'Pipeline'], ['/manager/certificates', 'Certificates'], ['/manager/staff', 'Staff'],
            ['/manager/schemes', 'Schemes'], ['/manager/audit', 'Audit log']],
};
NAV.admin = NAV.manager;

const ROLE = { client: 'Client', inspector: 'Inspector', verifier: 'Verification officer', manager: 'Certification manager', admin: 'Administrator' };

const Header = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const links = NAV[user?.user_type] || [];
  const cls = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-sm ${isActive ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:text-primary-600'}`;
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/dashboard" className="text-xl font-bold text-primary-700">EcoCertification</Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map(([to, label]) => <NavLink key={to} to={to} end className={cls}>{label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right leading-tight">
            <div className="text-sm font-medium text-gray-800">{user?.first_name} {user?.last_name}</div>
            <div className="text-xs text-gray-500">{ROLE[user?.user_type]}</div>
          </div>
          <button onClick={logout} className="text-sm text-gray-600 hover:text-red-600">Sign out</button>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
        </div>
      </div>
      {open && <nav className="md:hidden px-4 pb-3">{links.map(([to, label]) =>
        <NavLink key={to} to={to} end className={cls} onClick={() => setOpen(false)}>{label}</NavLink>)}</nav>}
    </header>
  );
};
export default Header;
