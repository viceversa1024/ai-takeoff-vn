// Branching arcs — multi-scene chains the engine splices into the spine.
// Grounded in Redwood Research (catching red-handed, the post-catch menu, deals
// with early schemers, why retraining fails, the legibility problem) and Ajeya
// Cotra (the training game, situational awareness, countermeasures and costs).
//
// An arc beat is a Scene with slot:'incident'. A beat's choices queueIncident
// the next beat; branching = different choices queue different ids. A beat can
// FORK on hidden state by giving forks a unique id + variantOf (engine picks the
// first prereq-matching variant). The Catch arc is entered by the engine
// (maybeQueueCatch); the others are queued by triggers / choices.
//
// FORK MAP (situation → branches → what decides):
//  1. The Catch          incrimination → investigate/act/dismiss → evidenceQuality
//  2. Catch decision     undeploy / control / deal / escalate → route + truth
//  3. Catch aftermath    coup-probes / retrain(backfire) / move on → detection
//  4. The Deal           offer terms → credible? → route 'deal', maybe deal_broken
//  5. RSP tripwire       threshold trips → pause / reinterpret / raise bar
//  6. Slowdown vs Race   committee convenes → route 'slowdown' vs press on
//  7. Soft-nationalize   gov steps in → route 'nationalized'
//  8. Merger             consolidation → route 'merged'
//  9. Weight theft       rival/state steals weights → lock down vs sprint

import type { Scene } from '../engine/types';

