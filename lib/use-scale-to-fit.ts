"use client";

import { useLayoutEffect, useRef, useState } from "react";

// Measures the natural height of `contentRef` against the available height of
// `boxRef` and returns a scale factor (<=1) so callers can shrink content to
// fit exactly — used to keep book pages from ever cropping or scrolling.
export function useScaleToFit(deps: unknown[]) {
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const content = contentRef.current;
    if (!box || !content) return;

    function recalc() {
      if (!box || !content) return;
      const availableHeight = box.clientHeight;
      const naturalHeight = content.scrollHeight;
      if (availableHeight <= 0 || naturalHeight <= 0) return;
      setScale(Math.min(1, availableHeight / naturalHeight));
    }

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(box);
    observer.observe(content);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { boxRef, contentRef, scale };
}
