import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Term } from '../components/Term';

describe('Term', () => {
  it('renders a dotted-underline trigger for known terms', () => {
    render(<Term id="acwr">ACWR</Term>);
    const trigger = screen.getByRole('button', { name: /ACWR/i });
    expect(trigger.className).toContain('decoration-dotted');
    expect(trigger).toHaveTextContent('ACWR');
  });

  it('shows the glossary definition on hover', async () => {
    const user = userEvent.setup();
    render(<Term id="acwr">ACWR</Term>);
    await user.hover(screen.getByRole('button'));
    const tip = screen.getByRole('tooltip');
    expect(tip).toHaveTextContent(/Acute:Chronic Workload Ratio/i);
  });

  it('renders plain children when id is unknown', () => {
    render(<Term id="does-not-exist">Plain text</Term>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Plain text')).toBeInTheDocument();
  });

  it('is case-insensitive on the id', () => {
    render(<Term id="RPE">RPE</Term>);
    expect(screen.getByRole('button', { name: /RPE/i })).toBeInTheDocument();
  });
});
