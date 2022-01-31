import { createStitches } from "@stitches/react";
import type * as Stitches from "@stitches/react";

export const { css, styled, config, getCssText } = createStitches();
type CSS = Stitches.CSS<typeof config>;
