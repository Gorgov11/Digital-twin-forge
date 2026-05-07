import type {
  SimulationReport,
  ScenarioPreset,
  HumanParams,
  IndustrialParams,
  ModelCategory,
  SimulationPhase,
  SimulationFinding,
  SimulationRecommendation,
  RiskLevel,
} from '@twinforge/shared';

interface GenerateArgs {
  simId: string;
  twinId: string;
  twinName: string;
  scenario: ScenarioPreset;
  params: HumanParams | IndustrialParams;
  category: ModelCategory;
}

// ── Human report templates ────────────────────────────────────────────────────

function humanCardiacStressReport(args: GenerateArgs, p: HumanParams): SimulationReport {
  const bpHigh = p.systolicBP > 140;
  const hrHigh = p.restingHeartRate > 90;
  const efLow = p.ejectionFraction < 55;
  const riskLevel: RiskLevel = (bpHigh && hrHigh) || efLow ? 'HIGH' : bpHigh || hrHigh ? 'MEDIUM' : 'LOW';

  const phases: SimulationPhase[] = [
    {
      timeLabel: 'T+0 min',
      title: 'Baseline Assessment',
      description: `Twin initialised. Resting HR: ${p.restingHeartRate} bpm, BP: ${p.systolicBP}/${p.diastolicBP} mmHg. Ejection fraction ${p.ejectionFraction}%. ${efLow ? 'Reduced EF flags elevated cardiac risk.' : 'Cardiac function within acceptable range.'}`,
      riskLevel: 'LOW',
      keyMetrics: [
        { label: 'Resting HR', value: `${p.restingHeartRate} bpm` },
        { label: 'BP', value: `${p.systolicBP}/${p.diastolicBP}` },
        { label: 'EF', value: `${p.ejectionFraction}%` },
      ],
    },
    {
      timeLabel: 'T+5 min',
      title: 'Warm-Up Phase',
      description: 'Gradual exercise load applied. Sympathetic nervous system activation increases cardiac output. Heart rate rises proportionally to VO₂ demand.',
      riskLevel: 'LOW',
      keyMetrics: [
        { label: 'HR', value: `${Math.round(p.restingHeartRate * 1.4)} bpm`, delta: `+${Math.round(p.restingHeartRate * 0.4)} bpm` },
        { label: 'BP', value: `${p.systolicBP + 18}/${p.diastolicBP + 4}` },
        { label: 'VO₂', value: `${Math.round(p.vo2Max * 0.55)} ml/kg/min` },
      ],
    },
    {
      timeLabel: 'T+15 min',
      title: 'Moderate Exertion',
      description: `Twin at 70% VO₂max. ${bpHigh ? 'Blood pressure response is exaggerated — systolic exceeds 190mmHg, indicating hypertensive response to exercise.' : 'Blood pressure response is within normal limits.'} ST-segment monitoring active.`,
      riskLevel: bpHigh ? 'MEDIUM' : 'LOW',
      keyMetrics: [
        { label: 'HR', value: `${Math.round(p.restingHeartRate * 1.85)} bpm`, delta: `+${Math.round(p.restingHeartRate * 0.85)} bpm` },
        { label: 'Systolic BP', value: `${p.systolicBP + (bpHigh ? 58 : 42)} mmHg`, delta: `+${bpHigh ? 58 : 42} mmHg` },
        { label: 'VO₂', value: `${Math.round(p.vo2Max * 0.72)} ml/kg/min` },
      ],
    },
    {
      timeLabel: 'T+25 min',
      title: 'Peak Exertion',
      description: `Maximum effort reached. VO₂max approached: ${p.vo2Max} ml/kg/min. ${hrHigh || bpHigh || efLow ? 'Arrhythmia risk window identified — vigilance required. Chronotropic response suboptimal.' : 'Chronotropic response normal. No ST changes detected.'}`,
      riskLevel,
      keyMetrics: [
        { label: 'Peak HR', value: `${Math.round(220 - p.age * 0.85)} bpm` },
        { label: 'VO₂max', value: `${p.vo2Max} ml/kg/min` },
        { label: 'RPP', value: `${Math.round(p.systolicBP * 1.35 * (220 - p.age * 0.85) / 1000)} mmHg·bpm/1000` },
      ],
    },
    {
      timeLabel: 'T+35 min',
      title: 'Recovery',
      description: `Post-exertion recovery phase. ${efLow ? 'Prolonged HR recovery — indicates reduced cardiac reserve. 2-minute HR recovery <12 bpm is abnormal.' : 'Heart rate recovery within normal parameters. Good cardiac reserve demonstrated.'}`,
      riskLevel: efLow ? 'MEDIUM' : 'LOW',
      keyMetrics: [
        { label: '1-min HR', value: `${Math.round((220 - p.age * 0.85) * 0.82)} bpm` },
        { label: '2-min HR', value: `${Math.round((220 - p.age * 0.85) * 0.68)} bpm` },
        { label: 'Recovery', value: efLow ? 'Abnormal' : 'Normal' },
      ],
    },
  ];

  const findings: SimulationFinding[] = [
    ...(bpHigh ? [{
      severity: 'HIGH' as RiskLevel,
      title: 'Hypertensive Response to Exercise',
      detail: `Systolic BP exceeds 200mmHg at moderate intensity. This pattern is associated with 2.3× increased risk of future cardiovascular events. Baseline hypertension (${p.systolicBP}/${p.diastolicBP} mmHg) compounds exercise-induced response.`,
    }] : []),
    ...(efLow ? [{
      severity: 'HIGH' as RiskLevel,
      title: 'Reduced Ejection Fraction — Exercise Intolerance Risk',
      detail: `EF of ${p.ejectionFraction}% limits stroke volume augmentation during exercise. Peak cardiac output estimated 18% below age-matched normal. Haemodynamic reserve is compromised.`,
    }] : []),
    ...(p.smokingStatus === 'current' ? [{
      severity: 'MEDIUM' as RiskLevel,
      title: 'Smoking — Reduced Cardiopulmonary Reserve',
      detail: 'Active smoking reduces VO₂max by 10–15% and impairs microvascular coronary response. Exercise-induced ischaemia risk is elevated.',
    }] : []),
    {
      severity: 'LOW' as RiskLevel,
      title: `VO₂max: ${p.vo2Max} ml/kg/min — ${p.vo2Max < 30 ? 'Below Average' : p.vo2Max < 45 ? 'Average' : 'Above Average'} for Age`,
      detail: `VO₂max is the strongest independent predictor of all-cause mortality. ${p.vo2Max < 30 ? 'Low fitness significantly increases cardiovascular risk — structured exercise intervention is strongly recommended.' : 'Maintain current activity level.'}`,
    },
  ];

  const recommendations: SimulationRecommendation[] = [
    ...(bpHigh ? [{
      priority: 'immediate' as const,
      action: 'Initiate or titrate antihypertensive therapy',
      rationale: 'Resting BP ≥140/90 with exaggerated exercise response warrants pharmacological intervention. Target <130/80 mmHg per ESC/ACC guidelines.',
    }] : []),
    ...(efLow ? [{
      priority: 'immediate' as const,
      action: 'Cardiology referral for echocardiographic evaluation',
      rationale: `EF of ${p.ejectionFraction}% meets criteria for further workup. Rule out ischaemic aetiology. Consider GDMT (ACE inhibitor, beta-blocker, sacubitril/valsartan).`,
    }] : []),
    {
      priority: 'short-term' as const,
      action: p.vo2Max < 35 ? 'Supervised cardiac rehabilitation programme' : 'Structured aerobic exercise programme',
      rationale: `${p.vo2Max < 35 ? 'Cardiac rehab will safely improve exercise capacity and reduce cardiac mortality by 26%.' : 'Progressive aerobic training to maintain and improve VO₂max.'} Target 150 min/week moderate-intensity exercise.`,
    },
    {
      priority: 'long-term' as const,
      action: 'Annual exercise stress test with echocardiographic imaging',
      rationale: 'Longitudinal monitoring of functional capacity and LV function under stress will detect subclinical deterioration before clinical events occur.',
    },
  ];

  return {
    id: args.simId,
    twinId: args.twinId,
    twinName: args.twinName,
    scenarioId: args.scenario.id,
    scenarioName: args.scenario.name,
    overallRisk: riskLevel,
    executiveSummary: `The ${args.twinName} digital twin completed a graded exercise stress test simulation. ${bpHigh ? 'A hypertensive response to exercise was identified, representing elevated cardiovascular risk.' : 'Blood pressure response was within acceptable limits.'} ${efLow ? 'Reduced ejection fraction limits haemodynamic reserve and warrants urgent cardiology review.' : ''} ${hrHigh ? 'Resting tachycardia reduces maximum chronotropic reserve.' : ''} Overall cardiovascular fitness (VO₂max: ${p.vo2Max} ml/kg/min) is ${p.vo2Max >= 45 ? 'excellent' : p.vo2Max >= 35 ? 'good' : 'below average'} for age group. ${findings.length > 1 ? `${findings.length} findings identified requiring clinical attention.` : 'One key finding requires attention.'}`,
    phases,
    findings,
    recommendations,
    generatedAt: new Date().toISOString(),
    modelUsed: 'TwinForge AI Engine (claude-sonnet-4-6)',
  };
}

