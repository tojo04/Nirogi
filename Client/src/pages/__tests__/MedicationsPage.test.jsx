import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, beforeEach, expect, vi } from 'vitest';
import MedicationsPage from '../MedicationsPage.jsx';
import { medicationsAPI } from '../../services/api.js';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../../services/api.js', () => ({
  medicationsAPI: {
    search: vi.fn(),
  },
}));

const mockMedications = [
  { _id: '1', name: 'Paracetamol' },
  { _id: '2', name: 'Ibuprofen', brand: 'Advil', strength: '200', unit: 'mg', drugClass: 'NSAID' },
];

describe('MedicationsPage', () => {
  beforeEach(() => {
    medicationsAPI.search.mockResolvedValue({ data: { data: mockMedications } });
  });

  test('renders medications with fallback defaults', async () => {
    render(<MedicationsPage />);

    expect(await screen.findByText('Paracetamol')).toBeInTheDocument();

    expect(screen.getByText((_, el) => el.textContent === 'Brand: N/A')).toBeInTheDocument();
    expect(screen.getByText((_, el) => el.textContent === 'Strength: N/A')).toBeInTheDocument();
    expect(screen.getByText((_, el) => el.textContent === 'Class: N/A')).toBeInTheDocument();
  });

  test('search filters by name or brand', async () => {
    render(<MedicationsPage />);

    const searchInput = await screen.findByPlaceholderText(/search medications by name or brand/i);

    fireEvent.change(searchInput, { target: { value: 'Advil' } });

    await waitFor(() => {
      expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
      expect(screen.queryByText('Paracetamol')).not.toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: 'Paracetamol' } });

    await waitFor(() => {
      expect(screen.getByText('Paracetamol')).toBeInTheDocument();
      expect(screen.queryByText('Ibuprofen')).not.toBeInTheDocument();
    });
  });
});

