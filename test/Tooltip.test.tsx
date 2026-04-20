import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from '../components/Tooltip';

describe('Tooltip', () => {
  it('is hidden by default', () => {
    render(
      <Tooltip content="Hello tip">
        <button>Trigger</button>
      </Tooltip>
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows on hover and hides on mouse leave', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Hello tip">
        <button>Trigger</button>
      </Tooltip>
    );
    const trigger = screen.getByRole('button', { name: /trigger/i });
    await user.hover(trigger);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Hello tip');
    await user.unhover(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows on focus and hides on blur', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Tooltip content="Focus tip">
          <button>Focusable</button>
        </Tooltip>
        <button>Other</button>
      </>
    );
    await user.tab();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Focus tip');
    await user.tab();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('hides on Escape', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Escape tip">
        <button>Trigger</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole('button'));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('links trigger to tooltip via aria-describedby when open', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Described">
        <button>Trigger</button>
      </Tooltip>
    );
    const trigger = screen.getByRole('button');
    await user.hover(trigger);
    const tooltip = screen.getByRole('tooltip');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
  });
});
