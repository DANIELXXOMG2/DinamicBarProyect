import { useState, useCallback } from 'react';

export function useEditableCell(
  initialValue: string,
  onSave: (newValue: string) => Promise<void>
) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
    },
    []
  );

  const handleBlur = useCallback(async () => {
    setIsEditing(false);
    if (value !== initialValue) {
      try {
        await onSave(value);
      } catch (error) {
        console.error('Failed to save value:', error);
        setValue(initialValue); // Revert on error
      }
    }
  }, [value, initialValue, onSave]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleBlur();
      }
    },
    [handleBlur]
  );

  return {
    isEditing,
    value,
    handleDoubleClick,
    handleChange,
    handleBlur,
    handleKeyDown,
  };
}
