import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Timeline } from './Timeline';
import { useHolocronStore } from '@/store/holocron-store';

describe('<Timeline />', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    useHolocronStore.setState({
      eraId: 'clone-wars',
      selectedPlanetId: null,
      view: 'map',
      aiOpen: false,
    });
  });

  it('рендерит заголовок и все эпохи', () => {
    render(<Timeline />);
    expect(screen.getByText(/Таймлайн эпох/i)).toBeInTheDocument();
    expect(screen.getByText(/Clone Wars/i)).toBeInTheDocument();
    expect(screen.getByText(/Empire/i)).toBeInTheDocument();
  });

  it('переключает эпоху по клику', async () => {
    const user = userEvent.setup();
    render(<Timeline />);
    await user.click(screen.getByRole('button', { name: /empire/i }));
    expect(useHolocronStore.getState().eraId).toBe('empire');
  });
});
