import { ScoringMethod } from "@client/api";
import { ScoreObjective } from "@mytypes/score";

function convertRacePointsToText(points: number[]) {
  const textParts = points.map((point, index) => {
    if (index === 0) {
      return (
        <span key={index}>
          The first team to collect all items will be awarded{" "}
          <b className="text-info">{point}</b> points
        </span>
      );
    } else if (index === points.length - 1) {
      return (
        <span key={index}>
          {" "}
          and the remaining teams <b className="text-info">{point}</b> points.
        </span>
      );
    } else {
      return (
        <span key={index}>
          {" "}
          the next team will get <b className="text-info">{point}</b> points
        </span>
      );
    }
  });
  return textParts;
}

function convertBonusPointsToText(points: number[]) {
  if (points.length === 1) {
    return (
      <span>
        All items collected will be awarded{" "}
        <b className="text-info">{points[0]}</b> points.
      </span>
    );
  }
  let current_points = points[0];
  let current_count = 1;
  const out = [];
  for (let i = 1; i < points.length; i++) {
    if (points[i] === current_points) {
      current_count++;
    } else {
      out.push({ points: current_points, number: current_count });
      current_points = points[i];
      current_count = 1;
    }
  }
  out.push({ points: current_points, number: current_count });
  const out_text = [
    <span>
      The first {out[0].number} items will be awarded{" "}
      <b className="text-info">{out[0].points}</b> points.{" "}
    </span>,
  ];
  for (let i = 1; i < out.length - 1; i++) {
    out_text.push(
      <span>
        The next {out[i].number} items will be awarded{" "}
        <b className="text-info">{out[i].points}</b> points.{" "}
      </span>,
    );
  }
  out_text.push(
    <span>
      The remaining items will be awarded{" "}
      <b className="text-info">{out[out.length - 1].points}</b> points.
    </span>,
  );
  return out_text;
}

function getRacePointsRules(category: ScoreObjective) {
  const preset = category?.scoring_presets[0];
  if (!preset)
    return (
      <p>Finishing this category first does not award additional points.</p>
    );
  if (preset.scoring_method === ScoringMethod.RANKED_COMPLETION_TIME) {
    return <p> {convertRacePointsToText(preset.points)}</p>;
  }
  if (preset.scoring_method === ScoringMethod.BONUS_PER_COMPLETION) {
    return <p> {convertBonusPointsToText(preset.points)}</p>;
  }
  return null;
}

function getItemPointsRules(category: ScoreObjective) {
  const preset = category?.children?.[0]?.scoring_presets[0];
  if (!preset) return null;
  if (preset.points.length === 1 && preset.points[0] === 0) {
    return null;
  }
  if (preset.scoring_method === ScoringMethod.PRESENCE) {
    return (
      <p>
        Every item collected will award{" "}
        <b className="text-info">{preset.points[0]}</b> points.
      </p>
    );
  }
}

export function getPointRules(category: ScoreObjective) {
  return (
    <>
      <h3>{category.name}</h3>
      {getRacePointsRules(category)}
      {getItemPointsRules(category)}
    </>
  );
}
