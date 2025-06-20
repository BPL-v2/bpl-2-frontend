import React, { CSSProperties } from "react";
import { getEmbedUrl, getThumbnailUrl } from "@utils/video-utils";
import { PlayCircleIcon } from "@heroicons/react/24/outline";
import { YoutubeFilled } from "@icons/youtube";
import { TwitchFilled } from "@icons/twitch";
export interface VideoEmbedProps {
  url: string;
  title?: string;
  style?: CSSProperties;
}
function getIcon(url: string): React.ReactNode {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (_) {
    return;
  }

  if (parsedUrl.hostname === "www.youtube.com") {
    return <YoutubeFilled className="h-16 w-16" brandColor />;
  } else if (parsedUrl.hostname === "youtu.be") {
    return <YoutubeFilled className="h-16 w-16" brandColor />;
  } else if (parsedUrl.hostname === "www.twitch.tv") {
    return <TwitchFilled className="h-16 w-16" brandColor />;
  }
  return;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = (
  props: VideoEmbedProps
) => {
  const { title, url, style } = props;
  const [isOpened, setIsOpened] = React.useState(false);
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | undefined>(
    undefined
  );
  const embedUrl = getEmbedUrl(url);

  React.useEffect(() => {
    if (!embedUrl) {
      return;
    }
    getThumbnailUrl(url, undefined).then(setThumbnailUrl);
  }, [embedUrl, url]);

  if (!embedUrl) {
    return <></>;
  }

  const icon = getIcon(url);

  if (isOpened) {
    return (
      <iframe
        style={{ border: "none", userSelect: "none", ...style }}
        width={"100%"}
        height={"100%"}
        src={embedUrl.toString()}
        title="Video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    );
  }

  return (
    <>
      <div
        style={{
          position: "relative",
          backgroundColor: "black",
          backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : thumbnailUrl,
          backgroundPosition: "center center",
          backgroundSize: "cover",
          cursor: "pointer",
          border: "none",
          userSelect: "none",
          width: "100%",
          height: "100%",

          ...style,
        }}
        onClick={() => {
          setIsOpened(true);
        }}
      >
        {title && (
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%" }}>
            {title}
          </div>
        )}
        <button
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          aria-label="Play"
        >
          {!icon ? <PlayCircleIcon className="h-6 w-6" /> : icon}
        </button>
      </div>
    </>
  );
};
