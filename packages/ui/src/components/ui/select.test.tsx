import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './select';

// Radix UI Select relies on PointerEvent.hasPointerCapture which jsdom does not
// implement. Polyfill it so the component can open without throwing.
beforeAll(() => {
  if (typeof window !== 'undefined') {
    if (!window.PointerEvent) {
      class PointerEvent extends MouseEvent {
        pointerId: number;
        constructor(type: string, init?: PointerEventInit) {
          super(type, init);
          this.pointerId = init?.pointerId ?? 0;
        }
      }
      Object.defineProperty(window, 'PointerEvent', {
        writable: true,
        value: PointerEvent,
      });
    }

    if (!HTMLElement.prototype.hasPointerCapture) {
      HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
    }
    if (!HTMLElement.prototype.releasePointerCapture) {
      HTMLElement.prototype.releasePointerCapture = vi.fn();
    }
    if (!HTMLElement.prototype.setPointerCapture) {
      HTMLElement.prototype.setPointerCapture = vi.fn();
    }
  }
});

function renderSelect(onValueChange?: (v: string) => void) {
  return render(
    <Select onValueChange={onValueChange}>
      <SelectTrigger aria-label="Pick a fruit">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe('Select', () => {
  it('should render the trigger with placeholder text', () => {
    renderSelect();
    expect(screen.getByText('Select a fruit')).toBeInTheDocument();
  });

  it('should open the listbox on trigger click', () => {
    renderSelect();
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
  });

  it('should call onValueChange when an option is selected', () => {
    const handleChange = vi.fn();
    renderSelect(handleChange);

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Apple' }));

    expect(handleChange).toHaveBeenCalledWith('apple');
  });

  it('should display the selected value in the trigger', () => {
    render(
      <Select defaultValue="banana">
        <SelectTrigger aria-label="Pick a fruit">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('should be disabled when the disabled prop is set', () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Disabled" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
