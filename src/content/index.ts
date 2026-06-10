import type { Scene } from '../engine/types';
import { spineScenes } from './scenes';
import { incidentScenes } from './incidents';
import { arcScenes } from './arcs';

export const allScenes: Scene[] = [...spineScenes, ...incidentScenes, ...arcScenes];
export { evidenceTemplates } from './evidenceTemplates';
export { endings } from './endingsText';
