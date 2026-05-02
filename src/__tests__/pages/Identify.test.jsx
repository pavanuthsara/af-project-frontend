import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Identify from '../../pages/Identify';

describe('Identify page', () => {
  it('renders header and upload prompt', () => {
    render(<Identify />);
    expect(screen.getByText('🔍 AI Waste Identifier')).toBeInTheDocument();
    expect(screen.getByText(/Drop image here or click to upload/i)).toBeInTheDocument();
  });
});
