import * as Checkbox from "@radix-ui/react-checkbox";

import { styled } from "~/utils/stitches.config";
export const Tag = styled(Checkbox.Root, {
  all: "unset",
  padding: "6px",
  border: "1px solid black",
  borderRadius: "8px",
  "&[data-state='checked']": {
    color: "white",
    background: "black",
  },
  "&[data-state='unchecked']": {
    color: "black",
    background: "#c3c3c3",
  },
});
export const ButtonContainer = styled("div", {
  display: "flex",
  [`& ${Tag}`]: {
    marginRight: "4px",
  },
});
