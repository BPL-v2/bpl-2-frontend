import { createFileRoute } from "@tanstack/react-router";
import { usePageSEO } from "@utils/use-seo";

export const Route = createFileRoute("/rules")({
  component: RulePage,
});

type CollapseItems = {
  label: string;
  children: React.ReactNode;
};
function RulePage() {
  usePageSEO("rules");
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
          Yes, actually you can! Just make sure to include your friend&apos;s
          PoE Account name in the signup form. If they do the same with you,
          you'll get sorted into the same team.
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

  // const itemStashCollapse: CollapseItems[] = [
  //   {
  //     label: "The stash tab must be public",
  //     children: <>This excludes guild stash tabs.</>,
  //   },
  //   {
  //     label: "The item must remain in the possession of the team",
  //     children: (
  //       <>
  //         It can remain in the stash of any team member until the end of the
  //         event, and it can be traded between players. Items worn by your
  //         character can also not be tracked.
  //       </>
  //     ),
  //   },
  //   {
  //     label: "Collection goals must be completed in a single stash tab",
  //     children: (
  //       <>
  //         To prevent exploitation, any objective that requires more than one
  //         item must be completed in a single stash tab and cannot be split
  //         across multiple player's tabs. For this reason it makes sense to trade
  //         these items to your team lead.
  //       </>
  //     ),
  //   },
  //   {
  //     label: "A dedicated tab for scoring items should be used",
  //     children: (
  //       <>
  //         There is a 5 minute delay before the item will show up for us. This
  //         timer will reset every time you change anything in the stash tab, so
  //         if you want something to show up asap for us, make sure have a
  //         dedicated stash tab that does not change too much.
  //       </>
  //     ),
  //   },
  // ];
  return (
    <article className="prose text-left p-4 max-w-full">
      <div className="divider divider-primary" id="gameplay">
        Gameplay Rules
      </div>
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
      {/* <div className="divider divider-primary" id="mods">
        Private League Modifiers
      </div>
      <p>The Private League will have the following modifiers:</p>
      <ul className="list font-bold text-base bg-base-200 rounded-lg my-2">
        <li className="list-row">Settlers</li>
        <li className="list-row">Alternative Ascendancies</li>
        <li className="list-row">Sentinel</li>
      </ul>
      <p>
        Due to the unbalanced nature of the alternative ascendancies, we will
        not impose any team restrictions on any of the ascendancies and you may
        choose to play any ascendancy you like.
      </p> */}

      {/* <div className="divider divider-primary" id="earning-points">
        Earning Points
      </div>
      <p>
        In BPL 17, three teams compete to earn as many points as possible in 3
        days. Compared to previous seasons items can be scored from anyones
        stash in the league - not just the team leads. There are some
        intricacies to scoring items that you should be aware of though:
      </p>
      <div className="flex flex-col gap-2 mt-4"> */}
      {/* {itemStashCollapse.map((rule, index) => (
          <div
            key={rule.label + index}
            tabIndex={index}
            className="bg-base-200 focus:bg-base-300 collapse"
          >
            <div className="collapse-title font-semibold">{rule.label}</div>
            <div className="collapse-content text-sm">{rule.children}</div>
          </div>
        ))} */}
      {/* </div> */}
      <div className="divider divider-primary" id="faq">
        Frequently Asked Questions
      </div>
      <div className="flex flex-col gap-2 mt-4">
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
    </article>
  );
}
