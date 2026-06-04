import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { RadioGroup, RadioGroupItem } from './radio-group';

describe('RadioGroup', () => {
  function RadioGroupExample({
    onValueChange,
  }: {
    onValueChange?: (value: string) => void;
  }) {
    return (
      <RadioGroup defaultValue="option1" onValueChange={onValueChange}>
        <RadioGroupItem value="option1" id="option1" aria-label="Option 1" />
        <RadioGroupItem value="option2" id="option2" aria-label="Option 2" />
      </RadioGroup>
    );
  }

  it('should render radio buttons', () => {
    render(<RadioGroupExample />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
  });

  it('should have the default value selected', () => {
    render(<RadioGroupExample />);
    expect(screen.getByLabelText('Option 1')).toBeChecked();
  });

  it('should change selection on click', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<RadioGroupExample onValueChange={onValueChange} />);
    await user.click(screen.getByLabelText('Option 2'));

    expect(onValueChange).toHaveBeenCalledWith('option2');
  });

  it('should render without crashing with no default value', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" aria-label="A" />
      </RadioGroup>
    );
    expect(screen.getByRole('radio')).toBeInTheDocument();
  });
});
