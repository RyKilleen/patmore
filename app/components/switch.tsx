import * as RadixSwitch from "@radix-ui/react-switch";
import { styled } from "~/utils/stitches.config";

export const Switch = styled(RadixSwitch.Root, {
  $$checkedColor: "black",
  $$backgroundColor: "grey",

  all: "unset",
  width: 42,
  height: 25,
  backgroundColor: "$$backgroundColor",
  borderRadius: "9999px",
  position: "relative",
  boxShadow: `0 2px 10px grey`,
  WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
  "&:focus": { boxShadow: `0 0 0 2px black` },
  '&[data-state="checked"]': { backgroundColor: "$$checkedColor" },
});

export const Thumb = styled(RadixSwitch.Thumb, {
  display: "block",
  width: 21,
  height: 21,
  backgroundColor: "white",
  borderRadius: "9999px",
  boxShadow: `0 2px 2px grey`,
  transition: "transform 100ms",
  transform: "translateX(2px)",
  willChange: "transform",
  '&[data-state="checked"]': { transform: "translateX(19px)" },
});

export default Switch;
