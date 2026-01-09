/**
 * Integration Tests for usePayrollWizard Hook
 * Tests the complete payroll wizard flow including state management and step navigation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { usePayrollWizard, WIZARD_STEPS } from '../usePayrollWizard';
import type { WorkLocation } from '../useWorkLocations';

// Mock the dependencies
vi.mock('../usePayrollRunsV2', () => ({
  useCreatePayrollRun: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'new-run-123' }),
    isPending: false,
  }),
  usePayrollRun: () => ({ data: null }),
  useUpdatePayrollRun: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
  useCheckExistingDraft: () => ({ data: null }),
}));

vi.mock('../usePayrollRunEmployees', () => ({
  usePayrollRunEmployees: () => ({
    data: [],
    snapshotEmployees: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('../usePayrollRunAdjustments', () => ({
  usePayrollRunAdjustments: () => ({ data: [] }),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock location for testing
const mockLocation: WorkLocation = {
  id: 'loc-123',
  name: 'Main Office',
  address: '123 Main St',
  city: 'Riyadh',
  country: 'Saudi Arabia',
  currency: 'SAR',
  is_remote: false,
  is_hq: true,
  created_at: '2024-01-01',
  employeeCount: 10,
  gosi_enabled: false,
  gosi_nationality_rates: [],
  gosi_base_calculation: 'basic_plus_housing',
};

describe('usePayrollWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state when no existing run', () => {
      const { result } = renderHook(
        () => usePayrollWizard({
          location: mockLocation,
          onComplete: vi.fn(),
        }),
        { wrapper: createWrapper() }
      );

      expect(result.current.state.currentStep).toBe(0);
      expect(result.current.state.runId).toBeNull();
      expect(result.current.state.selectedEmployeeIds).toEqual([]);
      expect(result.current.steps).toEqual(WIZARD_STEPS);
    });

    it('should start at step 2 when existing run ID is provided', () => {
      const { result } = renderHook(
        () => usePayrollWizard({
          location: mockLocation,
          existingRunId: 'existing-run-456',
          onComplete: vi.fn(),
        }),
        { wrapper: createWrapper() }
      );

      expect(result.current.state.currentStep).toBe(2);
      expect(result.current.state.runId).toBe('existing-run-456');
    });

    it('should set pay period to current month by default', () => {
      const { result } = renderHook(
        () => usePayrollWizard({
          location: mockLocation,
          onComplete: vi.fn(),
        }),
        { wrapper: createWrapper() }
      );

      // Should have valid date strings
      expect(result.current.state.payPeriodStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.current.state.payPeriodEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Step Navigation', () => {
    it('should navigate to next step with goNext', async () => {
      const { result } = renderHook(
        () => usePayrollWizard({
          location: mockLocation,
          onComplete: vi.fn(),
        }),
        { wrapper: createWrapper() }
      );

      expect(result.current.state.currentStep).toBe(0);

      await act(async () => {
        await result.current.actions.goNext();
      });

      expect(result.current.state.currentStep).toBe(1);
    });

    it('should navigate back with goBack', async () => {
      const { result } = renderHook(
        () => usePayrollWizard({
          location: mockLocation,
          onComplete: vi.fn(),
        }),
        { wrapper: createWrapper() }
      );

      // Go to step 1 first
      await act(async () => {
        await result.current.actions.goNext();
      });

      expect(result.current.state.currentStep).toBe(1);

      act(() => {
        result.current.actions.goBack();
      });

      expect(result.current.state.currentStep).toBe(0);
    });

    it('should not go below step 0', () => {
      const { result } = renderHook(
        () => usePayrollWizard({
          location: mockLocation,
          onComplete: vi.fn(),
        }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.actions.goBack();
      });

      expect(result.current.state.currentStep).toBe(0);
    });

    it('should navigate to specific step with goToStep', () => {
      const { result } = renderHook(
        () => usePayrollWizard({
          location: mockLocation,
          onComplete: vi.fn(),
        }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.actions.goToStep(3);
      });

      expect(result.current.state.currentStep).toBe(3);
    });

    it('should clamp step to valid range', () => {
      const { result } = renderHook(
        () => usePayrollWizard({
          location: mockLocation,
          onComplete: vi.fn(),
        }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.actions.goToStep(100);
      });

      expect(result.current.state.currentStep).toBe(WIZARD_STEPS.length - 1);

      act(() => {
        result.current.actions.goToStep(-5);
      });

      expect(result.current.state.currentStep).toBe(0);
    });
  });

  describe('Pay Period Management', () => {
    it('should update pay period start date', () => {
      const { result } = renderHook(
        () => usePayrollWizard({
          location: mockLocation,
          onComplete: vi.fn(),
        }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.actions.setPayPeriodStart('2024-03-01');
      });

      expect(result.current.state.payPeriodStart).toBe('2024-03-01');
    });

    it('should update pay period end date', () => {
      const { result } = renderHook(
        () => usePayrollWizard({
          location: mockLocation,
          onComplete: vi.fn(),
        }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.actions.setPayPeriodEnd('2024-03-31');
      });

      expect(result.current.state.payPeriodEnd).toBe('2024-03-31');
    });
  });

  describe('Employee Selection', () => {
    it('should update selected employee IDs', () => {
      const { result } = renderHook(
        () => usePayrollWizard({
          location: mockLocation,
          onComplete: vi.fn(),
        }),
        { wrapper: createWrapper() }
      );

      const employeeIds = ['emp-1', 'emp-2', 'emp-3'];

      act(() => {
        result.current.actions.setSelectedEmployeeIds(employeeIds);
      });

      expect(result.current.state.selectedEmployeeIds).toEqual(employeeIds);
    });

    it('should set canProceed to false when on step 2 with no employees', () => {
      const { result } = renderHook(
        () => usePayrollWizard({
          location: mockLocation,
          onComplete: vi.fn(),
        }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.actions.goToStep(2);
      });

      expect(result.current.status.canProceed).toBe(false);
    });

    it('should set canProceed to true when employees are selected on step 2', () => {
      const { result } = renderHook(
        () => usePayrollWizard({
          location: mockLocation,
          onComplete: vi.fn(),
        }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.actions.goToStep(2);
        result.current.actions.setSelectedEmployeeIds(['emp-1']);
      });

      expect(result.current.status.canProceed).toBe(true);
    });
  });

  describe('Draft Management', () => {
    it('should resume draft and go to step 2', () => {
      const { result } = renderHook(
        () => usePayrollWizard({
          location: mockLocation,
          onComplete: vi.fn(),
        }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.actions.resumeDraft('draft-123');
      });

      expect(result.current.state.runId).toBe('draft-123');
      expect(result.current.state.currentStep).toBe(2);
    });

    it('should call onComplete when saving draft', async () => {
      const onComplete = vi.fn();
      const { result } = renderHook(
        () => usePayrollWizard({
          location: mockLocation,
          onComplete,
        }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.actions.saveDraft();
      });

      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe('Wizard Steps Configuration', () => {
    it('should have 5 steps defined', () => {
      expect(WIZARD_STEPS).toHaveLength(5);
    });

    it('should have correct step IDs', () => {
      const stepIds = WIZARD_STEPS.map(step => step.id);
      expect(stepIds).toEqual([0, 1, 2, 3, 4]);
    });

    it('should have all required step properties', () => {
      WIZARD_STEPS.forEach(step => {
        expect(step).toHaveProperty('id');
        expect(step).toHaveProperty('label');
        expect(step).toHaveProperty('description');
        expect(typeof step.label).toBe('string');
        expect(typeof step.description).toBe('string');
      });
    });
  });

  describe('Status Flags', () => {
    it('should expose isCreating status', () => {
      const { result } = renderHook(
        () => usePayrollWizard({
          location: mockLocation,
          onComplete: vi.fn(),
        }),
        { wrapper: createWrapper() }
      );

      expect(typeof result.current.status.isCreating).toBe('boolean');
    });

    it('should expose isUpdating status', () => {
      const { result } = renderHook(
        () => usePayrollWizard({
          location: mockLocation,
          onComplete: vi.fn(),
        }),
        { wrapper: createWrapper() }
      );

      expect(typeof result.current.status.isUpdating).toBe('boolean');
    });
  });
});
