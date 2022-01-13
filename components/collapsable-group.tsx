import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";
export const CollapsableGroup = ({
  label,
  children,
}: {
  label: string;
  children?: any;
}) => {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <h2>
        {label} <Collapsible.Trigger>{open ? "-" : "+"}</Collapsible.Trigger>
      </h2>
      {children}
    </Collapsible.Root>
  );
};

export default CollapsableGroup;
