
// Map raw test answers to the 16 PAIMA Z-score variables

interface RawData {
    implicitAnswers: Record<string, number>; // "imgId_qId": 0-10
    explicitAnswers: Record<string, number>; // "index": 0-6 (Likert 7 point usually) - need to check LikertScale
    wellbeingAnswers: Record<string, number>; // "index": 0-6
    iatAnswers?: number[]; // Reaction Times in ms (114 trials expected)
    stareData?: { monsterGaze: number; forestGaze: number };
}

export interface PaimaScores {
    // 16 Variables (Standardized Z-Scores)
    Z_PSCI: number;
    Z_MDI_Ach: number;
    Z_MDI_Pow: number;
    Z_MDI_Aff: number;

    Z_iM_Ach: number;
    Z_iM_Pow: number;
    Z_iM_Aff: number;

    Z_eM_Ach: number;
    Z_eM_Pow: number;
    Z_eM_Aff: number;

    Z_N_Auto: number;
    Z_N_Comp: number;
    Z_N_Rela: number;

    Z_W_Wellbeing: number;
    Z_C_Depletion: number;
    Z_C_External: number;
}

// Z-Score Standardizer
// Input: Raw Score, Mean (Center), Range (Max-Min or Max)
// We map the Theoretical Range [Min, Max] to Z-Score Range [-2.0, +2.0].
// Center is (Max+Min)/2.
const mapToZ = (val: number, min: number, max: number) => {
    // Normalize to 0..1
    const norm = (val - min) / (max - min);
    // Map 0 -> -2, 0.5 -> 0, 1 -> +2
    return (norm - 0.5) * 4;
};

// IAT Helper: Calculate PSCI (D-Score)
// D-Score = (Mean_Incompatible - Mean_Compatible) / SD_Pooled
const calculateIAT_PSCI = (times: number[] | undefined): number => {
    // Tolerant check: we need at least 114 trials to have valid blocks.
    if (!times || times.length < 114) return 0; // Default Z=0

    // Phase 3: Compatible (Me + Acceptance) -> Trials 24-63 (40 items)
    // Indices 24..64 (slice end exclusive)
    const blockComp = times.slice(24, 64);

    // Phase 5: Incompatible (Me + Oppression) -> Trials 74-113 (40 items)
    // Indices 74..114 (slice end exclusive)
    const blockIncomp = times.slice(74, 114);

    // If slices are empty (shouldn't happen with length check), return 0
    if (blockComp.length === 0 || blockIncomp.length === 0) return 0;

    // Simple robust mean
    const meanComp = blockComp.reduce((a, b) => a + b, 0) / blockComp.length;
    const meanIncomp = blockIncomp.reduce((a, b) => a + b, 0) / blockIncomp.length;

    // Pooled SD calculation
    const all = [...blockComp, ...blockIncomp];
    const meanAll = all.reduce((a, b) => a + b, 0) / all.length;
    const variance = all.reduce((a, b) => a + Math.pow(b - meanAll, 2), 0) / all.length;
    const sd = Math.sqrt(variance) || 1; // Prevent div by 0

    // D-Score
    // If Incomp (Repression) is slower -> MeanIncomp > MeanComp -> D > 0.
    // Meaning: Shadow Conflict Present.
    const dScore = (meanIncomp - meanComp) / sd;

    // D-Scores usually range -2 to +2. We treat it directly as Z_PSCI.
    return dScore;
};

