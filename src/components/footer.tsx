import { DiscordFilled } from "@icons/discord";
import { GithubFilled } from "@icons/github";
import { TwitchFilled } from "@icons/twitch";
import { TwitterFilled } from "@icons/twitter";
import { YoutubeFilled } from "@icons/youtube";

export function Footer() {
  return (
    <footer className="footer items-center rounded-t-box bg-base-300 p-4 shadow-xl sm:footer-horizontal">
      <aside className="grid-flow-col items-center">
        <p>
          This product isn't affiliated with or endorsed by Grinding Gear Games
          in any way.
        </p>
      </aside>
      <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
        <a
          aria-label="Discord"
          href="https://discord.com/invite/3weG9JACgb"
          target="_blank"
          className="cursor-pointer hover:text-primary"
        >
          <DiscordFilled className="size-6" />
        </a>
        <a
          aria-label="GitHub"
          href="https://github.com/orgs/BPL-v2/repositories"
          target="_blank"
          className="cursor-pointer hover:text-primary"
        >
          <GithubFilled className="size-6" />
        </a>
        <a
          aria-label="Twitch"
          href="https://www.twitch.tv/bpl_poe"
          target="_blank"
          className="cursor-pointer hover:text-primary"
        >
          <TwitchFilled className="size-6" />
        </a>
        <a
          aria-label="YouTube"
          href="https://www.youtube.com/@BPL-PoE"
          target="_blank"
          className="cursor-pointer hover:text-primary"
        >
          <YoutubeFilled className="size-6" />
        </a>
        <a
          aria-label="Twitter"
          href="https://x.com/BPL_PoE"
          target="_blank"
          className="cursor-pointer hover:text-primary"
        >
          <TwitterFilled className="size-6" />
        </a>
      </nav>
    </footer>
  );
}
