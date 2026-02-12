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
    <span>
      {actualGoldMedals > 0 && `${actualGoldMedals}🥇`}
      {actualSilverMedals > 0 && ` ${actualSilverMedals}🥈`}
      {actualBronzeMedals > 0 && ` ${actualBronzeMedals}🥉`}
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
