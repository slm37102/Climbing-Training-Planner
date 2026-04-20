import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PulleyPopModal } from '../components/PulleyPopModal';

describe('PulleyPopModal', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <PulleyPopModal open={false} onClose={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the persistent disclaimer on the intro step', () => {
    render(<PulleyPopModal open={true} onClose={() => {}} />);
    const disclaimers = screen.getAllByTestId('rehab-disclaimer');
    expect(disclaimers.length).toBeGreaterThan(0);
    expect(disclaimers[0]).toHaveTextContent(/not medical advice/i);
  });

  it('shows the warning banner on every step', () => {
    render(<PulleyPopModal open={true} onClose={() => {}} />);
    expect(
      screen.getByText(/see a specialist after a suspected pulley injury/i),
    ).toBeInTheDocument();
  });

  it('advances to see-doctor-now when the user reports a pop and hides the create-goal button', () => {
    const onCreate = vi.fn();
    render(
      <PulleyPopModal
        open={true}
        onClose={() => {}}
        onCreateRehabGoal={onCreate}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /start self-check/i }));
    fireEvent.click(screen.getByRole('button', { name: /I heard\/felt a pop/i }));

    expect(screen.getByText(/see a specialist promptly/i)).toBeInTheDocument();
    // No "Create rehab goal" option on urgent outcomes
    expect(
      screen.queryByRole('button', { name: /create rehab goal/i }),
    ).toBeNull();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('advances to likely-strain and invokes onCreateRehabGoal("acute") when Create rehab goal clicked', () => {
    const onCreate = vi.fn();
    const onClose = vi.fn();
    render(
      <PulleyPopModal
        open={true}
        onClose={onClose}
        onCreateRehabGoal={onCreate}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /start self-check/i }));
    // Q1 pop: No
    fireEvent.click(screen.getByRole('button', { name: /^No$/ }));
    // Q2 ROM: yes mostly pain-free
    fireEvent.click(
      screen.getByRole('button', { name: /mostly pain-free/i }),
    );
    // Q3 swelling: obvious → likely-strain
    fireEvent.click(
      screen.getByRole('button', { name: /obvious swelling or bruising/i }),
    );

    expect(
      screen.getByText(/likely a low-grade strain/i),
    ).toBeInTheDocument();

    const createBtn = screen.getByRole('button', { name: /create rehab goal/i });
    fireEvent.click(createBtn);

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenCalledWith('acute');
    expect(onClose).toHaveBeenCalled();
  });

  it('reaches minor-monitor and does not offer a create-goal button', () => {
    const onCreate = vi.fn();
    render(
      <PulleyPopModal
        open={true}
        onClose={() => {}}
        onCreateRehabGoal={onCreate}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /start self-check/i }));
    fireEvent.click(screen.getByRole('button', { name: /^No$/ }));
    fireEvent.click(
      screen.getByRole('button', { name: /mostly pain-free/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: /none at all/i }));
    fireEvent.click(screen.getByRole('button', { name: /no pain at all/i }));

    expect(screen.getByText(/minor — monitor closely/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /create rehab goal/i }),
    ).toBeNull();
  });

  it('opens the rehab phase viewer with three phase tabs', () => {
    render(<PulleyPopModal open={true} onClose={() => {}} onCreateRehabGoal={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /start self-check/i }));
    fireEvent.click(screen.getByRole('button', { name: /I heard\/felt a pop/i }));

    fireEvent.click(
      screen.getByRole('button', { name: /learn about rehab phases/i }),
    );

    expect(screen.getByRole('tab', { name: 'acute' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'sub-acute' })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'return-to-climb' }),
    ).toBeInTheDocument();
  });
});
