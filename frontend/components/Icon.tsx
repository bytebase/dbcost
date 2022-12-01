import { memo } from "react";
import Image from "next/image";
import { getIconPath } from "@/utils";

interface Props {
  name: string;
  // https://nextjs.org/docs/api-reference/next/image#sizes
  sizes: string;
}

/* Pure Component */
const Icon: React.FC<Props> = ({ name, sizes }) => {
  return (
    <Image
      src={getIconPath(`${name}.png`)}
      alt={name}
      fill
      sizes={sizes}
      style={{ objectFit: "contain" }}
    />
  );
};

export default memo(Icon);
