import React from "react";

type PointTranslation = {
  count: number;
  value: number;
};

export function pointsToGroup(points: number[]): PointTranslation[] {
  if (!points) {
    return [];
  }
  const groups: PointTranslation[] = [];
  let currentValue = points[0];
  let count = 0;

  for (const point of points) {
    if (point === currentValue) {
      count++;
    } else {
      groups.push({ value: currentValue, count });
      currentValue = point;
      count = 1;
    }
  }
  groups.push({ value: currentValue, count }); // Push the last group

  return groups;
}

export function renderStringWithUrl(string: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = string.match(urlRegex);
  if (urls) {
    urls.forEach((urlString) => {
      const url = new URL(urlString);
      string = string.replace(
        urlString,
        `<a class="link link-info" href="${urlString}" target="_blank">${url.hostname.replace("www.", "")}</a>`
      );
    });
  }
  return React.createElement("div", { dangerouslySetInnerHTML: { __html: string } });
}
