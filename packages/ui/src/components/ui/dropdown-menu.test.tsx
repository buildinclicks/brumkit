import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuGroup,
} from './dropdown-menu';

describe('DropdownMenu', () => {
  function DropdownExample({ onSelect }: { onSelect?: () => void }) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onSelect}>Profile</DropdownMenuItem>
            <DropdownMenuItem disabled>Billing</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  it('should render trigger button', () => {
    render(<DropdownExample />);
    expect(screen.getByText('Open Menu')).toBeInTheDocument();
  });

  it('should not show menu content before trigger click', () => {
    render(<DropdownExample />);
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });

  it('should show menu items when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<DropdownExample />);

    await user.click(screen.getByText('Open Menu'));

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
  });

  it('should call onSelect when a menu item is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<DropdownExample onSelect={onSelect} />);

    await user.click(screen.getByText('Open Menu'));
    await user.click(screen.getByText('Profile'));

    expect(onSelect).toHaveBeenCalled();
  });

  it('should show label', async () => {
    const user = userEvent.setup();
    render(<DropdownExample />);

    await user.click(screen.getByText('Open Menu'));

    expect(screen.getByText('My Account')).toBeInTheDocument();
  });
});

describe('DropdownMenuCheckboxItem', () => {
  it('should render a checkbox menu item', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={false}>
            Show status
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Show status')).toBeInTheDocument();
  });
});

describe('DropdownMenuRadioGroup', () => {
  it('should render radio group items', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="option1">
            <DropdownMenuRadioItem value="option1">
              Option 1
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="option2">
              Option 2
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });
});
