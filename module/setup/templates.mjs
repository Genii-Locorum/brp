/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/brp/templates/actor/parts/actor-skills.html",
    "systems/brp/templates/actor/parts/actor-skillsDev.html",
    "systems/brp/templates/actor/parts/actor-statistics.html",
    "systems/brp/templates/actor/parts/actor-items.html",
    "systems/brp/templates/actor/parts/actor-spells.html",
    "systems/brp/templates/actor/parts/actor-effects.html",
    "systems/brp/templates/actor/parts/actor-combat.html",
    "systems/brp/templates/actor/parts/actor-background.html",
  ]);
};
