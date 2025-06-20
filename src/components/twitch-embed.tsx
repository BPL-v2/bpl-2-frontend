import React, { useEffect, useRef, useState } from "react";

interface TwitchEmbedProps {
  channel: string;
  width?: number;
  height?: number;
  parent?: string[];
}

const TwitchEmbed: React.FC<TwitchEmbedProps> = ({
  channel,
  parent = ["bpl-poe.com"],
  // parent = ["localhost"],
}) => {
  const embedRef = useRef<HTMLDivElement>(null);
  const embedInstanceRef = useRef<any>(null); // eslint-disable-line
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  useEffect(() => {
    // Function to calculate dimensions based on the viewport width
    const calculateDimensions = () => {
      const width = Math.min(1440, window.innerWidth); // Full view width
      const height = (width * 3) / 6; // Enforce 4:3 aspect ratio
      setDimensions({ width, height });
    };

    // Calculate dimensions on mount and on window resize
    calculateDimensions();
    window.addEventListener("resize", calculateDimensions);

    return () => {
      window.removeEventListener("resize", calculateDimensions);
    };
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) {
      return;
    }
    // Dynamically load the Twitch Embed script
    const script = document.createElement("script");
    script.src = "https://embed.twitch.tv/embed/v1.js";
    script.async = true;
    script.onload = () => {
      // @ts-ignore: window.Twitch existst if the script is loaded
      if (window.Twitch && embedRef.current) {
        // Initialize the Twitch Embed instance only if it doesn't already exist
        if (!embedInstanceRef.current) {
          // @ts-ignore: window.Twitch existst if the script is loaded
          embedInstanceRef.current = new window.Twitch.Embed(
            embedRef.current.id,
            {
              width: dimensions.width,
              height: dimensions.height,
              channel,
              parent,
            }
          );
        } else {
          // Update the channel if the instance already exists
          embedInstanceRef.current.setChannel(channel);
        }
      }
    };
    document.body.appendChild(script);

    // Cleanup script on unmount
    return () => {
      document.body.removeChild(script);
    };
  }, [channel, dimensions, parent]);

  return <div id="twitch-embed" ref={embedRef}></div>;
};

export default TwitchEmbed;
