Create a new video topic, end to end, with hard stage gates.

Ask the user for (unless already provided in $ARGUMENTS): the topic or pasted article, audience (default: general), AND the design choice — present exactly these options:
  a) a ready theme (list the 7 dark themes + rotation recommendation based on existing topics),
  b) a ready design PACK if any exist in src/designs/index.ts,
  c) a design-* skill not yet converted (warn: needs a one-time pack build first — offer to run that job with approval),
  d) custom (their own description → map to the nearest ready theme now, note it as a future pack candidate).
Also ask: any extra additions (their logo? a specific stat? an image they'll provide)? Derive today's date from the environment. If the topic is time-sensitive or no article was given, web-search first — training memory is not a source.

Then:
0.5 TOPIC VERDICT (mandatory, per channel_playbook.md §1): web-search the entity's age and existing content supply; score the four axes; state the verdict plainly. If <2 axes, say so with the expected-views warning and web-search 3 fresher alternatives; proceed only on explicit user overrule. Check topics/ledger.json — if a validated entity relates, propose a "+" sequel title. Record axes in meta.topicAxes and append the entity to the ledger.
1. Propose a kebab-case slug and run `npm run new-topic -- <slug> "Title"`.
2. STAGE 1 ONLY: payoff, open loop, analogy, audience, THEME (dark, rotated vs existing topics — list what previous topics used) + background variant + themeLight, beat map (6–9 rows). STOP. Wait for explicit approval.
3. On approval: write topics/<slug>/long.json and shorts.json per the tech-video-director skill (thumbnail + cover blocks included), run `npm run lint`, fix violations until PASS.
4. Run `npm run voiceover -- <slug>` and `npm run chapters -- <slug>`. Then output the upload kit per channel_playbook.md: 3 titles (templates A-D only, integrity line applies), 3 thumbnail variants (contrast rule), the FULL 7-block description (branded anchor phrase + slogan + WATCH_NEXT from channel_profile, chapters pasted from the generated file, REAL references only), User Queries block (8-14 autocomplete-style, intent-matched, one branded query), exactly 3 hashtags (entity/category/brand), pinned comment. Run the §7 anti-leak QA checklist on everything before showing it.
5. Ask: "Package as a standalone zip?" If yes → `npm run package -- <slug>` and hand them the dist path with the three-line quickstart (extract → npm install → npm run dev). If no → finish with: npm run dev · proof · npm run render -- <slug> <variant>.
