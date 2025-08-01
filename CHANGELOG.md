# CHANGE LOG

## 13.1.45
-  Spanish Language pack added courtesy of Adrian_Martin(bakali77)

## 13.1.44
- (Hopefully) this is updated for Foundry V13.
- Please note this version does not support Foundry V12 - please stay on BRP v12.1.43 if you haven't moved to Foundry v13
- And please do back up your world before migtation in case you need to roll back
- The system is stil on Application v1 - the move to v2 will happen in due course
- Please report any issues at https://github.com/Genii-Locorum/brp/issues

## 12.1.43
- Active Effects have been added to Weapons, Armour and Gear.  You can read more at https://github.com/Genii-Locorum/brp/wiki/Active-Effects
- Active Effects do work for Unlinked Actors - when Foundry fix the underlying issue we may see duplicate effects until we remove the fix.
- There is now an Active Effects tab on these item sheets - GMs can edit effects, Players can only view the current effects.
- Weapons and Gear must be carried for the effects to apply, Armour must be worn
- There is a limited list of active effects - these can be added to - please let me have your feedback if there are more to be added
- You can add bonuses to skills, magic and psychic abilities by manually adding a customised data path -  see the Wiki for more info on this.
- There is now an "effects" tab on the character sheet which lists the effects and the item they are attached to.  Click on the Source Item name to open the item sheet.
- This is all the hard work of JamesB.  Thank you so much for this.

## 12.1.42
- Error witn Item "HP and PP" labels showing as undefined fixed.
- Damage to the chest now triggers the correct statuses
- There are icons to the left and right of Hit Points, the sword adds a wound, the heart heals a wound.
- For powers (Magic, Sorcery, Superpower etc) the context menu now has the option to send the item description to the chat window.
- When power roles (Magic, Psychic) are made then the description is also shown in the "hidden" section of the roll.  This only applies to Normal rolls at the moment.
- There's a new Combat game setting that let's you have a "Quick Combat" roll.  This is a non-oppossed combat roll that also shows the damage that would be caused for each success level
- There is now a Custom Resource in the "Optional Rules" menu - you can turn it on/off and give it a label.  It will then appear on the actor sheet.  There is no automation added.
- There is now a Fatigue Point modifier on actors.

## 12.1.41
- Slight tweak to roll cards to centre the first line next to the actor image
- A lot more options to adjust the character sheet - https://github.com/Genii-Locorum/brp/wiki/Game-Settings:-Display-Options
- The character sheet logo setting has moved to the Display Options
- The character sheet visual adjustments are a work in progress - please feedback any other changes needed or areas where the expected results aren't working.
- Instead of selecting to use Magic Points rather than Power Points you can now add a name and abbreviation instead of Power Points/PP - see the Optional Game Rules settings
- You can also change the name and abbreviations for Hit Points and Fatigue Points.
- BRP IDs can be automatically added for Items now - see the BRPID game settings (Actor BRPID has moved here from Char Settings)

## 12.1.40
- Roll chat cards updated to increase size of the actor image and the space for the skill, weapon etc name and there is some additional info in the "expandable" section of the card
- There is now a game setting to choose if you want to show XP & POW Improvement Dice Rolls where you have Dice So Nice module activated.  You could see a lot of dice rolled.
- POW improvement rolls no longer increase POW when the roll is failed (oops).
- When dropping professions etc you should no longer get console errors if actor items don't have BRPIDs.
- There's a new game setting, which if activated, autogenerates the BRP ID for new actors based on the name.  Initially the BRPID fingerprint icon will be orange to warn you.
- Special Weapon Damages are now being applied properly
- Game Settings have been reorganised (the list was getting too long) in to several sub-forms - click on the relevant button to open the subform
- There is a new advances skill category calculation - Negative Secondary - like Secondary but for stat values less than 10
- Where you've added a different label to a Power in game settings this also applies to the list on the relevant character sheet tab and the item sheet.
- Under BRP Game Settings > Display Options there is now two Colour settings to change the main background and secondary background colours on the actor sheet.  Enter a colour reference such as rgba(0,141,142) or #008080.
  These are sort of a test to see if it's what people want.  I will expand the list if it is.

## 12.1.39
- Personal Skill Points are now totalled on the Skills tab, in unlocked mode, under the correct column
- MOVE score added to culture item and added to character sheet along with the culture
- On the character sheet there is now an option under the Skills tab context menu to toggle how the skills are displayed
- When adding a profession to the character you now choose the wealth level.  This can be edited when the character sheet is unlocked.
- On the "CHAR" tab the Redistribute values are no longer manually entered.  When in "Development Mode" and with the character sheet unlocked use the arrows by the
  stats to redistribute stats.  You can only redistribute 3 points and there are min/maxes in place.  Unless the redistributed points net to nil the column is red
