import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import ComparePage from '../ComparePage.jsx';
import { medicationsAPI } from '../../services/api.js';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../../services/api.js', () => ({
  medicationsAPI: {
    getPopular: vi.fn(),
    search: vi.fn(),
  },
  pricesAPI: {
    get: vi.fn(),
  },
}));

describe('ComparePage', () => {
  test('renders medications with fallback defaults', async () => {
    medicationsAPI.getPopular.mockResolvedValue({ data: { data: [{ _id: '1', name: 'Paracetamol' }] } });

    render(<ComparePage />);

    expect(await screen.findByText('Paracetamol')).toBeInTheDocument();
    expect(screen.getByText('N/A - N/A')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  test('search works when only name present', async () => {
    medicationsAPI.getPopular.mockResolvedValue({ data: { data: [] } });
    medicationsAPI.search.mockResolvedValue({ data: { data: [{ _id: '1', name: 'Paracetamol' }] } });

    render(<ComparePage />);

    fireEvent.change(screen.getByPlaceholderText(/e.g./i), { target: { value: 'Paracetamol' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(await screen.findByText('Paracetamol')).toBeInTheDocument();
  });
});

