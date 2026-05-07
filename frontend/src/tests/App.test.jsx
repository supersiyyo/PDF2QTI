import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../App';
import PDF2QTI from '../pages/tools/PDF2QTI';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

describe('App Component', () => {
  it('renders the Educational Tools Platform home page', () => {
    render(<App />);
    expect(screen.getByText(/Educational Tools Platform/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF to Canvas QTI/i)).toBeInTheDocument();
  });

  it('renders the PDF2QTI tool and its upload component', () => {
    // Render the tool directly. Since it's a tool page, we wrap it in a MemoryRouter
    // in case it needs any router context.
    render(
      <MemoryRouter>
        <PDF2QTI />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/PDF to Canvas QTI/i)).toBeInTheDocument();
    expect(screen.getByText(/Click or drag PDF here to upload/i)).toBeInTheDocument();
  });
});
