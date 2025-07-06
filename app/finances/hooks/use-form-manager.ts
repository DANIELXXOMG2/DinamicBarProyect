'use client';

import { useContext } from 'react';

import { FormManagerContext } from '../context/form-manager.context';

export const useFormManager = () => {
  const context = useContext(FormManagerContext);
  if (!context) {
    throw new Error('useFormManager must be used within a FormManagerProvider');
  }
  return context;
};

export type { FormId } from '../context/form-manager.context';