export const calculatePaimaScores = (data: RawData): PaimaScores => {
    const { implicitAnswers, explicitAnswers, wellbeingAnswers, iatAnswers, stareData } = data;

    // --- 0. Z_PSCI (from IAT) ---
    const Z_PSCI = calculateIAT_PSCI(iatAnswers);

    // --- 1. Implicit Motives (iM) ---
    // iM = Hope_Raw - Fear_Raw
    // Images 1-6. Questions: 
    // Q1(Ach Hope), Q2(Ach Fear)
    // Q3(Pow Hope), Q4(Pow Fear)
    // Q5(Aff Hope), Q6(Aff Fear)
    // Each Q is 0-10. Sum over 6 images.
    // Max Sum = 60. Min Sum = 0.
    // iM Range for (Hope-Fear): (0..60) - (0..60) = -60 to +60.

    let iAchHope = 0, iAchFear = 0;
    let iPowHope = 0, iPowFear = 0;
    let iAffHope = 0, iAffFear = 0;

    const imgCount = 6;
    for (let i = 1; i <= imgCount; i++) {
        const imgId = `img${i}`;
        // Note: Check input keys carefully. usually img1_q1
        iAchHope += (implicitAnswers[`${imgId}_q1`] || 0);
        iAchFear += (implicitAnswers[`${imgId}_q2`] || 0);

        iPowHope += (implicitAnswers[`${imgId}_q3`] || 0);
        iPowFear += (implicitAnswers[`${imgId}_q4`] || 0);

        iAffHope += (implicitAnswers[`${imgId}_q5`] || 0);
        iAffFear += (implicitAnswers[`${imgId}_q6`] || 0);
    }

    const raw_iAch = iAchHope - iAchFear;
    const raw_iPow = iPowHope - iPowFear;
    const raw_iAff = iAffHope - iAffFear;

    const Z_iM_Ach = mapToZ(raw_iAch, -24, 24);
    const Z_iM_Pow = mapToZ(raw_iPow, -24, 24);
    const Z_iM_Aff = mapToZ(raw_iAff, -24, 24);

    // --- 2. Explicit Motives (eM) ---
    // 9 Questions (Likert 1-5). Normalized 0-4.
    // Average of 3 items per motive.
    // Range 0 to 4.
    const getEM = (indices: number[]) => {
        const sum = indices.reduce((acc, idx) => acc + ((explicitAnswers[idx] || 1) - 1), 0);
        return sum / 3;
    };

    const raw_eAch = getEM([0, 1, 2]);
    const raw_ePow = getEM([3, 4, 5]);
    const raw_eAff = getEM([6, 7, 8]);

    const Z_eM_Ach = mapToZ(raw_eAch, 0, 4);
    const Z_eM_Pow = mapToZ(raw_ePow, 0, 4);
    const Z_eM_Aff = mapToZ(raw_eAff, 0, 4);

    // --- 3. MDI (Discrepancy) ---
    // Spec: | Z(eM) - Z(iM) |
    const Z_MDI_Ach = Math.abs(Z_eM_Ach - Z_iM_Ach);
    const Z_MDI_Pow = Math.abs(Z_eM_Pow - Z_iM_Pow);
    const Z_MDI_Aff = Math.abs(Z_eM_Aff - Z_iM_Aff);

    // --- 4. Needs (N) & Wellbeing (W/C) ---
    // 18 Questions total.
    const getWB = (idx: number) => (wellbeingAnswers[idx] || 1) - 1; // 0-4 scale

    // Q1-2: Autonomy
    const raw_N_Auto = (getWB(0) + getWB(1)) / 2;
    const Z_N_Auto = mapToZ(raw_N_Auto, 0, 4);

    // Q3-4: Competence
    const raw_N_Comp = (getWB(2) + getWB(3)) / 2;
    const Z_N_Comp = mapToZ(raw_N_Comp, 0, 4);

    // Q5-6: Relatedness
    const raw_N_Rela = (getWB(4) + getWB(5)) / 2;
    const Z_N_Rela = mapToZ(raw_N_Rela, 0, 4);

    // Wellbeing (Q7-16, 10 items)
    let wSum = 0;
    for (let i = 6; i <= 15; i++) wSum += getWB(i);
    const raw_W = wSum / 10;
    const Z_W_Wellbeing = mapToZ(raw_W, 0, 4);

    // Conflict Depletion (Q17) - Single Item
    const Z_C_Depletion = mapToZ(getWB(16), 0, 4);

    // Conflict External (Q18) - Single Item
    const Z_C_External = mapToZ(getWB(17), 0, 4);

    // --- 5. Custom Interaction: Shadow Curiosity ---
    // Using stareData to adjust Z_PSCI (Unconscious Acceptance)
    let shadowAdjustment = 0;
    if (stareData) {
        const totalGaze = stareData.monsterGaze + stareData.forestGaze;
        if (totalGaze > 0) {
            const monsterRatio = stareData.monsterGaze / totalGaze;
            // High gaze on monster -> Higher acceptance of shadow -> Lower PSCI conflict
            // Map 0..1 ratio to -0.5 to +0.5 adjustment
            shadowAdjustment = (monsterRatio - 0.5);
        }
    }

    return {
        Z_PSCI: Z_PSCI - shadowAdjustment, // Adjusted by interaction
        Z_MDI_Ach, Z_MDI_Pow, Z_MDI_Aff,
        Z_iM_Ach, Z_iM_Pow, Z_iM_Aff,
        Z_eM_Ach, Z_eM_Pow, Z_eM_Aff,
        Z_N_Auto, Z_N_Comp, Z_N_Rela,
        Z_W_Wellbeing,
        Z_C_Depletion,
        Z_C_External
    };
};
