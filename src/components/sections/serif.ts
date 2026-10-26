import type { CSSProperties } from "react";

// Editorial serif used for big headlines (matches the reference).
// Falls back to Georgia until you wire up a next/font serif (see notes).
export const SERIF: CSSProperties = {
  fontFamily: "var(--font-serif, Georgia, 'Times New Roman', serif)",
};