import { memo } from "react";
import Image from "next/image";
import { getIconPath } from "@/utils";

interface Props {
  name: string;
}

/* Pure Component */
const Icon: React.FC<Props> = ({ name }) => {
  return (
    <Image
      src={getIconPath(`${name}.png`)}
      alt={name}
      fill
      style={{ objectFit: "contain" }}
    />
  );
};

export default memo(Icon);
