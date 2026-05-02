import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';

vi.mock('../../api/wasteApi', () => ({
  getCategories: vi.fn(),
  getItems: vi.fn()
}));
vi.mock('../../store/authStore', () => ({
  default: () => ({ user: { role: 'admin' } })
}));

import WasteLibrary from '../../pages/WasteLibrary';
import { getCategories, getItems } from '../../api/wasteApi';

describe('WasteLibrary page', () => {
  beforeEach(() => {
    getCategories.mockResolvedValue({ data: { data: [{ _id: 'c1', name: 'Plastics', description: 'desc', recyclable: true } ] } });
    getItems.mockResolvedValue({ data: { data: [{ _id: 'i1', name: 'Bottle', description: 'plastic bottle', category: 'c1' }], pagination: null } });
  });

  it('renders header, filters and items', async () => {
    render(<WasteLibrary />);
    expect(screen.getByText('♻️ Waste Library')).toBeInTheDocument();

    // filters labels
    expect(screen.getByText('Recyclability')).toBeInTheDocument();
    expect(screen.getByText('Hazard Level')).toBeInTheDocument();

    // wait for items to load
    await waitFor(() => expect(screen.getByText('Bottle')).toBeInTheDocument());
  });
});
