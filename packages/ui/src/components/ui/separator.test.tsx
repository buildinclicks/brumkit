import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Separator } from './separator';

describe('Separator', () => {
  it('should render without crashing', () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render horizontal separator by default', () => {
    const { container } = render(<Separator />);
    const el = container.firstChild as HTMLElement;
    expect(el).toBeInTheDocument();
  });

  it('should render vertical separator', () => {
    const { container } = render(<Separator orientation="vertical" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Separator className="my-class" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('my-class');
  });
});
