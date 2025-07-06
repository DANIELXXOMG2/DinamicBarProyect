'use client';

import {
  createContext,
  useState,
  useMemo,
  ReactNode,
  useCallback,
} from 'react';

export type FormId = 'income' | 'expense' | 'purchase';

interface FormManagerState {
  minimizedForms: FormId[];
  activeForm: FormId | null;
  toggleMinimize: (formId: FormId) => void;
  setActiveForm: (formId: FormId | null) => void;
}

export const FormManagerContext = createContext<FormManagerState | undefined>(
  undefined
);

interface FormManagerProviderProps {
  readonly children: ReactNode;
}

export function FormManagerProvider({ children }: FormManagerProviderProps) {
  const [minimizedForms, setMinimizedForms] = useState<FormId[]>([]);
  const [activeForm, setActiveForm] = useState<FormId | null>(null);

  const toggleMinimize = useCallback(
    (formId: FormId) => {
      setMinimizedForms((previous) =>
        previous.includes(formId)
          ? previous.filter((id) => id !== formId)
          : [...previous, formId]
      );
      if (activeForm === formId) {
        setActiveForm(null);
      }
    },
    [activeForm]
  );

  const contextValue = useMemo(
    () => ({
      minimizedForms,
      activeForm,
      toggleMinimize,
      setActiveForm,
    }),
    [minimizedForms, activeForm, toggleMinimize, setActiveForm]
  );

  return (
    <FormManagerContext.Provider value={contextValue}>
      {children}
    </FormManagerContext.Provider>
  );
}