- Age has been added to the character sheet neer the top left of the Personal Section
- Clicking on the "Impact" of a Magic Spell or a Psychic Ability on the actor sheet causes an Impact (Damage or Healing) dice roll
- When adding a skill, profession, personality etc the system will check if you have the Skill Category on the character and if not it will add it automatically
- There are two game settings for the initiative formula - select a stat (or none) and enter a modifier.  If your formula is invalid you will get an error message when your world starts and the default formula is used


## 12.1.38
- Context menu for Psychic Abilities now shows XP improvement options when there is an improvement tick and development mode is on
- All improvement checks exclude the item.system.effects score
- Psychic Ability item sheet, when owned, now shows the Improvement button which can be toggled on and off
- Personality Traits now have a "Starter Trait" toggle.
- There is a new game setting "Starter Traits".  If turned on then any new character will, if Personality Traits are used, automatically start with
  any trait which has the "Starter Trait" toggle activated.

## 12.1.37
- Fixed issue with "easy" rolls incorrectly getting XP checks
- Only characters can get XP checks (not NPCs) - this was throwing an error in the console for weapons
- Chat card for skills rolls etc now show the correct actor image where wildcard tokens are used.


## 12.1.36
- The autoXP game setting has changed from a tick box to a drop down selection - None (not auto XP), Any Success (tick XP for success, special success of critical) or On Fail/Fumble.
  Please re-check your setting following world migration, as they are likely to have reset to "none".

## 12.1.35
- Culture now has the correct title on the item sheet
- Failings on the character sheet now display the failing name if the short description is blank
- Where the system can't find a skill category in dice rolls then the Cat Bonus now correctly sets to nil
- There are now game settings to allow you to change the titles of the "power" tabs on the character sheet.  Leave them blank to use the defaults
- You can now click on the skill category in the character sheet skill tab to open up the Skill Category item
- In the skill category, when on a character, you can enter a "manual" modifier that is added to the calculated bonus

## 12.1.34
- Layout of Items on characters now fixed to a consistent grid size
- Culture has been added as an Item.  You can set the characteristic dice rolls and culture bonuses, plus skills with skill modifiers.
- Adding a culture to a character adds the characterstic formulae, bonuses, skills with modifiers.
- When in development mode and with the character sheet unlocked there is a dice icon on the "CHAR" tab that lets you roll the dice - with a chat message showing the results.
- When you have added a culture the name is shown on the character sheet and there's a context menu to view or delete the culture.
- If you don't drop a culture item on the character you can manually enter a culture name
- You can also manually enter/edit the dice rolls for characteristics if development mode is on and the character sheet is unlocked.
- You can now edit (and keep the changes) to weapon ammo and hitpoints on the NPC sheet
- Specialised skills now show under a common "main skill" heading on the actor sheet (so all Languages appear under "Language")
- A macro has been included in BRP ID Macros compendium to rename all actor and game world specialised skills

## 12.1.33
- When dropping a Specialism skill on to the character sheet where the specialism hasn't been chosen you will get asked for the specialism name
- When the character sheet is unlocked the Skills Tab context menu now includes a "Recalculate skill base scores" which does exactly that.
- When dropping Personality on to a character - the skills included in the personality are added to the character - with relevant choices presented to the player and base scores calculated.
- The same applies for a Profession
- Skills added via the Personality gain the +20 bonus and are highlighted in the Skill Dev tab (Skill tab when character sheet unlocked), though you can edit the Personality Points on any skill
- Skills added via the Profession are highlighted in the Skill Dev tab, though the system doesn't restrict you to spending Professional Skill Points on just these skill
- NPCs now have a Power Modifier option on the Base Stats tab
- NPCs now have a 'Move Notes" entry on the base stats tab for a longer description of their movement.  This appears as a tooltip on the main NPC sheet
- GMs should now be able to drag all items from the Characters and NPCs to the items menu or compendia
- The skill category on the Skill Item Sheet should now display properly for players (it was fine for GMs)

