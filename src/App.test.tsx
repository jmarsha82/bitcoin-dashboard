import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the operations dashboard and future raw miner boundary', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByText('ASIC Health')).toBeInTheDocument();
    expect(screen.getByText('Pool Routing')).toBeInTheDocument();
    expect(screen.getByText('Raw Miner Engine')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Locked' })).toBeDisabled();
  });

  it('updates profitability when electricity cost changes', async () => {
    const user = userEvent.setup();
    render(<App />);

    const powerCost = screen.getByLabelText('Power cost per kWh');
    await user.clear(powerCost);
    await user.type(powerCost, '0.02');

    expect(powerCost).toHaveValue(0.02);
    expect(screen.getByText(/daily power cost/i)).toHaveTextContent('$4.79 daily power cost');
  });
});
