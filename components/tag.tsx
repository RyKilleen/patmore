import { styled } from "@stitches/react";
export const Tag = styled("button", {
  all: "unset",
  padding: "6px",
  border: "1px solid black",
  borderRadius: "8px",
  variants: {
    selected: {
      true: {
        color: "white",
        background: "black",
      },
      false: {
        color: "black",
        background: "#c3c3c3",
      },
    },
  },
});

export default Tag;
