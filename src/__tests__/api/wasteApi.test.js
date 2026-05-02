import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/axios', () => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }));

import * as api from '../../api/wasteApi';
import axios from '../../api/axios';

describe('wasteApi wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls axios.get for getCategories with params', () => {
    api.getCategories({ page: 1 });
    expect(axios.get).toHaveBeenCalledWith('/categories', { params: { page: 1 } });
  });

  it('calls axios.get for getItems with params', () => {
    api.getItems({ search: 'a' });
    expect(axios.get).toHaveBeenCalledWith('/items', { params: { search: 'a' } });
  });
});
