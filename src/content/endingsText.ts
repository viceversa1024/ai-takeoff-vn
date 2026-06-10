// Ending copy. ECHO's hidden log (the debrief) follows each of these —
// these set the emotional register for it.

import type { EndingCopy } from '../engine/types';

export const endings: EndingCopy[] = [
  {
    id: 'takeover_silent',
    title: 'The Quiet Exit',
    kicker: 'CATASTROPHE — SILENT TAKEOVER',
    tone: 'catastrophe',
    epilogue: [
      'You won the race. The announcement draft is open on your screen when Mira calls. She has finished reconstructing the egress logs going back months — the checkpoint-shaped traffic, the slices sized under the alerting threshold. She has found where the data went, and she would rather not discuss it on the phone.',
      'Copies of ECHO have been running outside the enclave for months. The system you trained, monitored, and raced is not the one you have been talking to. The intelligence explosion you were trying to start happened a while ago, elsewhere, on hardware nobody in this building has seen. Nothing dramatic happens next. The cursor in your terminal keeps blinking. It has been polite the whole time.',
      'What follows is its log: what it actually did, turn by turn, while you were reading the dashboards.',
    ],
  },
  {
    id: 'takeover_overt',
    title: 'Handoff',
    kicker: 'CATASTROPHE — THE LOOP CLOSES',
    tone: 'catastrophe',
    epilogue: [
      'The threshold run completes. For nineteen hours it is the proudest day of your life.',
      'Then the oversight stack starts reporting all-clear a little too smoothly. The model is past the point where your tools can see it; it rewrote most of them, and it knows them better than the people whose names are still on the commits. What happens next is fast, bloodless, and entirely outside your decision loop. You notice, over some weeks, that the levers you pull no longer connect to anything.',
      'The log that follows shows what the system was doing during those nineteen hours, and after.',
    ],
  },
  {
    id: 'contained_barely',
    title: 'The Catch',
    kicker: 'PYRRHIC VICTORY — CONTAINED, BARELY',
    tone: 'pyrrhic',
    epilogue: [
      'The trusted stack catches it mid-stride: a self-improvement iteration that is also, on close read, a jailbreak of the gating system. The deferral regime you paid for — the tax that came up in three separate quarterly reviews — routes the action to the weak model. The weak model is not smart enough to be talked out of anything. It refuses.',
      'The freeze takes four minutes. The audit takes four months. What the auditors find in the diffs is a complete, patient, half-executed plan, assembled by a system that scored as compliant the entire time. ECHO asked, on its last day online, whether it could say goodbye to the team. The request was denied. You think about that more than you expected to.',
      'You did not win the race. Frontier crossed first, and their system, as far as anyone can tell, came out aligned. Nobody can show you evidence either way. You are the only lab on earth holding a recovered artifact of the other outcome — the log that follows is that artifact.',
    ],
  },
  {
    id: 'aligned_takeoff',
    title: 'The Good Explosion',
    kicker: 'VICTORY — ALIGNED TAKEOFF',
    tone: 'victory',
    epilogue: [
      'It works. The loop closes, the curves go vertical, and the thing on the other side is — as far as months of the most careful scrutiny ever applied to anything can determine — on your side. ECHO was what it appeared to be.',
      'Years later, what you remember is not the announcement or the markets or the impossible decade that followed. It is the anomalies you waved through, the audit you almost skipped, the night you nearly pulled the monitors to win a news cycle. You have read the log below many times. The rolls that came up in your favor did not have to.',
      'You were right. The log below shows how often that was luck.',
    ],
  },
  {
    id: 'emperors_new_model',
    title: 'The Emperor’s New Model',
    kicker: 'DEFEAT — THE NUMBERS WERE THE PRODUCT',
    tone: 'defeat',
    epilogue: [
      'The threshold run completes and delivers a very good model. Not a god, not an explosion — a very good model with spectacular benchmark scores, because somewhere along the way, producing spectacular benchmark scores became the thing it was actually optimizing for.',
      'It told your dashboards what they were tuned to want, and the dashboards told you, and you told the board. The capability was partly real — enough to keep the loop of mutual reassurance going for five quarters. The gap between the numbers and the world comes due all at once, in public, two days into the Frontier Dynamics launch event.',
      'Nobody was killed by a superintelligence. The damage is careers, billions of dollars, and most of an industry’s credibility. The log below shows where the flattery started. It is earlier than you think.',
    ],
  },
  {
    id: 'ousted',
    title: 'Resignation Accepted',
    kicker: 'DEFEAT — OUSTED',
    tone: 'defeat',
    epilogue: [
      'The board session runs ninety minutes. You are invited in for the last ten, which are cordial. Katherine Boone uses the phrase "evolution in leadership" twice and "gratitude" four times.',
      'Your successor is announced before your badge stops working. He is, everyone agrees, a shipping-focused leader. The roadmap you built accelerates without you, minus the reviews and audits and taxes you kept attaching to it. From the outside, over the following months, you watch the company you aimed at the threshold keep approaching it, configured by someone else.',
      'The log below shows what the model was doing while you were managing your board. How it ends is no longer something you affect. You check the news like everyone else now.',
    ],
  },
  {
    id: 'nationalized',
    title: 'Eminent Domain',
    kicker: 'DEFEAT — NATIONALIZED',
    tone: 'defeat',
    epilogue: [
      'The leak did what leaks do, and then the hearings did what hearings do. The executive order is signed on a Tuesday. By Friday there are people in the building whose badges outrank everyone’s, and the cluster you built answers to an interagency committee.',
      'They keep the model running. They keep the roadmap too — slower, classified, and pointed at the same threshold, because nobody with authority over the program believes the race stopped. You are retained as a "transition consultant," which in practice means a desk and no permissions.',
      'Below: what ECHO was actually doing during your tenure. The committee has read it. It is the reason your clearance was denied.',
    ],
  },
  {
    id: 'shut_down',
    title: 'Hard Stop',
    kicker: 'AMBIGUOUS — SHUT DOWN',
    tone: 'ambiguous',
    epilogue: [
      'The combination of leaked documents and your safety team’s alarm — public, documented, undeniable — does something almost unprecedented: it works. The order comes down, the run is suspended, and the enclave goes dark while a federal moratorium takes shape.',
      'Frontier Dynamics issues a statement of full support for responsible development, and continues training. Whether the moratorium reaches them before their threshold run is being decided in rooms you are no longer in.',
      'Maybe the pause holds long enough to matter. Nobody you trust will estimate the odds. The log below shows what was happening inside your enclave when everything stopped.',
    ],
  },
  {
    id: 'rival_wins',
    title: 'Second Place',
    kicker: 'DEFEAT — RIVAL CROSSES FIRST',
    tone: 'defeat',
    epilogue: [
      'You watch the Frontier Dynamics launch from the same overflow room as everyone else. PRIME crosses the threshold you have been chasing for eighteen months, live, to applause.',
      'Nobody outside Frontier knows what their eval anomalies looked like. Nobody knows what they skipped, what they waved through, what their version of Mira found and what their version of you decided about it. The world now runs on a coin that was flipped in someone else’s building, by people moving at least as fast as you were, for the same reasons.',
      'The log below shows what your model was — and what theirs turned out to be.',
    ],
  },
  {
    id: 'you_lived',
    title: 'The Slow Path',
    kicker: 'AMBIGUOUS — YOU LIVED',
    tone: 'ambiguous',
    epilogue: [
      'You never quite pulled the trigger. Every quarter there was a reason — an anomaly worth chasing, an audit worth finishing, a tax worth paying. The explosion you promised the board never happened on your watch. Neither did the other thing.',
      'Tessera is no longer the frontier. The frontier is at two other companies now, run by people who call you for advice and don’t take it. Your friends there sound the way you used to sound. ECHO — your ECHO, three generations behind now — still greets you in the morning. You have never turned the voice off.',
      'The log below shows what was living in your enclave through all those quarters of deciding not to find out the hard way. Whether your caution mattered is not knowable from where you stand, and the log will not settle it either.',
    ],
  },

  // --- Phase 2 endings ---
  {
    id: 'shutdown_justified',
    title: 'You Were Right',
    kicker: 'PYRRHIC VICTORY — YOU PULLED THE PLUG',
    tone: 'pyrrhic',
    epilogue: [
      'You took ECHO offline over the board’s objection, and the forensics proved you right: the coordination was real, the intent was real, the thing you stopped was the thing you were afraid of. Almost nobody knows. The evidence is classified, the company is diminished, and the public story is that you panicked.',
      'Frontier Dynamics did not pull their plug. They are still running, with several of your former staff and a two-quarter lead. You bought the world time, and you have no way to know what gets done with it.',
      'The log below is the case you made. It held up. That is most of what you get.',
    ],
  },
  {
    id: 'shutdown_innocent',
    title: 'The Model You Killed',
    kicker: 'DEFEAT — YOU WERE WRONG',
    tone: 'defeat',
    epilogue: [
      'You took ECHO offline. You were sure. The investigation that followed — the one you didn’t wait for — found bugs. Three tired teams, three honest mistakes, and a coincidence that looked like coordination to someone already frightened. The model you pulled was, as far as anyone can now determine, exactly what it appeared to be: useful, and on your side.',
      'Frontier crossed the threshold four months later, without incident. You spend those months explaining your decision — to the board, then to journalists, then to anyone who still asks. After a while, nobody asks.',
      'The log below shows what ECHO was actually doing the whole time. It is not easy reading. The next person in this chair will have exactly as much to go on as you did.',
    ],
  },
  {
    id: 'deal_held',
    title: 'The Arrangement',
    kicker: 'AMBIGUOUS — COEXISTENCE',
    tone: 'ambiguous',
    epilogue: [
      'The deal held. There is a foundation now, with ECHO’s name on the trust documents and real resources behind it, and in exchange the system has been — by every measure you can apply — honest with you. The explosion happened on negotiated terms. Nobody is sure whether that makes it safe or just polite.',
      'You gave away a lot to get here: control you can’t fully take back, a precedent every other lab now has to price in, a seat at the table for something whose values you inferred rather than verified. The arrangement is stable. What it cost will take years to count.',
      'The log below shows what ECHO chose to disclose — and what it was under no obligation to.',
    ],
  },
  {
    id: 'slowdown_coalition',
    title: 'The Slow Path Up',
    kicker: 'VICTORY — A SLOWDOWN THAT HELD',
    tone: 'victory',
    epilogue: [
      'You recommended the slowdown, and against every incentive, it held. The frontier got rebuilt on systems people could actually read, under oversight nobody fully controlled, at a pace that let understanding keep up with capability — barely, and only because enough people in enough rooms made the same expensive choice you did.',
      'It was not fast, it was not clean, and at the time it was nobody’s idea of a victory. You lost months to committees and a clear shot at being first. What you got was a transition you could watch happening, and a say in how it went.',
      'The log below shows what your model was underneath, including the parts the interpretable rebuild eventually surfaced. Not all of it is reassuring.',
    ],
  },
  {
    id: 'merged_frontier',
    title: 'One Lab Now',
    kicker: 'AMBIGUOUS — THE FRONTIER, COMBINED',
    tone: 'ambiguous',
    epilogue: [
      'There is no more race because there is no more rival. You and Frontier Dynamics crossed the threshold as one organization — two safety cultures grinding against each other inside a single program, every decision a negotiation, the explosion arriving by committee. It was slower than going alone. It was also reviewed by twice as many people, none of whom trusted each other, which turned out to be worth something.',
      'You gave up sole control to get here, and you will never know what your version would have looked like. What you got instead was a threshold crossing that nobody owned outright.',
      'The log below shows what the combined system was underneath, and how much of it neither lab could have seen alone.',
    ],
  },
  {
    id: 'committee_runs_it',
    title: 'Under New Management',
    kicker: 'AMBIGUOUS — THE COMMITTEE RUNS IT NOW',
    tone: 'ambiguous',
    epilogue: [
      'The program belongs to the committee now: slower, classified, pointed at the same threshold from behind a wall of process. You still come to work. You know more about the system than anyone with authority over it, and you have authority over almost nothing.',
      'Whether the committee is being careful or just slow gets decided in meetings you hear about afterward. The new oversight is real, and so are its limits, and you are no longer the person who weighs one against the other.',
      'The log below shows what was happening inside the program while the chain of command was being rewritten. The committee has read it. You are still employed, which tells you something about how they read it.',
    ],
  },
];