## 12.1.32
- Fixed issue with the Sorcery Spell sheet nullifying levels when opened by a player
- Fixed issue with Psychic abilities not being able to access Description/GM Notes
- Added 'Crush and Knockabck' as a special damage type.  This and 'Impale and Knockback' now do the relevant special damage.
- Most Item names can now be edited by players since the name is less critical with the intro of BRPIDs.  This doesnt include Hit Location, Skill Category and Wound
- When creating a new character only adds new skills and skill categories if not already on the sheet (was a problem with duplicating characters)
- You can now drop NPCs from the compendium to the canvas.  If the NPC already exists in the game actors (where BRPID and Priority match) then you won't get an additional copy created in game
- For characteristic rolls there are now two new difficulty levels - Tricky and Awkward for STAT * 4 and STAT * 3 respectively.  Difficulty levels now show the multiplier.


## 12.1.31
- BRP IDs have been added to the game - see the Github Wiki for more information - https://github.com/Genii-Locorum/brp/wiki/BRP-IDs.  This is a major change so please BACKUP YOUR WORLDS before implementing this.
- A number of macros have been included to help with migration - more info at https://github.com/Genii-Locorum/brp/wiki/Migrating-to-BRP-IDs
- You no longer need to bring comepndium items in to the game items and can drag items etc straight from the compendia
- The list of weapon types (and some other checks) are no longer generated from just in world game items, but pull a list from game items and compendia based on BRPIDs.  You will still need some combat skills etc before you create weapons but they can be in the compendia rather than in world
- Under skills there is a new toggle option "Combat Skill" - if toggled on then the skill is included in the list of weapon types.  You don't need to toggle this on if the Category is set to Combat as these are automatically included.  This removes some hard coding to include Dodge, Throw and Demolitions.  It means you can also include other skills you create or rename those skills.
- Most compendia have been removed from this system but have been placed in to a separate module - the aim is to make customising your world easier (you can use the new module, import the content, remove the module, edit the content and save your own compendia)
- Instructions have been removed from within the game but have migrated to the Github Wiki - https://github.com/Genii-Locorum/brp/wiki
- For Personality, you can now manually enter the personality name when the character sheet is unlocked if you don't have a Personality Item on the character sheet - if you later add a Personality item it supercedes (but doesnt erase) the manual entry.  If you right click the "personality" title and there is no context menu this shows you don't have a relevant item.  The same applies to Profession.
- When skills or powers are shown on Personality, Profession etc either in the main list or optional groups you can now click on the name to open the relevant Item sheet.  These will be the best match based on the BRPID with the highest priority as the actual skill etc is not stored in the Personality, Profession etc.  This means you can ammend a skill etc without having to relink it to the Personality etc
-Hit Locations (the item) now have a Display Name (e.g. Head) and a Creature Type (e.g. Humanoid).  The item name will be a combination of the two with the Creature Type, if populated, appearing in brackets.  The Display Name is what's shown on the Character & NPC sheets.  This is to make finding the right hit location for a creature easier in a big list of hit locations
-Skill Categories have been added as a new Item.  You can change the name and configure how the category modifiers are calculated.  The BRPID for each modifier in world or the compendium is used to generate the list of possible skill categories.  Skill categories are automatically added to new characters.  It is imperative that you either have a skill category with the BRPID 'i.skillcat.combat' or you flag all the weapon skills as combat skills.  If you don't you won't see a list of weapon skills.
- Because of the above the game settings for Social and Supernatural have been removed (include or don't include the relevant game items as you see fit.)
- For NPCs you can now enter Max HP formula (as two stats, a multiple and a modifier) on the Base Stats Tab and the calculation formula is then displayed.  It defaults to CON, SIZ, 0.5 & 0
- When dropping unlinked NPC actors to a scene you can get the Random or Average stats to be autorolled for you - you may get asked depending on the game settings - there's a new one to choose Ask, Do nothing, use Random stats or Average Stats.
- In game settings you can also choose whether to show NPC names on tokens as defaults. You can also do the same for Resource Bars

## 12.1.29
- Added a Description section to NPCs for extended notes.
- You now access NPC stats and base stats (dice to roll) via separate icons rather than toggling one
- There is a new GM tool - Bestiary Mode.  When toggled on you will see more HPL and Armour & SAN Loss sections on the NPC sheet even if your game doesn't use them.  This mode is aimed at creating a Bestiary for distribution to other users who may use game settings that you don't.
- SAN Loss has been added to NPC sheets
- Fixed a bug with NPC hit points on HPL not recording properly.

## 12.1.28
- Fixed Combat rolls not correctly reducing success level.

## 12.1.27
- HP on weapons on NPC sheet are now saved
- NPC Fatigue Points Max are autocalculated
- When rolling or averaging stats for an NPC the Current HP, PP, FP and SP are set to maximum values

## 12.1.26
- A Special Success Damage Roll for a Crushing Weapon now adds +1D4 Damage Bonus if the base Damage Bonus = 0
- Macros can now be dragged between hotbar slots and from the Macro Directory
- When rolling damage the rolled dice are now visible if you expand the chat message
- Combat cards can now be resolved with only 1 roll in them
- Combat rolls now tick relevant XP skills when successfully made and relevant game setting is on
- Hit Locations now check they are not already on the character sheet before they can be dropped
- Armour - previously if the Ballistic Armour values were left blank, then the non-ballistics armour value was assumed to be used.  This no longer happens - you will need to update the Ballistic Armour values in each piece of armour
- If using Hits Per Location, Armour on the Items tab is grouped by Hit Location with a summary of the location.  Clicking on the expand icon (on the right) hides the specific hit location but shows the relevant armour items.  Clicking on the collapse icon hides the armour items and reveals the hit location.  Clicking on the title "ARMOUR" expands all hit locations whilst SHIFT + CLICK collapses them all.

## 12.1.25
- Added a game setting for "Reputation" - choose from None (reputation not used), single (single reputation item allowed) or multiple (multiple reputation items allowed).  NPCs will always use the mutliple option.
- Reputation item can be dragged to macro bar
- New tab on character sheet "SOCIAL" that combines Reputation and Allegiance Items.  Visible if either is allowed in game
- New tab on character sheet "PERS" (Personality) that combines Passion and Personality Traits. Visible if either is allowed in game
- There are now "+" icons on the Armour and Weapons grids on the character sheet to directly add Armour and Weapons to the character sheet.
- Please note that Instructions for new items are being added to the Github wiki (https://github.com/Genii-Locorum/brp/wiki) - overtime more instructions will be added to, and ingame instructions migrated to, the wiki.

## 12.1.24
- Removed the superfluous true/false flag on the Character Sheet Allegiance tab (this was for potenital ally status)
- Fixed the inline edit for NPC Allegiance points
- Total Professional Skill Points, Personal Skill Points and XP now shown on the "CHAR" tab (this adds up totals from Skill, Magic and Psychic items)
- Fixed error with Critical Damage not rolling

## 12.1.23
- Skill categories on the actor sheet get to use the full width of the skill list column to prevent wrap around issues
- Add Supernatural as a skill category and a game setting.  If unticked then any skills with Supernatural won't be shown on the character sheet
- Add Social as a skill category and a game setting.  If unticked then any skills with Social won't be shown on the character sheet
- Personality Traits have been added.  You can roll on the Personality Trait or the Opposed Trait and do XP improvements as well.
- You can drag Personality Traits to the hotbar for a macro.  Using the ALT key when clicking on it triggers the Opposed roll.
- Added macro roll functionality for Passions (previously only displayed the item sheet).
- All item Descriptions and GM Descriptions are now rich text.
- Background, backstory and biography are now rich text.
- NPC sheets now have Passions, Allegiance and Personality Traits.  Unless you have an item on the NPC or the sheet is unlocked you won't see the sections (to save space) - you can drag and drop an item on and it will appear.  This has been added for Powers as well.

## 12.1.22
- Change to manifest URL to correct it

## 12.1.21
- Fix to NPC sheet to allow in line edit of #ATT on weapons ((it was failing to make the update after a new value was entered))
- Tooltip added on NPC sheet explaining BAP

## 12.1.20
- Added option to adjust maximum magic points to character (on the CHAR tab)
- Gear, Weapons and Armour can now have stored magic/power points.  Enter them on the item sheet (default is zero).  The current value can be edited directly on the character sheet.
- If you hover over Power/Magic points then a tool tip shows current and maximum stored power points.  If an item is "stored" then it is not included
- A few tweaks to the character sheet Combat/Item tab with font size to accomodate the Stored PP/MP.  These are only shown if the Max is set to 1 or more.

## 12.1.19
- Added Dodge to list of weapon skills available when creating weapon.  Added Dodge as a weapon to the compendium.  Use this to "Dodge" in combat (this is a a workaround pending a better option)

## 12.1.18
- Fixed issue with Combined/Oppossed/Cooperative rolls in V11 (Issue#16)
- Fixed issue with AudioHelper error on XP rolls.

## 12.1.17
- Fixed issue with Wounds not being created if not using HPL on actors (worked for tokens)

## 12.1.16
- Updated for V12 release 324

## 11.1.15
- Added NPC actor type
- Added a game settings for Allegiances
- Added Allegiance item, and an allegiance roll (normal roll only)
- Allegiance Improvement has an XP check like skills and magic
- Added a game settings for Passions
- Added Passion item, and a passion roll (normal and opposed)
- Passion Improvement has an XP check like skills and magic
- Fixed issue with not being able to add Wounds to an unlinked token (and couldn't roll XP checks either)
- Can open mutation, psychic, sorcery and superpower item sheets on Character sheet by clicking on the names

## 11.1.14
- Added combat rolls from weapons on the hotbar
- Tidied up some of the chat message outputs
- Can cast Magic spells - click on the spell total score

## 11.1.13
- Tweaked context menus so they go up if the start point is in the bottom half of the screen
- Roll cards fixed so the correct roll is deleted rather than always the first roll
- Dice rolls now visible on opposed, cooperative and combined rolls when using Dice so Nice when roll is resolved
- Updated roll chat messages to add extra info when expanding the roll (GM or owner can click on the indidividual result lines)

## 11.1.12
- Hotfix to reinsert code to calculate stats total

## 11.1.11
- Context menus should now render upwards if they would drop off the bottom of the screen
- Skills will roll from the macro bar (you can roll weapon skills from the Skills tab, but not weapons from the items tab - yet)
- Skill tab percentages now include the category bonus
- ENC now calculated (shown on Characteristics tab).  FP adjusted an
- "Carry status" is now shown as icon rather than words (the words are available as a tooltip)
- Auto calc of Encumberance (Items, Armour Weapons) which in turn updates the Max Fatigue Points
- Changed the combat tab.  Rate of Fire is now visible by hovering over "Attack".  Added ENC (hover to see quantity).
- Fatigue and Power point spend and recovery added
- Added error check on dropping Weapon on character sheet to make sure a Skill has been added to the weapon if first skill slot
- Added an game setting  to change the logo at the top centre of the character sheet.  58px height and 700px wide max.
- Added a setting in Skills for "Starter Skills".  Any skill flagged as a starter skill we be automatically added to a new character sheet
  if the relevant game setting is on (this may get added in time)

## 11.1.10
- Removed a testing element left in (oops) that forced max dice roll values
- Added context menu options for weapon skill and damage rolls

## 11.1.9
- Added GM Tools to the scene tools and a Development Phase
- Added XP improvement checks, only available when Development Phase is turned on by the GM.  Applies to Normal Skill, Combined, Oppossed and POW v POW rolls.
- Added POW improvement roll, only available when Dev Phase is turned on
- Option to turn on "auto XP" checks when succesfully using a skill
- Cooperative skill rolls added
- Can roll weapon damage from items in the Combat tab (unless damage is "Special")
- Can roll weapon attacks from skill% in items in the Combat tab
- Updated partial success rolls for Combined rolls

## 11.1.8
- Added Socket functionality (pre-cursor to combined/opposed rolls)
- Combined and Opposed skill rolls added
- Skills now roll off the values not the name (context menus are off the name).  Clicking on the name opens the skill item sheet
- Some changes to skills and weapons (additional skills added - Lasso, Net, Thrown Axe) and which weapons use which skills changed
  based on discussions with author.  Rates of Fire also added to advanced missile weapons

## 11.1.7
- Added wound/hit point statuses, minor and major wounds
- Update hit locations for wound statuses
- Characteristics now roll off the value not the name (context menus are off the name)

## 11.1.6
- Minor change to natural healing
- Added a "general" hit location when new character is created and the game is using HPL to hold poison damage etc
- Moved Damage Bonus to show correctly in the derived stats area rather than the Combat Tab
- Characteristic Rolls added along with instructions
- Game settings added for Impossible rolls, Resistance rolls always having a 1% success/fail and detailed Resistance Roll results
- Specialised skills, where "specialism chosen" is toggled on will now have the specialism name shown first so it is more visible in the skill list

## 11.1.5
- Hits per location autocalculated
- Added Wounds which autoupdate hits (total and HPL)
- Added healing (treat wounds, natural healing, heal all wounds)
- Add HP adjustment to hit locations

## 11.1.4
- Updated item drop so base skill scores are automatically calculated
- Autocalc for Max HP, PP & FP added
- Added a Game Setting to allow characters to have enhanced HP
- Added a flat modifier to characters on Characteristics tab to increase HP (driven by superpowers)

## 11.1.3
- Corrected error in character.mjs pointing to wrong sheet in some operating systems.

## 11.1.2
- Corrected error in actor-itemDrop for adding skills to character sheet when a weapon is dropped (refencing skill1 instead of skill2)
- Added note in readme reminding users to "Keep Document ID" on importing from Compendia

## 11.1.1
- Initial Beta Release