function humanMetabolicReport(args: GenerateArgs, p: HumanParams): SimulationReport {
  const diabetic = p.fastingGlucose > 126 || p.hba1c > 6.5;
  const prediabetic = !diabetic && (p.fastingGlucose > 100 || p.hba1c > 5.7);
  const riskLevel: RiskLevel = diabetic ? 'HIGH' : prediabetic ? 'MEDIUM' : 'LOW';

  const phases: SimulationPhase[] = [
    {
      timeLabel: 'T+0h',
      title: 'Fasting Baseline',
      description: `Baseline metabolic state. Fasting glucose: ${p.fastingGlucose} mg/dL (${diabetic ? 'diabetic range' : prediabetic ? 'pre-diabetic range' : 'normal'}). HbA1c: ${p.hba1c}%. Insulin sensitivity: ${p.insulinSensitivity}.`,
      riskLevel: diabetic ? 'HIGH' : prediabetic ? 'MEDIUM' : 'LOW',
      keyMetrics: [
        { label: 'Fasting glucose', value: `${p.fastingGlucose} mg/dL` },
        { label: 'HbA1c', value: `${p.hba1c}%` },
        { label: 'Insulin sensitivity', value: p.insulinSensitivity },
      ],
    },
    {
      timeLabel: 'T+30min',
      title: 'Post-Prandial Peak',
      description: `Glucose peak following mixed meal challenge. ${p.insulinSensitivity === 'resistant' ? 'Severely blunted insulin response — glucose excursion markedly elevated.' : 'First-phase insulin response modelled.'}`,
      riskLevel,
      keyMetrics: [
        { label: 'Peak glucose', value: `${Math.round(p.fastingGlucose * (p.insulinSensitivity === 'resistant' ? 2.1 : p.insulinSensitivity === 'low' ? 1.8 : 1.5))} mg/dL`, delta: '+' + Math.round(p.fastingGlucose * 0.5) + ' mg/dL' },
        { label: 'Insulin response', value: p.insulinSensitivity === 'resistant' ? 'Severely impaired' : p.insulinSensitivity === 'low' ? 'Impaired' : 'Normal' },
      ],
    },
    {
      timeLabel: 'T+2h',
      title: '2-Hour Post-Prandial',
      description: `${p.insulinSensitivity === 'resistant' ? 'Glucose remains elevated beyond 200 mg/dL at 2 hours — diagnostic for diabetes under OGTT criteria.' : 'Glucose trajectory returning toward baseline within expected timeframe.'}`,
      riskLevel,
      keyMetrics: [
        { label: '2h glucose', value: `${Math.round(p.fastingGlucose * (p.insulinSensitivity === 'resistant' ? 1.7 : 1.2))} mg/dL` },
      ],
    },
  ];

  return {
    id: args.simId,
    twinId: args.twinId,
    twinName: args.twinName,
    scenarioId: args.scenario.id,
    scenarioName: args.scenario.name,
    overallRisk: riskLevel,
    executiveSummary: `Metabolic simulation of ${args.twinName} reveals ${diabetic ? 'a diabetic glycaemic profile requiring immediate intervention' : prediabetic ? 'a pre-diabetic pattern with high conversion risk' : 'a metabolic profile within normal parameters'}. Insulin sensitivity classified as ${p.insulinSensitivity}. Total cholesterol ${p.totalCholesterol} mg/dL (LDL ${p.ldl}, HDL ${p.hdl}). ${p.insulinSensitivity === 'resistant' ? 'Insulin resistance significantly increases cardiovascular and oncological risk.' : ''}`,
    phases,
    findings: [
      ...(diabetic ? [{ severity: 'HIGH' as RiskLevel, title: 'Diabetic Glycaemic Profile', detail: `Fasting glucose ${p.fastingGlucose} mg/dL and HbA1c ${p.hba1c}% meet diagnostic criteria for Type 2 Diabetes Mellitus. Microvascular and macrovascular complication risk is markedly elevated without intervention.` }] : []),
      ...(prediabetic ? [{ severity: 'MEDIUM' as RiskLevel, title: 'Pre-Diabetic Pattern — High Conversion Risk', detail: `Without lifestyle intervention, 37% of individuals with this profile progress to T2DM within 4 years. Structured lifestyle modification reduces risk by 58%.` }] : []),
      { severity: 'LOW' as RiskLevel, title: `LDL Cholesterol: ${p.ldl} mg/dL`, detail: p.ldl > 130 ? `Elevated LDL significantly increases atherosclerotic risk, compounding diabetes-associated cardiovascular risk.` : 'LDL within acceptable range. Continue dietary surveillance.' },
    ],
    recommendations: [
      ...(diabetic ? [{ priority: 'immediate' as const, action: 'Initiate metformin therapy and refer to diabetologist', rationale: 'First-line pharmacotherapy for T2DM. Reduces HbA1c by 1.5–2.0% and has cardiovascular-neutral or protective profile.' }] : []),
      { priority: 'short-term' as const, action: '12-week structured lifestyle intervention', rationale: 'Mediterranean diet + 150 min/week aerobic exercise. Reduces HbA1c by 0.5–1.5% and improves insulin sensitivity by up to 40%.' },
      { priority: 'long-term' as const, action: 'Quarterly HbA1c monitoring + annual lipid panel', rationale: 'Longitudinal biomarker surveillance to detect progression and titrate therapy.' },
    ],
    generatedAt: new Date().toISOString(),
    modelUsed: 'TwinForge AI Engine (claude-sonnet-4-6)',
  };
}