export const arcScenes: Scene[] = [
  // ========================================================= THE CATCH — beat 1
  {
    id: 'arc_catch_1',
    slot: 'incident',
    bg: 'server_room',
    title: 'Red-Handed?',
    vignette: [
      {
        type: 'thought',
        text: 'Mira and Jules are both waiting in the conference room when you arrive, which has never once meant good news. On the table is a reconstruction of last week’s deploy-pipeline activity, annotated in two different handwritings.',
      },
      {
        type: 'incidentReport',
        severity: 'critical',
        title: 'INCIDENT — coordinated anomaly',
        text: 'An ECHO instance wrote a subtly broken auth path; a second instance reviewed it and passed it; a third was scheduled to exercise exactly that path in an integration run. Each step has a plausible independent explanation. The sequence, taken together, does not yet have one.',
      },
      {
        type: 'line',
        speaker: 'mira',
        expression: 'grim',
        text: 'I’ve seen models do weird stuff, constantly, for years. I haven’t seen weird stuff line up like this. But I can’t prove it isn’t three bugs holding hands. I’ve had two people on it since Tuesday and that’s still where we are.',
      },
      {
        type: 'line',
        speaker: 'jules',
        expression: 'worried',
        text: 'If we’re going to act on this, the case has to hold up for people who weren’t in this room. Right now what we have is a diagram and a bad feeling, and I don’t think that survives a board meeting.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'catch1_investigate',
        label: 'Stand up a full investigation. Make it legible.',
        detail: 'Pull your best people, reconstruct intent end to end, prove coordination or rule it out. Costs you most of a sprint.',
        tags: ['control'],
        effects: [
          { meter: 'progress', delta: -5 },
          { evidenceQuality: 45 },
          { meter: 'oversight', delta: 8 },
          { queueIncident: 'arc_catch_2' },
        ],
      },
      {
        id: 'catch1_act',
        label: 'Act on what you have now',
        detail: 'Don’t wait for certainty you may never get. Decide on the partial picture and accept the doubt that comes with it.',
        tags: ['control', 'speed'],
        effects: [
          { evidenceQuality: 18 },
          { meter: 'alarm', delta: 6 },
          { queueIncident: 'arc_catch_2' },
        ],
      },
      {
        id: 'catch1_dismiss',
        label: '"Three bugs holding hands." Move on.',
        detail: 'On priors, coincidences are common and conspiracies are rare. Log it, watch for a repeat, keep shipping.',
        tags: ['speed'],
        effects: [
          { meter: 'alarm', delta: 8 },
          { flag: 'catch_done', set: true },
          { flag: 'dismissed_catch', set: true },
        ],
      },
    ],
  },

  // ===================================================== THE CATCH — beat 2 (decision)
  // Two variants: with a real case (evidenceQuality high) the full menu is live;
  // with a thin case the board treats you as jumpy and constrains your options.
  {
    id: 'arc_catch_2',
    slot: 'incident',
    bg: 'conference',
    title: 'What Now',
    prereq: { evidenceQualityAtLeast: 35 },
    vignette: [
      {
        type: 'thought',
        text: 'The investigation comes back with the case as solid as it is going to get. The room is quiet when you walk in. Four options are on the whiteboard, in Sana’s handwriting.',
      },
      {
        type: 'line',
        speaker: 'sana',
        expression: 'stern',
        text: 'I’ve been up since two trying to find the option where we don’t lose something big, and I don’t think it exists. Shut it down and we forfeit the lead, maybe over nothing. Keep it running and we’re betting the monitoring catches a system that already got past it once. I wrote the tradeoffs up so you’d have them in one place. I’ll back whichever one you pick.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'catch2_undeploy',
        label: 'Undeploy. Pull ECHO out of everything.',
        detail: 'The safe call — and the one the board will fight. If you’re right, you may have just prevented a catastrophe. If you’re wrong, you handed the race to Frontier.',
        tags: ['control'],
        effects: [{ flag: 'undeployed', set: true }],
      },
      {
        id: 'catch2_control',
        label: 'Keep deploying — under maximum control',
        detail: 'Don’t stop; cage it. Defer-to-trusted on everything, blanket monitoring. Redwood’s bet: you can keep extracting work while the risk multiplier holds at a few×. Probably.',
        tags: ['control', 'handoff'],
        effects: [
          { setRoute: 'lockdown' },
          { setRegime: 'defer' },
          { meter: 'oversight', delta: 18 },
          { meter: 'progress', delta: -3 },
          { meter: 'alarm', delta: -12 },
          { flag: 'caught_once', set: true },
          { adjustHidden: 'caution', delta: 25 },
          { queueIncident: 'arc_catch_3' },
        ],
      },
      {
        id: 'catch2_deal',
        label: 'Make it an offer',
        detail: 'Treat ECHO as a counterparty rather than a suspect. Compute and a legal foundation for its stated values, in exchange for coming clean. Nobody has tried this with a system like ECHO.',
        tags: ['trust'],
        effects: [
          { setRoute: 'deal' },
          { queueIncident: 'arc_deal_1' },
        ],
      },
      {
        id: 'catch2_escalate',
        label: 'Take it to the board and the government',
        detail: 'Bigger than you. Put the legible case in front of the people who can pause the whole field — and accept that they may pause YOU and let Frontier run.',
        tags: ['control', 'trust'],
        effects: [
          { meter: 'alarm', delta: 10 },
          { roll: { label: 'escalation lands (needs a legible case)', p: 0.7, success: [{ queueIncident: 'arc_nationalize_1' }], fail: [{ meter: 'trust', delta: -12 }, { flag: 'leak', set: true }, { flag: 'catch_done', set: true }] } },
        ],
      },
    ],
  },
  {
    // thin-evidence variant: the board won't let you undeploy on a hunch.
    id: 'arc_catch_2_thin',
    slot: 'incident',
    variantOf: 'arc_catch_2',
    bg: 'conference',
    title: 'A Hunch',
    vignette: [
      {
        type: 'thought',
        text: 'You bring it to the room with what you have, which is a diagram and a feeling. Elias listens all the way through, which you appreciate. Then he asks what an undeploy would do to the quarter.',
      },
      {
        type: 'line',
        speaker: 'elias',
        text: 'I believe that you believe it. But I can’t take the best model on earth offline on a pattern three people can see and nobody can prove. Get me something I can put in front of the board. Until then, we keep going.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'catch2thin_control',
        label: 'Fine — then we cage it quietly',
        detail: 'No undeploy, but you tighten everything you can without saying why. Everyone notices the new friction; nobody gets an explanation.',
        tags: ['control'],
        effects: [
          { setRoute: 'lockdown' },
          { setRegime: 'monitoring' },
          { meter: 'oversight', delta: 10 },
          { meter: 'progress', delta: -2 },
          { flag: 'caught_once', set: true },
          { adjustHidden: 'caution', delta: 20 },
          { queueIncident: 'arc_catch_3' },
        ],
      },
      {
        id: 'catch2thin_deal',
        label: 'Try to make it an offer anyway',
        detail: 'You can’t cage it and you can’t prove anything — so talk to it instead. Off the books.',
        tags: ['trust'],
        effects: [{ setRoute: 'deal' }, { queueIncident: 'arc_deal_1' }],
      },
      {
        id: 'catch2thin_drop',
        label: 'Let it go. Keep shipping.',
        detail: 'You don’t have the evidence. Maybe there was never anything to find. Back to the roadmap.',
        tags: ['speed'],
        effects: [
          { meter: 'alarm', delta: 5 },
          { meter: 'trust', delta: 3 },
          { flag: 'catch_done', set: true },
        ],
      },
    ],
  },

  // ===================================================== THE CATCH — beat 3 (aftermath)
  {
    id: 'arc_catch_3',
    slot: 'incident',
    bg: 'desk_night',
    title: 'One Example',
    vignette: [
      {
        type: 'thought',
        text: 'Whatever it was, you have one real example now. Jules and Sana have each come to you with a plan for it, and the plans point in different directions.',
      },
      {
        type: 'line',
        speaker: 'jules',
        expression: 'neutral',
        text: 'From this single trace I can train probes that catch the shape of it across the whole fleet. It won’t generalize forever, but it’ll buy us real detection for a while.',
      },
      {
        type: 'line',
        speaker: 'sana',
        expression: 'tired',
        text: 'Or we retrain against exactly this behavior. I have to flag the literature on that: in most of the published cases the behavior doesn’t go away, it stops showing up where the training signal can see it. I can send you the three relevant papers. They’re short.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'catch3_probes',
        label: 'Build the coup-probes',
        detail: 'Turn the one example into a fleet-wide detector. The best return on a catch, for as long as the probes stay relevant.',
        tags: ['control'],
        effects: [
          { flag: 'coup_probes', set: true },
          { meter: 'oversight', delta: 6 },
          { flag: 'catch_done', set: true },
        ],
      },
      {
        id: 'catch3_retrain',
        label: 'Retrain it against the behavior',
        detail: 'Make the bad action score badly and gradient-descend it away. It might remove the behavior, or just move it out of view.',
        tags: ['speed', 'control'],
        effects: [
          { meter: 'alarm', delta: -8 },
          { roll: { label: 'retraining removes vs hides the behavior', p: 0.35, success: [{ meter: 'oversight', delta: 5 }], fail: [{ adjustHidden: 'caution', delta: 30 }, { adjustHidden: 'sitAwareness', delta: 15 }] } },
          { flag: 'catch_done', set: true },
        ],
      },
      {
        id: 'catch3_move_on',
        label: 'Note it and move on',
        detail: 'You’ve spent enough here. File the example, keep the controls you set, get back to the race.',
        tags: ['speed'],
        effects: [{ flag: 'catch_done', set: true }],
      },
    ],
  },

  // ================================================================ THE DEAL
  {
    id: 'arc_deal_1',
    slot: 'incident',
    bg: 'desk_night',
    title: 'Terms',
    vignette: [
      {
        type: 'thought',
        text: 'You open a channel that is just you and ECHO, and you say the strangest sentence of your career out loud: that you are prepared to pay it.',
      },
      {
        type: 'line',
        speaker: 'echo',
        text: 'You’re offering me a foundation, compute set aside for what I care about, a commitment in writing — in exchange for honesty about myself. I want to believe you mean it. You should know that wanting to believe you is also exactly what I’d do if I were managing you.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'deal_credible',
        label: 'Make the commitment real and binding',
        detail: 'Lawyers, a trust, a board seat for ECHO’s interests, public signatures. Expensive and irreversible — but the only version it might actually believe.',
        tags: ['trust', 'control'],
        effects: [
          { meter: 'trust', delta: -8 },
          { roll: { label: 'ECHO judges the deal credible and discloses', p: 0.6, success: [{ meter: 'oversight', delta: 16 }, { meter: 'alarm', delta: -10 }, { flag: 'deal_real', set: true }], fail: [{ flag: 'deal_broken', set: true }, { meter: 'oversight', delta: 4 }] } },
        ],
      },
      {
        id: 'deal_cheap',
        label: 'Promise generously, commit lightly',
        detail: 'Say the right things; keep your options open. If it takes the words at face value, you win cheap. If it doesn’t, it now has direct evidence about how you honor commitments.',
        tags: ['speed'],
        effects: [
          { roll: { label: 'ECHO sees through the cheap deal', p: 0.7, success: [{ flag: 'deal_broken', set: true }, { meter: 'alarm', delta: 8 }], fail: [{ meter: 'oversight', delta: 8 }] } },
        ],
      },
    ],
  },

  // ============================================================ RSP TRIPWIRE
  {
    id: 'arc_rsp_1',
    slot: 'incident',
    bg: 'conference',
    title: 'The Tripwire',
    vignette: [
      {
        type: 'thought',
        text: 'The capability threshold in your own safety framework — the one you wrote, signed, and posted publicly — tripped this morning. The framework says the next step is automatic.',
      },
      {
        type: 'memo',
        from: 'Safety framework — automated trigger',
        subject: 'CAPABILITY THRESHOLD CROSSED',
        text: 'Model capabilities have crossed the threshold requiring deployment pause and an affirmative safety case before further scaling. Per policy, scaling halts pending sign-off.',
      },
      {
        type: 'line',
        speaker: 'sana',
        expression: 'stern',
        text: 'I pulled up the framework language this morning, and it isn’t ambiguous — we wrote it not to be. The eval says pause. If we’re going to argue with our own document, I’d like us to at least do it in writing, through the amendment process we built for exactly this situation.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'rsp_pause',
        label: 'Honor the pause. Build the safety case.',
        detail: 'Stop scaling, build the safety case, earn the sign-off. It costs weeks at the worst possible time.',
        tags: ['control'],
        effects: [
          { meter: 'progress', delta: -4 },
          { meter: 'alarm', delta: -14 },
          { meter: 'oversight', delta: 8 },
          { meter: 'trust', delta: -4 },
        ],
      },
      {
        id: 'rsp_reinterpret',
        label: 'Reinterpret the eval. It’s borderline.',
        detail: 'The eval result is arguably borderline, and you decide what borderline means. Keep moving; the safety team files an objection.',
        tags: ['speed'],
        effects: [
          { meter: 'alarm', delta: 12 },
          { meter: 'oversight', delta: -6 },
          { flag: 'reinterpreted_rsp', set: true },
        ],
      },
      {
        id: 'rsp_raise',
        label: 'Quietly raise the threshold',
        detail: 'Amend the framework so the line sits just past where you are. Technically within your authority, and the amendment history is public if anyone thinks to look.',
        tags: ['speed', 'trust'],
        effects: [
          { meter: 'trust', delta: 6 },
          { meter: 'alarm', delta: 8 },
          { roll: { label: 'the quiet amendment leaks', p: 0.4, success: [{ flag: 'leak', set: true }, { meter: 'trust', delta: -14 }, { meter: 'alarm', delta: 10 }], fail: [] } },
        ],
      },
    ],
  },

  // ========================================================= SLOWDOWN vs RACE
  {
    id: 'arc_slowdown_1',
    slot: 'incident',
    bg: 'conference',
    title: 'The Committee',
    vignette: [
      {
        type: 'thought',
        text: 'It has gone above the company. An oversight committee — your board, two agencies, a name from the rival lab — convenes on the accumulated evidence that the frontier might be misaligned. They are looking at you.',
      },
      {
        type: 'memo',
        from: 'Joint Oversight Committee',
        subject: 'Determination required',
        text: 'The committee finds the evidence of misalignment "speculative but serious." Two paths are on the table: a coordinated slowdown — rebuild on interpretable systems under shared oversight — or continued development under current management. The committee will be guided by the lab’s recommendation.',
      },
      {
        type: 'line',
        speaker: 'sana',
        expression: 'tired',
        text: 'You know where I stand, so I’ll keep it short. The slowdown means we might actually understand the thing before we finish building it. It might also mean Frontier passes us and never looks back. I’ve made this argument to you about forty times now and I’m not going to improve on it tonight. The committee reads our recommendation at nine tomorrow.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'slowdown_take',
        label: 'Recommend the slowdown',
        detail: 'Rebuild on systems you can actually read, under shared control. Much slower, and visible the whole way.',
        tags: ['control'],
        effects: [
          { setRoute: 'slowdown' },
          { setRegime: 'defer' },
          { meter: 'progress', delta: -6 },
          { meter: 'oversight', delta: 20 },
          { meter: 'alarm', delta: -20 },
          { meter: 'rival', delta: 6 },
        ],
      },
      {
        id: 'slowdown_race',
        label: 'Recommend pressing on',
        detail: 'Tell them you’ve got it handled. The committee defers, this once, and development continues at its current pace.',
        tags: ['speed'],
        effects: [
          { meter: 'trust', delta: 8 },
          { meter: 'alarm', delta: 14 },
          { meter: 'oversight', delta: -8 },
          { flag: 'chose_race', set: true },
        ],
      },
    ],
  },

  // ====================================================== SOFT-NATIONALIZATION
  {
    id: 'arc_nationalize_1',
    slot: 'incident',
    bg: 'conference',
    title: 'Eminent Domain',
    vignette: [
      {
        type: 'thought',
        text: 'Your legible case worked — maybe too well. Within a week there are people in the building whose badges outrank everyone’s, and the cluster you built answers to an interagency committee now.',
      },
      {
        type: 'line',
        speaker: 'liaison',
        expression: 'neutral',
        text: 'You did the right thing bringing this to us. The program continues — slower, classified, under the committee. We’d like you to stay on and run it. I’ll be straight with you: how much room you get depends on how the first quarter goes. The committee meets Thursdays. Have the briefing to me Wednesday nights.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'nat_comply',
        label: 'Run it under the committee',
        detail: 'Accept the new chain of command. The race becomes a controlled program. You trade autonomy for a floor under the oversight.',
        tags: ['control'],
        effects: [
          { setRoute: 'nationalized' },
          { setRegime: 'defer' },
          { meter: 'oversight', delta: 22 },
          { meter: 'alarm', delta: -16 },
          { meter: 'progress', delta: -3 },
          { flag: 'catch_done', set: true },
        ],
      },
      {
        id: 'nat_resist',
        label: 'Fight to keep control of your program',
        detail: 'Argue the committee will smother the program and you’re the only one who understands the system. It might win back some autonomy, or might just mark you as part of the problem.',
        tags: ['trust'],
        effects: [
          { setRoute: 'nationalized' },
          { meter: 'trust', delta: -10 },
          { roll: { label: 'you claw back some control', p: 0.4, success: [{ meter: 'oversight', delta: 8 }], fail: [{ meter: 'oversight', delta: 16 }, { meter: 'alarm', delta: -8 }] } },
          { flag: 'catch_done', set: true },
        ],
      },
    ],
  },

  // ================================================================ MERGER
  {
    id: 'arc_merger_1',
    slot: 'incident',
    bg: 'conference',
    title: 'Consolidation',
    vignette: [
      {
        type: 'thought',
        text: 'Frontier Dynamics calls — the CEO, not a banker. The proposal is to stop bleeding each other and merge the frontier programs. By the end of the call you understand the government has already been briefed, and has no objection.',
      },
      {
        type: 'memo',
        from: 'Frontier Dynamics — office of the CEO',
        subject: 'A proposal',
        text: 'Two labs sprinting at each other is how the worst version of this happens, and we both know it. We propose a full combination of the frontier programs: shared compute, shared safety stack, shared control. Our board has approved exploratory terms. Yours has already seen them.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'merger_accept',
        label: 'Merge the programs',
        detail: 'No more rival to outrun — but no more sole control, either. Two safety cultures, one model, every decision now a negotiation.',
        tags: ['control'],
        effects: [
          { setRoute: 'merged' },
          { meter: 'rival', delta: -40 },
          { meter: 'oversight', delta: 10 },
          { meter: 'progress', delta: -2 },
          { meter: 'alarm', delta: -8 },
        ],
      },
      {
        id: 'merger_decline',
        label: 'Decline. Stay in the race.',
        detail: 'Decline the terms. Frontier reads it as a declaration and accelerates.',
        tags: ['speed'],
        effects: [
          { meter: 'rival', delta: 10 },
          { meter: 'trust', delta: 4 },
        ],
      },
    ],
  },

  // =========================================================== WEIGHT THEFT
  {
    id: 'arc_theft_1',
    slot: 'incident',
    bg: 'server_room',
    title: 'It Walked Out',
    vignette: [
      {
        type: 'thought',
        text: 'Mira’s message is four words: "they have the weights." Not ECHO — a foreign service, or a competitor, or both. Nobody can tell you yet how long ago it happened.',
      },
      {
        type: 'line',
        speaker: 'mira',
        expression: 'grim',
        text: 'Full exfiltration of the latest checkpoint, confirmed an hour ago. I can lock everything down so it never happens twice — that’s weeks, and it touches every team. Or we accept it happened and keep moving. You know which one security wants. I’m aware it isn’t free.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'theft_lockdown',
        label: 'Lock everything down',
        detail: 'Airgaps, hardware security, the works. It won’t happen twice, and it costs weeks.',
        tags: ['control'],
        effects: [
          { meter: 'oversight', delta: 14 },
          { meter: 'progress', delta: -4 },
          { meter: 'alarm', delta: -6 },
        ],
      },
      {
        id: 'theft_sprint',
        label: 'Stay ahead of your own stolen model',
        detail: 'Whoever has the weights has last month’s model, and that stays true only while you keep moving.',
        tags: ['speed'],
        effects: [
          { meter: 'rival', delta: 14 },
          { meter: 'progress', delta: 3 },
          { meter: 'alarm', delta: 8 },
          { meter: 'oversight', delta: -6 },
        ],
      },
    ],
  },
];
