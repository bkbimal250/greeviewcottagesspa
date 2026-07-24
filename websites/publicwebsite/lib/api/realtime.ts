import { getBackendOrigin } from "@/lib/api/client";

export function getRealtimeUrl(path = "/ws/realtime/"): string {
  const origin = getBackendOrigin();
  const url = new URL(path, origin);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}
