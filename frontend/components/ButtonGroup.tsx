import Link from "next/link";
import { Button } from "antd";
import { useSearchConfigContext } from "@/stores";

interface Props {
  type: "reset" | "back";
}

const ButtonGroup: React.FC<Props> = ({ type }) => {
  const { reset: resetSearchConfig } = useSearchConfigContext();

  return (
    <div className="flex flex-row justify-center my-4">
      {type === "reset" ? (
        <Button className="mr-2" onClick={() => void resetSearchConfig()}>
          Reset
        </Button>
      ) : (
        <Link href="/" passHref>
          <a>
            <Button className="mr-2">Back to Dashboard</Button>
          </a>
        </Link>
      )}
      <Button onClick={copyURL}>Copy URL</Button>
    </div>
  );
};

const copyURL= () => {
  navigator.clipboard.writeText(document.location.href)
}

export default ButtonGroup;
