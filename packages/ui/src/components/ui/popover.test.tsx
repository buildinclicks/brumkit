import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { Popover, PopoverTrigger, PopoverContent } from './popover';

describe('Popover', () => {
  function PopoverExample() {
    return (
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>
    );
  }

  it('should render trigger button', () => {
    render(<PopoverExample />);
    expect(screen.getByText('Open Popover')).toBeInTheDocument();
  });

  it('should not show content before trigger click', () => {
    render(<PopoverExample />);
    expect(screen.queryByText('Popover Content')).not.toBeInTheDocument();
  });

  it('should show content after clicking trigger', async () => {
    const user = userEvent.setup();
    render(<PopoverExample />);

    await user.click(screen.getByText('Open Popover'));

    expect(screen.getByText('Popover Content')).toBeInTheDocument();
  });
});
