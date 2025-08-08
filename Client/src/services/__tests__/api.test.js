import { describe, it, expect, vi } from 'vitest';
import api, { pricesAPI } from '../api.js';

describe('pricesAPI', () => {
  it('URL-encodes medicine names with spaces and special characters', () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({});

    pricesAPI.get('Lipitor 10mg+50%');

    expect(getSpy).toHaveBeenCalledWith('/prices/Lipitor%2010mg%2B50%25');

    getSpy.mockRestore();
  });
});
