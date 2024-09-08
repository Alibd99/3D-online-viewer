import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import LoggedChatRoute from './LoggedChatRoute';
import { act } from 'react-dom/test-utils';

// Mock the `fetch` API for `handleExecutePython`
global.fetch = jest.fn(() =>
  Promise.resolve({
    status: 200,
  })
);

describe('LoggedChatRoute Component', () => {
  // Test rendering
  test('renders LoggedChatRoute component', () => {
    render(
      <MemoryRouter>
        <LoggedChatRoute />
      </MemoryRouter>
    );

    expect(screen.getByText(/Search for 3D model/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Write your text here/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Execute Python/i })).toBeInTheDocument();
  });

  // Test user typing and button click
  test('updates textarea and handles button clicks', async () => {
    render(
      <MemoryRouter>
        <LoggedChatRoute />
      </MemoryRouter>
    );

    const textarea = screen.getByPlaceholderText(/Write your text here/i);
    const sendButton = screen.getByRole('button', { name: /Send/i });
    const executeButton = screen.getByRole('button', { name: /Execute Python/i });

    // Test typing in textarea
    fireEvent.change(textarea, { target: { value: 'color red' } });
    expect(textarea.value).toBe('color red');

    // Test color selection
    const colorAutocomplete = screen.getByText(/color autocomplete/i); // Adjust this selector based on actual implementation
    fireEvent.click(colorAutocomplete);
    expect(textarea.value).toContain('color red'); // Update with the actual expected text after color selection

    // Test form submission
    fireEvent.submit(sendButton);
    await waitFor(() => {
      expect(textarea.value).toBe('');
    });

    // Test Execute Python button click
    await act(async () => {
      fireEvent.click(executeButton);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  // Clean up mocks after tests
  afterEach(() => {
    jest.resetAllMocks();
  });
});
