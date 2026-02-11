import { Perf } from "r3f-perf";
import { useEffect, useState } from "react";

export function PerfOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.code === "KeyP" && event.shiftKey) {
        setVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!visible) return null;

  return <Perf position="top-left" minimal />;
}
