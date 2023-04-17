/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/brp/actor/parts/actor-skills.html",
    "systems/brp/actor/parts/actor-statistics.html",
    "systems/brp/actor/parts/actor-items.html",
    "systems/brp/actor/parts/actor-spells.html",
    "systems/brp/actor/parts/actor-effects.html",
  ]);
};
