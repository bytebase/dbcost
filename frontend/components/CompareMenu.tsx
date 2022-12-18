import { useState } from "react";
import { Select, Button } from "antd";
import { useRouter } from "next/router";
import { nameToSlug } from "utils";
import { DBInstance } from "@/types";
import data from "@data";

const instanceTypeList = (data as DBInstance[]).map((dbInstance, index) => ({
  label: dbInstance.name,
  value: index,
}));

const CompareMenu: React.FC = () => {
  const [comparer, setComparer] = useState<{
    first?: { value: string; index: number };
    second?: { value: string; index: number };
  }>({});
  const [secondaryOptions, setSecondaryOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [isInstanceSelected, setIsInstanceSelected] = useState(true);
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row justify-center md:justify-start items-center">
      <div className="relative flex items-center">
        <Select
          className="w-52 !mr-2"
          showSearch
          placeholder="Instance type"
          value={comparer.first?.value}
          filterOption={(inputValue, option) => {
            if (option?.label) {
              const { label } = option;
              return label.includes(inputValue);
            }
            return false;
          }}
          onSelect={(index: any): void => {
            setComparer({
              first: { value: instanceTypeList[index].label, index },
              second: undefined,
            });
            setSecondaryOptions(instanceTypeList.filter((_, i) => i !== index));
            setIsInstanceSelected(true);
          }}
          options={instanceTypeList}
        />
        <span>vs</span>
        <Select
          className="w-52 !ml-2 !mr-4"
          showSearch
          placeholder="Instance type"
          filterOption={(inputValue, option) => {
            if (option?.label) {
              const { label } = option;
              return label.includes(inputValue);
            }
            return false;
          }}
          value={comparer.second?.value}
          onSelect={(index: any): void => {
            setComparer({
              ...comparer,
              second: { value: instanceTypeList[index].label, index },
            });
            setIsInstanceSelected(true);
          }}
          options={secondaryOptions}
        />
        <Button
          onClick={() => {
            if (!comparer.first?.value || !comparer.second?.value) {
              setIsInstanceSelected(false);
            } else {
              const compareRoute = "/compare";
              const { first, second } = comparer;
              const param =
                first!.index < second!.index
                  ? nameToSlug(first!.value, second!.value)
                  : nameToSlug(second!.value, first!.value);

              router.push(`${compareRoute}/${param}`);
            }
          }}
          type="primary"
        >
          Compare Instances
        </Button>
        {!isInstanceSelected && (
          <p className="absolute m-0 -right-44 text-red-500">
            Please select instances.
          </p>
        )}
      </div>
    </div>
  );
};

export default CompareMenu;
