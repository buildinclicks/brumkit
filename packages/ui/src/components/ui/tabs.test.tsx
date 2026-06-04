import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

describe('Tabs', () => {
  function TabsExample() {
    return (
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
  }

  it('should render tabs without crashing', () => {
    render(<TabsExample />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('should render tab triggers', () => {
    render(<TabsExample />);
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
  });

  it('should show default tab content', () => {
    render(<TabsExample />);
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('should switch to another tab on click', async () => {
    const user = userEvent.setup();
    render(<TabsExample />);

    await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });
});
