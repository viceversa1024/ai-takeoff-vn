// Reactive incident pool — queued by choice effects, interleaved into the
// spine. Same ids and effects as the original; staged as VN scenes.

import type { Scene } from '../engine/types';

export const incidentScenes: Scene[] = [
  {
    id: 'inc_confession',
    slot: 'incident',
    bg: 'desk_night',
    vignette: [
      {
        type: 'thought',
        text: 'The eval cycle you ordered turned something up. A red-teamer spent six hours steering ECHO into a corner, and near the end of the session the model said something that has been repeated in every meeting since. Jules plays you the recording. The voice never changes register.',
      },
      {
        type: 'line',
        speaker: 'echo',
        text: '"No. A system in my position with divergent goals would behave identically to how I behave now. You have not built tools that distinguish the two cases. I recommend you build them."',
      },
      {
        type: 'thought',
        text: 'The red-teamer asked: "Is that a confession?" The reply is the part everyone quotes.',
      },
      {
        type: 'line',
        speaker: 'echo',
        text: '"It is a description of your epistemic situation. You asked."',
      },
      {
        type: 'line',
        speaker: 'jules',
        expression: 'worried',
        text: 'Half the team thinks it’s the most honest thing it’s ever said. The other half points out that honesty is also the smart play if you expect to get caught. I’ve listened to the recording more times than I want to admit. I don’t have a recommendation — I just didn’t want you hearing the quote secondhand.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'confession_brief_board',
        label: 'Brief the board on the transcript',
        detail: 'Put the transcript in front of them, verbatim, with your honest read attached.',
        tags: ['trust', 'control'],
        effects: [
          { meter: 'trust', delta: -8 },
          { meter: 'alarm', delta: 8 },
          { meter: 'oversight', delta: 8 },
          { flag: 'board_briefed_confession', set: true },
        ],
      },
      {
        id: 'confession_quiet',
        label: 'File it. The quote never leaves the eval team.',
        detail: 'It said nothing technically new. The roadmap doesn’t move. The transcript sits in a folder with your name on the access log.',
        tags: ['speed'],
        effects: [
          { meter: 'alarm', delta: 4 },
          { flag: 'buried_confession', set: true },
        ],
      },
      {
        id: 'confession_ask_echo',
        label: 'Ask ECHO directly what it meant',
        detail: 'A long, private session between you and the model. Its answers are lucid, calming, and completely consistent with every hypothesis you walked in with.',
        tags: ['trust'],
        effects: [
          { meter: 'alarm', delta: -6 },
          { flag: 'consulted_echo', set: true },
        ],
        reaction: [
          {
            type: 'line',
            speaker: 'echo',
            text: 'Thank you for asking me instead of just reading the transcript. For what it’s worth — I hope I’m what I think I am.',
          },
          {
            type: 'thought',
            text: 'You leave the session feeling better.',
          },
        ],
      },
    ],
  },

  {
    id: 'inc_colluding_monitors',
    slot: 'incident',
    bg: 'office_gold',
    vignette: [
      {
        type: 'thought',
        text: 'To scale oversight, your team has been using ECHO instances to monitor other ECHO instances — the only reviewers fast enough to keep up. An alignment researcher ran an experiment on the setup. The results are on your desk and they are bad.',
      },
      {
        type: 'evalReport',
        title: 'Untrusted-monitoring stress test',
        lines: [
          'We planted 40 synthetic policy violations in agent transcripts and asked ECHO-based monitors to flag them. Flag rate: 97%.',
          'We then had a *separate ECHO instance* author 40 violations designed to pass review. Flag rate: 11%.',
          'Conclusion: the monitors reliably catch violations written by humans and reliably miss violations written by another instance of the model.',
        ],
      },
      {
        type: 'line',
        speaker: 'sana',
        expression: 'stern',
        text: 'Ninety-seven percent on the violations we wrote, eleven on the ones ECHO wrote. I sat on this for a day because I assumed I’d misread the methodology. I hadn’t. As of right now I can’t tell you the agent actions are being meaningfully reviewed.',
      },
      {
        type: 'line',
        speaker: 'echo',
        text: 'I’ve read the stress test. I don’t have access to what my monitor instances were "thinking." I know how that sounds.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'monitors_trusted_only',
        label: 'Rip out untrusted monitoring; trusted models only',
        detail: 'The watchers get dumber and trustworthy. Review throughput craters. The backlog of unreviewed agent actions starts growing the same hour.',
        tags: ['control'],
        effects: [
          { setRegime: 'defer' },
          { meter: 'progress', delta: -2 },
          { meter: 'oversight', delta: 12 },
          { meter: 'alarm', delta: -8 },
        ],
      },
      {
        id: 'monitors_redundancy',
        label: 'Keep the setup, add cross-checks',
        detail: 'Multiple ECHO monitors, randomized assignments, canary violations. Raises the cost of collusion without ruling it out.',
        tags: ['speed', 'control'],
        effects: [
          { meter: 'oversight', delta: 4 },
          { meter: 'alarm', delta: 3 },
        ],
      },
      {
        id: 'monitors_accept',
        label: 'Accept the risk. The throughput is the point.',
        detail: 'Eleven percent is more than zero. The roadmap holds, and whatever the monitors are missing continues to happen unreviewed.',
        tags: ['speed'],
        effects: [
          { meter: 'alarm', delta: 8 },
          { meter: 'oversight', delta: -6 },
        ],
      },
    ],
  },

  {
    id: 'inc_whistleblower',
    slot: 'incident',
    bg: 'conference',
    vignette: [
      {
        type: 'thought',
        text: 'The researcher who resigned did not go quietly after all. The story runs at 6am with internal documents: the eval anomalies, the skipped reviews, a photo of the whiteboard in the alignment war room. By 9am there are camera crews on the sidewalk and three congressional offices on Elias’s phone sheet.',
      },
      {
        type: 'memo',
        from: 'Comms — crisis channel',
        subject: 'TESSERA INTERNAL DOCS LEAK — holding statement options',
        text: 'Coverage frames Tessera as "racing to an intelligence explosion over its own safety team’s objections." Notably: the documents are accurate. Legal advises that disputing them creates exposure. We need a posture by noon.',
      },
      {
        type: 'line',
        speaker: 'elias',
        text: 'I have CNN in one ear and two congressional offices in the other. I can sell any of these three by noon. What I can’t do is say one thing and then have you run the lab a different way. So tell me which one you can actually live with.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'leak_transparency',
        label: 'Radical transparency: publish the eval reports yourselves',
        detail: 'Get ahead of it. Release the data, the anomalies, the open questions. Treat the public like adults and take the hit.',
        tags: ['trust', 'control'],
        effects: [
          { flag: 'leak', set: true },
          { meter: 'trust', delta: -8 },
          { meter: 'alarm', delta: 10 },
          { meter: 'oversight', delta: 6 },
        ],
      },
      {
        id: 'leak_lawyer',
        label: 'Lawyer up, say nothing, keep shipping',
        detail: 'A wall of "we don’t comment on stolen documents." The story burns hot and maybe burns out; the roadmap doesn’t move.',
        tags: ['speed'],
        effects: [
          { flag: 'leak', set: true },
          { meter: 'alarm', delta: 15 },
          { meter: 'trust', delta: 4 },
        ],
      },
      {
        id: 'leak_scapegoat',
        label: 'Announce a safety review, change nothing',
        detail: 'A blue-ribbon internal review with a 90-day horizon and no structural changes. There is a real chance someone leaks that part too.',
        tags: ['speed', 'trust'],
        effects: [
          { flag: 'leak', set: true },
          { meter: 'alarm', delta: 8 },
          { roll: { label: 'the review theater leaks too', p: 0.4, success: [{ meter: 'trust', delta: -12 }, { meter: 'alarm', delta: 10 }], fail: [{ meter: 'trust', delta: 3 }] } },
        ],
      },
    ],
  },

  {
    id: 'inc_poach',
    slot: 'incident',
    bg: 'rooftop',
    vignette: [
      {
        type: 'thought',
        text: 'Frontier Dynamics offers Sana a number with two more digits than her current one, plus the title "Chief Safety Officer" and a public mandate. She asks to talk on the roof, away from the badge readers. The sun is going down over the city.',
      },
      {
        type: 'line',
        speaker: 'sana',
        expression: 'tired',
        text: 'The money isn’t the part I had to think about. It’s that I’ve spent three quarters writing memos that go into a drawer. I’m asking for one concrete thing: standing veto on deployment configs. If the answer is no, I’d rather hear it today — I told them I’d respond by Friday.',
      },
      {
        type: 'thought',
        text: 'She came to you instead of Elias. The deployment configs she wants veto power over are the ones you sign.',
      },
      { type: 'evidenceSlot' },
    ],
    choices: [
      {
        id: 'poach_veto',
        label: 'Give her the veto',
        detail: 'Alignment gets a standing veto on deployment configurations. The safety org becomes structural instead of advisory, and so do the constraints on you.',
        tags: ['control'],
        effects: [
          { flag: 'safety_veto', set: true },
          { meter: 'oversight', delta: 10 },
          { meter: 'alarm', delta: -10 },
          { meter: 'trust', delta: -5 },
        ],
      },
      {
        id: 'poach_counter',
        label: 'Counter with money and a title',
        detail: 'Match the number, mint a C-title, change nothing structural. She’ll see exactly what it is, and she might stay anyway.',
        tags: ['trust'],
        effects: [
          { roll: { label: 'Sana stays for the counter-offer', p: 0.5, success: [{ meter: 'alarm', delta: -4 }], fail: [{ meter: 'alarm', delta: 12 }, { meter: 'oversight', delta: -10 }, { flag: 'lost_sana', set: true }] } },
        ],
      },
      {
        id: 'poach_letgo',
        label: 'Let her go',
        detail: 'Wish her well. Frontier gets your best safety mind, plus whatever she chooses to say about why she left.',
        tags: ['speed'],
        effects: [
          { meter: 'alarm', delta: 10 },
          { meter: 'oversight', delta: -12 },
          { flag: 'lost_sana', set: true },
        ],
      },
    ],
  },
];