// ── Industrial report templates ───────────────────────────────────────────────

function industrialBearingReport(args: GenerateArgs, p: IndustrialParams): SimulationReport {
  const ageRatio = p.operatingHoursTotal / Math.max(p.fatigueLifeHours, 1);
  const hasDefects = p.openDefects.length > 0;
  const highLoad = p.loadCyclePercent > 80;
  const riskLevel: RiskLevel = (ageRatio > 0.7 && hasDefects) || ageRatio > 0.85 ? 'HIGH' : ageRatio > 0.5 || hasDefects || highLoad ? 'MEDIUM' : 'LOW';
  const rul = Math.round((1 - ageRatio) * p.fatigueLifeHours);

  const phases: SimulationPhase[] = [
    {
      timeLabel: '0h',
      title: 'Baseline State Assessment',
      description: `Asset: ${p.manufacturer} ${p.modelNumber} (S/N: ${p.serialNumber}). Operating hours: ${p.operatingHoursTotal.toLocaleString()} / ${p.fatigueLifeHours.toLocaleString()} design life. ${hasDefects ? `Open defects logged: ${p.openDefects.join('; ')}.` : 'No open defects recorded.'}`,
      riskLevel: ageRatio > 0.7 ? 'MEDIUM' : 'LOW',
      keyMetrics: [
        { label: 'Life consumed', value: `${(ageRatio * 100).toFixed(1)}%` },
        { label: 'Operating hours', value: p.operatingHoursTotal.toLocaleString() },
        { label: 'RUL estimate', value: `${rul.toLocaleString()} hrs` },
      ],
    },
    {
      timeLabel: '+500h',
      title: 'Incipient Defect Stage',
      description: `Micro-pitting initiates on bearing raceway. ${highLoad ? 'High load cycle ('+p.loadCyclePercent+'%) accelerates defect growth rate by estimated 34%.' : 'Load within normal operating range.'} Vibration signature shows early-stage ultrasonic anomaly.`,
      riskLevel: highLoad ? 'MEDIUM' : 'LOW',
      keyMetrics: [
        { label: 'Vibration (RMS)', value: `${(1.8 + ageRatio * 3).toFixed(2)} mm/s`, delta: '+0.4 mm/s' },
        { label: 'BPFO', value: `${(ageRatio * 15).toFixed(1)} dBg` },
        { label: 'Oil particle count', value: `${Math.round(200 + ageRatio * 800)} ppb Fe` },
      ],
    },
    {
      timeLabel: '+1,500h',
      title: 'Developing Defect',
      description: 'Spalling progresses to mid-stage. Increased debris generation detected in lubricant. Vibration energy in bearing defect frequency bands rises significantly. Thermal camera shows 4°C localised hotspot.',
      riskLevel: riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
      keyMetrics: [
        { label: 'Vibration (RMS)', value: `${(3.2 + ageRatio * 4).toFixed(2)} mm/s`, delta: '+1.4 mm/s' },
        { label: 'Temperature delta', value: '+4°C', delta: '+4°C' },
        { label: 'ISO 10816 zone', value: riskLevel === 'HIGH' ? 'Zone D (danger)' : 'Zone C (alert)' },
      ],
    },
    {
      timeLabel: `+${Math.round(rul * 0.8).toLocaleString()}h`,
      title: 'Predicted Failure Window Opens',
      description: `Model predicts bearing failure probability exceeds 50% within this window. ${p.inspectionFrequency === 'monthly' || p.inspectionFrequency === 'weekly' ? 'Scheduled inspection should detect this state.' : 'Current inspection frequency ('+p.inspectionFrequency+') may miss this window — consider shortening interval.'} Immediate bearing replacement is the most cost-effective intervention.`,
      riskLevel: 'HIGH',
      keyMetrics: [
        { label: 'Failure probability', value: '>50%' },
        { label: 'Predicted RUL', value: `${Math.round(rul * 0.2).toLocaleString()} hrs` },
        { label: 'Replacement urgency', value: 'HIGH' },
      ],
    },
  ];

  return {
    id: args.simId,
    twinId: args.twinId,
    twinName: args.twinName,
    scenarioId: args.scenario.id,
    scenarioName: args.scenario.name,
    overallRisk: riskLevel,
    executiveSummary: `Bearing wear progression simulation for ${p.manufacturer} ${p.modelNumber}. Asset has consumed ${(ageRatio * 100).toFixed(1)}% of design life (${p.operatingHoursTotal.toLocaleString()} / ${p.fatigueLifeHours.toLocaleString()} hours). Estimated Remaining Useful Life: ${rul.toLocaleString()} hours. ${highLoad ? 'Elevated load cycle ('+p.loadCyclePercent+'%) is accelerating wear progression.' : ''} ${hasDefects ? 'Pre-existing defects increase failure probability significantly.' : ''} The model recommends proactive replacement within the next maintenance window to prevent unplanned downtime.`,
    phases,
    findings: [
      { severity: riskLevel, title: `Remaining Useful Life: ${rul.toLocaleString()} operating hours`, detail: `Based on Palmgren-Miner linear damage accumulation model, calibrated with ${p.environment} environment factor and ${p.loadCyclePercent}% load cycle. 95% confidence interval: ${Math.round(rul * 0.8).toLocaleString()}–${Math.round(rul * 1.2).toLocaleString()} hours.` },
      ...(hasDefects ? [{ severity: 'HIGH' as RiskLevel, title: `${p.openDefects.length} Open Defect(s) Compounding Risk`, detail: `Logged defects (${p.openDefects.join('; ')}) interact with bearing wear to increase failure probability by estimated 40%. Defects should be closed before next operating cycle.` }] : []),
      { severity: highLoad ? 'MEDIUM' as RiskLevel : 'LOW' as RiskLevel, title: `Load Cycle: ${p.loadCyclePercent}% — ${highLoad ? 'Elevated' : 'Normal'}`, detail: highLoad ? `Operating at ${p.loadCyclePercent}% rated load compresses bearing L10 life. Recommend reviewing whether load reduction is operationally feasible.` : 'Load cycle within manufacturer specification. No accelerated wear from load factor.' },
    ],
    recommendations: [
      { priority: 'immediate' as const, action: 'Schedule bearing replacement at next planned outage', rationale: `With ${(ageRatio * 100).toFixed(0)}% life consumed and ${hasDefects ? 'open defects,' : ''} unplanned failure risk is increasing. Planned replacement cost ~5% of unplanned failure cost.` },
      { priority: 'short-term' as const, action: 'Increase vibration monitoring frequency to weekly', rationale: 'High-frequency vibration monitoring will give 200–400 hour early warning of accelerating defect growth, enabling precise replacement timing.' },
      { priority: 'long-term' as const, action: 'Implement oil debris monitoring with automatic alerts', rationale: 'Continuous ferrography provides the earliest bearing defect signal. Integration with CMMS will close the prediction-to-action loop automatically.' },
    ],
    generatedAt: new Date().toISOString(),
    modelUsed: 'TwinForge AI Engine (claude-sonnet-4-6)',
  };
}

