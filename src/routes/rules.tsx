import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/rules")({
  component: RulePage,
});

type CollapseItems = {
  label: string;
  children: React.ReactNode;
};
export function RulePage() {
  const ruleCollapse: CollapseItems[] = [
    {
      label:
        "1. Do not play a character of a class that your team does not have access to.",
      children: (
        <>
          Teams are restricted to a set of classes. We have a system in place to
          find characters that are the wrong class for your team. You may create
          a character belonging to a different class for the purpose of
          acquiring a specific skill gem, but you may not ascend on that
          character, nor will it be eligible for level points. If it determined
          that you are playing on an unascended character of the wrong class for
          longer than necessary to acquire those gems, the case will be treated
          as though you are in violation of this rule.
        </>
      ),
    },
    {
      label:
        "2. Create your character of team's class options with the appropriate tag in the name.",
      children: (
        <>
          Each team has its own tag, related to the team&apos;s name. When you
          make your character, please ensure that your character name begins
          with the tag associated with your team. For example, if Badger were on
          team Malice, he would name his character MAL_Badger (or something
          along those lines). If you create a character with an incorrect tag
          with the intention of acquiring items from other teams, you will be
          discovered and banned.
        </>
      ),
    },
    {
      label: "3. Do not attack, harass, or excessively taunt other players.",
      children: (
        <>
          BPL is a welcoming space, and it is important to ensure that everyone
          is being treated with respect. This includes members of opposing
          teams. Friendly banter is of course fine, but there will be a
          1-warning system for over-the-line aggressiveness. Be a reasonable
          person. This is a cooperative event, and any attempts to scam other
          people will not be tolerated. If someone tries to scam you, please
          report it to the Command Team, with evidence if you have any, and it
          will be addressed immediately.
        </>
      ),
    },
    {
      label: "4. Do not play with or help members of opposing teams.",
      children: (
        <>
          Helping the other teams undermines the integrity of the event, and we
          cannot allow it to occur while keeping the event fair. Please refrain
          from playing with people from other teams, and do not give items away
          to people on other teams for free.
        </>
      ),
    },
    {
      label: "5. Do not share your account.",
      children: (
        <>
          As a reminder, account sharing is against GGG&apos;s Terms of Service
          and is strictly prohibited. If you are determined to be sharing an
          account in order to have that character online more often, you will be
          immediately banned from the event and reported to GGG staff.
        </>
      ),
    },
  ];

  const faqCollapse: CollapseItems[] = [
    {
      label: "Can I signup with my friend?",
      children: (
        <>
          Currently, you may not sign up explicitly with your friend. If they
          are on a different team, we ask you to follow the rules above and not
          play or collude with any individuals of other teams.
        </>
      ),
    },
    {
      label: "Can I make a character of another class to get a starting skill?",
      children: (
        <>
          Yes, though points acquired by characters of classes and ascendencies
          you are not assigned to will not count for your team.
        </>
      ),
    },
    {
      label: "Can I sign-up for a specific team?",
      children: (
        <>
          The nature of this event is to randomly assign players to get them
          into different gameplay and group play than they normally would.
          Embrace the RNG and improvise with your new teammates (and hopefully
          friends) to achieve victory. The sort is (with few exceptions) is
          random, and we try our best to make balanced teams.
        </>
      ),
    },
  ];

  return (
    <div className="text-left">
      <div className="divider divider-primary">Gameplay Rules</div>
      <p>
        Below are the major rules you should follow when playing in BPL. If
        there is a discrepancy between the information listed here and in the
        rules channel on Discord - the Discord one is correct.
      </p>
      <div className="flex flex-col gap-2 mt-4">
        {ruleCollapse.map((rule, index) => (
          <div
            key={rule.label + index}
            tabIndex={index}
            className="bg-base-200 focus:bg-base-300 collapse"
          >
            <div className="collapse-title font-semibold">{rule.label}</div>
            <div className="collapse-content text-sm">{rule.children}</div>
          </div>
        ))}
      </div>
      <div className="divider divider-primary">Earning Points</div>
      <p>
        In BPL 15.5, One team that attempts to 100% complete BPL in 7 days.
        Dailies, bounty board, and collection goals have been adjusted to
        compensate. In categories that require you to submit an item, only items
        in team lead's stashes count.
      </p>
      <p>
        The follow private league mods have been enabled: "Monsters fire 2
        additional projectiles" and "Monsters have 35% increased area of effect"
      </p>
      <div className="divider divider-primary">Frequently Asked Questions</div>
      <div className="flex flex-col gap-1 mt-4">
        {faqCollapse.map((faq, index) => (
          <div
            key={faq.label + index}
            tabIndex={index}
            className="bg-base-200 focus:bg-base-300 collapse"
          >
            <div className="collapse-title font-semibold">{faq.label}</div>
            <div className="collapse-content text-sm">{faq.children}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
