
import { create } from 'zustand';

interface TestState {
    currentStep: 'INTRO' | 'GUIDE' | 'IAT' | 'IMPLICIT' | 'EXPLICIT' | 'WELLBEING' | 'ANALYZING' | 'RESULT';

    // Data Storage
    iatResults: any | null;
    implicitAnswers: Record<string, number>; // questionId -> score
    explicitGoal: string;
    explicitAnswers: Record<string, number>;
    wellbeingAnswers: Record<string, number>;
    stareData: { monsterGaze: number; forestGaze: number }; // Time looked at monster vs elsewhere (ms)
    walkingProgress: number; // Track progression through test (0-100)
    visualStage: number; // 1-7, used for grayscale to color progression
    testResult: any | null; // Stores full analysis result

    // Actions
    setStep: (step: TestState['currentStep']) => void;
    setIatResults: (results: any) => void;
    setImplicitAnswer: (id: string, value: number) => void;
    setExplicitGoal: (goal: string) => void;
    setExplicitAnswer: (id: string, value: number) => void;
    setWellbeingAnswer: (id: string, value: number) => void;
    updateStareData: (type: 'monster' | 'forest', ms: number) => void;
    incrementWalkingProgress: () => void;
    setVisualStage: (stage: number) => void;
    setTestResult: (result: any) => void;
    resetTest: () => void;
}

export const useTestStore = create<TestState>((set) => ({
    currentStep: 'INTRO',

    iatResults: null,
    implicitAnswers: {},
    explicitGoal: '',
    explicitAnswers: {},
    wellbeingAnswers: {},
    stareData: { monsterGaze: 0, forestGaze: 0 },
    walkingProgress: 0,
    visualStage: 1,
    testResult: null,

    setStep: (step) => set({ currentStep: step }),
    setIatResults: (results) => set({ iatResults: results }),
    setImplicitAnswer: (id, value) => set((state) => ({
        implicitAnswers: { ...state.implicitAnswers, [id]: value }
    })),
    setExplicitGoal: (goal) => set({ explicitGoal: goal }),
    setExplicitAnswer: (id, value) => set((state) => ({
        explicitAnswers: { ...state.explicitAnswers, [id]: value }
    })),
    setWellbeingAnswer: (id, value) => set((state) => ({
        wellbeingAnswers: { ...state.wellbeingAnswers, [id]: value }
    })),
    updateStareData: (type, ms) => set((state) => ({
        stareData: {
            ...state.stareData,
            [type === 'monster' ? 'monsterGaze' : 'forestGaze']: state.stareData[type === 'monster' ? 'monsterGaze' : 'forestGaze'] + ms
        }
    })),
    incrementWalkingProgress: () => set((state) => ({
        walkingProgress: Math.min(100, state.walkingProgress + 5)
    })),
    setVisualStage: (stage) => set({ visualStage: stage }),
    setTestResult: (result) => set({ testResult: result }),
    resetTest: () => set({
        currentStep: 'INTRO',
        iatResults: null,
        implicitAnswers: {},
        explicitGoal: '',
        explicitAnswers: {},
        wellbeingAnswers: {},
        stareData: { monsterGaze: 0, forestGaze: 0 },
        walkingProgress: 0,
        visualStage: 1,
        testResult: null,
    }),
}));
