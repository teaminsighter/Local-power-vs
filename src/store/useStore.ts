import { create } from 'zustand';

export type StateType = 'NSW' | 'QLD' | 'VIC' | 'SA' | null;
export type SolutionType = 'solar' | 'battery' | 'solar-battery' | null;

interface StoreState {
  selectedState: StateType;
  selectedSolution: SolutionType;
  currentStep: number;
  formData: {
    address: string;
    electricityBill: number;
    roofType: string;
    propertyType: string;
  };
  setSelectedState: (state: StateType) => void;
  setSelectedSolution: (solution: SolutionType) => void;
  setCurrentStep: (step: number) => void;
  updateFormData: (data: Partial<StoreState['formData']>) => void;
  resetStore: () => void;
}

const useStore = create<StoreState>((set) => ({
  selectedState: null,
  selectedSolution: null,
  currentStep: 1,
  formData: {
    address: '',
    electricityBill: 0,
    roofType: '',
    propertyType: '',
  },
  setSelectedState: (state) => set({ selectedState: state }),
  setSelectedSolution: (solution) => set({ selectedSolution: solution }),
  setCurrentStep: (step) => set({ currentStep: step }),
  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  resetStore: () =>
    set({
      selectedState: null,
      selectedSolution: null,
      currentStep: 1,
      formData: {
        address: '',
        electricityBill: 0,
        roofType: '',
        propertyType: '',
      },
    }),
}));

export default useStore;