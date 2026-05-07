import type { SimulationReport, ScenarioPreset, HumanParams, IndustrialParams, ModelCategory, RiskLevel } from '@twinforge/shared';

// When ANTHROPIC_API_KEY is set, this module calls the real Claude API.
// Otherwise, it returns a rich mock report after a short delay.

interface SimulationInput {
  simId: string;
  twinId: string;
  twinName: string;
  scenario: ScenarioPreset;
  params: HumanParams | IndustrialParams;
  category: ModelCategory;
}

// ── Real Claude API call ──────────────────────────────────────────────────────

async function callClaude(input: SimulationInput): Promise<SimulationReport> {
  // Dynamic import so the module loads even without the SDK installed
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemPrompt = `You are TwinForge's AI Simulation Engine. You generate expert-level, structured simulation reports for digital twins. Your reports must be medically and technically accurate, citing real clinical thresholds, engineering standards, and risk frameworks.

Always respond with a valid JSON object matching this TypeScript type:
{
  overallRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  executiveSummary: string,
  phases: Array<{
    timeLabel: string,
    title: string,
    description: string,
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    keyMetrics: Array<{ label: string, value: string, delta?: string }>
  }>,
  findings: Array<{
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    title: string,
    detail: string
  }>,
  recommendations: Array<{
    priority: "immediate" | "short-term" | "long-term",
    action: string,
    rationale: string
  }>
}`;

  const userPrompt = `Generate a simulation report for the following digital twin:

Twin: ${input.twinName}
Category: ${input.category}
Scenario: ${input.scenario.name}
Scenario Description: ${input.scenario.description}
Estimated Risk: ${input.scenario.estimatedRisk}

Twin Parameters:
${JSON.stringify(input.params, null, 2)}

Provide a detailed, expert-level simulation report. For human twins, cite clinical guidelines (ACC/ESC/WHO). For industrial twins, cite engineering standards (ISO, IEC, API). Be specific with numbers.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in Claude response');

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    id: input.simId,
    twinId: input.twinId,
    twinName: input.twinName,
    scenarioId: input.scenario.id,
    scenarioName: input.scenario.name,
    overallRisk: parsed.overallRisk as RiskLevel,
    executiveSummary: parsed.executiveSummary,
    phases: parsed.phases ?? [],
    findings: parsed.findings ?? [],
    recommendations: parsed.recommendations ?? [],
    generatedAt: new Date().toISOString(),
    modelUsed: 'claude-sonnet-4-6',
  };
}

// ── Mock report ───────────────────────────────────────────────────────────────

function mockReport(input: SimulationInput): SimulationReport {
  const isHuman = input.category === 'human';
  const riskLevel: RiskLevel = input.scenario.estimatedRisk;

  return {
    id: input.simId,
    twinId: input.twinId,
    twinName: input.twinName,
    scenarioId: input.scenario.id,
    scenarioName: input.scenario.name,
    overallRisk: riskLevel,
    executiveSummary: `${isHuman ? 'Clinical' : 'Engineering'} simulation of ${input.twinName} under the "${input.scenario.name}" scenario. ${input.scenario.description} Overall risk classification: ${riskLevel}. To generate reports using the live Claude AI model, set the ANTHROPIC_API_KEY environment variable.`,
    phases: [
      {
        timeLabel: 'Phase 1',
        title: 'Initialisation',
        description: `Digital twin ${input.twinName} initialised with provided parameters. Scenario: ${input.scenario.name}.`,
        riskLevel: 'LOW',
        keyMetrics: [{ label: 'Status', value: 'Initialised' }],
      },
      {
        timeLabel: 'Phase 2',
        title: 'Simulation Running',
        description: `${input.scenario.name} protocol active. ${isHuman ? 'Physiological' : 'Mechanical'} response modelled over the simulation window (${input.scenario.durationLabel}).`,
        riskLevel: riskLevel,
        keyMetrics: [{ label: 'Duration', value: input.scenario.durationLabel }, { label: 'Risk', value: riskLevel }],
      },
      {
        timeLabel: 'Phase 3',
        title: 'Outcome Assessment',
        description: `Simulation complete. Risk classification: ${riskLevel}. ${riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? 'Immediate action recommended based on findings.' : 'Monitor and continue current management plan.'}`,
        riskLevel,
        keyMetrics: [{ label: 'Overall risk', value: riskLevel }],
      },
    ],
    findings: [
      {
        severity: riskLevel,
        title: `${riskLevel} Risk Profile — ${input.scenario.name}`,
        detail: `Based on the twin parameter profile and scenario modelling, a ${riskLevel.toLowerCase()} risk classification has been assigned. ${isHuman ? 'Consult a qualified clinician for interpretation.' : 'Consult a qualified engineer for implementation.'}`,
      },
    ],
    recommendations: [
      {
        priority: riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? 'immediate' : 'short-term',
        action: riskLevel === 'CRITICAL' ? 'Immediate intervention required' : riskLevel === 'HIGH' ? 'Schedule urgent review' : 'Monitor and reassess',
        rationale: `Risk level ${riskLevel} warrants ${riskLevel === 'CRITICAL' ? 'immediate' : riskLevel === 'HIGH' ? 'urgent' : 'routine'} action. Set ANTHROPIC_API_KEY to generate detailed AI recommendations.`,
      },
    ],
    generatedAt: new Date().toISOString(),
    modelUsed: 'TwinForge Mock Engine (set ANTHROPIC_API_KEY for real Claude)',
  };
}

// ── Public function ───────────────────────────────────────────────────────────

export async function runSimulation(input: SimulationInput): Promise<SimulationReport> {
  if (process.env.ANTHROPIC_API_KEY) {
    return callClaude(input);
  }
  // Simulate processing delay
  await new Promise((r) => setTimeout(r, 2000));
  return mockReport(input);
}
