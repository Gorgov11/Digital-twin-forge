import { useState } from 'react';
import type { HumanParams } from '@twinforge/shared';

const DEFAULT_HUMAN_PARAMS: HumanParams = {
  age: 35,
  weight: 75,
  height: 178,
  biologicalSex: 'male',
  restingHeartRate: 65,
  systolicBP: 120,
  diastolicBP: 80,
  vo2Max: 42,
  ejectionFraction: 62,
  fastingGlucose: 90,
  hba1c: 5.2,
  totalCholesterol: 180,
  ldl: 110,
  hdl: 50,
  insulinSensitivity: 'normal',
  activityLevel: 'moderate',
  sleepQuality: 'good',
  smokingStatus: 'never',
  alcoholUnitsPerWeek: 4,
  stressIndex: 4,
  existingConditions: [],
  medications: [],
  familyHistoryHD: false,
  familyHistoryDiabetes: false,
  familyHistoryCancer: false,
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-bg-elevated hover:bg-border transition-colors text-left"
      >
        <span className="text-xs font-semibold text-txt-primary">{title}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`w-3.5 h-3.5 text-txt-muted transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="p-4 space-y-3 bg-bg-surface">{children}</div>}
    </div>
  );
}

function Field({ label, warning, children }: { label: string; warning?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {warning && <p className="text-[10px] text-warning mt-1">⚠ {warning}</p>}
    </div>
  );
}

function NumInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="input flex-1 text-right font-mono"
      />
      {unit && <span className="text-xs text-txt-muted w-10 shrink-0">{unit}</span>}
    </div>
  );
}

function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="input"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

interface HumanParamFormProps {
  params: HumanParams;
  onChange: (params: HumanParams) => void;
}

export { DEFAULT_HUMAN_PARAMS };

export default function HumanParamForm({ params, onChange }: HumanParamFormProps) {
  function set<K extends keyof HumanParams>(key: K, value: HumanParams[K]) {
    onChange({ ...params, [key]: value });
  }

  const bpHigh = params.systolicBP > 140 || params.diastolicBP > 90;
  const hrHigh = params.restingHeartRate > 100;
  const glucoseHigh = params.fastingGlucose > 126;

  return (
    <div className="space-y-2">
      <Section title="Biometrics" defaultOpen>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Age">
            <NumInput value={params.age} onChange={(v) => set('age', v)} min={5} max={100} unit="yrs" />
          </Field>
          <Field label="Biological Sex">
            <Select value={params.biologicalSex} onChange={(v) => set('biologicalSex', v)}
              options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
          </Field>
          <Field label="Weight">
            <NumInput value={params.weight} onChange={(v) => set('weight', v)} min={20} max={250} unit="kg" />
          </Field>
          <Field label="Height">
            <NumInput value={params.height} onChange={(v) => set('height', v)} min={100} max={230} unit="cm" />
          </Field>
        </div>
      </Section>

      <Section title="Cardiovascular">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Resting Heart Rate" warning={hrHigh ? 'Above 100 bpm — tachycardia' : undefined}>
            <NumInput value={params.restingHeartRate} onChange={(v) => set('restingHeartRate', v)} min={30} max={200} unit="bpm" />
          </Field>
          <Field label="VO₂ Max">
            <NumInput value={params.vo2Max} onChange={(v) => set('vo2Max', v)} min={10} max={85} step={0.5} unit="ml/kg/min" />
          </Field>
          <Field label="Systolic BP" warning={bpHigh ? 'Above clinical threshold' : undefined}>
            <NumInput value={params.systolicBP} onChange={(v) => set('systolicBP', v)} min={70} max={250} unit="mmHg" />
          </Field>
          <Field label="Diastolic BP" warning={params.diastolicBP > 90 ? 'Elevated' : undefined}>
            <NumInput value={params.diastolicBP} onChange={(v) => set('diastolicBP', v)} min={40} max={150} unit="mmHg" />
          </Field>
          <Field label="Ejection Fraction" warning={params.ejectionFraction < 40 ? 'Below 40% — reduced EF' : undefined}>
            <NumInput value={params.ejectionFraction} onChange={(v) => set('ejectionFraction', v)} min={10} max={80} unit="%" />
          </Field>
        </div>
      </Section>

      <Section title="Metabolic">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fasting Glucose" warning={glucoseHigh ? 'Diabetic range' : params.fastingGlucose > 100 ? 'Pre-diabetic range' : undefined}>
            <NumInput value={params.fastingGlucose} onChange={(v) => set('fastingGlucose', v)} min={50} max={400} unit="mg/dL" />
          </Field>
          <Field label="HbA1c">
            <NumInput value={params.hba1c} onChange={(v) => set('hba1c', v)} min={4} max={15} step={0.1} unit="%" />
          </Field>
          <Field label="Total Cholesterol">
            <NumInput value={params.totalCholesterol} onChange={(v) => set('totalCholesterol', v)} min={100} max={400} unit="mg/dL" />
          </Field>
          <Field label="LDL">
            <NumInput value={params.ldl} onChange={(v) => set('ldl', v)} min={30} max={300} unit="mg/dL" />
          </Field>
          <Field label="HDL">
            <NumInput value={params.hdl} onChange={(v) => set('hdl', v)} min={20} max={100} unit="mg/dL" />
          </Field>
          <Field label="Insulin Sensitivity">
            <Select value={params.insulinSensitivity} onChange={(v) => set('insulinSensitivity', v)}
              options={[
                { value: 'high', label: 'High' },
                { value: 'normal', label: 'Normal' },
                { value: 'low', label: 'Low' },
                { value: 'resistant', label: 'Resistant' },
              ]} />
          </Field>
        </div>
      </Section>

      <Section title="Lifestyle">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Activity Level">
            <Select value={params.activityLevel} onChange={(v) => set('activityLevel', v)}
              options={[
                { value: 'sedentary', label: 'Sedentary' },
                { value: 'light', label: 'Light' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'active', label: 'Active' },
                { value: 'athlete', label: 'Athlete' },
              ]} />
          </Field>
          <Field label="Sleep Quality">
            <Select value={params.sleepQuality} onChange={(v) => set('sleepQuality', v)}
              options={[
                { value: 'poor', label: 'Poor' },
                { value: 'fair', label: 'Fair' },
                { value: 'good', label: 'Good' },
                { value: 'excellent', label: 'Excellent' },
              ]} />
          </Field>
          <Field label="Smoking Status">
            <Select value={params.smokingStatus} onChange={(v) => set('smokingStatus', v)}
              options={[
                { value: 'never', label: 'Never' },
                { value: 'former', label: 'Former' },
                { value: 'current', label: 'Current' },
              ]} />
          </Field>
          <Field label="Alcohol (units/week)">
            <NumInput value={params.alcoholUnitsPerWeek} onChange={(v) => set('alcoholUnitsPerWeek', v)} min={0} max={80} unit="u/wk" />
          </Field>
          <Field label="Stress Index (1–10)" warning={params.stressIndex > 8 ? 'High chronic stress' : undefined}>
            <NumInput value={params.stressIndex} onChange={(v) => set('stressIndex', v)} min={1} max={10} />
          </Field>
        </div>
      </Section>

      <Section title="Medical History & Genetics">
        <div className="space-y-3">
          <Field label="Existing Conditions (comma-separated)">
            <textarea
              value={params.existingConditions.join(', ')}
              onChange={(e) => set('existingConditions', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              className="input resize-none h-16 text-xs"
              placeholder="e.g. hypertension, type 2 diabetes"
            />
          </Field>
          <Field label="Medications (comma-separated)">
            <textarea
              value={params.medications.join(', ')}
              onChange={(e) => set('medications', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              className="input resize-none h-16 text-xs"
              placeholder="e.g. metformin 500mg, lisinopril 10mg"
            />
          </Field>
          <div className="grid grid-cols-3 gap-2">
            {([
              ['familyHistoryHD', 'Heart Disease'],
              ['familyHistoryDiabetes', 'Diabetes'],
              ['familyHistoryCancer', 'Cancer'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={params[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-primary"
                />
                <span className="text-xs text-txt-secondary">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
