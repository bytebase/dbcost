import { useState } from "react";
import Link from "next/link";
import { Button } from "antd";
import { CheckIcon } from "@radix-ui/react-icons";
import { useSearchConfigContext } from "@/stores";

interface Props {
  type: "reset" | "back";
  showCompare?: boolean;
}

const ButtonGroup: React.FC<Props> = ({ type }) => {
  const { reset: resetSearchConfig } = useSearchConfigContext();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(document.location.href);
    setIsCopied(true);
  };

  return (
    <div className="flex flex-row justify-center items-center my-4">
      {type === "reset" ? (
        <Button className="mr-2" onClick={() => void resetSearchConfig()}>
          Reset
        </Button>
      ) : (
        <Link href="/" passHref>
          <Button className="mr-2">Back to Dashboard</Button>
        </Link>
      )}
      <Button type={isCopied ? "dashed" : "default"} onClick={handleCopy}>
        {isCopied ? (
          <div className="flex justify-center items-center">
            Copied <CheckIcon className="ml-1" />
          </div>
        ) : (
          "Copy URL"
        )}
      </Button>
    </div>
  );
};

export default ButtonGroup;
