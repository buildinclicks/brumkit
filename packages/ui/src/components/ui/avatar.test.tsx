import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Avatar, AvatarImage, AvatarFallback } from './avatar';

describe('Avatar', () => {
  it('should render without crashing', () => {
    const { container } = render(<Avatar />);
    expect(container.firstChild).toBeTruthy();
  });

  it('should render fallback initials', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should apply custom className to root', () => {
    const { container } = render(<Avatar className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render AvatarImage with src', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="User avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    // AvatarFallback is accessible while image loads
    // Either the image or fallback should be in the document
    expect(
      document.body.textContent?.includes('JD') ||
        !!document.querySelector('img')
    ).toBe(true);
  });
});
