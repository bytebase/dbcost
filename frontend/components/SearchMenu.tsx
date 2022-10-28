import Image from "next/image";
import { Checkbox, Input, InputNumber, Slider, Divider } from "antd";
import {
  QuestionMarkCircledIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import Tooltip from "@/components/primitives/Tooltip";
import { useSearchConfigContext } from "@/stores";
import { getIconPath } from "@/utils";
import { CloudProvider, EngineType, ChargeType, SearchBarType } from "@/types";

interface Props {
  type?: SearchBarType;
  hideProviders?: boolean;
}

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

const SearchMenu: React.FC<Props> = ({
  type = SearchBarType.DASHBOARD,
  hideProviders = false,
}) => {
  const { searchConfig, update: updateSearchConfig } = useSearchConfigContext();

  return (
    <div className="w-full flex flex-col md:flex-row justify-center md:justify-between pb-2 border-b">
      <div className="pt-6 pb-4 flex flex-wrap gap-2 justify-start items-center">
        {/* Cloud Providers */}
        {!hideProviders && type !== SearchBarType.INSTANCE_DETAIL && (
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
            <Divider type="vertical" />
          </Checkbox.Group>
        )}

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
          <Divider type="vertical" />
        </Checkbox.Group>

        {/* Charge Types */}
        <Checkbox.Group
          className="!ml-2 !mr-2 pb-2"
          value={searchConfig.chargeType}
          onChange={(checkedValue) =>
            void updateSearchConfig("chargeType", checkedValue as ChargeType[])
          }
        >
          <Checkbox value="OnDemand">On Demand</Checkbox>
          {type === SearchBarType.DASHBOARD && (
            <Checkbox value="Reserved">Reserved</Checkbox>
          )}
        </Checkbox.Group>

        {/* Min specification for Memory & CPU */}
        {type !== SearchBarType.INSTANCE_DETAIL && (
          <div className="flex !mr-4">
            <div className="w-36">
              <InputNumber
                min={0}
                max={9999}
                value={searchConfig.minCPU}
                addonBefore="Min CPU"
                keyboard={true}
                onChange={(value) => void updateSearchConfig("minCPU", value)}
              />
            </div>
            <div className="w-48 ml-4">
              <InputNumber
                min={0}
                max={9999}
                value={searchConfig.minRAM}
                addonBefore="Min RAM (GB)"
                keyboard={true}
                onChange={(value) => void updateSearchConfig("minRAM", value)}
              />
            </div>
          </div>
        )}

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
