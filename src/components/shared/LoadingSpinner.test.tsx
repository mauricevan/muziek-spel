import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import LoadingSpinner from '../common/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render without crashing', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container).toBeTruthy();
  });

  it('should contain an SVG element', () => {
    const { container } = render(<LoadingSpinner />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('width')).toBe('38');
    expect(svg?.getAttribute('height')).toBe('38');
  });

  it('should have proper styling', () => {
    const { container } = render(<LoadingSpinner />);
    const div = container.firstChild as HTMLElement;
    expect(div).toBeTruthy();
    expect(div.style.display).toBe('flex');
    expect(div.style.justifyContent).toBe('center');
    expect(div.style.alignItems).toBe('center');
  });
});

