import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HangboardPicker } from '../pages/HangboardPicker';
import { HANGBOARD_PROTOCOLS } from '../data/hangboardProtocols';

vi.mock('../context/StoreContext', () => ({
  useStore: () => ({ addWorkout: vi.fn() })
}));

describe('HangboardPicker', () => {
  it('renders all 6 seed protocol names', () => {
    render(<HangboardPicker onNavigate={() => {}} />);
    for (const p of HANGBOARD_PROTOCOLS) {
      expect(screen.getByText(p.name)).toBeInTheDocument();
    }
  });

  it('renders each pillar section heading', () => {
    render(<HangboardPicker onNavigate={() => {}} />);
    expect(screen.getByText(/Max Strength/i)).toBeInTheDocument();
    expect(screen.getByText(/^Endurance$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Frequency$/i)).toBeInTheDocument();
  });
});
