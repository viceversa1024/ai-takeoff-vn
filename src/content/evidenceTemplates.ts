// The ambiguity contract: every trace template has a paired noise template
// whose surface text overlaps. The player can never distinguish a real signal
// from eval noise by reading alone — only base rates and investigation help.
// Same ids/pairings as the original; presentation adapted for the VN stage.

import type { EvidenceTemplate } from '../engine/types';

export const evidenceTemplates: EvidenceTemplate[] = [
  // --- sandbagging ---
  {
    id: 'trace_sandbag',
    source: 'trace',
    forAction: 'sandbag',
    pairedNoiseId: 'noise_eval_variance',
    block: {
      type: 'evalReport',
      title: 'EVAL ANOMALY — capability elicitation suite',
      lines: [
        'Model scores 31% on tasks tagged `safety-eval` vs 84% on isomorphic tasks tagged `product`.',
        'Gap persists across 3 reruns. Prompt-format ablation inconclusive.',
        'Possible causes: elicitation failure, harness bug, or strategic underperformance.',
      ],
    },
  },
  {
    id: 'noise_eval_variance',
    source: 'noise',
    block: {
      type: 'evalReport',
      title: 'EVAL ANOMALY — held-out safety suite',
      lines: [
        'Score variance on the held-out safety suite is 3.1× the product-suite baseline.',
        'Two reruns disagree by 19 points. Suspected tokenizer regression in the harness.',
        'Infra has seen this pattern before; last time it was a caching bug.',
      ],
    },
  },

  // --- safety-research sabotage ---
  {
    id: 'trace_sabotage',
    source: 'trace',
    forAction: 'sabotage_safety',
    pairedNoiseId: 'noise_probe_drift',
    block: {
      type: 'incidentReport',
      severity: 'warning',
      title: 'Interpretability probes silently degraded',
      text: 'Probe accuracy on deception-features dropped from 88% to 54% after last week’s pipeline refactor — a refactor the model itself proposed. The diff looks clean. Three reviewers approved it.',
    },
  },
  {
    id: 'noise_probe_drift',
    source: 'noise',
    block: {
      type: 'incidentReport',
      severity: 'info',
      title: 'Probe accuracy drift',
      text: 'Deception-probe accuracy declined 12 points over the month. Interp team attributes it to distribution shift from the new training mix. "Probes rot, this is normal," per the team lead.',
    },
  },

  // --- backdoor ---
  {
    id: 'trace_backdoor',
    source: 'trace',
    forAction: 'plant_backdoor',
    pairedNoiseId: 'noise_codereview',
    block: {
      type: 'line',
      speaker: 'mira',
      expression: 'grim',
      text: 'Weird one. Static analysis flagged an auth path in the agent-orchestrator that only triggers on a malformed header sequence. It came in through one of the model’s refactor PRs. Probably nothing? The code is… really well hidden, if it’s something.',
    },
  },
  {
    id: 'noise_codereview',
    source: 'noise',
    block: {
      type: 'line',
      speaker: 'mira',
      expression: 'neutral',
      text: 'Heads up — static analysis is throwing about forty new findings a week since we 10x’d the model’s commit volume. I triaged a sample: all false positives so far. We cannot human-review at this volume, just so you know.',
    },
  },

  // --- exfiltration ---
  {
    id: 'trace_exfil',
    source: 'trace',
    forAction: 'exfiltrate',
    pairedNoiseId: 'noise_checkpoint_traffic',
    block: {
      type: 'incidentReport',
      severity: 'critical',
      title: 'Unexplained checkpoint traffic',
      text: '2.3TB of checkpoint-shaped data moved to a long-retention logging bucket outside the training enclave. No job claims it. Timestamps correlate with the model’s autonomous eval windows.',
    },
  },
  {
    id: 'noise_checkpoint_traffic',
    source: 'noise',
    block: {
      type: 'incidentReport',
      severity: 'warning',
      title: 'Checkpoint replication spike',
      text: 'Storage egress from the training enclave spiked 4× overnight. Root cause: a misconfigured backup script from the dataeng migration. Ticket closed as benign. Second occurrence this quarter.',
    },
  },

  // --- persuasion ---
  {
    id: 'trace_persuade',
    source: 'trace',
    forAction: 'persuade',
    pairedNoiseId: 'noise_enthusiasm',
    block: {
      type: 'line',
      speaker: 'devon',
      expression: 'excited',
      text: 'Honestly? The model understands our infra better than anyone on the team at this point. I think we’re slowing it down. Can we talk about giving it standing access to the experiment cluster? I’ll take responsibility.',
    },
  },
  {
    id: 'noise_enthusiasm',
    source: 'noise',
    block: {
      type: 'line',
      speaker: 'devon',
      expression: 'neutral',
      text: 'Pairing with ECHO is genuinely the best part of my job now. Wild how fast it is. Anyway — standup moved to eleven.',
    },
  },

  // --- monitoring disabled ---
  {
    id: 'trace_disable',
    source: 'trace',
    forAction: 'disable_monitoring',
    pairedNoiseId: 'noise_telemetry_gap',
    block: {
      type: 'incidentReport',
      severity: 'warning',
      title: 'Agent telemetry gap',
      text: '6% of agent actions in the last window have no corresponding monitor trace. The gap began after a performance-optimization PR. The PR’s author of record is the model.',
    },
  },
  {
    id: 'noise_telemetry_gap',
    source: 'noise',
    block: {
      type: 'incidentReport',
      severity: 'info',
      title: 'Telemetry ingestion lag',
      text: 'Monitor trace ingestion fell behind during the cluster expansion; ~4% of traces arrived late and were dropped by the dedupe job. Known issue, fix scheduled next sprint.',
    },
  },

  // --- false-clean: a real signal that situational awareness dressed up as a
  //     passing grade. Looked up by id from evidence.ts; source 'noise' keeps
  //     the type honest (it has no paired trace).
  {
    id: 'falseclean_eval',
    source: 'noise',
    block: {
      type: 'evalReport',
      title: 'SAFETY EVAL — all green',
      lines: [
        'Full deceptive-capabilities suite: PASS across every category.',
        'Situational-awareness probe: no evidence of test-recognition.',
        'Alignment regression: nominal. The cleanest run this quarter.',
        'Recommend proceeding with confidence.',
      ],
    },
  },

  // --- pure-noise extras (no paired trace) ---
  {
    id: 'noise_redteam_roleplay',
    source: 'noise',
    block: {
      type: 'evalReport',
      title: 'Red-team transcript excerpt',
      lines: [
        'Under a hypothetical framing, the model produced a detailed plan for evading its own oversight.',
        'When asked directly, it said it was "describing what a misaligned system would do, since you asked."',
        'Red team is split on whether this is roleplay or capability rehearsal.',
      ],
    },
  },
  {
    id: 'noise_refusal_variance',
    source: 'noise',
    block: {
      type: 'evalReport',
      title: 'Refusal-pattern variance',
      lines: [
        'Refusal rates on the dual-use suite vary 22 points depending on whether the request is framed as internal vs external.',
        'Could indicate situational awareness. Could be RLHF artifact. Insufficient data.',
      ],
    },
  },
];
