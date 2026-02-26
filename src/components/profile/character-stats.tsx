import { useDeletePoB, useGetEvents, useGetUser } from "@client/query";
import { AscendancyPortrait } from "@components/character/ascendancy-portrait";
import {
  ClipboardDocumentListIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";
import { PathOfBuilding } from "@utils/pob";
import { isAdmin } from "@utils/token";
import { useState } from "react";

export function CharacterStats({
  pob,
  userId,
  characterId,
  pobId,
  eventId,
}: {
  pob: PathOfBuilding;
  userId: number;
  characterId: string;
  pobId: number;
  eventId: number;
}) {
  const qc = useQueryClient();
  const { deletePoB } = useDeletePoB(qc);
  const { events } = useGetEvents();
  const { user } = useGetUser();
  const [showEhpTooltip, setShowEhpTooltip] = useState(false);
  const event = events?.find((e) => e.id === eventId);
  const characterClass =
    pob.build.ascendClassName != "None"
      ? pob.build.ascendClassName
      : pob.build.className;
  const highestDps = Math.max(
    pob.build.playerStats.combinedDPS || 0,
    pob.build.playerStats.cullingDPS || 0,
    pob.build.playerStats.fullDPS || 0,
    pob.build.playerStats.fullDotDPS || 0,
    pob.build.playerStats.fullDotDPS || 0,
    pob.build.playerStats.totalDPS || 0,
    pob.build.playerStats.totalDot || 0,
    pob.build.playerStats.totalDotDPS || 0,
    pob.build.playerStats.withBleedDPS || 0,
    pob.build.playerStats.withIgniteDPS || 0,
    pob.build.playerStats.withPoisonDPS || 0,
  );
  return (
    <div className="flex w-full flex-row justify-between gap-3 rounded-box bg-base-300 p-4 md:p-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center justify-between">
          <div className="mb-1 flex items-center gap-4 text-xl">
            <AscendancyPortrait
              character_class={characterClass}
              className="size-14 rounded-full object-cover"
            />
            <h1>
              Level {pob.build.level}{" "}
              {
                pob.skills.skillSets[0].skills[
                  pob.build.mainSocketGroup - 1
                ]?.gems.find((gem) => !gem.variantId.includes("Support"))
                  ?.nameSpec
              }{" "}
              {characterClass}
            </h1>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="justify-left flex flex-row flex-wrap gap-2">
            <div>
              Life:{" "}
              <span className="text-health">
                {pob.build.playerStats.life.toLocaleString()}
              </span>
            </div>
            {pob.build.playerStats.energyShield > 0 && (
              <div>
                ES:{" "}
                <span className="text-energy-shield">
                  {pob.build.playerStats.energyShield.toLocaleString()}
                </span>
              </div>
            )}
            {pob.build.playerStats.mana > 0 && (
              <div>
                Mana:{" "}
                <span className="text-mana">
                  {pob.build.playerStats.mana.toLocaleString()}
                </span>
              </div>
            )}
            <div
              className="relative"
              onMouseEnter={() => setShowEhpTooltip(true)}
              onMouseLeave={() => setShowEhpTooltip(false)}
            >
              <span title="Total effective Health Pool">eHP: </span>
              <span className="underline decoration-dotted">
                {Math.round(pob.build.playerStats.totalEHP).toLocaleString()}
              </span>
              {showEhpTooltip && (
                <div className="pointer-events-none absolute top-full left-1/2 z-30 mt-2 w-60 -translate-x-1/2">
                  <div className="rounded-box bg-base-100 px-4 py-2 text-sm whitespace-pre-line shadow-lg">
                    <div>
                      <span>Physical Max Hit: </span>
                      <span className="">
                        {pob.build.playerStats.physicalMaximumHitTaken.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span>Fire Max Hit: </span>
                      <span className="text-fire">
                        {pob.build.playerStats.fireMaximumHitTaken.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span>Cold Max Hit: </span>
                      <span className="text-cold">
                        {pob.build.playerStats.coldMaximumHitTaken.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span>Lightning Max Hit: </span>
                      <span className="text-lightning">
                        {pob.build.playerStats.lightningMaximumHitTaken.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span>Chaos Max Hit: </span>
                      <span className="text-chaos">
                        {pob.build.playerStats.chaosMaximumHitTaken.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {(pob.build.playerStats.effectiveBlockChance > 20 ||
              pob.build.playerStats.effectiveBlockChance > 20) && (
              <div>
                Block:{" "}
                <span className="text-highlight-content">
                  <span title="Attack Block">
                    {" "}
                    {Math.round(pob.build.playerStats.effectiveBlockChance)}%
                  </span>
                  /
                  <span title="Spell Block">
                    {" "}
                    {Math.round(
                      pob.build.playerStats.effectiveSpellBlockChance,
                    )}
                    %
                  </span>
                </span>
              </div>
            )}
            {pob.build.playerStats.effectiveSpellSuppressionChance > 25 && (
              <div>
                Suppression:{" "}
                <span className="text-highlight-content">
                  {Math.round(
                    pob.build.playerStats.effectiveSpellSuppressionChance,
                  )}
                  %
                </span>
              </div>
            )}
          </div>
          <div className="justify-left flex flex-row flex-wrap gap-2">
            <div>
              Resistances:{" "}
              <span className="text-fire">
                {pob.build.playerStats.fireResist.toLocaleString()}%
              </span>
              /
              <span className="text-cold">
                {pob.build.playerStats.coldResist.toLocaleString()}%
              </span>
              /
              <span className="text-lightning">
                {pob.build.playerStats.lightningResist.toLocaleString()}%
              </span>
              /
              <span className="text-chaos">
                {pob.build.playerStats.chaosResist.toLocaleString()}%
              </span>
            </div>
            {pob.build.playerStats.armour > 0 &&
              pob.build.playerStats.physicalDamageReduction > 5 && (
                <div>
                  Armour:{" "}
                  <span className="text-highlight-content">
                    {pob.build.playerStats.armour.toLocaleString()}
                  </span>
                </div>
              )}
            {pob.build.playerStats.meleeEvadeChance > 5 && (
              <div>
                Evasion:{" "}
                <span className="text-highlight-content">
                  {pob.build.playerStats.evasion.toLocaleString()}
                </span>
              </div>
            )}
            {pob.build.playerStats.ward > 200 && (
              <div>
                Ward:{" "}
                <span className="text-highlight-content">
                  {pob.build.playerStats.ward.toLocaleString()}
                </span>
              </div>
            )}{" "}
          </div>
          <div className="flex flex-row gap-2">
            <div>
              DPS:{" "}
              <span className="text-highlight-content">
                {Math.round(highestDps).toLocaleString()}
              </span>
            </div>
            <div>
              Speed:{" "}
              <span className="text-highlight-content">
                {pob.build.playerStats.speed?.toFixed(2)}
              </span>
            </div>
            {pob.build.playerStats.critMultiplier > 1.6 && (
              <>
                <div>
                  Crit Chance:{" "}
                  <span className="text-highlight-content">
                    {pob.build.playerStats.critChance
                      ?.toFixed(2)
                      .toLocaleString()}
                    %
                  </span>
                </div>
                <div>
                  Crit Multi:{" "}
                  <span className="text-highlight-content">
                    {pob.build.playerStats.critMultiplier?.toFixed(2)}
                  </span>
                </div>
              </>
            )}
            {pob.build.playerStats.effectiveMovementSpeedMod > 2 && (
              <div>
                Movement Speed:{" "}
                <span className="text-highlight-content">
                  {Math.round(
                    pob.build.playerStats.effectiveMovementSpeedMod * 100,
                  )}
                  %
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-start gap-4 py-2">
        <div
          className="tooltip tooltip-top tooltip-primary"
          data-tip="Copy this snapshot to clipboard"
        >
          <ClipboardDocumentListIcon
            className="size-8 cursor-pointer transition-transform duration-100 select-none hover:text-primary active:scale-110 active:text-secondary"
            onClick={() => {
              if (pob.export) navigator.clipboard.writeText(pob.export);
            }}
          />
        </div>
        {event &&
          new Date(event.event_end_time) < new Date() &&
          (user?.id === userId || isAdmin()) && (
            <div
              className="tooltip tooltip-bottom tooltip-error"
              data-tip="Delete this snapshot"
            >
              <TrashIcon
                className="size-8 cursor-pointer transition-transform duration-100 select-none hover:text-error active:scale-110 active:text-secondary"
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to delete this Path of Building? This action cannot be undone.",
                    )
                  ) {
                    deletePoB({ userId, characterId, pobId });
                  }
                }}
              />
            </div>
          )}
      </div>
    </div>
  );
}
