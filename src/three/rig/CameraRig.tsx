"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { sampleCamera } from "@/three/utils/cameraPath";
import { useScrollStore } from "@/store/scrollStore";

const EPSILON = 1e-4;

export function CameraRig(): null {
  const camera = useThree((state) => state.camera);
  const lookAt = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    camera.up.set(0, 1, 0);
  }, [camera]);

  useFrame(() => {
    const progress = useScrollStore.getState().progress;
    const sample = sampleCamera(progress);

    const [px, py, pz] = sample.position;
    const [tx, ty, tz] = sample.target;

    if (
      !Number.isFinite(px) ||
      !Number.isFinite(py) ||
      !Number.isFinite(pz) ||
      !Number.isFinite(tx) ||
      !Number.isFinite(ty) ||
      !Number.isFinite(tz) ||
      !Number.isFinite(sample.fov)
    ) {
      return;
    }

    camera.position.set(px, py, pz);
    lookAt.set(tx, ty, tz);
    camera.lookAt(lookAt);

    if (
      camera instanceof THREE.PerspectiveCamera &&
      Math.abs(camera.fov - sample.fov) > 1e-3
    ) {
      camera.fov = sample.fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
