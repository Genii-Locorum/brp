# CHANGELOG

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