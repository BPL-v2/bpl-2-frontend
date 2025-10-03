import { TwitchStream } from "@client/api";

export type TwitchStreamEmbedProps = {
  stream: TwitchStream;
  width?: number;
  height?: number;
};

export const TwitchStreamEmbed = ({
  stream,
  width = 640,
  height = 480,
}: TwitchStreamEmbedProps) => {
  return (
    <div
      className="overflow-hidden rounded-b-field bg-base-300"
      style={{ width: `${width}px`, minHeight: `${height + 60}px` }}
    >
      <div className="relative">
        {stream.thumbnail_url ? (
          <img
            src={stream.thumbnail_url
              .replace("{height}", String(height))
              .replace("{width}", String(width))}
            alt={stream.title}
          />
        ) : null}
        <div className="absolute top-2 left-2 rounded-md bg-red-600 px-2 text-sm font-bold text-white">
          LIVE
        </div>
        <div className="absolute bottom-2 left-2 rounded-lg bg-black/50 px-2 text-sm text-white">
          {stream.viewer_count} viewers
        </div>
      </div>
      <div className="ml-2 rounded-full text-left">
        <div className="rounded-full">
          <h1 className="text-lg font-bold">{stream.user_name}</h1>
          <p
            id="marquee"
            className="overflow-hidden overflow-ellipsis whitespace-nowrap"
          >
            <span className="my-1 inline-block">{stream.title}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
