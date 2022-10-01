import Image from "next/image";
import { Checkbox, Input, InputNumber, Slider } from "antd";
import {
  QuestionMarkCircledIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import Tooltip from "@/components/primitives/Tooltip";
import { useSearchConfigStore } from "@/stores/searchConfig";
import { getIconPath } from "@/utils";
import { CloudProvider, EngineType, ChargeType } from "@/types";

const ProviderCheckbox = [
  {
    key: "AWS",
    src: getIconPath("provider-aws.png"),
    width: 24,
    className: "pr-1",
    style: { transform: "scale(1)" },
  },
  {
    key: "GCP",
    src: getIconPath("provider-gcp.png"),
    width: 24,
    className: "",
    style: { transform: "scale(0.9)" },
  },
];

const EngineCheckbox = [
  {
    key: "MYSQL",
    src: getIconPath("db-mysql.png"),
    width: 24,
  },
  {
    key: "POSTGRES",
    src: getIconPath("db-postgres.png"),
    width: 24,
  },
];

const SearchMenu: React.FC = () => {
  const [searchConfig, updateSearchConfig] = useSearchConfigStore((state) => [
    state.searchConfig,
    state.update,
  ]);

  return (
    <div className="flex justify-between pb-2 border-b">
      <div className="h-24 pt-2 flex flex-wrap items-center">
        {/* Cloud Providers */}
        <Checkbox.Group
          className="mr-2 !-mt-1"
          value={searchConfig.cloudProvider}
          onChange={(checkedValue) =>
            void updateSearchConfig(
              "cloudProvider",
              checkedValue as CloudProvider[]
            )
          }
        >
          {ProviderCheckbox.map((provider) => (
            <Checkbox
              className={provider.className}
              key={provider.key}
              value={provider.key}
            >
              <div className="relative top-1 w-6 h-5" style={provider.style}>
                <Image
                  src={provider.src}
                  alt="aws"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </Checkbox>
          ))}
        </Checkbox.Group>

        {/* Database Engine Types */}
        <Checkbox.Group
          className="!ml-2 !-mt-1"
          value={searchConfig.engineType}
          onChange={(checkedValue) =>
            void updateSearchConfig("engineType", checkedValue as EngineType[])
          }
        >
          {EngineCheckbox.map((engine) => (
            <Checkbox key={engine.key} value={engine.key}>
              <div className="relative top-1 w-6 h-5">
                <Image
                  src={engine.src}
                  alt="aws"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </Checkbox>
          ))}
        </Checkbox.Group>

        {/* Charge Types */}
        <Checkbox.Group
          className="!ml-2 pb-2"
          value={searchConfig.chargeType}
          onChange={(checkedValue) =>
            void updateSearchConfig("chargeType", checkedValue as ChargeType[])
          }
        >
          <Checkbox value="OnDemand">On Demand</Checkbox>
          <Checkbox value="Reserved">Reserved</Checkbox>
        </Checkbox.Group>

        {/* Min specification for Memory & CPU */}
        <div className="flex !ml-2 !mr-4">
          <div className="w-36">
            <InputNumber
              min={0}
              max={999}
              value={searchConfig.minCPU}
              addonBefore="Min CPU"
              keyboard={true}
              onChange={(value) => void updateSearchConfig("minCPU", value)}
            />
          </div>
          <div className="w-36 ml-4">
            <InputNumber
              min={0}
              max={999}
              value={searchConfig.minRAM}
              addonBefore="Min RAM"
              keyboard={true}
              onChange={(value) => void updateSearchConfig("minRAM", value)}
            />
          </div>
        </div>

        {/* Search Bar */}
        <div>
          <Input
            allowClear
            placeholder="Keyword"
            prefix={<MagnifyingGlassIcon className="mr-1" />}
            value={searchConfig.keyword}
            onChange={(e) => void updateSearchConfig("keyword", e.target.value)}
          />
        </div>
      </div>

      {/* Utilization & Lease Length Slider */}
      <div className="flex justify-start pt-2 items-center">
        <div className="pr-2 mr-2 items-baseline">
          <div className="flex mb-1 items-center">
            Utilization
            <Tooltip
              delayDuration={0}
              content="Utilization is the time percentage actually used during the entire
              lease length."
            >
              <QuestionMarkCircledIcon className="ml-1 cursor-pointer" />
            </Tooltip>
            <span className="ml-2 font-mono">
              {Math.trunc(searchConfig.utilization * 100)}%
            </span>
          </div>
          <Slider
            className="w-40"
            min={0.01}
            max={1}
            step={0.01}
            value={searchConfig.utilization}
            onChange={(value) => void updateSearchConfig("utilization", value)}
            tooltip={{ formatter: null }}
          ></Slider>
        </div>
        <div className="ml-2">
          <div className="flex mb-1 items-center">
            Lease Length
            <span className="ml-2 font-mono">
              {searchConfig.leaseLength} Year
            </span>
          </div>
          <Slider
            className="w-40 align-middle"
            min={1}
            max={3}
            step={1}
            value={searchConfig.leaseLength}
            onChange={(value) => void updateSearchConfig("leaseLength", value)}
            tooltip={{ formatter: null }}
          ></Slider>
        </div>
      </div>
    </div>
  );
};

export default SearchMenu;
