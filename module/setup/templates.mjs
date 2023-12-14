 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/brp/templates/actor/parts/actor-skills.html",
    "systems/brp/templates/actor/parts/actor-skillsDev.html",
    "systems/brp/templates/actor/parts/actor-statistics.html",
    "systems/brp/templates/actor/parts/actor-items.html",
    "systems/brp/templates/actor/parts/actor-magic.html",
    "systems/brp/templates/actor/parts/actor-magicDev.html",
    "systems/brp/templates/actor/parts/actor-combat.html",
    "systems/brp/templates/actor/parts/actor-background.html",
    "systems/brp/templates/actor/parts/actor-mutations.html",
    "systems/brp/templates/actor/parts/actor-psychics.html",
    "systems/brp/templates/actor/parts/actor-psychicsDev.html",
    "systems/brp/templates/actor/parts/actor-sorcery.html",
    "systems/brp/templates/actor/parts/actor-super.html",
  ]);
};
