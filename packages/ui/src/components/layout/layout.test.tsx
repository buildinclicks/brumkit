import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Container, Stack } from './layout';

describe('Container', () => {
  it('should render children', () => {
    render(<Container>Content</Container>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should use lg size by default', () => {
    const { container } = render(<Container>Content</Container>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('max-w-screen-lg');
  });

  it('should apply sm size', () => {
    const { container } = render(<Container size="sm">Content</Container>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('max-w-screen-sm');
  });

  it('should apply md size', () => {
    const { container } = render(<Container size="md">Content</Container>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('max-w-screen-md');
  });

  it('should apply xl size', () => {
    const { container } = render(<Container size="xl">Content</Container>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('max-w-screen-xl');
  });

  it('should apply 2xl size', () => {
    const { container } = render(<Container size="2xl">Content</Container>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('max-w-screen-2xl');
  });

  it('should apply full size', () => {
    const { container } = render(<Container size="full">Content</Container>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('max-w-full');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Container className="custom-class">Content</Container>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('custom-class');
  });
});

describe('Stack', () => {
  it('should render children', () => {
    render(<Stack>Content</Stack>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should use column direction by default', () => {
    const { container } = render(<Stack>Content</Stack>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('flex-col');
  });

  it('should apply row direction', () => {
    const { container } = render(<Stack direction="row">Content</Stack>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('flex-row');
  });

  it('should apply spacing', () => {
    const { container } = render(<Stack spacing="lg">Content</Stack>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('gap-6');
  });

  it('should apply align center', () => {
    const { container } = render(<Stack align="center">Content</Stack>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('items-center');
  });

  it('should apply justify between', () => {
    const { container } = render(<Stack justify="between">Content</Stack>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('justify-between');
  });

  it('should apply none spacing', () => {
    const { container } = render(<Stack spacing="none">Content</Stack>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('gap-0');
  });

  it('should apply xs spacing', () => {
    const { container } = render(<Stack spacing="xs">Content</Stack>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('gap-1');
  });
});
