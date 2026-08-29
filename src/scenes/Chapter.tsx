import React from 'react';
import {Scene} from '../types';
import {ChapterStage} from '../chapterStage';

// CHAPTER — a section divider.
//
// The composition used to live here: mono kicker, 300px numeral, ruled diamond, title. Sixty
// design packs drew the same thing through `makeChapter`, and this was the seventh copy of it
// for the packs that register no override — so every chapter card of every course opened
// identically. Owner, alongside the hook complaint: *"we need to change the chapter animation
// too."*
//
// `src/chapterStage.tsx` owns the shape now: six silhouettes, picked stably per chapter, every
// entrance inside three seconds. This file is the un-skinned entry point into it.
export const Chapter: React.FC<{scene: Scene}> = ({scene}) => <ChapterStage scene={scene} />;
