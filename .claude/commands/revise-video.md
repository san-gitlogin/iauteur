Revise scenes of an existing topic. Expect $ARGUMENTS like: "<slug> s03: make the caption shorter".
Edit ONLY the referenced scenes in topics/<slug>/*.json, keep all other fields byte-identical, run `npm run lint`, report the diff summary. Never touch component code; layout/animation complaints get routed per PROJECT_RULES corrections matrix instead.
