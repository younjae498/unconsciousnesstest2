'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Svg, Line, Rect, Circle, Polyline, Image } from '@react-pdf/renderer';
import { RESULT_PROFILES } from '../../../data/resultProfiles';
import { getInterpretation } from '../../../lib/resultCalculator';

// Korean Font Support - Using Google Fonts API
Font.register({
    family: 'Noto Sans KR',
    src: 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@latest/korean-400-normal.ttf',
});

Font.register({
    family: 'Noto Serif KR',
    src: 'https://cdn.jsdelivr.net/fontsource/fonts/noto-serif-kr@latest/korean-400-normal.ttf',
});

// Styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#ffffff',
        fontFamily: 'Noto Serif KR',
        color: '#333',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 5,
        marginBottom: 10,
    },
    headerText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#333',
    },
    titleBlock: {
        marginBottom: 20,
        alignItems: 'center',
    },
    mainTitle: {
        fontFamily: 'Noto Sans KR',
        fontSize: 32,
        color: '#1a3c34', // Dark Green
        textAlign: 'center',
        marginBottom: 5,
    },
    subTitle: {
        fontFamily: 'Noto Sans KR',
        fontSize: 14,
        color: '#1a3c34',
        textAlign: 'right',
        width: '100%',
        paddingRight: 10,
        marginBottom: 20,
    },
    contentRow: {
        flexDirection: 'row',
        gap: 20,
    },
    leftCol: {
        width: '45%',
    },
    rightCol: {
        width: '55%',
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#000',
    },
    sectionSubTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    bodyText: {
        fontSize: 8,
        lineHeight: 1.6,
        color: '#444',
        marginBottom: 15,
        textAlign: 'justify',
    },
    chartLabel: {
        fontSize: 7,
        color: '#666',
    },
    greenBox: {
        backgroundColor: '#4a6741',
    },
    lightGreenBox: {
        backgroundColor: '#8f9e8a',
    },
});

interface AnalysisReportPDFProps {
    userData: {
        name: string;
        date: string;
    };
    results: any;
    aiAnalysis?: any;
}

