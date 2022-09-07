import * as TooltipPrimitive from "@radix-ui/react-tooltip";

type TooltipProps = {
  children: React.ReactNode;
  content: React.ReactNode;
  delayDuration?: number;
};

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  delayDuration,
  ...props
}) => {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root {...(delayDuration && { delayDuration })}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          className="px-2 py-1 rounded bg-black/75 text-white"
          {...props}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export default Tooltip;
