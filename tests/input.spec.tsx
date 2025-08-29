import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Input from '../src/components/Input';

describe('Input component', () => {
  it('includes dark theme text color class', () => {
    const html = renderToString(<Input />);
    expect(html).toContain('dark:text-gray-100');
  });
});
