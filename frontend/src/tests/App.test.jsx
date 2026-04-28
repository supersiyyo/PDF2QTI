import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../App';
import '@testing-library/jest-dom';

describe('App Component', () => {
  it('renders the header correctly', () => {
    render(<App />);
    expect(screen.getByText(/PDF to Canvas QTI/i)).toBeInTheDocument();
    expect(screen.getByText(/Transform documents and static quizzes/i)).toBeInTheDocument();
  });

  it('renders the upload component initially', () => {
    render(<App />);
    // Check for "Click or drag PDF here to upload" which should be in UploadComponent
    expect(screen.getByText(/Click or drag PDF here to upload/i)).toBeInTheDocument();
  });
});
