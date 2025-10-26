// Portions of this file are derived from pasteofexile (https://github.com/Dav1dde/pasteofexile)
// Licensed under GNU AGPL v3.0: https://www.gnu.org/licenses/agpl-3.0.html
// Copyright (c) Dav1dde and contributors
import { ArrowsPointingInIcon } from "@heroicons/react/24/outline";
import { decodePoBExport } from "@utils/pob";
import { useMemo, useState } from "react";
import Tree from "./tree";
import { CharacterItems } from "./character-items";
import { CharacterSkills } from "./character-skills";
import { CharacterStats } from "./character-stats";

type Props = {
  pobString?: string;
};

export function PoB({ pobString }: Props) {
  const [treeExpanded, setTreeExpanded] = useState(false);
  const pob = useMemo(() => decodePoBExport(pobString), [pobString]);
  const passiveTree = useMemo(() => {
    if (!pob.spec.nodes) return null;
    return (
      <Tree
        version={pob.spec.treeVersion}
        nodes={pob.spec.nodes}
        type="passives"
        ascendancy={pob.build.ascendClassName}
        children=" "
        tooltip={treeExpanded}
        showUnallocated={true}
      />
    );
  }, [pob.spec.nodes, pob.build.ascendClassName, treeExpanded]);
  if (!pobString) {
    return null;
  }
  return (
    <div className="flex flex-col gap-4">
      {treeExpanded && (
        <div className="relative w-full rounded-box bg-base-300 p-4">
          {passiveTree}
          <ArrowsPointingInIcon
            className="absolute top-2 right-2 size-8 cursor-pointer rounded-full border-2 border-base-content p-1 hover:border-info hover:text-info"
            onClick={() => setTreeExpanded(false)}
          />
        </div>
      )}
      <div className="flex min-h-170 flex-col gap-4 text-left lg:flex-row">
        <CharacterItems pob={pob} />
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-row gap-4">
            {!treeExpanded && (
              <div
                onClick={() => setTreeExpanded(true)}
                className="w-[40%] cursor-zoom-in rounded-box bg-base-300"
              >
                {passiveTree}
              </div>
            )}
            <CharacterStats pob={pob} />
          </div>
          <CharacterSkills pob={pob} />
        </div>
      </div>
    </div>
  );
}
