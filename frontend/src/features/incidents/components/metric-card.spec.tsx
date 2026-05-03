import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricCard } from './metric-card';
import { Activity } from 'lucide-react';

describe('MetricCard', () => {
  it('renders label and value correctly', () => {
    render(
      <MetricCard
        icon={Activity}
        label="Total Incidents"
        value={123}
        tone="slate"
      />
    );

    expect(screen.getByText('Total Incidents')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('applies correct tone classes', () => {
    const { container } = render(
      <MetricCard
        icon={Activity}
        label="Critical"
        value={5}
        tone="red"
      />
    );

    const iconContainer = container.querySelector('.bg-rose-50');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass('text-rose-700');
  });
});
