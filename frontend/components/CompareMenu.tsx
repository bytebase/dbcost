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
  const router = useRouter();

  return (
    <div className="w-full flex flex-col md:flex-row justify-center md:justify-start items-center pb-6">
      <h2 className="!m-0">Compare between two different instance types:</h2>
      <div className="mx-4 flex items-center">
        <Select
          className="w-48 !mx-2"
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
          }}
          options={instanceTypeList}
        />
        <span>vs</span>
        <Select
          className="w-48 !ml-2 !mr-4"
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
          onSelect={(index: any): void =>
            void setComparer({
              ...comparer,
              second: { value: instanceTypeList[index].label, index },
            })
          }
          options={secondaryOptions}
        />
        <Button
          onClick={() => {
            const compareRoute = "/compare";
            const { first, second } = comparer;
            const param =
              first!.index < second!.index
                ? nameToSlug(first!.value, second!.value)
                : nameToSlug(second!.value, first!.value);

            router.push(`${compareRoute}/${param}`);
          }}
          disabled={
            comparer.first === undefined || comparer.second === undefined
          }
        >
          Compare
        </Button>
      </div>
    </div>
  );
};

export default CompareMenu;
