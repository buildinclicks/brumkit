import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { Textarea } from './textarea';

describe('Textarea', () => {
  it('should render without crashing', () => {
    render(<Textarea />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render with a placeholder', () => {
    render(<Textarea placeholder="Write something..." />);
    expect(
      screen.getByPlaceholderText('Write something...')
    ).toBeInTheDocument();
  });

  it('should reflect a controlled value', () => {
    render(<Textarea value="some text" onChange={() => {}} />);
    expect(screen.getByDisplayValue('some text')).toBeInTheDocument();
  });

  it('should be disabled when the disabled prop is set', () => {
    render(<Textarea disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should call onChange when the user types', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} />);

    await user.type(screen.getByRole('textbox'), 'Hello');
    expect(handleChange).toHaveBeenCalled();
  });

  it('should respect the rows prop', () => {
    render(<Textarea rows={5} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
  });
});
