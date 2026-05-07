import type { HumanParams, IndustrialParams, ModelCategory } from '@twinforge/shared';

// Human health score: 0–100 (higher = healthier)
function scoreHuman(p: HumanParams): number {
  let score = 100;
  const deductions: number[] = [];

  // Cardiovascular
  if (p.restingHeartRate > 100) deductions.push(15);
  else if (p.restingHeartRate > 90) deductions.push(8);
  else if (p.restingHeartRate < 50) deductions.push(3);

  if (p.systolicBP > 180) deductions.push(20);
  else if (p.systolicBP > 140) deductions.push(10);
  else if (p.systolicBP > 130) deductions.push(5);

  if (p.ejectionFraction < 40) deductions.push(20);
  else if (p.ejectionFraction < 55) deductions.push(8);

  if (p.vo2Max < 20) deductions.push(12);
  else if (p.vo2Max < 35) deductions.push(5);
  else if (p.vo2Max > 55) score += 3;

  // Metabolic
  if (p.fastingGlucose > 200) deductions.push(15);
  else if (p.fastingGlucose > 126) deductions.push(10);
  else if (p.fastingGlucose > 100) deductions.push(5);

  if (p.hba1c > 9) deductions.push(12);
  else if (p.hba1c > 7) deductions.push(8);
  else if (p.hba1c > 5.7) deductions.push(3);

  if (p.totalCholesterol > 240) deductions.push(8);
  else if (p.totalCholesterol > 200) deductions.push(4);

  if (p.insulinSensitivity === 'resistant') deductions.push(10);
  else if (p.insulinSensitivity === 'low') deductions.push(5);

  // Lifestyle
  if (p.activityLevel === 'sedentary') deductions.push(10);
  else if (p.activityLevel === 'light') deductions.push(5);
  else if (p.activityLevel === 'active') score += 3;
  else if (p.activityLevel === 'athlete') score += 5;

  if (p.sleepQuality === 'poor') deductions.push(8);
  else if (p.sleepQuality === 'fair') deductions.push(3);

  if (p.smokingStatus === 'current') deductions.push(15);
  else if (p.smokingStatus === 'former') deductions.push(5);

  if (p.alcoholUnitsPerWeek > 21) deductions.push(10);
  else if (p.alcoholUnitsPerWeek > 14) deductions.push(5);

  if (p.stressIndex > 8) deductions.push(10);
  else if (p.stressIndex > 6) deductions.push(5);

  // Medical history
  deductions.push(Math.min(p.existingConditions.length * 4, 20));

  // Genetic
  if (p.familyHistoryHD) deductions.push(5);
  if (p.familyHistoryDiabetes) deductions.push(3);

  const totalDeduction = deductions.reduce((a, b) => a + b, 0);
  return Math.max(0, Math.min(100, score - totalDeduction));
}

// Industrial health score: 0–100 (higher = better condition)
function scoreIndustrial(p: IndustrialParams): number {
  let score = 100;
  const deductions: number[] = [];

  // Age of asset
  const installYear = new Date(p.installationDate).getFullYear();
  const ageYears = new Date().getFullYear() - installYear;
  if (ageYears > 20) deductions.push(15);
  else if (ageYears > 10) deductions.push(8);
  else if (ageYears > 5) deductions.push(3);

  // Operating hours vs fatigue life
  if (p.fatigueLifeHours > 0) {
    const ratio = p.operatingHoursTotal / p.fatigueLifeHours;
    if (ratio > 0.9) deductions.push(20);
    else if (ratio > 0.7) deductions.push(12);
    else if (ratio > 0.5) deductions.push(6);
  }

  // Load cycle
  if (p.loadCyclePercent > 95) deductions.push(12);
  else if (p.loadCyclePercent > 85) deductions.push(6);

  // Temperature extremes
  if (p.temperatureMax > 120) deductions.push(8);
  else if (p.temperatureMax > 80) deductions.push(4);

  // Maintenance freshness
  const daysSinceService = Math.floor(
    (Date.now() - new Date(p.lastServiceDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceService > 730) deductions.push(15);
  else if (daysSinceService > 365) deductions.push(8);
  else if (daysSinceService > 180) deductions.push(3);

  // Open defects
  deductions.push(Math.min(p.openDefects.length * 5, 25));

  // Operator skill
  if (p.operatorSkillLevel === 'trainee') deductions.push(5);

  // Environment
  if (p.environment === 'offshore') deductions.push(8);
  else if (p.environment === 'arctic') deductions.push(10);

  // Hours per day (wear rate)
  if (p.hoursPerDay > 20) deductions.push(8);
  else if (p.hoursPerDay > 16) deductions.push(4);

  const totalDeduction = deductions.reduce((a, b) => a + b, 0);
  return Math.max(0, Math.min(100, score - totalDeduction));
}

export function computeHealthScore(
  params: HumanParams | IndustrialParams,
  category: ModelCategory
): number {
  if (category === 'human') return scoreHuman(params as HumanParams);
  return scoreIndustrial(params as IndustrialParams);
}

export function healthScoreColor(score: number): string {
  if (score >= 80) return '#10B981'; // success
  if (score >= 60) return '#22D3EE'; // accent
  if (score >= 40) return '#F59E0B'; // warning
  return '#EF4444'; // danger
}

export function healthScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Poor';
  return 'Critical';
}
