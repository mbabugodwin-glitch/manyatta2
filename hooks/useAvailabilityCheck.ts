import { useState, useCallback } from 'react';
import { checkPropertyAvailability, AvailabilityCheckPayload } from '../services/bookingService';

interface AvailabilityState {
  available: boolean;
  reason?: string;
  checking: boolean;
  error?: string;
}

/**
 * Hook to check property availability
 */
export const useAvailabilityCheck = () => {
  const [state, setState] = useState<AvailabilityState>({
    available: true,
    checking: false,
  });

  const checkAvailability = useCallback(async (payload: AvailabilityCheckPayload) => {
    try {
      setState((prev) => ({ ...prev, checking: true, error: undefined }));
      const result = await checkPropertyAvailability(payload);
      setState({
        available: result.available,
        reason: result.reason,
        checking: false,
      });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Availability check failed';
      setState({
        available: false,
        checking: false,
        error: message,
      });
      throw error;
    }
  }, []);

  return {
    ...state,
    checkAvailability,
  };
};
