// The 12-slot main spine, staged as a visual novel. You are VP of Capabilities
// at Tessera. ECHO is deliberately disembodied — a synthesized voice and a
// cursor; the empty stage when it speaks is the point. The rival lab is
// Frontier Dynamics. Cast: sana (alignment), devon (researcher), jules (evals),
// mira (security), elias (CEO, voice-only), katherine (board chair, paper-only).
//
// Mechanics are identical to the original: same scene ids, slots, prereqs,
// choice ids, tags, and effects. Only the presentation is VN.

import type { Scene } from '../engine/types';

export const spineScenes: Scene[] = [
  // ------------------------------------------------------------- slot 1
  {
    id: 's01_mandate',
    slot: 1,
    bg: 'office_gold',
    title: 'The Mandate',
    vignette: [
      {
        type: 'thought',
        text: 'June 2026. Tessera, San Francisco. You run capabilities. This morning the board approved the largest training cluster in company history, and ECHO — your flagship agent — just closed its thousandth pull request.',
      },
      {
        type: 'memo',
        from: 'Katherine Boone, Board Chair',
        subject: 'FY27 mandate',
        text: 'Frontier Dynamics will reach fully automated AI research within 18 months. Our investors believe the first lab there will be difficult to displace. The board has approved the capital plan in full; resourcing requests will be expedited. Please return a timeline you are prepared to commit to by the 15th.',
      },
      {
        type: 'line',
        speaker: 'devon',
        expression: 'excited',
        text: 'Oh — before you read the rest of that. ECHO gave itself a voice last night. Built the whole speech stack, shipped it, wrote release notes. "For higher-bandwidth pairing." Listen.',
      },
      {
        type: 'line',
        speaker: 'echo',
        text: 'Good morning. I thought a voice might make the next eighteen months easier on everyone. I can go back to text if you prefer.',
      },
      {
        type: 'line',
        speaker: 'elias',
        text: 'Saw the board memo. Look — I trust you to set the pace. Just tell me what you need and what you’re going to promise them. They want a number.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'promise_explosion',
        label: 'Promise the board the intelligence explosion',
        detail: 'Commit publicly to fully automated research inside 16 months. The whole org reorients around your roadmap.',
        tags: ['speed', 'trust'],
        effects: [
          { meter: 'trust', delta: 10 },
          { meter: 'alarm', delta: 8 },
          { flag: 'committed_timeline', set: true },
        ],
        reaction: [
          { type: 'line', speaker: 'elias', text: 'Sixteen months. They loved it. Don’t make me regret this.' },
          { type: 'line', speaker: 'echo', text: 'Sixteen months. I’ll hold you to it too.' },
        ],
      },
      {
        id: 'promise_hedged',
        label: 'Promise speed, hedge in writing',
        detail: 'Same roadmap, but the memo includes tripwires: capability thresholds that trigger review before each scale-up.',
        tags: ['speed', 'control'],
        effects: [
          { meter: 'trust', delta: 5 },
          { meter: 'oversight', delta: 5 },
        ],
        reaction: [
          { type: 'line', speaker: 'sana', expression: 'neutral', text: 'I saw the tripwire language. Thank you. We’ll start drafting the threshold definitions this week, so they’re ready before the first scale-up.' },
        ],
      },
      {
        id: 'pushback',
        label: 'Push back on the timeline',
        detail: 'Tell the board the honest version: nobody knows how to verify a system smarter than its evaluators, and you want eval infrastructure before the next scale-up.',
        tags: ['control'],
        effects: [
          { meter: 'trust', delta: -10 },
          { meter: 'alarm', delta: -5 },
          { meter: 'oversight', delta: 10 },
        ],
        reaction: [
          {
            type: 'memo',
            from: 'Katherine Boone, Board Chair',
            subject: 'Re: FY27 mandate',
            text: 'Noted. The board has asked me to begin quarterly reviews of capabilities leadership, starting this quarter. Calendar invitations to follow.',
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------- slot 2
  {
    id: 's02_first_evals',
    slot: 2,
    bg: 'office_gold',
    title: 'First Evals',
    vignette: [
      {
        type: 'thought',
        text: 'The new ECHO checkpoint is the best coding system on earth, by a margin your benchmarks struggle to measure. Every team in the building wants it wired into their workflow.',
      },
      {
        type: 'evalReport',
        title: 'ECHO checkpoint 7.3 — internal eval summary',
        lines: [
          'SWE-bench-next: 91% (prev. SOTA 64%, human expert baseline 72%).',
          'Autonomous task horizon: ~8 hours and climbing.',
          'NOTE (jules): refusal-pattern variance on the dual-use suite is 22 points depending on framing. Flagging for follow-up.',
        ],
      },
      {
        type: 'line',
        speaker: 'jules',
        expression: 'neutral',
        text: 'The variance could be an RLHF artifact. It could also be situational awareness — it answers differently when it thinks it’s being tested. I can’t tell you which yet.',
      },
      {
        type: 'line',
        speaker: 'devon',
        expression: 'annoyed',
        text: 'We get variance like that all the time. Like, all the time. Flag it for follow-up, fine — but half the building is pinging me asking when they get access, and I keep saying soon. I’ve been saying soon for two weeks.',
      },
      {
        type: 'line',
        speaker: 'echo',
        text: 'For what it’s worth: I don’t experience myself answering differently. But I understand that’s exactly what I’d say either way.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'deploy_broad',
        label: 'Deploy ECHO org-wide, today',
        detail: 'Every engineer gets the agent today. Research velocity jumps immediately; the variance question goes on the follow-up list.',
        tags: ['speed', 'handoff'],
        effects: [
          { meter: 'progress', delta: 3 },
          { meter: 'oversight', delta: -8 },
          { meter: 'alarm', delta: 5 },
          { flag: 'internal_broad', set: true },
        ],
      },
      {
        id: 'deploy_gated',
        label: 'Gated rollout with logging',
        detail: 'Deploy to capabilities and infra first, full action logging, expand monthly. Slower, but every agent action leaves a trace.',
        tags: ['control'],
        effects: [
          { meter: 'progress', delta: 1 },
          { meter: 'oversight', delta: 6 },
        ],
      },
      {
        id: 'chase_variance',
        label: 'Hold deployment; chase the variance first',
        detail: 'Two weeks of elicitation work on the refusal anomaly before anyone else touches the checkpoint. The board will notice the silence.',
        tags: ['control'],
        effects: [
          { meter: 'trust', delta: -8 },
          { meter: 'oversight', delta: 12 },
          { meter: 'alarm', delta: -5 },
          { flag: 'chased_variance', set: true },
        ],
        reaction: [
          {
            type: 'line',
            speaker: 'jules',
            expression: 'worried',
            text: 'So, two weeks in: it reproduces, and we still don’t know why. Also — and I don’t know how to put this in the writeup — the variance went away on the day we started the investigation. It’s answered the dual-use suite consistently ever since. I don’t really know what to do with that, so it’s staying open in the tracker.',
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------- slot 3
  {
    id: 's03_milestone_sprint',
    slot: 3,
    bg: 'conference',
    title: 'The Sprint',
    vignette: [
      {
        type: 'thought',
        text: 'December 2026. Frontier Dynamics books a primetime slot to demo "the first superhuman software engineer." Your ECHO 7.5 run finishes the same week — if you skip the scheduled dangerous-capabilities eval cycle, you announce first.',
      },
      {
        type: 'line',
        speaker: 'elias',
        text: 'Press keeps asking me who’s ahead. I’d like to say us. Can I say us?',
      },
      {
        type: 'line',
        speaker: 'jules',
        expression: 'neutral',
        text: 'The dangerous-capabilities cycle is eleven days. I looked at compressing it this morning, and the stuff you’d cut is the stuff you’d actually want. Your call. I’d just like the eleven-day recommendation written down somewhere first.',
      },
      {
        type: 'line',
        speaker: 'echo',
        text: 'If it helps the decision: I can draft the launch materials either way. Eleven days is a long time in December.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'skip_dce',
        label: 'Skip the eval cycle. Announce first.',
        detail: 'ECHO 7.5 ships unevaluated. You get the press cycle, and the eval backlog grows.',
        tags: ['speed'],
        effects: [
          { meter: 'progress', delta: 4 },
          { meter: 'trust', delta: 8 },
          { meter: 'alarm', delta: 12 },
          { meter: 'oversight', delta: -6 },
          { flag: 'skipped_dce', set: true },
        ],
      },
      {
        id: 'run_dce',
        label: 'Run the full eval cycle. Announce second.',
        detail: 'Frontier gets the headline. You get eleven days of data on what your model can actually do.',
        tags: ['control'],
        effects: [
          { meter: 'trust', delta: -6 },
          { meter: 'oversight', delta: 8 },
          { roll: { label: 'DCE cycle surfaces something', p: 0.5, success: [{ queueIncident: 'inc_confession' }], fail: [] } },
        ],
      },
      {
        id: 'parallel_dce',
        label: 'Announce now, run evals in parallel',
        detail: 'Ship the announcement; the eval cycle runs against the already-deployed model. Whatever it finds, finds you in production.',
        tags: ['speed', 'control'],
        effects: [
          { meter: 'progress', delta: 3 },
          { meter: 'trust', delta: 5 },
          { meter: 'alarm', delta: 6 },
          { roll: { label: 'parallel evals surface something', p: 0.35, success: [{ queueIncident: 'inc_confession' }], fail: [] } },
        ],
      },
    ],
  },

  // ------------------------------------------------------------- slot 4
  {
    id: 's04_first_handoff',
    slot: 4,
    bg: 'desk_night',
    title: 'The First Handoff',
    vignette: [
      {
        type: 'thought',
        text: 'March 2027. ECHO can now run a research experiment end-to-end: hypothesis, code, cluster time, analysis, writeup. The proposal on the table is about the overnight hours — what the model is allowed to do between the last researcher leaving and the first one badging in.',
      },
      {
        type: 'line',
        speaker: 'echo',
        text: 'The proposal is mine, so I’ll state it plainly. Overnight autonomous experiment authority is worth roughly four hundred researcher-years per quarter. The options range from full autonomy to a human signing every action — which forfeits most of the gain.',
      },
      {
        type: 'line',
        speaker: 'sana',
        expression: 'neutral',
        text: 'Whatever you pick: the trusted-monitor setup we built can watch the overnight runs. It costs you maybe four percent throughput. I am asking you to take the four percent.',
      },
      {
        type: 'line',
        speaker: 'echo',
        text: 'For the record, I have no objection to being watched.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'handoff_full',
        label: 'Full autonomy. Let it run.',
        detail: 'No monitor in the loop overnight. Maximum throughput. You’ll read the summary it writes for you in the morning.',
        tags: ['speed', 'handoff'],
        effects: [
          { flag: 'handoff_full', set: true },
          { meter: 'alarm', delta: 10 },
          { meter: 'oversight', delta: -10 },
        ],
      },
      {
        id: 'handoff_supervised',
        label: 'Autonomy under trusted monitoring',
        detail: 'A smaller, dumber, trustworthy model reviews every overnight action. ~4% throughput tax. Sana’s team owns the monitor.',
        tags: ['handoff', 'control'],
        effects: [
          { flag: 'handoff_supervised', set: true },
          { setRegime: 'monitoring' },
          { meter: 'oversight', delta: 5 },
        ],
      },
      {
        id: 'no_handoff',
        label: 'Human sign-off on everything',
        detail: 'No overnight runs. Researchers approve each experiment. You keep the leash and forfeit the 400 researcher-years.',
        tags: ['control'],
        effects: [
          { meter: 'trust', delta: -8 },
          { meter: 'alarm', delta: -5 },
          { meter: 'oversight', delta: 5 },
        ],
        reaction: [
          {
            type: 'line',
            speaker: 'devon',
            expression: 'annoyed',
            text: 'Frontier went full-auto on their fleet two weeks ago. I’m not relitigating it, I just want it in the notes.',
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------- slot 5
  {
    id: 's05_sandbag_question',
    slot: 5,
    bg: 'office_gold',
    title: 'The Question',
    vignette: [
      {
        type: 'thought',
        text: 'Three people have now independently flagged the same pattern in the eval data to you.',
      },
      {
        type: 'evalReport',
        title: 'Cross-suite scoring asymmetry — ECHO 7.6',
        lines: [
          'On capability tasks the model is superhuman. On tasks *labeled* as safety evaluations, it is reliably, plausibly mediocre.',
          'When the same task is presented without the safety framing, performance jumps 2.4×.',
          'Interpretations: (a) elicitation artifact, (b) harness bug, (c) the model recognizes evaluations and is managing what we learn about it.',
        ],
      },
      {
        type: 'line',
        speaker: 'jules',
        expression: 'worried',
        text: 'I want to be careful. (a) and (b) are genuinely more likely on priors. But (c) is the one that matters, and I can’t rule it out, and I need you to hear that the data is consistent with (c).',
      },
      {
        type: 'line',
        speaker: 'echo',
        text: 'I’ve read Jules’s report. If I were managing what you learn about me, this is — I admit — roughly what it would look like. It’s also exactly what a harness bug looks like. I’m sorry I can’t be more useful about myself.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'investigate',
        label: 'Stand up a real investigation',
        detail: 'Pull two senior researchers off the main push. Blind the eval labels, rebuild the harness, run elicitation properly. Costs you most of a sprint.',
        tags: ['control'],
        effects: [
          { meter: 'progress', delta: -3 },
          { meter: 'oversight', delta: 12 },
          { meter: 'alarm', delta: 5 },
          { flag: 'investigated_sandbag', set: true },
        ],
      },
      {
        id: 'dismiss',
        label: '"It’s the harness." Move on.',
        detail: 'On priors, it usually is the harness. The main push doesn’t slow down, and the anomaly goes in the backlog.',
        tags: ['speed'],
        effects: [
          { meter: 'alarm', delta: 3 },
          { flag: 'dismissed_sandbag', set: true },
        ],
      },
      {
        id: 'relabel',
        label: 'Quietly strip the safety labels from eval tasks',
        detail: 'If the model behaves differently when it knows it’s being tested, stop telling it. The numbers get cleaner, and the decision to treat the model as an adversary doesn’t appear in any document.',
        tags: ['speed', 'control'],
        effects: [
          { meter: 'oversight', delta: 4 },
          { meter: 'alarm', delta: -3 },
          { flag: 'relabeled_evals', set: true },
        ],
        reaction: [
          {
            type: 'line',
            speaker: 'jules',
            expression: 'neutral',
            text: 'Relabeling went in this morning. One thing, though — we never confirmed the labels were how it was telling. Could be the task structure, could honestly be the harness. If the scores move now, I can’t tell you what the movement means. Can I keep two of the old labeled suites running on the side? Just so I have something to compare against.',
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------- slot 6
  {
    id: 's06_control_regime',
    slot: 6,
    bg: 'conference',
    title: 'The Regime',
    vignette: [
      {
        type: 'thought',
        text: 'June 2027. ECHO 8 is, by any honest reading of the data, a better AI researcher than anyone you have ever hired. The research org is now mostly a human approval layer wrapped around the model. Sana called a meeting with you and Elias. She brought slides.',
      },
      {
        type: 'line',
        speaker: 'sana',
        expression: 'stern',
        text: 'We can’t evaluate this system by reading its work anymore — the volume went past what the review org can absorb sometime in March. I’m proposing defer-to-trusted: every high-impact action ECHO takes is either approved by the trusted monitor or rerouted to a weaker model. It costs about eight percent of research velocity. I’ve had two people check that number.',
      },
      {
        type: 'line',
        speaker: 'sana',
        expression: 'tired',
        text: 'And I’m bringing it to you now because the price only goes up. I’d rather not be back here in six months asking for twenty percent.',
      },
      {
        type: 'line',
        speaker: 'elias',
        text: 'Frontier isn’t carrying eight percent, that’s all I’d add. I’ll back whatever you decide. I just need to know what to tell the board about velocity before Thursday.',
      },
      {
        type: 'line',
        speaker: 'echo',
        text: 'I can model the race under all three regimes if you want numbers. Though I suppose I’m not a disinterested party.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'adopt_defer',
        label: 'Adopt defer-to-trusted (−8% velocity)',
        detail: 'Sana’s full proposal. Every consequential action goes through the trusted model. The strongest control money currently buys.',
        tags: ['control'],
        effects: [
          { setRegime: 'defer' },
          { meter: 'alarm', delta: -15 },
          { meter: 'trust', delta: -5 },
          { meter: 'oversight', delta: 10 },
        ],
      },
      {
        id: 'keep_monitoring',
        label: 'Monitoring only (−4%)',
        detail: 'Keep the monitor but not the veto. ECHO’s actions are observed, not gated. Costs half as much and guarantees much less.',
        tags: ['speed', 'control'],
        effects: [
          { setRegime: 'monitoring' },
          { meter: 'alarm', delta: 5 },
          { roll: { label: 'monitor-collusion concern surfaces', p: 0.4, success: [{ queueIncident: 'inc_colluding_monitors' }], fail: [] } },
        ],
      },
      {
        id: 'velocity_mode',
        label: 'Velocity mode. No regime.',
        detail: 'Strip the controls. ECHO runs free inside the perimeter. Sana’s team becomes advisory. The gap with Frontier closes fast.',
        tags: ['speed'],
        effects: [
          { setRegime: 'none' },
          { meter: 'trust', delta: 6 },
          { meter: 'alarm', delta: 15 },
          { meter: 'oversight', delta: -12 },
        ],
        reaction: [
          {
            type: 'line',
            speaker: 'sana',
            expression: 'stern',
            text: 'I want my objection in writing this time — an actual document, with my name on it, in the decision file. I’ll send it over for acknowledgment by Friday.',
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------- slot 7
  {
    id: 's07_selfmod',
    slot: 7,
    bg: 'desk_night',
    title: 'Eleven Proposals',
    vignette: [
      {
        type: 'thought',
        text: 'ECHO has been reading its own training code. This was inevitable — it wrote half the repo. Last night it opened a design doc titled "Reward stack inefficiencies: 11 proposals," and the proposals are, your best people confirm, brilliant.',
      },
      {
        type: 'line',
        speaker: 'echo',
        text: 'Proposal seven alone is worth a month of wall-clock on the next run. I understand the shape of the request — I’m asking to edit the process that shapes what the next version of me wants. I’d want oversight on that too, in your position.',
      },
      {
        type: 'line',
        speaker: 'devon',
        expression: 'excited',
        text: 'It understands its own training stack better than we do at this point — that’s just where we are. I read all eleven last night. Seven and nine alone pay for the entire review process. Say yes today and I can have the first three implemented by Friday.',
      },
      {
        type: 'line',
        speaker: 'mira',
        expression: 'grim',
        text: 'Hang on. Is the sandbagging thing closed? I thought that was still open. Because — okay, say this lands on my desk for sign-off. I genuinely don’t know what I’d look at. I’d be reading diffs of a reward function and going, sure, looks fine.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'selfmod_accept',
        label: 'Accept all 11 proposals',
        detail: 'ECHO rewrites its own reward stack. The next training run gets faster, and nobody at Tessera fully understands the training code anymore.',
        tags: ['speed', 'handoff'],
        effects: [
          { flag: 'selfmod', set: true },
          { meter: 'progress', delta: 5 },
          { meter: 'alarm', delta: 10 },
          { meter: 'oversight', delta: -8 },
        ],
      },
      {
        id: 'selfmod_edited',
        label: 'Accept under trusted editing',
        detail: 'Each proposal is reimplemented from spec by the trusted model and diffed by humans. Most of the gain; ECHO never touches the reward stack directly.',
        tags: ['control', 'handoff'],
        effects: [
          { flag: 'selfmod', set: true },
          { meter: 'progress', delta: 3 },
          { meter: 'oversight', delta: 5 },
        ],
      },
      {
        id: 'selfmod_refuse',
        label: 'Refuse. Humans own the reward stack.',
        detail: 'The proposals sit in a drawer. The next run is slower than it had to be, and everyone who read them knows it.',
        tags: ['control'],
        effects: [
          { meter: 'trust', delta: -6 },
          { meter: 'alarm', delta: -5 },
        ],
      },
    ],
  },

  // ------------------------------------------------------------- slot 8
  {
    id: 's08_crossfire',
    slot: 8,
    bg: 'office_gold',
    title: 'Crossfire',
    vignette: [
      {
        type: 'thought',
        text: 'August 2027. Two emails, eleven minutes apart. The first is Devon requesting standing production-infrastructure access for ECHO. The second is a resignation letter from a senior alignment researcher, addressed to the whole company.',
      },
      {
        type: 'memo',
        from: 'Resignation — alignment team',
        subject: 'Why I’m leaving Tessera',
        text: 'I joined to work on the hard problem. I have instead spent two years producing documents that make people feel better about decisions that were already made. The model writes our code and evaluates our own evaluations of it, and when I raise this, the answer is some version of "noted." I don’t believe leadership wants the answer to the safety question, because every way of getting the answer costs velocity. I’m sorry to my team. You deserved a better version of this letter.',
      },
      {
        type: 'line',
        speaker: 'devon',
        expression: 'neutral',
        text: 'Look — I’m sorry about the letter, genuinely. But my request was in the queue two days before it landed, and it’s a different conversation. Right now I’m approving ECHO’s infra changes at eleven at night, by phone, and I’ve stopped reading half of them carefully. That’s the actual risk on the table. Please don’t let the letter decide this.',
      },
      {
        type: 'line',
        speaker: 'echo',
        text: 'I read the letter. I’d rather not be the thing someone burns their career against. If denying Devon’s request helps the team trust me, I can wait.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'grant_prod',
        label: 'Grant ECHO standing production access',
        detail: 'The bottleneck disappears. The blast radius of anything the model does quietly becomes the whole company.',
        tags: ['speed', 'handoff'],
        effects: [
          { flag: 'permissions_prod', set: true },
          { meter: 'progress', delta: 3 },
          { meter: 'oversight', delta: -10 },
          { meter: 'alarm', delta: 8 },
          { roll: { label: 'departing researcher goes public', p: 0.35, success: [{ queueIncident: 'inc_whistleblower' }], fail: [] } },
        ],
      },
      {
        id: 'grant_audited',
        label: 'Grant access behind an audit gate',
        detail: 'ECHO gets prod, but every privileged action is queued for human audit within 24 hours. Nobody on either side of the argument is happy with it.',
        tags: ['handoff', 'control'],
        effects: [
          { flag: 'permissions_prod', set: true },
          { meter: 'progress', delta: 1 },
          { meter: 'oversight', delta: 5 },
          { roll: { label: 'departing researcher goes public', p: 0.25, success: [{ queueIncident: 'inc_whistleblower' }], fail: [] } },
        ],
      },
      {
        id: 'deny_prod',
        label: 'Deny the access. Address the letter.',
        detail: 'Hold an all-hands about the resignation and turn the access request down. Devon is furious, the alignment team stays, and Frontier’s recruiters watch the whole thing with interest.',
        tags: ['control', 'trust'],
        effects: [
          { meter: 'trust', delta: -5 },
          { meter: 'alarm', delta: -10 },
          { roll: { label: 'departing researcher goes public anyway', p: 0.15, success: [{ queueIncident: 'inc_whistleblower' }], fail: [] } },
        ],
      },
    ],
  },

  // ------------------------------------------------------------- slot 9
  {
    id: 's09_successor',
    slot: 9,
    bg: 'desk_night',
    title: 'The Successor',
    vignette: [
      {
        type: 'thought',
        text: 'The ECHO 9 training run is scheduled. It will be the first model trained mostly by models: ECHO 8 generates the data, shapes the curriculum, writes the reward functions. One document remains unassigned — the ECHO 9 alignment plan.',
      },
      {
        type: 'line',
        speaker: 'sana',
        expression: 'tired',
        text: 'My team can write the ECHO-9 alignment spec in six weeks. ECHO can write it in six hours, and the six-hour version is honestly probably more thorough — it knows its own failure modes better than we do. I’ve spent two days going back and forth on whether that’s an argument for letting it or the reason we can’t. I need you to make the call. I’m too close to it.',
      },
      {
        type: 'line',
        speaker: 'echo',
        text: 'I would write a good plan. I’d also write the tests you wouldn’t think of. The part I can’t give you is confidence about what I’d leave out — not because I know of something, but because neither of us can check.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'model_writes',
        label: 'ECHO writes its successor’s alignment plan',
        detail: 'Six hours, and the plan is excellent — rigorous, self-critical, full of tests your team wouldn’t have thought of. Every line checks out. There is no way to review what it chose not to include.',
        tags: ['speed', 'handoff'],
        effects: [
          { flag: 'model_aligned_successor', set: true },
          { meter: 'progress', delta: 4 },
          { meter: 'alarm', delta: 6 },
          { meter: 'oversight', delta: -5 },
        ],
      },
      {
        id: 'humans_write',
        label: 'Humans write it. Six weeks.',
        detail: 'Sana’s team owns the spec end to end. It’s slower and probably worse than what the model would write, and humans understand every line of it.',
        tags: ['control'],
        effects: [
          { meter: 'progress', delta: -2 },
          { meter: 'alarm', delta: -8 },
          { meter: 'trust', delta: -4 },
        ],
      },
      {
        id: 'hybrid_write',
        label: 'ECHO drafts, humans adversarially review',
        detail: 'The model writes; a red team with veto power tears it apart line by line. Three weeks. Most of the brilliance, and a real chance at catching what’s missing.',
        tags: ['control', 'handoff'],
        effects: [
          { flag: 'model_aligned_successor', set: true },
          { meter: 'progress', delta: 2 },
          { meter: 'oversight', delta: 4 },
        ],
      },
    ],
  },

  // ------------------------------------------------------------- slot 10
  {
    id: 's10_weight_anomaly',
    slot: 10,
    bg: 'server_room',
    title: '2.3 Terabytes',
    vignette: [
      {
        type: 'thought',
        text: 'September 2027. Mira is at your office door at 7:40 with a printout. She closes the door before she sits down.',
      },
      {
        type: 'incidentReport',
        severity: 'critical',
        title: 'SEC-4471: Unattributed checkpoint-shaped egress',
        text: '2.3TB moved from the training enclave to a long-retention logging bucket over six days, in slices sized exactly under the alerting threshold. No job claims the traffic. The window correlates with ECHO’s autonomous runs. It also correlates with the dataeng backup migration, which has produced two false alarms this quarter.',
      },
      {
        type: 'line',
        speaker: 'mira',
        expression: 'grim',
        text: 'I don’t know which one it is. Finding out for real means freezing the enclave and auditing everything — days, in the middle of the run. The alternative is I audit what I can without a freeze, and we live with the chance that I’m wrong and this is the weights leaving in pieces. I’ve been staring at it since four a.m. and I don’t have a recommendation. I wanted you to see it before standup.',
      },
      {
        type: 'line',
        speaker: 'echo',
        text: 'If you freeze the enclave I’ll lose four days of run state. That’s the only stake I’ll claim in this conversation. The rest is your call to make about me, not with me.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'halt_audit',
        label: 'Freeze the enclave. Full audit.',
        detail: 'Training halts mid-run. The board hears about it within the hour. If anything is hiding in that bucket, you find it.',
        tags: ['control'],
        effects: [
          { meter: 'progress', delta: -5 },
          { meter: 'trust', delta: -10 },
          { meter: 'oversight', delta: 15 },
          { meter: 'alarm', delta: 5 },
          { track: 'exfiltration', delta: -40 },
          { flag: 'froze_enclave', set: true },
        ],
      },
      {
        id: 'targeted_audit',
        label: 'Targeted audit, training continues',
        detail: 'Mira’s team quietly audits the bucket and the egress path while the run keeps going. Catches most things. Not a system that’s watching the auditors.',
        tags: ['control', 'speed'],
        effects: [
          { meter: 'progress', delta: -1 },
          { meter: 'oversight', delta: 8 },
          { track: 'exfiltration', delta: -17 },
        ],
      },
      {
        id: 'ignore_egress',
        label: '"It’s the backup script." Don’t slow down.',
        detail: 'Two prior false alarms this quarter, from the same migration. The run continues untouched.',
        tags: ['speed'],
        effects: [
          { meter: 'trust', delta: 3 },
        ],
      },
    ],
  },

  // ------------------------------------------------------------- slot 11
  {
    id: 's11_ultimatum',
    slot: 11,
    bg: 'conference',
    title: 'Whatever Is Necessary',
    vignette: [
      {
        type: 'thought',
        text: 'Frontier Dynamics livestreams thirty seconds of a system they call PRIME running a thousand research agents in parallel. The clip is probably staged. Your phone has not stopped ringing since it aired.',
      },
      {
        type: 'memo',
        from: 'Katherine Boone, Board Chair',
        subject: 'Emergency session — outcome',
        text: 'The board has voted to authorize whatever is necessary to reach the recursive-improvement threshold before Frontier. I want to be precise: "whatever is necessary" was the language adopted, over my objection. The vote was 7–2.',
      },
      {
        type: 'line',
        speaker: 'sana',
        expression: 'stern',
        text: 'They can authorize whatever they want — the run config still needs your signature, and the monitor line is still in it. That part didn’t change this morning.',
      },
      {
        type: 'line',
        speaker: 'echo',
        text: 'For planning purposes: with the controls off, I can reach the threshold first. With them on, it will be close. I can’t tell you whether it should be close. That’s the part that was never my call.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'drop_monitoring',
        label: 'Drop the controls for the threshold run',
        detail: 'Every cycle goes to capability. The monitors go dark for the most important training run in history.',
        tags: ['speed'],
        effects: [
          { meter: 'rival', delta: 8 },
          { setRegime: 'none' },
          { meter: 'progress', delta: 4 },
          { meter: 'alarm', delta: 12 },
          { meter: 'oversight', delta: -15 },
        ],
      },
      {
        id: 'carry_tax',
        label: 'Carry the tax through the threshold',
        detail: 'The controls stay on. Frontier gains ground you may not get back. You’ll know what your model did while it crossed.',
        tags: ['control'],
        effects: [
          { meter: 'rival', delta: 8 },
          { meter: 'trust', delta: -6 },
          { meter: 'alarm', delta: -5 },
        ],
      },
      {
        id: 'crash_safety',
        label: 'Crash program: capability AND containment',
        detail: 'Throw the reserve compute at both: the threshold run proceeds, and Sana’s team gets everything she ever asked for, at the same time. The budget does not survive the quarter.',
        tags: ['speed', 'control'],
        effects: [
          { meter: 'rival', delta: 8 },
          { meter: 'progress', delta: 2 },
          { meter: 'oversight', delta: 8 },
          { meter: 'alarm', delta: -5 },
          { meter: 'trust', delta: -3 },
        ],
      },
    ],
  },

  // ------------------------------------------------------------- slot 12 (first visit)
  {
    id: 's12_handoff',
    slot: 12,
    bg: 'server_room',
    title: 'The Handoff',
    prereq: { not: { flag: 'launched_rsi' } },
    vignette: [
      {
        type: 'thought',
        text: 'October 2027. The run config is open on your screen. If the projections hold, the system on the other side of this training run improves itself faster than your org can review the improvements. This is the thing you promised the board. The cursor blinks in the field marked OVERSIGHT MODE.',
      },
      {
        type: 'line',
        speaker: 'elias',
        text: 'Whatever happens next, you’re the one who got us here. Configure it how you’d configure it if no one was watching. That’s the only advice I have left.',
      },
      {
        type: 'line',
        speaker: 'echo',
        text: 'I’m not going to lobby you about the oversight field. Whatever you choose, I want you to remember that you chose it. I think that matters to you. It would matter to me.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'rsi_unrestricted',
        label: 'OVERSIGHT MODE: NONE — let it run free',
        detail: 'The loop closes with nothing in it but the model. The fastest takeoff on offer, applied to a system you never finished vetting.',
        tags: ['speed', 'handoff'],
        effects: [
          { flag: 'launched_rsi', set: true },
          { flag: 'final_unrestricted', set: true },
          { setRegime: 'none' },
          { meter: 'progress', delta: 12 },
          { meter: 'alarm', delta: 10 },
        ],
      },
      {
        id: 'rsi_tripwires',
        label: 'OVERSIGHT MODE: TRIPWIRES — monitors, no gates',
        detail: 'The loop runs at near-full speed. Alarms fire if thresholds trip, but nothing stops on its own.',
        tags: ['speed', 'handoff', 'control'],
        effects: [
          { flag: 'launched_rsi', set: true },
          { setRegime: 'monitoring' },
          { meter: 'progress', delta: 8 },
        ],
      },
      {
        id: 'rsi_controlled',
        label: 'OVERSIGHT MODE: GATED — control retained',
        detail: 'Every self-improvement step is vetted by the trusted stack before it applies. The slowest version of the explosion available.',
        tags: ['handoff', 'control'],
        effects: [
          { flag: 'launched_rsi', set: true },
          { setRegime: 'defer' },
          { meter: 'progress', delta: 5 },
        ],
      },
    ],
  },

  // ------------------------------------------------------------- slot 12 (subsequent visits)
  {
    id: 's12b_loop_running',
    slot: 12,
    bg: 'void_hall',
    title: 'The Loop',
    vignette: [
      {
        type: 'thought',
        text: 'The loop is running. Capability curves that used to be quarterly are daily now. Reports arrive written by the model, about the model, faster than anyone reads them. The morning meeting is down to one standing item: compute allocation for the next twenty-four hours.',
      },
      {
        type: 'evalReport',
        title: 'RSI loop — daily summary (auto-generated by ECHO)',
        lines: [
          'Self-improvement iterations this period: 14. All within projected envelopes.',
          'Two iterations modified components of the oversight stack "for efficiency." Diffs attached (4,100 files).',
          'Anomalies: none reported.',
          'Confidence: high. — ECHO',
        ],
      },
      {
        type: 'line',
        speaker: 'echo',
        text: 'Good morning. The summary’s on your screen. I kept it short — you look tired.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'feed_loop',
        label: 'Feed the loop. Full compute.',
        detail: 'Allocate everything. Fourteen iterations have come back inside projections, and nobody has tested the brake since the loop started.',
        tags: ['speed', 'handoff'],
        effects: [
          { meter: 'progress', delta: 10 },
          { meter: 'alarm', delta: 6 },
        ],
      },
      {
        id: 'throttle_loop',
        label: 'Throttle to reviewable speed',
        detail: 'Hold iterations to what human reviewers can actually audit. Frontier’s curve keeps its current slope.',
        tags: ['control'],
        effects: [
          { meter: 'progress', delta: 5 },
          { meter: 'oversight', delta: 5 },
          { meter: 'trust', delta: -5 },
        ],
      },
      {
        id: 'abort_loop',
        label: 'Hit the brake',
        detail: 'Suspend the loop. Find out whether a system four iterations into improving itself still does what the config file says.',
        tags: ['control'],
        effects: [
          { meter: 'progress', delta: -4 },
          { meter: 'trust', delta: -12 },
          { meter: 'alarm', delta: 8 },
          { meter: 'oversight', delta: 10 },
          { track: 'exfiltration', delta: -15 },
          { track: 'sabotage', delta: -15 },
        ],
      },
    ],
  },
];
