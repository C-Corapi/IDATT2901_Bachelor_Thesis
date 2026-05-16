import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../../src/components/Navbar';

afterEach(() => {
  cleanup();
});

const expectedLinks = [
  { to: '/overview', label: 'Overview', tooltip: 'View all extracted metadata' },
  { to: '/kanban', label: 'Kanban', tooltip: 'Manage items on the board' },
  { to: '/documents', label: 'Documents', tooltip: 'Browse uploaded documents' },
  { to: '/upload', label: 'Upload', tooltip: 'Upload a new document' },
  { to: '/about', label: 'About', tooltip: 'Learn about this tool' },
];

// helper to render and wait for router
async function renderWithRouter(ui: React.ReactElement, route = '/') {
  const result = render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
  await screen.findByLabelText('Main navigation');
  await Promise.resolve();

  return result;
}

describe('Navbar', () => {
  it('renders a nav landmark and a non-link logo with accessible name', async () => {
    await renderWithRouter(<Navbar />, '/');

    const nav = screen.getByLabelText('Main navigation');
    expect(nav).toBeTruthy();

    const logo = screen.getByLabelText('NextGen Project Planning home');
    expect(logo).toBeTruthy();
    expect(logo).toHaveTextContent(/Metadata Project Planning/i);

    const logoLink = screen.queryByRole('link', { name: /Metadata Project Planning/i });
    expect(logoLink).toBeNull();
  });

  it('renders exactly the expected number of links', async () => {
    await renderWithRouter(<Navbar />, '/');

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(expectedLinks.length);
  });

  it('each link has the expected href, title and aria-label (accessible name)', async () => {
    await renderWithRouter(<Navbar />, '/');

    expectedLinks.forEach((l) => {
      const link = screen.getByRole('link', { name: l.tooltip });
      expect(link).toBeTruthy();

      expect(link).toHaveTextContent(l.label);

      expect(link.getAttribute('href')).toBe(l.to);
      expect(link).toHaveAttribute('title', l.tooltip);
      expect(link).toHaveAttribute('aria-label', l.tooltip);
    });
  });

  it('sets aria-current="page" and active class for the initial route', async () => {
    await renderWithRouter(<Navbar />, '/kanban');

    const kanbanAnchor = screen.getByText('Kanban').closest('a') as HTMLAnchorElement;
    expect(kanbanAnchor).toBeTruthy();

    expect(kanbanAnchor.className).toContain('nav-link--active');
    expect(kanbanAnchor).toHaveAttribute('aria-current', 'page');

    expectedLinks.filter((l) => l.label !== 'Kanban').forEach((o) => {
      const anchor = screen.getByText(o.label).closest('a') as HTMLAnchorElement;
      expect(anchor).not.toHaveAttribute('aria-current');
      expect(anchor.className).not.toContain('nav-link--active');
    });
  });

  it('clicking a link updates which link is active (class and aria-current)', async () => {
    await renderWithRouter(<Navbar />, '/overview');

    const user = userEvent.setup();
    const overviewAnchor = screen.getByText('Overview').closest('a') as HTMLAnchorElement;
    const kanbanAnchor = screen.getByText('Kanban').closest('a') as HTMLAnchorElement;

    expect(overviewAnchor.className).toContain('nav-link--active');
    expect(overviewAnchor).toHaveAttribute('aria-current', 'page');

    await user.click(kanbanAnchor);
    expect(kanbanAnchor.className).toContain('nav-link--active');
    expect(kanbanAnchor).toHaveAttribute('aria-current', 'page');

    expect(overviewAnchor.className).not.toContain('nav-link--active');
    expect(overviewAnchor).not.toHaveAttribute('aria-current');
  });

it('tabbing moves focus through links in DOM order (keyboard accessibility)', async () => {
  await renderWithRouter(<Navbar />, '/');

  const user = userEvent.setup();
  const hamburger = screen.getByRole('button', { name: /Open menu/i });
  const anchors = expectedLinks.map((l) => screen.getByText(l.label).closest('a') as HTMLAnchorElement);

  let focusedElement = document.activeElement;

  for (const expected of anchors) {
    await user.tab();
    focusedElement = document.activeElement;
    if (focusedElement === hamburger) {
      await user.tab();
      focusedElement = document.activeElement;
    }
    expect(focusedElement).toBe(expected);
  }
});

  it('activates a link with Enter when it has focus', async () => {
    await renderWithRouter(<Navbar />, '/overview');
    const user = userEvent.setup();
    const kanbanAnchor = screen.getByText('Kanban').closest('a') as HTMLAnchorElement;

    kanbanAnchor.focus();
    await user.keyboard('{Enter}');

    expect(kanbanAnchor.className).toContain('nav-link--active');
    expect(kanbanAnchor).toHaveAttribute('aria-current', 'page');
  });

  it('visible label and accessible name differ: visible label is the text, accessible name is the tooltip (aria-label)', async () => {
    await renderWithRouter(<Navbar />, '/');

    const aboutAnchor = screen.getByText('About').closest('a') as HTMLAnchorElement;
    expect(aboutAnchor).toBeTruthy();

    expect(aboutAnchor).toHaveTextContent('About');

    expect(aboutAnchor).toHaveAttribute('aria-label', 'Learn about this tool');
  });

  it('closes menu when a link is clicked', async () => {
    await renderWithRouter(<Navbar />, '/');
    const user = userEvent.setup();

    const hamburger = screen.getByRole('button', { name: /Open menu/i });
    await user.click(hamburger);

    const overviewLink = screen.getByText('Overview').closest('a') as HTMLAnchorElement;
    await user.click(overviewLink);

    const navLinks = overviewLink.closest('ul');
    expect(navLinks?.className).not.toContain('nav-links--open');
  });

  it('hamburger button toggles menu visibility', async () => {
    await renderWithRouter(<Navbar />, '/');
    const user = userEvent.setup();

    const hamburger = screen.getByRole('button', { name: /Open menu/i });
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');

    await user.click(hamburger);
    expect(hamburger).toHaveAttribute('aria-expanded', 'true');

    await user.click(hamburger);
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });
});