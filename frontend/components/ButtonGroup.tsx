import { Button } from "antd";
import { useSearchConfigContext } from "@/stores";

const ButtonGroup: React.FC = () => {
  const { reset: resetSearchConfig } = useSearchConfigContext();

  return (
    <div className="flex flex-row justify-center my-4">
      <Button className="mr-2" onClick={() => void resetSearchConfig()}>
        Reset
      </Button>
      <Button>Copy URL</Button>
    </div>
  );
};

export default ButtonGroup;
