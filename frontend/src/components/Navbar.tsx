import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/overview',  label: 'Overview',    tooltip: 'View all extracted metadata' },
  { to: '/kanban',    label: 'Kanban',      tooltip: 'Manage items on the board' },
  { to: '/documents', label: 'Documents',   tooltip: 'Browse uploaded documents' },
  { to: '/upload',    label: 'Upload',      tooltip: 'Upload a new document' },
  { to: '/about',     label: 'About',       tooltip: 'Learn about this tool' },
];

const Navbar: React.FC = () => (
  <nav className="nav" aria-label="Main navigation">
    <div className="nav-logo" aria-label="NextGen Project Planning home">Metadata Project Planning</div>
    <ul className="nav-links" role="list">
      {links.map((l) => (
        <li key={l.to} role="listitem">
          <NavLink to={l.to} title={l.tooltip} aria-label={l.tooltip}
            className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
            {l.label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);

export default Navbar;