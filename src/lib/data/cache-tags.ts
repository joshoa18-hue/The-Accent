/**
 * Cache tag for everything that belongs to the signed-in learner (profile, XP,
 * missions, achievements). Data functions tag their results with it; a Server
 * Action that changes learner data calls updateTag() with it, so the next page
 * shows the change immediately instead of a cached copy.
 */
export const LEARNER_DATA_TAG = "learner-data";