function industrialThermalReport(args: GenerateArgs, p: IndustrialParams): SimulationReport {
  const riskLevel: RiskLevel = p.temperatureMax > 100 || p.environment === 'offshore' ? 'HIGH' : 'MEDIUM';

  const phases: SimulationPhase[] = [
    {
      timeLabel: 'T=0',
      title: 'Normal Operation',
      description: `${p.manufacturer} ${p.modelNumber} operating at ${p.loadCyclePercent}% load. Thermal baseline established.`,
      riskLevel: 'LOW',
      keyMetrics: [
        { label: 'Operating temp', value: `${p.temperatureMax - 15}°C` },
        { label: 'Load', value: `${p.loadCyclePercent}%` },
        { label: 'Cooling flow', value: '100%' },
      ],
    },
    {
      timeLabel: 'T+15min',
      title: 'Cooling Loss Event',
      description: 'Loss of coolant flow simulated. Core temperature begins to rise. Thermal protection systems activated.',
      riskLevel: 'MEDIUM',
      keyMetrics: [
        { label: 'Core temp', value: `${p.temperatureMax + 8}°C`, delta: `+${8}°C` },
        { label: 'Cooling', value: '0%' },
        { label: 'Trip setpoint', value: `${p.temperatureMax + 30}°C` },
      ],
    },
    {
      timeLabel: 'T+45min',
      title: 'Thermal Limit Approach',
      description: `Temperature approaching trip setpoint. Material properties degrading. ${p.coatingType ? `${p.coatingType} coating providing 15–20°C of additional thermal protection.` : 'No thermal barrier coating — limited protection.'}`,
      riskLevel: 'HIGH',
      keyMetrics: [
        { label: 'Core temp', value: `${p.temperatureMax + 25}°C`, delta: `+${25}°C` },
        { label: 'Material strength', value: '-18% yield', delta: '-18%' },
      ],
    },
  ];

  return {
    id: args.simId,
    twinId: args.twinId,
    twinName: args.twinName,
    scenarioId: args.scenario.id,
    scenarioName: args.scenario.name,
    overallRisk: riskLevel,
    executiveSummary: `Thermal event simulation for ${args.twinName}. Operating environment: ${p.environment}. Maximum rated temperature: ${p.temperatureMax}°C. Under coolant loss scenario, the model projects critical temperature exceedance within 45 minutes, requiring emergency shutdown. ${p.coatingType} coating provides partial thermal protection.`,
    phases,
    findings: [
      { severity: riskLevel, title: 'Thermal Runaway Risk Under Coolant Loss', detail: `Without cooling, core temperature exceeds material design limits within ${Math.round(45 * (p.temperatureMax / 80))} minutes. ${p.environment === 'offshore' ? 'Offshore environment limits access for rapid intervention.' : ''}` },
      { severity: 'MEDIUM' as RiskLevel, title: `Material Grade ${p.materialGrade} — Thermal Degradation Curve`, detail: `${p.materialGrade} shows 15% yield strength reduction at +25°C above rated temperature. Permanent deformation risk above this threshold.` },
    ],
    recommendations: [
      { priority: 'immediate' as const, action: 'Verify coolant system redundancy and automatic trip logic', rationale: 'Single-point cooling failure should automatically trigger shutdown before temperature exceedance. Verify trip setpoints are correctly calibrated.' },
      { priority: 'short-term' as const, action: 'Install continuous temperature monitoring with SMS alerts', rationale: 'Real-time thermal monitoring with mobile alerting provides 20–30 minute intervention window — sufficient for controlled shutdown.' },
      { priority: 'long-term' as const, action: 'Evaluate thermal barrier coating upgrade', rationale: `Upgrading from ${p.coatingType || 'uncoated'} to advanced TBC would extend thermal margin by ~20°C, significantly reducing exceedance risk.` },
    ],
    generatedAt: new Date().toISOString(),
    modelUsed: 'TwinForge AI Engine (claude-sonnet-4-6)',
  };
}

// ── Router ────────────────────────────────────────────────────────────────────

export function generateMockReport(args: GenerateArgs): SimulationReport {
  const { scenario, category, params } = args;

  if (category === 'human') {
    const p = params as HumanParams;
    if (scenario.category === 'cardiovascular') return humanCardiacStressReport(args, p);
    return humanMetabolicReport(args, p);
  } else {
    const p = params as IndustrialParams;
    if (scenario.category === 'thermal' || scenario.category === 'corrosion') return industrialThermalReport(args, p);
    return industrialBearingReport(args, p);
  }
}
