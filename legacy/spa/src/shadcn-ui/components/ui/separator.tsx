import React from "react";

type SeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
};

export const Separator: React.FC<SeparatorProps> = ({
  orientation = "horizontal",
  decorative = true,
  className = "",
  ...props
}) => {
  const orientationClass =
    orientation === "vertical" ? "h-full w-px" : "h-px w-full";

  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={`shrink-0 bg-border ${orientationClass} ${className}`}
      {...props}
    />
  );
};

export default Separator;
