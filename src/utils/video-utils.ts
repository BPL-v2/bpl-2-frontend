export function getEmbedUrl(url: string): URL | undefined {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return;
  }
  let embedUrl: URL | undefined;

  if (parsedUrl.hostname === "www.youtube.com") {
    const videoId = parsedUrl.searchParams.get("v");
    const timeStamp = parsedUrl.searchParams.get("t");
    embedUrl = new URL("https://www.youtube.com");
    embedUrl.pathname = "embed/" + videoId;
    embedUrl.searchParams.append("autoplay", "1");
    if (timeStamp) {
      embedUrl.searchParams.append("start", timeStamp);
    }
  } else if (parsedUrl.hostname === "youtu.be") {
    const videoId = parsedUrl.pathname;
    const timeStamp = parsedUrl.searchParams.get("t");
    embedUrl = new URL("https://www.youtube.com/");
    embedUrl.pathname = "embed" + videoId;
    embedUrl.searchParams.append("autoplay", "1");
    if (timeStamp) {
      embedUrl.searchParams.append("start", timeStamp);
    }
  } else if (parsedUrl.hostname === "www.twitch.tv") {
    const pathsParts = parsedUrl.pathname.split("/");
    if (pathsParts[1] === "videos") {
      embedUrl = new URL("https://player.twitch.tv");
      embedUrl.searchParams.append("video", pathsParts[2]);
    } else if (pathsParts[2] === "clip") {
      embedUrl = new URL("https://clips.twitch.tv/embed");
      embedUrl.searchParams.append("clip", pathsParts[3]);
    } else {
      console.log("Unknown twitch url", parsedUrl);
      return;
    }
    embedUrl.searchParams.append("parent", "bpl-poe.com");
    embedUrl.searchParams.append("parent", "localhost");
    embedUrl.searchParams.append("autoplay", "true");
    const timeStamp = parsedUrl.searchParams.get("t");
    if (timeStamp) {
      embedUrl.searchParams.append("time", timeStamp);
    }
  }
  return embedUrl;
}

export async function getThumbnailUrl(
  url: string,
  twitchToken: string | undefined
): Promise<string | undefined> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return;
  }
  if (parsedUrl.hostname === "www.youtube.com") {
    const videoId = parsedUrl.searchParams.get("v");
    return "https://img.youtube.com/vi/" + videoId + "/0.jpg";
  } else if (parsedUrl.hostname === "youtu.be") {
    const videoId = parsedUrl.pathname;
    return "https://img.youtube.com/vi" + videoId + "/0.jpg";
  } else if (parsedUrl.hostname === "www.twitch.tv") {
    const apiUrl = new URL("https://api.twitch.tv");
    const pathsParts = parsedUrl.pathname.split("/");
    if (pathsParts[1] === "videos") {
      apiUrl.pathname = "/helix/videos";
      apiUrl.searchParams.append("id", pathsParts[2]);
    } else if (pathsParts[2] === "clip") {
      apiUrl.pathname = "/helix/clips";
      apiUrl.searchParams.append("id", pathsParts[3]);
    }
    const headers = {
      "Client-ID": "iu65ia9dsqi0ssdnk3gkolmt5uvz1v",
      Authorization: "Bearer " + twitchToken,
    };
    return fetch(apiUrl, { headers: headers })
      .then((res) => res.json())
      .then((json: { data: { thumbnail_url: string }[] }) => {
        if (json.data.length === 0) {
          return;
        }
        return json.data[0].thumbnail_url
          .replace("%{width}", "640")
          .replace("%{height}", "480");
      });
  }
  return;
}
