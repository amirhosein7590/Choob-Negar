import { ScrollDriver } from "@/features/scroll/ScrollDriver";
import { StoryLayout } from "@/components/templates/StoryLayout";
import { LoadingVeil } from "@/components/molecules/LoadingVeil";
import { WorldTransitionVeil } from "@/components/molecules/WorldTransitionVeil";
import { LatheToBowlVeil } from "@/components/molecules/LatheToBowlVeil";
import { DynamicScene } from "@/components/three/DynamicScene";

export default function HomePage() {
  return (
    <>
      <ScrollDriver />
      <DynamicScene />
      <StoryLayout />
      <WorldTransitionVeil />
      <LatheToBowlVeil />
      <LoadingVeil />
    </>
  );
}
