import { useState } from 'react';
import type { IndustrialParams } from '@twinforge/shared';

export const DEFAULT_INDUSTRIAL_PARAMS: IndustrialParams = {
  manufacturer: 'Siemens',
  modelNumber: 'SGT-600',
  serialNumber: 'SN-2019-004821',
  installationDate: '2019-03-15',
  rpmMin: 800,
  rpmMax: 3600,
  loadCyclePercent: 75,
  temperatureMin: -10,
  temperatureMax: 85,
  environment: 'indoor',
  lastServiceDate: '2024-06-01',
  operatingHoursTotal: 28000,
  openDefects: [],
  activeSensorCount: 24,
  samplingRateHz: 100,
  materialGrade: 'AISI 4140',
  coatingType: 'Thermal barrier coating',
  fatigueLifeHours: 100000,
  hoursPerDay: 16,
  operatorSkillLevel: 'qualified',
  inspectionFrequency: 'monthly',
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`w-3.5 h-3.5 text-txt-muted transition-transform ${open ? 'rotate-180' : ''}`}>
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

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input text-xs"
    />
  );
}

function NumInput({ value, onChange, min, max, step = 1, unit }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit?: string }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="input flex-1 text-right font-mono text-xs"
      />
      {unit && <span className="text-xs text-txt-muted w-14 shrink-0">{unit}</span>}
    </div>
  );
}

function Select<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)} className="input text-xs">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

interface IndustrialParamFormProps {
  params: IndustrialParams;
  onChange: (params: IndustrialParams) => void;
}

export default function IndustrialParamForm({ params, onChange }: IndustrialParamFormProps) {
  function set<K extends keyof IndustrialParams>(key: K, value: IndustrialParams[K]) {
    onChange({ ...params, [key]: value });
  }

  const hoursOld = params.fatigueLifeHours > 0 ? params.operatingHoursTotal / params.fatigueLifeHours : 0;
  const lifeWarning = hoursOld > 0.8 ? 'Approaching end of design life (>80%)' : hoursOld > 0.6 ? 'Over 60% design life consumed' : undefined;

  return (
    <div className="space-y-2">
      <Section title="Asset Identity" defaultOpen>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Manufacturer">
            <TextInput value={params.manufacturer} onChange={(v) => set('manufacturer', v)} placeholder="e.g. Siemens" />
          </Field>
          <Field label="Model Number">
            <TextInput value={params.modelNumber} onChange={(v) => set('modelNumber', v)} placeholder="e.g. SGT-600" />
          </Field>
          <Field label="Serial Number">
            <TextInput value={params.serialNumber} onChange={(v) => set('serialNumber', v)} />
          </Field>
          <Field label="Installation Date">
            <input
              type="date"
              value={params.installationDate}
              onChange={(e) => set('installationDate', e.target.value)}
              className="input text-xs"
            />
          </Field>
        </div>
      </Section>

      <Section title="Operating Conditions">
        <div className="grid grid-cols-2 gap-3">
          <Field label="RPM Min">
            <NumInput value={params.rpmMin} onChange={(v) => set('rpmMin', v)} min={0} max={10000} unit="RPM" />
          </Field>
          <Field label="RPM Max">
            <NumInput value={params.rpmMax} onChange={(v) => set('rpmMax', v)} min={0} max={10000} unit="RPM" />
          </Field>
          <Field label="Load Cycle" warning={params.loadCyclePercent > 90 ? 'High load — increased wear rate' : undefined}>
            <NumInput value={params.loadCyclePercent} onChange={(v) => set('loadCyclePercent', v)} min={0} max={100} unit="%" />
          </Field>
          <Field label="Environment">
            <Select value={params.environment} onChange={(v) => set('environment', v)}
              options={[
                { value: 'indoor', label: 'Indoor' },
                { value: 'outdoor', label: 'Outdoor' },
                { value: 'offshore', label: 'Offshore' },
                { value: 'cleanroom', label: 'Cleanroom' },
                { value: 'arctic', label: 'Arctic' },
              ]} />
          </Field>
          <Field label="Temp Min">
            <NumInput value={params.temperatureMin} onChange={(v) => set('temperatureMin', v)} min={-60} max={50} unit="°C" />
          </Field>
          <Field label="Temp Max">
            <NumInput value={params.temperatureMax} onChange={(v) => set('temperatureMax', v)} min={10} max={500} unit="°C" />
          </Field>
        </div>
      </Section>

      <Section title="Maintenance History">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Last Service Date">
            <input
              type="date"
              value={params.lastServiceDate}
              onChange={(e) => set('lastServiceDate', e.target.value)}
              className="input text-xs"
            />
          </Field>
          <Field label="Total Operating Hours" warning={lifeWarning}>
            <NumInput value={params.operatingHoursTotal} onChange={(v) => set('operatingHoursTotal', v)} min={0} max={500000} unit="hrs" />
          </Field>
          <Field label="Hours / Day">
            <NumInput value={params.hoursPerDay} onChange={(v) => set('hoursPerDay', v)} min={0} max={24} unit="hrs/day" />
          </Field>
          <Field label="Inspection Frequency">
            <Select value={params.inspectionFrequency} onChange={(v) => set('inspectionFrequency', v)}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
              ]} />
          </Field>
        </div>
        <Field label="Open Defects (comma-separated)">
          <textarea
            value={params.openDefects.join(', ')}
            onChange={(e) => set('openDefects', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
            className="input resize-none h-14 text-xs"
            placeholder="e.g. minor oil leak on bearing housing"
          />
        </Field>
      </Section>

      <Section title="Sensor Configuration">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Active Sensors">
            <NumInput value={params.activeSensorCount} onChange={(v) => set('activeSensorCount', v)} min={0} max={500} unit="pts" />
          </Field>
          <Field label="Sampling Rate">
            <NumInput value={params.samplingRateHz} onChange={(v) => set('samplingRateHz', v)} min={1} max={10000} unit="Hz" />
          </Field>
        </div>
      </Section>

      <Section title="Material & Operational Context">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Material Grade">
            <TextInput value={params.materialGrade} onChange={(v) => set('materialGrade', v)} placeholder="e.g. AISI 4140" />
          </Field>
          <Field label="Coating Type">
            <TextInput value={params.coatingType} onChange={(v) => set('coatingType', v)} placeholder="e.g. TBC" />
          </Field>
          <Field label="Design Life">
            <NumInput value={params.fatigueLifeHours} onChange={(v) => set('fatigueLifeHours', v)} min={1000} max={500000} unit="hrs" />
          </Field>
          <Field label="Operator Skill">
            <Select value={params.operatorSkillLevel} onChange={(v) => set('operatorSkillLevel', v)}
              options={[
                { value: 'trainee', label: 'Trainee' },
                { value: 'qualified', label: 'Qualified' },
                { value: 'expert', label: 'Expert' },
              ]} />
          </Field>
        </div>
      </Section>
    </div>
  );
}