const AnalysisReportPDF = ({ userData, results, aiAnalysis }: AnalysisReportPDFProps) => {
    const paima = results.paima || {};
    const profileKey = paima.profileKey || 'WANDERING_EXPLORER';
    const profileData = RESULT_PROFILES[profileKey] || RESULT_PROFILES['WANDERING_EXPLORER'];

    // Map Z-scores to 0-100 range for visualization
    const mapZ = (z: number) => Math.min(Math.max((z * 20) + 50, 10), 90);

    // DYNAMIC Line Chart Data - Using actual motivation scores
    // Comparing implicit (무의식) vs explicit (의식) motivations
    const lineChartData = [
        {
            x: 20,
            label: '성취동기',
            target: mapZ(paima.Z_iM_Ach ?? 0),  // Implicit Achievement
            goal: mapZ(paima.Z_eM_Ach ?? 0)      // Explicit Achievement
        },
        {
            x: 40,
            label: '권력동기',
            target: mapZ(paima.Z_iM_Pow ?? 0),   // Implicit Power
            goal: mapZ(paima.Z_eM_Pow ?? 0)      // Explicit Power
        },
        {
            x: 60,
            label: '친화동기',
            target: mapZ(paima.Z_iM_Aff ?? 0),   // Implicit Affiliation
            goal: mapZ(paima.Z_eM_Aff ?? 0)      // Explicit Affiliation
        },
        {
            x: 80,
            label: '웰빙',
            target: mapZ(paima.Z_W_Wellbeing ?? 0),  // Wellbeing
            goal: mapZ(paima.Z_PSCI ?? 0) * 0.8     // Conflict (inverted scale)
        },
    ];

    // DYNAMIC Horizontal Bar Data - Basic Needs
    const needsData = [
        { label: '자율성', value: mapZ(paima.Z_N_Auto ?? 0) },
        { label: '유능성', value: mapZ(paima.Z_N_Comp ?? 0) },
        { label: '관계성', value: mapZ(paima.Z_N_Rela ?? 0) },
        { label: '의지력', value: 100 - mapZ(paima.Z_C_Depletion ?? 0) }, // Inverted
    ];

    // DYNAMIC Stacked Bar Data - MDI (Motivation Discrepancy Index)
    const mdiData = [
        {
            label: '성취',
            parts: [
                { height: Math.abs(paima.Z_MDI_Ach ?? 0) * 15, color: '#2f3f2e' },
                { height: mapZ(paima.Z_iM_Ach ?? 0) * 0.6, color: '#4a5f45' },
                { height: mapZ(paima.Z_eM_Ach ?? 0) * 0.4, color: '#7a8775' },
            ]
        },
        {
            label: '권력',
            parts: [
                { height: Math.abs(paima.Z_MDI_Pow ?? 0) * 15, color: '#2f3f2e' },
                { height: mapZ(paima.Z_iM_Pow ?? 0) * 0.5, color: '#4a5f45' },
                { height: mapZ(paima.Z_eM_Pow ?? 0) * 0.5, color: '#9fa896' },
            ]
        },
        {
            label: '친화',
            parts: [
                { height: Math.abs(paima.Z_MDI_Aff ?? 0) * 15, color: '#4a5f45' },
                { height: mapZ(paima.Z_iM_Aff ?? 0) * 0.6, color: '#7a8775' },
            ]
        },
        {
            label: '종합',
            parts: [
                { height: mapZ(paima.Z_W_Wellbeing ?? 0) * 0.7, color: '#9fa896' },
                { height: mapZ(paima.Z_PSCI ?? 0) * 0.5, color: '#7a8775' },
                { height: (100 - mapZ(paima.Z_C_Depletion ?? 0)) * 0.4, color: '#4a5f45' },
                { height: 20, color: '#2f3f2e' },
            ]
        },
    ];

    return (
        <Document>
            {/* PAGE 1: DIAGNOSIS AND EMPATHY - Exact Match */}
            <Page size="A4" style={[styles.page, { padding: '40px 40px' }]}>
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 0.5, borderBottomColor: '#000', paddingBottom: 6, marginBottom: 20 }}>
                    <Text style={{ fontSize: 10, fontFamily: 'Noto Serif KR' }}>Giggling Platypus Co.</Text>
                    <Text style={{ fontSize: 10 }}>November 2024</Text>
                </View>

                {/* Main Title */}
                <View style={{ marginBottom: 20, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Noto Sans KR', fontSize: 50, letterSpacing: 2, textAlign: 'center', lineHeight: 1.1 }}>
                        PAGE 1: DIAGNOSIS
                    </Text>
                    <Text style={{ fontFamily: 'Noto Sans KR', fontSize: 50, letterSpacing: 2, textAlign: 'center', marginBottom: 10 }}>
                        AND EMPATHY
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', alignSelf: 'flex-end', marginTop: -5 }}>진단과 공감</Text>
                </View>

                {/* Content Grid */}
                <View style={{ flexDirection: 'row', gap: 30 }}>

                    {/* LEFT COLUMN (40%) */}
                    <View style={{ width: '40%' }}>
                        {/* 1. Line Chart with Legend */}
                        <View style={{ marginBottom: 20 }}>
                            {/* Legend */}
                            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 8 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#aaa' }} />
                                    <Text style={{ fontSize: 7 }}>Target</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#000' }} />
                                    <Text style={{ fontSize: 7 }}>Goal</Text>
                                </View>
                            </View>

                            {/* Line Chart */}
                            <View style={{ height: 120, borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
                                <Svg viewBox="0 0 100 100">
                                    {/* Y-axis labels and grid */}
                                    {[0, 20, 40, 60, 80, 100].map((val, i) => (
                                        <React.Fragment key={i}>
                                            <Text x="0" y={100 - val + 3} style={{ fontSize: 4, fill: '#666' }}>{val}</Text>
                                            <Line x1="8" y1={100 - val} x2="100" y2={100 - val} stroke="#eee" strokeWidth={0.4} />
                                        </React.Fragment>
                                    ))}

                                    {/* Lines */}
                                    <Polyline
                                        points={lineChartData.map(p => `${p.x},${100 - p.target}`).join(' ')}
                                        stroke="#aaa"
                                        strokeWidth={1.2}
                                        fill="none"
                                    />
                                    <Polyline
                                        points={lineChartData.map(p => `${p.x},${100 - p.goal}`).join(' ')}
                                        stroke="#000"
                                        strokeWidth={1.2}
                                        fill="none"
                                    />

                                    {/* Points */}
                                    {lineChartData.map((d, i) => (
                                        <React.Fragment key={i}>
                                            <Circle cx={d.x} cy={100 - d.target} r={2} fill="#aaa" />
                                            <Circle cx={d.x} cy={100 - d.goal} r={2} fill="#000" />
                                        </React.Fragment>
                                    ))}

                                    {/* X-axis labels */}
                                    <Text x="8" y="110" style={{ fontSize: 5 }}>성취</Text>
                                    <Text x="32" y="110" style={{ fontSize: 5 }}>권력</Text>
                                    <Text x="56" y="110" style={{ fontSize: 5 }}>친화</Text>
                                    <Text x="78" y="110" style={{ fontSize: 5 }}>웰빙</Text>
                                </Svg>
                            </View>
                        </View>

                        {/* 2. Horizontal Stacked Bar Chart - Platform Labels */}
                        <View style={{ marginBottom: 20 }}>
                            {['성취동기', '권력동기', '친화동기', '웰빙/갈등'].map((label, i) => (
                                <View key={i} style={{ marginBottom: 8 }}>
                                    <Text style={{ fontSize: 7, marginBottom: 3 }}>{label}</Text>
                                    <View style={{ flexDirection: 'row', height: 12 }}>
                                        <View style={{ width: `${needsData[i].value}%`, backgroundColor: '#4a5f45' }} />
                                        <View style={{ width: `${100 - needsData[i].value}%`, backgroundColor: '#9fa896' }} />
                                    </View>
                                </View>
                            ))}
                            {/* Scale labels */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                <Text style={{ fontSize: 5, color: '#888' }}>0</Text>
                                <Text style={{ fontSize: 5, color: '#888' }}>25</Text>
                                <Text style={{ fontSize: 5, color: '#888' }}>50</Text>
                                <Text style={{ fontSize: 5, color: '#888' }}>75</Text>
                                <Text style={{ fontSize: 5, color: '#888' }}>100</Text>
                            </View>
                        </View>

                        {/* 3. "혹시 이런 순간들이 있지 않았나?" Section */}
                        <View style={{ marginTop: 10 }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 6 }}>{profileData.profile_name}</Text>
                            <Text style={{ fontSize: 7, lineHeight: 1.4, color: '#333' }}>
                                {profileData.profile_summary}
                            </Text>
                        </View>
                    </View>

                    {/* RIGHT COLUMN (60%) */}
                    <View style={{ width: '60%' }}>
                        {/* Top Right Header */}
                        <Text style={{ fontSize: 8, textAlign: 'right', fontWeight: 'bold', marginBottom: 15 }}>
                            2. 두 마음의 줄다리기 (이중 동력 분석)
                        </Text>

                        {/* "자네의 마음속 풍경" Section */}
                        <View style={{ marginBottom: 15 }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 5 }}>
                                자네의 마음속 풍경 (핵심 테마: {profileData.core_theme})
                            </Text>
                            <Text style={{ fontSize: 7.5, lineHeight: 1.6, color: '#333' }}>
                                {profileData.profile_summary}
                            </Text>
                        </View>

                        {/* Goal Percentage Table */}
                        <View style={{ marginBottom: 15 }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 8 }}>
                                Goal Percentage of Social Media Platforms
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#000', marginRight: 5 }} />
                                    <Text style={{ fontSize: 7 }}>성취 지표: {mapZ(paima.Z_iM_Ach ?? 0).toFixed(0)}% ({getInterpretation(paima.Z_iM_Ach ?? 0)})</Text>
                                </View>
                                <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#000', marginRight: 5 }} />
                                    <Text style={{ fontSize: 7 }}>권력 지표: {mapZ(paima.Z_iM_Pow ?? 0).toFixed(0)}% ({getInterpretation(paima.Z_iM_Pow ?? 0)})</Text>
                                </View>
                                <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#000', marginRight: 5 }} />
                                    <Text style={{ fontSize: 7 }}>친화 지표: {mapZ(paima.Z_iM_Aff ?? 0).toFixed(0)}% ({getInterpretation(paima.Z_iM_Aff ?? 0)})</Text>
                                </View>
                                <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#000', marginRight: 5 }} />
                                    <Text style={{ fontSize: 7 }}>웰빙 지표: {mapZ(paima.Z_W_Wellbeing ?? 0).toFixed(0)}% ({getInterpretation(paima.Z_W_Wellbeing ?? 0)})</Text>
                                </View>
                            </View>
                        </View>

                        {/* "이게 무슨 뜻이냐고?" Section */}
                        <View style={{ marginBottom: 15 }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 5 }}>이게 무슨 뜻이냐고?</Text>
                            <Text style={{ fontSize: 7.5, lineHeight: 1.6, color: '#333' }}>
                                {aiAnalysis?.summary?.content || profileData.internal_conflict}
                            </Text>
                        </View>

                        {/* Category Content Legend */}
                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 6 }}>
                                Category Content of Social Media Platforms
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                                    <View style={{ width: 8, height: 8, backgroundColor: '#2f3f2e', marginRight: 5 }} />
                                    <Text style={{ fontSize: 6.5 }}>내적 동인 (MDI)</Text>
                                </View>
                                <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                                    <View style={{ width: 8, height: 8, backgroundColor: '#9fa896', marginRight: 5 }} />
                                    <Text style={{ fontSize: 6.5 }}>행복/만족도</Text>
                                </View>
                                <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                                    <View style={{ width: 8, height: 8, backgroundColor: '#4a5f45', marginRight: 5 }} />
                                    <Text style={{ fontSize: 6.5 }}>에너지 수준</Text>
                                </View>
                                <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                                    <View style={{ width: 8, height: 8, backgroundColor: '#7a8775', marginRight: 5 }} />
                                    <Text style={{ fontSize: 6.5 }}>갈등 지수</Text>
                                </View>
                            </View>
                        </View>

                        {/* Content-Type Performance Chart */}
                        <View>
                            <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>
                                CONTENT-TYPE PERFORMANCE
                            </Text>

                            {/* Legend */}
                            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
                                {[
                                    { label: 'Picture', color: '#2f3f2e' },
                                    { label: 'Video', color: '#4a5f45' },
                                    { label: 'Link', color: '#7a8775' },
                                    { label: 'Text', color: '#9fa896' }
                                ].map((item, i) => (
                                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.color }} />
                                        <Text style={{ fontSize: 6 }}>{item.label}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Stacked Bar Chart - DYNAMIC */}
                            <View style={{ height: 140, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' }}>
                                {mdiData.map((item, idx) => {
                                    const totalHeight = item.parts.reduce((sum, p) => sum + p.height, 0);
                                    const normalizedHeight = Math.min(totalHeight, 95); // Cap at 95%

                                    return (
                                        <View key={idx} style={{ width: '20%', height: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <View style={{ width: '70%', height: `${normalizedHeight}%`, justifyContent: 'flex-end' }}>
                                                {item.parts.map((part, i) => (
                                                    <View key={i} style={{ height: `${(part.height / totalHeight) * 100}%`, backgroundColor: part.color }} />
                                                ))}
                                            </View>
                                            <Text style={{ fontSize: 6, marginTop: 5 }}>{item.label}</Text>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* Y-axis labels */}
                            <View style={{ position: 'absolute', left: -15, bottom: 20, height: 140 }}>
                                {[0, 20, 40, 60, 80, 100, 120, 140].map((val, i) => (
                                    <Text key={i} style={{ fontSize: 5, color: '#888', position: 'absolute', bottom: (val / 140) * 100 + '%' }}>
                                        {val}
                                    </Text>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={{ position: 'absolute', bottom: 30, right: 40 }}>
                    <Text style={{ fontSize: 8 }}>Prepared by: Daniel Gallego</Text>
                </View>
            </Page>

            {/* PAGE 2: DIAGNOSIS AND EMPATHY - New Layout */}
            <Page size="A4" style={[styles.page, { padding: '40px 40px' }]}>
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 0.5, borderBottomColor: '#000', paddingBottom: 6, marginBottom: 20 }}>
                    <Text style={{ fontSize: 10, fontFamily: 'Noto Serif KR' }}>Giggling Platypus Co.</Text>
                    <Text style={{ fontSize: 10 }}>November 2024</Text>
                </View>

                {/* Main Title */}
                <View style={{ marginBottom: 20, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Noto Sans KR', fontSize: 50, letterSpacing: 2, textAlign: 'center', lineHeight: 1.1 }}>
                        PAGE 1: DIAGNOSIS
                    </Text>
                    <Text style={{ fontFamily: 'Noto Sans KR', fontSize: 50, letterSpacing: 2, textAlign: 'center', marginBottom: 10 }}>
                        AND EMPATHY
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', alignSelf: 'flex-end', marginTop: -5 }}>진단과 공감</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', alignSelf: 'flex-end', marginTop: 5 }}>2. 두 마음의 줄다리기 (이중 동력 분석)</Text>
                </View>

                {/* Content Grid */}
                <View style={{ flexDirection: 'row', gap: 30 }}>

                    {/* LEFT COLUMN (40%) */}
                    <View style={{ width: '40%' }}>
                        {/* 1. Line Chart with Legend */}
                        <View style={{ marginBottom: 20 }}>
                            {/* Legend */}
                            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 8 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#aaa' }} />
                                    <Text style={{ fontSize: 7 }}>Target</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#000' }} />
                                    <Text style={{ fontSize: 7 }}>Goal</Text>
                                </View>
                            </View>

                            {/* Line Chart */}
                            <View style={{ height: 120, borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
                                <Svg viewBox="0 0 100 100">
                                    {[0, 20, 40, 60, 80, 100].map((val, i) => (
                                        <React.Fragment key={i}>
                                            <Text x="0" y={100 - val + 3} style={{ fontSize: 4, fill: '#666' }}>{val}</Text>
                                            <Line x1="8" y1={100 - val} x2="100" y2={100 - val} stroke="#eee" strokeWidth={0.4} />
                                        </React.Fragment>
                                    ))}
                                    <Polyline
                                        points={lineChartData.map(p => `${p.x},${100 - p.target}`).join(' ')}
                                        stroke="#aaa" strokeWidth={1.2} fill="none"
                                    />
                                    <Polyline
                                        points={lineChartData.map(p => `${p.x},${100 - p.goal}`).join(' ')}
                                        stroke="#000" strokeWidth={1.2} fill="none"
                                    />
                                    {lineChartData.map((d, i) => (
                                        <React.Fragment key={i}>
                                            <Circle cx={d.x} cy={100 - d.target} r={2} fill="#aaa" />
                                            <Circle cx={d.x} cy={100 - d.goal} r={2} fill="#000" />
                                        </React.Fragment>
                                    ))}
                                    <Text x="8" y="110" style={{ fontSize: 5 }}>성취</Text>
                                    <Text x="32" y="110" style={{ fontSize: 5 }}>권력</Text>
                                    <Text x="56" y="110" style={{ fontSize: 5 }}>친화</Text>
                                    <Text x="78" y="110" style={{ fontSize: 5 }}>웰빙</Text>
                                </Svg>
                            </View>
                        </View>

                        {/* 2. Horizontal Stacked Bar Chart */}
                        <View style={{ marginBottom: 20 }}>
                            {['성취동기', '권력동기', '친화동기', '웰빙/갈등'].map((label, i) => (
                                <View key={i} style={{ marginBottom: 8 }}>
                                    <Text style={{ fontSize: 7, marginBottom: 3 }}>{label}</Text>
                                    <View style={{ flexDirection: 'row', height: 12 }}>
                                        <View style={{ width: `${needsData[i].value}%`, backgroundColor: '#4a5f45' }} />
                                        <View style={{ width: `${100 - needsData[i].value}%`, backgroundColor: '#9fa896' }} />
                                    </View>
                                </View>
                            ))}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                <Text style={{ fontSize: 5, color: '#888' }}>0</Text>
                                <Text style={{ fontSize: 5, color: '#888' }}>5</Text>
                                <Text style={{ fontSize: 5, color: '#888' }}>10</Text>
                                <Text style={{ fontSize: 5, color: '#888' }}>15</Text>
                                <Text style={{ fontSize: 5, color: '#888' }}>20</Text>
                                <Text style={{ fontSize: 5, color: '#888' }}>25</Text>
                                <Text style={{ fontSize: 5, color: '#888' }}>30</Text>
                            </View>
                        </View>

                        {/* 3. Vertical Stacked Bar Chart (MOVED HERE) */}
                        <View style={{ marginTop: 20 }}>
                            {/* Legend */}
                            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
                                {[
                                    { label: 'Picture', color: '#2f3f2e' },
                                    { label: 'Video', color: '#4a5f45' },
                                    { label: 'Link', color: '#7a8775' },
                                    { label: 'Text', color: '#9fa896' }
                                ].map((item, i) => (
                                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.color }} />
                                        <Text style={{ fontSize: 6 }}>{item.label}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Stacked Bar Chart */}
                            <View style={{ height: 140, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' }}>
                                {mdiData.map((item, idx) => {
                                    const totalHeight = item.parts.reduce((sum, p) => sum + p.height, 0);
                                    const normalizedHeight = Math.min(totalHeight, 95);
                                    return (
                                        <View key={idx} style={{ width: '20%', height: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <View style={{ width: '70%', height: `${normalizedHeight}%`, justifyContent: 'flex-end' }}>
                                                {item.parts.map((part, i) => (
                                                    <View key={i} style={{ height: `${(part.height / totalHeight) * 100}%`, backgroundColor: part.color }} />
                                                ))}
                                            </View>
                                            <Text style={{ fontSize: 6, marginTop: 5 }}>{item.label}</Text>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* Y-axis labels */}
                            <View style={{ position: 'absolute', left: -15, bottom: 20, height: 140 }}>
                                {[0, 20, 40, 60, 80, 100, 120, 140].map((val, i) => (
                                    <Text key={i} style={{ fontSize: 5, color: '#888', position: 'absolute', bottom: (val / 140) * 100 + '%' }}>
                                        {val}
                                    </Text>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* RIGHT COLUMN (60%) */}
                    <View style={{ width: '60%' }}>
                        {/* Diagnosis Header Text */}
                        <View style={{ marginBottom: 15 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>
                                {profileData.profile_name}
                            </Text>
                            <Text style={{ fontSize: 8, lineHeight: 1.5, color: '#333' }}>
                                {profileData.profile_summary}
                            </Text>
                        </View>

                        {/* Goal Percentage Legend */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 8 }}>
                                Goal Percentage of Social Media Platforms
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#000', marginRight: 5 }} />
                                    <Text style={{ fontSize: 7 }}>성취 에너지: {getInterpretation(paima.Z_iM_Ach ?? 0)}</Text>
                                </View>
                                <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#000', marginRight: 5 }} />
                                    <Text style={{ fontSize: 7 }}>권력 에너지: {getInterpretation(paima.Z_iM_Pow ?? 0)}</Text>
                                </View>
                                <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#000', marginRight: 5 }} />
                                    <Text style={{ fontSize: 7 }}>친화 에너지: {getInterpretation(paima.Z_iM_Aff ?? 0)}</Text>
                                </View>
                                <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#000', marginRight: 5 }} />
                                    <Text style={{ fontSize: 7 }}>행복감 수준: {getInterpretation(paima.Z_W_Wellbeing ?? 0)}</Text>
                                </View>
                            </View>
                        </View>

                        {/* 1. Persona Section */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>자네가 보여주고 싶은 모습 (페르소나)</Text>
                            <Text style={{ fontSize: 8, lineHeight: 1.5, color: '#333' }}>
                                {aiAnalysis?.deepAnalysis?.persona?.content || profileData.persona}
                            </Text>
                        </View>

                        {/* 2. Shadow Section */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>자네의 진짜 에너지 (그림자)</Text>
                            <Text style={{ fontSize: 8, lineHeight: 1.5, color: '#333' }}>
                                {aiAnalysis?.deepAnalysis?.shadow?.content || profileData.shadow}
                            </Text>
                        </View>

                        {/* 3. Conflict Section */}
                        <View style={{ marginTop: 25 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>
                                내적 갈등 ({getInterpretation(paima.Z_PSCI ?? 0)}) | 피로도 ({getInterpretation(paima.Z_C_Depletion ?? 0)})
                            </Text>
                            <Text style={{ fontSize: 8, lineHeight: 1.5, color: '#333' }}>
                                {aiAnalysis?.deepAnalysis?.conflict?.content || profileData.internal_conflict}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={{ position: 'absolute', bottom: 30, right: 40 }}>
                    <Text style={{ fontSize: 8 }}>Prepared by: Daniel Gallego</Text>
                </View>
            </Page>

            {/* PAGE 3: 심층 분석과 재구성 (Magazine Style - Exact Match) */}
            <Page size="A4" style={[styles.page, { padding: '30px 80px' }]}>
                {/* Header Title Information */}
                <View style={{ marginBottom: 15 }}>
                    <Text style={{ fontSize: 22, letterSpacing: 1 }}>PAGE 2: 심층</Text>
                    <Text style={{ fontSize: 22, letterSpacing: 1 }}>분석과 재구성</Text>
                </View>

                {/* Top Section */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    {/* Top Left: Graph Space (Diagonal) */}
                    <View style={{ width: '40%', height: 80 }}>
                        <Svg viewBox="0 0 100 100">
                            {/* Small Decorative Grid/Graph */}
                            <Line x1="10" y1="10" x2="10" y2="90" stroke="#eee" strokeWidth={1} />
                            <Line x1="10" y1="90" x2="90" y2="90" stroke="#eee" strokeWidth={1} />
                            <Polyline
                                points="10,80 30,40 50,60 70,20 90,30"
                                fill="none" stroke="#4a6741" strokeWidth={2}
                            />
                            <Circle cx="10" cy="80" r={2} fill="#4a6741" />
                            <Circle cx="30" cy="40" r={2} fill="#4a6741" />
                            <Circle cx="50" cy="60" r={2} fill="#4a6741" />
                            <Circle cx="70" cy="20" r={2} fill="#4a6741" />
                            <Circle cx="90" cy="30" r={2} fill="#4a6741" />
                            <Text x="10" y="5" style={{ fontSize: 6, fill: '#888' }}>MOTIVATION FLOW</Text>
                        </Svg>
                    </View>

                    {/* Top Right: ABOUT ME Section */}
                    <View style={{ width: '45%' }}>
                        <View style={{ alignItems: 'flex-end', marginBottom: 15 }}>
                            <Text style={{ fontSize: 40, fontFamily: 'Noto Sans KR', letterSpacing: 3 }}>ABOUT ME</Text>
                        </View>

                        <View style={{ paddingLeft: 10 }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 3 }}>1. 갈등이 청구한 비용</Text>
                            <Text style={{ fontSize: 8, lineHeight: 1.5, marginBottom: 8 }}>
                                {aiAnalysis?.deepAnalysis?.conflict?.content || profileData.internal_conflict}
                            </Text>
                            <Text style={{ fontSize: 8, lineHeight: 1.5, marginBottom: 8 }}>
                                {profileData.risk_of_misalignment}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Middle Section: Typography */}
                <View style={{ flexDirection: 'row', gap: 30, marginBottom: 8 }}>
                    {/* Left Column: Typography + Reframing Section */}
                    <View style={{ width: '45%' }}>
                        {/* DIAGNOSIS DARCY Typography */}
                        <View style={{ marginTop: 0, marginBottom: 35 }}>
                            <Text style={{ fontSize: 45, fontFamily: 'Noto Sans KR', lineHeight: 0.8, color: '#1a3c34', letterSpacing: -2 }}>DIAGNO</Text>
                            <Text style={{ fontSize: 45, fontFamily: 'Noto Sans KR', lineHeight: 0.8, color: '#1a3c34', letterSpacing: -2 }}>SIS</Text>
                            <Text style={{ fontSize: 45, fontFamily: 'Noto Sans KR', lineHeight: 0.8, color: '#1a3c34', letterSpacing: -2 }}>DARCY</Text>
                            <Text style={{ fontSize: 18, fontFamily: 'Noto Serif KR', marginTop: 5, color: '#4a6741' }}>Empathy</Text>
                        </View>

                        {/* 2. 잠재력의 재발견 Section */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 3 }}>2. 잠재력의 재발견 (Reframing)</Text>
                            <Text style={{ fontSize: 8, lineHeight: 1.5, marginBottom: 6 }}>
                                {aiAnalysis?.deepAnalysis?.potential?.content || profileData.latent_potential.reframed_shadow}
                            </Text>
                            <View style={{ paddingLeft: 10, marginBottom: 8 }}>
                                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                                    <Text style={{ fontSize: 7, width: 8 }}>•</Text>
                                    <Text style={{ fontSize: 7, flex: 1 }}>긍정적 해석: {profileData.latent_potential.positive_interpretation}</Text>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontSize: 7, width: 8 }}>•</Text>
                                    <Text style={{ fontSize: 7, flex: 1 }}>성장 방향: {profileData.latent_potential.development_direction}</Text>
                                </View>
                            </View>

                            <Text style={{ fontSize: 8, lineHeight: 1.5, marginTop: 5 }}>
                                {aiAnalysis?.deepAnalysis?.potential?.action || profileData.behavioral_tendencies}
                            </Text>
                        </View>
                    </View>

                    {/* Right Column: Bottom Graph */}
                    <View style={{ width: '55%' }}>

                        {/* Bottom Right: Graph Space (Diagonal) */}
                        <View style={{ marginTop: 5, height: 70 }}>
                            <Svg viewBox="0 0 100 100">
                                {/* Diagonal Comparison Chart */}
                                <Rect x="20" y="10" width="8" height="80" fill="#eee" />
                                <Rect x="20" y={100 - mapZ(paima.Z_iM_Pow ?? 0)} width="8" height={mapZ(paima.Z_iM_Pow ?? 0)} fill="#1a3c34" />

                                <Rect x="45" y="10" width="8" height="80" fill="#eee" />
                                <Rect x="45" y={100 - mapZ(paima.Z_eM_Pow ?? 0)} width="8" height={mapZ(paima.Z_eM_Pow ?? 0)} fill="#4a6741" />

                                <Rect x="70" y="10" width="8" height="80" fill="#eee" />
                                <Rect x="70" y={100 - mapZ(paima.Z_Wellbeing ?? 0)} width="8" height={mapZ(paima.Z_Wellbeing ?? 0)} fill="#8f9e8a" />

                                <Text x="24" y="95" style={{ fontSize: 4, textAnchor: 'middle' }}>SHADOW</Text>
                                <Text x="49" y="95" style={{ fontSize: 4, textAnchor: 'middle' }}>PERSONA</Text>
                                <Text x="74" y="95" style={{ fontSize: 4, textAnchor: 'middle' }}>WELLBEING</Text>
                            </Svg>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={{ position: 'absolute', bottom: 30, right: 40 }}>
                    <Text style={{ fontSize: 8 }}>Prepared by: Daniel Gallego</Text>
                </View>
            </Page>

            {/* PAGE 4: 무의식적 장애물 극복 (If-Then Plan) - Exact Match */}
            <Page size="A4" style={[styles.page, { padding: '40px 50px' }]}>
                {/* Header Section */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 5 }}>
                    <Text style={{ fontSize: 10, fontFamily: 'Noto Serif KR', color: '#333' }}>march 2024</Text>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 28, fontFamily: 'Noto Serif KR', color: '#000' }}>무의식적 장애물 극복 (If-</Text>
                        <Text style={{ fontSize: 28, fontFamily: 'Noto Serif KR', color: '#000' }}>ThenPlan)</Text>
                    </View>
                    <Text style={{ fontSize: 10, fontFamily: 'Noto Serif KR', color: '#333' }}>Donna Stroupe</Text>
                </View>

                {/* Horizontal Divider */}
                <View style={{ borderBottomWidth: 1, borderBottomColor: '#999', marginBottom: 20 }} />

                {/* Hero Section: Image and Intro Text */}
                <View style={{ flexDirection: 'row', gap: 30, marginBottom: 40, alignItems: 'center' }}>
                    {/* Visual Image */}
                    {/* Visual Image Placeholder or Valid URL */}
                    <View style={{ width: '40%', height: 260, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 10, color: '#aaa' }}>Visual Image</Text>
                    </View>

                    {/* Intro Text */}
                    <View style={{ width: '55%' }}>
                        <Text style={{ fontSize: 20, fontFamily: 'Noto Serif KR', lineHeight: 1.5, color: '#000' }}>
                            {profileData.profile_summary}
                        </Text>
                    </View>
                </View>

                {/* Strategies Section: 3-Column If-Then Plan */}
                <View style={{ flexDirection: 'row', gap: 20, marginBottom: 40 }}>
                    {/* Column 1: 외적 변화 */}
                    <View style={{ width: '31%' }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 8 }}>외적 변화 (환경 조성)</Text>
                        {aiAnalysis?.action_plan?.if_then_plans?.filter((p: any) => p.category === 'Appearance' || p.category === '외적 변화').slice(0, 2).map((plan: any, i: number) => (
                            <View key={i} style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 9, lineHeight: 1.4, color: '#000' }}>IF (상황): {plan.situation}</Text>
                                <Text style={{ fontSize: 9, lineHeight: 1.4, color: '#000' }}>THEN (행동): {plan.action}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Column 2: 마인드셋 */}
                    <View style={{ width: '31%' }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 8 }}>마인드셋 (생각의 전환)</Text>
                        {aiAnalysis?.action_plan?.if_then_plans?.filter((p: any) => p.category === 'Mindset' || p.category === '마인드셋').slice(0, 2).map((plan: any, i: number) => (
                            <View key={i} style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 9, lineHeight: 1.4, color: '#000' }}>IF (상황): {plan.situation}</Text>
                                <Text style={{ fontSize: 9, lineHeight: 1.4, color: '#000' }}>THEN (행동): {plan.action}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Column 3: 행동 */}
                    <View style={{ width: '31%' }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 8 }}>행동 (실질적 변화)</Text>
                        {aiAnalysis?.action_plan?.if_then_plans?.filter((p: any) => p.category === 'Action' || p.category === '행동').slice(0, 2).map((plan: any, i: number) => (
                            <View key={i} style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 9, lineHeight: 1.4, color: '#000' }}>IF (상황): {plan.situation}</Text>
                                <Text style={{ fontSize: 9, lineHeight: 1.4, color: '#000' }}>THEN (행동): {plan.action}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Bottom Section: Components and Closing */}
                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#634b35', marginBottom: 30, textTransform: 'uppercase' }}>
                        KEY COMPONENTS OF SUCCESSFUL UGC CREATION
                    </Text>

                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5 }}>마치며</Text>
                        <Text style={{ fontSize: 9, lineHeight: 1.6, textAlign: 'center', color: '#000', paddingHorizontal: 40 }}>
                            {aiAnalysis?.action_plan?.closing_message || "자네는 그동안 너무 겸손했네. 야망은 죄가 아니라네. 그것은 세상을 더 나은 곳으로 바꿀 연료일 뿐이야. 2026년에는 부디 그 왕좌에 앉아 자네만의 세상을 호령해 보게나. 자네는 충분히 그럴 자격이 있어. 응원하네."}
                        </Text>
                    </View>
                </View>
            </Page>

        </Document>
    );
};

export default AnalysisReportPDF;
