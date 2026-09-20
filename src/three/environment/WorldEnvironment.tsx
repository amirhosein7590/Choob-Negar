"use client";

import { Environment, useEnvironment } from "@react-three/drei";
import { useEffect, useState } from "react";
import { ForestEnvironment } from "./ForestEnvironment";
import { WorkshopEnvironment } from "./WorkshopEnvironment";
import { isWorkshopWorld } from "./workshopTransition";
import { useScrollStore } from "@/store/scrollStore";

const FOREST_HDRI = "/hdri/forest_slope_1k.hdr";
const WORKSHOP_HDRI = "/hdri/workshop_1k.hdr";

const WORKSHOP_PRELOAD_THRESHOLD = 0.4;

/**
 * The environment for the current world.
 *
 * The workshop HDRI is only preloaded once the user has scrolled past the
 * midpoint of the cut chapter. Before that, loading it would waste 7 MB of
 * bandwidth and compete with the forest assets for the network. After that,
 * the load has the entire second half of the narrative to complete before
 * the workshop is needed.
 */
export function WorldEnvironment() {
  const [isWorkshop, setIsWorkshop] = useState(false);
  const [workshopReady, setWorkshopReady] = useState(false);

  useEffect(() => {
    const apply = (progress: number) => {
      setIsWorkshop(isWorkshopWorld(progress));
      if (!workshopReady && progress >= WORKSHOP_PRELOAD_THRESHOLD) {
        setWorkshopReady(true);
      }
    };
    apply(useScrollStore.getState().progress);
    return useScrollStore.subscribe((state) => state.progress, apply);
  }, [workshopReady]);

  return (
    <>
      <Environment
        key={isWorkshop ? "workshop" : "forest"}
        files={isWorkshop ? WORKSHOP_HDRI : FOREST_HDRI}
        background={false}
        environmentIntensity={isWorkshop ? 0.55 : 0.75}
        environmentRotation={isWorkshop ? [0, 0, 0] : [0, Math.PI * 0.3, 0]}
        resolution={256}
      />

      {isWorkshop ? <WorkshopEnvironment /> : <ForestEnvironment />}
    </>
  );
}

useEnvironment.preload({ files: [FOREST_HDRI] });

/**
 * Warms the workshop HDRI loader once the user is halfway through the cut
 * chapter. The preload only runs once because the threshold check is
 * state-guarded.
 */
export function WorkshopHDRIWarmer(): null {
  const [warm, setWarm] = useState(false);

  useEffect(() => {
    const apply = (progress: number) => {
      if (!warm && progress >= WORKSHOP_PRELOAD_THRESHOLD) {
        setWarm(true);
      }
    };
    apply(useScrollStore.getState().progress);
    return useScrollStore.subscribe((state) => state.progress, apply);
  }, [warm]);

  useEffect(() => {
    if (!warm) return;
    useEnvironment.preload({ files: [WORKSHOP_HDRI] });
  }, [warm]);

  return null;
}
