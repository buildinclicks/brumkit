import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './table';

describe('Table', () => {
  function TableExample() {
    return (
      <Table>
        <TableCaption>Sample table</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Footer content</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
  }

  it('should render table without crashing', () => {
    render(<TableExample />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should render table headers', () => {
    render(<TableExample />);
    expect(
      screen.getByRole('columnheader', { name: 'Name' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Status' })
    ).toBeInTheDocument();
  });

  it('should render table cells', () => {
    render(<TableExample />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should render table caption', () => {
    render(<TableExample />);
    expect(screen.getByText('Sample table')).toBeInTheDocument();
  });

  it('should render footer content', () => {
    render(<TableExample />);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });
});
