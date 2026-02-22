export function renderScore(
  actualNumberOfPoints: number,
  potentialNumberOfPoints?: number,
  usesMedals: boolean = false,
) {
  if (!usesMedals) {
    if (potentialNumberOfPoints === undefined) {
      return actualNumberOfPoints;
    }
    return `${actualNumberOfPoints} / ${potentialNumberOfPoints}`;
  }
  const actualGoldMedals = Math.floor(actualNumberOfPoints / 10000) || 0;
  const actualSilverMedals =
    Math.floor((actualNumberOfPoints % 10000) / 100) || 0;
  const actualBronzeMedals = Math.floor(actualNumberOfPoints % 100) || 0;
  return (
    <span className="inline-flex flex-wrap">
      {actualGoldMedals > 0 && (
        <span className="whitespace-nowrap">{actualGoldMedals}🥇</span>
      )}
      {actualSilverMedals > 0 && (
        <span className="whitespace-nowrap">{actualSilverMedals}🥈</span>
      )}

      {actualBronzeMedals > 0 && (
        <span className="whitespace-nowrap">{actualBronzeMedals}🥉</span>
      )}
    </span>
  );
  // const potentialGoldMedals = Math.floor(potentialNumberOfPoints / 10000) || 0;
  // const potentialSilverMedals =
  //   Math.floor((potentialNumberOfPoints % 10000) / 100) || 0;
  // const potentialBronzeMedals = Math.floor(potentialNumberOfPoints % 100) || 0;
  // return (
  //   <span className="flex flex-col gap-1">
  //     {potentialGoldMedals > 0 && (
  //       <span>
  //         {actualGoldMedals}/{potentialGoldMedals}🥇
  //       </span>
  //     )}
  //     {potentialSilverMedals > 0 && (
  //       <span>
  //         {actualSilverMedals}/{potentialSilverMedals}🥈
  //       </span>
  //     )}
  //     {potentialBronzeMedals > 0 && (
  //       <span>
  //         {actualBronzeMedals}/{potentialBronzeMedals}🥉
  //       </span>
  //     )}
  //   </span>
  // );
}
