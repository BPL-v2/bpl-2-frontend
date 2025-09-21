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
      className="overflow-hidden bg-base-300 rounded-b-field"
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
        <div className="absolute top-2 left-2 bg-red-600 text-white rounded-md px-2 font-bold text-sm">
          LIVE
        </div>
        <div className="absolute bottom-2 left-2 bg-black/50 text-white rounded-lg px-2 text-sm">
          {stream.viewer_count} viewers
        </div>
      </div>
      <div className="text-left rounded-full ml-2">
        <div className="rounded-full">
          <h1 className="font-bold text-lg">{stream.user_name}</h1>
          <p
            id="marquee"
            className="overflow-hidden overflow-ellipsis whitespace-nowrap"
          >
            <span className="inline-block my-1">{stream.title}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
