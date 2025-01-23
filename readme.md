# Scoring in BPL

Scoring happens in 3 seperate steps:

- matching (describes how a (partial) completion candidate is found)
- aggregation (aggregate these candidates into something that can be scored)
- scoring (determine if an aggregation satisfies an objective / how the teams are ranked according to each other)

## Matching step:

### Objective type:

This describes what how we are tracking this objective.

- **Item**:
  - Tracked via the public stash api.
  - Example: "First team to gather 500 Scrolls of Wisdom"
- **Player**:
  - Tracked via GGGs character api.
  - Example: "First team to have a lvl 95 player"
- **Submission**:
  - Tracked via website submissions (usually things that the api can't pick up on)
  - Example: "First team to kill the Maven"

### Conditions (only for objective type Item):

A list of conditions that describe when an Item satisfies an Objective.
A condition consists of 3 parts:

- **Field**: The attribute of an item that is examined
- **Value**: The value that the field should have for the condition to be satisfied
- **Operator**: The comparison operator to compare the field and the value

Example: "Find a corrupted ilvl 85+ Headhunter Belt"

- Condition 1 (field: name, operator: equals, value: Headhunter)
- Condition 2 (field: corrupted, operator: equals, value: true)
- Condition 3 (field: ilvl, operator: greater_than, value: 84)

### Attribute:

What quantity of an entity is tracked.
For items, this is usually the stack size, for players this can be things like LVL, XP, PANTHEON, ASCENDANCY_POINTS etc.

## Aggregation Step:

### Aggregation:

This describes how pick and combine the previously found matches.

- SUM_LATEST:
  - here we pick the latest match for each player and sum them up
    Example: "Find the sum of all player levels of a team":
    objective(type:player, attribute:lvl, aggregation:SUM_LATEST)
- EARLIEST:
  - here we pick the earliest match per team
    Example "Find the first player of each team who managed to delve below depth 300"
    objective(type:player, attribute:delve_depth, aggregation:EARLIEST, condition(field:delve_depth, operator: geq, value:300))
- MAXIMUM:
  - we pick the match with the highest associated value per team
    Example: "Find the team with the most wisdom scrolls on one player at any point in time"
    objective(type:item, attribute:stack_size, aggregation:MAXIMUM, condition(field:base_type, operator:equals, value:Scroll of Wisdom))
- MINIMUM:
  - we pick the match with the lowest associated value per team
    Example: "Find the team with the player who killed the Maven at the lowest possible character level solo"
    objective(type:submission, attribute:submission_value, aggregation:MINIMUM)
- EARLIEST_FRESH_ITEM:
  - this one is a bit more complicated since it depends on how we fetch items.
    as it stands we can not guarantee that if a team has an item, it wasn't traded with another team.
    so if an item is currently not in the posession of a team anymore, we might not want to give them points.
    this aggregation method looks for the earliest occurance of an item, but will also make sure that its still in the posession of the team before it counts.
    Example: "Find Echoforge"
    objective(type:item, aggregation:EARLIEST_FRESH_ITEM, condition(field:name, operator:equals, value:Echoforge))

### Required Number:

The quantity of the tracked attribute that is the threshold to satisfy the objective.
Example: "Find 50 players who've done their fourth ascendancy" - objective(type:player, attribute:fully_ascended, required_number:50)
