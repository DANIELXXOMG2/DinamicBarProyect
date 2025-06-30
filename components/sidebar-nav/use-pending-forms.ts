import { useState, useEffect } from 'react';
import { useGlobalFormStatus } from '@/hooks/use-form-persistence';

export function usePendingForms() {
  const { pendingForms } = useGlobalFormStatus();
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (pendingForms.length === 0) {
      setTimeRemaining('');
      return;
    }

    const updateTimeRemaining = () => {
      let minTimeRemaining = Infinity;

      for (const formKey of pendingForms) {
        const savedData = localStorage.getItem(`form_${formKey}`);
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            const remaining = parsed.expiresAt - Date.now();
            if (remaining > 0 && remaining < minTimeRemaining) {
              minTimeRemaining = remaining;
            }
          } catch (error) {
            console.error('Error parsing form data:', error);
          }
        }
      }

      if (minTimeRemaining !== Infinity && minTimeRemaining > 0) {
        const minutes = Math.floor(minTimeRemaining / (1000 * 60));
        const seconds = Math.floor((minTimeRemaining % (1000 * 60)) / 1000);
        setTimeRemaining(
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      } else {
        setTimeRemaining('');
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [pendingForms]);

  return { pendingForms, timeRemaining };
}
