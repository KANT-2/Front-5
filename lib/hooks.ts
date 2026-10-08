import { useSyncExternalStore } from "react";
import { reducedMotionStore } from "./local-store";

export function useReducedMotion(): boolean {
  return useSyncExternalStore(reducedMotionStore.subscribe, reducedMotionStore.getSnapshot, reducedMotionStore.getServerSnapshot);
}
