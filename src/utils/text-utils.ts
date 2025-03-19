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
