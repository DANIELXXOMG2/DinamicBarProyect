import { Input } from '@/components/ui/input';
import { useEditableCell } from '../hooks/use-editable-cell';

interface EditableCellProps {
  readonly initialValue: string;
  readonly onSave: (newValue: string) => Promise<void>;
}

export function EditableCell({ initialValue, onSave }: EditableCellProps) {
  const {
    isEditing,
    value,
    handleDoubleClick,
    handleChange,
    handleBlur,
    handleKeyDown,
  } = useEditableCell(initialValue, onSave);

  if (isEditing) {
    return (
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <div onDoubleClick={handleDoubleClick} className="cursor-pointer">
      {value}
    </div>
  );
}
