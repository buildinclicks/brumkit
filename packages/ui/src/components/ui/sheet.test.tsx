import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from './sheet';

describe('Sheet', () => {
  function SheetExample() {
    return (
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet description text.</SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <SheetClose>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  it('should render the sheet trigger', () => {
    render(<SheetExample />);
    expect(screen.getByText('Open Sheet')).toBeInTheDocument();
  });

  it('should not show content before trigger is clicked', () => {
    render(<SheetExample />);
    expect(screen.queryByText('Sheet Title')).not.toBeInTheDocument();
  });

  it('should show content when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<SheetExample />);

    await user.click(screen.getByText('Open Sheet'));

    expect(screen.getByText('Sheet Title')).toBeInTheDocument();
    expect(screen.getByText('Sheet description text.')).toBeInTheDocument();
  });

  it('should close when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<SheetExample />);

    await user.click(screen.getByText('Open Sheet'));
    expect(screen.getByText('Sheet Title')).toBeInTheDocument();

    // There may be multiple buttons named "Close" (sr-only X + explicit button)
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    await user.click(closeButtons[0]!);
    expect(screen.queryByText('Sheet Title')).not.toBeInTheDocument();
  });

  it('should render left side sheet', async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side="left">Left Panel</SheetContent>
      </Sheet>
    );

    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Left Panel')).toBeInTheDocument();
  });
});
