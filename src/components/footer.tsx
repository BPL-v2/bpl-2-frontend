import { DiscordFilled } from "@icons/discord";
import { GithubFilled } from "@icons/github";
import { TwitchFilled } from "@icons/twitch";
import { TwitterFilled } from "@icons/twitter";
import { YoutubeFilled } from "@icons/youtube";

export function Footer() {
  return (
    <footer className="footer sm:footer-horizontal bg-base-200 items-center p-4">
      <aside className="grid-flow-col items-center">
        <p>
          This product isn't affiliated with or endorsed by Grinding Gear Games
          in any way.
        </p>
      </aside>
      <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
        <a
          href="https://discord.com/invite/3weG9JACgb"
          target="_blank"
          className="cursor-pointer hover:text-primary"
        >
          <DiscordFilled className="h-6 w-6" />
        </a>
        <a
          href="https://github.com/Liberatorist/bpl-2"
          target="_blank"
          className="cursor-pointer hover:text-primary"
        >
          <GithubFilled className="h-6 w-6" />
        </a>
        <a
          href="https://www.twitch.tv/bpl_poe"
          target="_blank"
          className="cursor-pointer hover:text-primary"
        >
          <TwitchFilled className="h-6 w-6" />
        </a>
        <a
          href="https://www.youtube.com/@BPL-PoE"
          target="_blank"
          className="cursor-pointer hover:text-primary"
        >
          <YoutubeFilled className="h-6 w-6" />
        </a>
        <a
          href="https://x.com/BPL_PoE"
          target="_blank"
          className="cursor-pointer hover:text-primary"
        >
          <TwitterFilled className="h-6 w-6" />
        </a>
      </nav>
    </footer>
  );
}
