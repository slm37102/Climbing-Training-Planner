import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Projects } from '../pages/Projects';
import type { Project } from '../types';

const updateProject = vi.fn();
const deleteProject = vi.fn();
const addProject = vi.fn().mockResolvedValue('newid');

let projectsList: Project[] = [];

vi.mock('../context/StoreContext', () => ({
  useStore: () => ({
    projects: projectsList,
    addProject,
    updateProject,
    deleteProject,
  }),
}));

const sampleProject: Project = {
  id: 'p1',
  name: 'Midnight Lightning',
  discipline: 'boulder',
  status: 'projecting',
  grade: 'V8',
  crag: 'Camp 4',
  beta: 'Big dyno to the diamond',
  attempts: 4,
  createdAt: '2024-03-01T00:00:00.000Z',
};

describe('Projects page', () => {
  beforeEach(() => {
    updateProject.mockClear();
    deleteProject.mockClear();
    addProject.mockClear();
    projectsList = [];
  });

  it('renders an empty state when there are no projects', () => {
    render(<Projects />);
    expect(screen.getByText(/no projects yet/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add your first project/i })
    ).toBeInTheDocument();
  });

  it('renders a project card with name, grade and crag', () => {
    projectsList = [sampleProject];
    render(<Projects />);
    expect(screen.getByText('Midnight Lightning')).toBeInTheDocument();
    expect(screen.getByText('V8')).toBeInTheDocument();
    expect(screen.getByText('Camp 4')).toBeInTheDocument();
    expect(screen.getByText(/4 attempts/i)).toBeInTheDocument();
  });

  it('clicking "Sent" status toggle calls updateProject with new status', () => {
    projectsList = [sampleProject];
    render(<Projects />);
    const sentBtn = screen.getByRole('button', { name: /set status sent/i });
    fireEvent.click(sentBtn);
    expect(updateProject).toHaveBeenCalledTimes(1);
    expect(updateProject).toHaveBeenCalledWith('p1', { status: 'sent' });
  });

  it('clicking "+1 attempt" increments the attempts count', () => {
    projectsList = [sampleProject];
    render(<Projects />);
    fireEvent.click(screen.getByRole('button', { name: /\+1 attempt/i }));
    expect(updateProject).toHaveBeenCalledWith('p1', { attempts: 5 });
  });

  it('expanding "View beta" shows the beta text', () => {
    projectsList = [sampleProject];
    render(<Projects />);
    expect(screen.queryByText('Big dyno to the diamond')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /view beta/i }));
    expect(screen.getByText('Big dyno to the diamond')).toBeInTheDocument();
  });
});
