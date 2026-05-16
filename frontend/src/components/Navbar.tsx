import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/overview',  label: 'Overview',    tooltip: 'View all extracted metadata' },
  { to: '/kanban',    label: 'Kanban',      tooltip: 'Manage items on the board' },
      { to: '/upload',    label: 'Upload',      tooltip: 'Upload a new document' },
  { to: '/documents', label: 'Documents',   tooltip: 'Browse uploaded documents' },
  { to: '/about',     label: 'About',       tooltip: 'Learn about this tool' },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="nav" aria-label="Main navigation">
      <div className="nav-logo" aria-label="NextGen Project Planning home">
        Metadata Project Planning
      </div>
      <button
        className="nav-hamburger"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul className={`nav-links ${isOpen ? 'nav-links--open' : ''}`} role="list">
        {links.map((l) => (
          <li key={l.to} role="listitem">
            <NavLink
              to={l.to}
              title={l.tooltip}
              aria-label={l.tooltip}
              className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;