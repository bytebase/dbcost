import { useReducer, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Checkbox } from "antd";
import type { CheckboxValueType } from "antd/es/checkbox/Group";
import Icon from "@/components/Icon";
import { useSearchConfigStore } from "@/stores/searchConfig";
import { AvailableRegion, SearchConfigDefault } from "@/types";

interface Props {
  availableRegionList: AvailableRegion[];
}

interface LocalState {
  regionMap: Record<string, string[]>;
  parentRegionList: string[];
  checkedParentRegionList: string[];
}

const initialState: LocalState = {
  regionMap: {},
  parentRegionList: SearchConfigDefault.region.map(getParentRegionName),
  checkedParentRegionList: [],
};

enum ReducerActionsType {
  CLEAR_MAP = "CLEAR_MAP",
  UPDATE_REGION_MAP = "UPDATE_REGION_MAP",
  SORT_PARENT_REGION_LIST = "SORT_PARENT_REGION_LIST",
  FILTER_CHECKED_PARENT_REGION_LIST = "FILTER_CHECKED_PARENT_REGION_LIST",
}

interface ReducerActions {
  type: ReducerActionsType;
  payload: any;
}

// "Asia Pacific (Hong Kong)" --->  ["Asia Pacific (Hong Kong", ""] ---> ["Asia Pacific", "Hong Kong"]
function getParentRegionName(regionName: string) {
  return regionName.split(")")[0].split(" (")[0];
}

const reducer = (state: LocalState, action: ReducerActions): LocalState => {
  const { type, payload } = action;
  switch (type) {
    case ReducerActionsType.CLEAR_MAP:
      return {
        ...state,
        regionMap: {},
        parentRegionList: [],
      };
    case ReducerActionsType.UPDATE_REGION_MAP:
      const { parent, region } = payload;
      if (state.regionMap[parent]) {
        return {
          ...state,
          regionMap: {
            ...state.regionMap,
            [parent]: [...state.regionMap[parent], region.name],
          },
        };
      } else {
        return {
          ...state,
          regionMap: {
            ...state.regionMap,
            [parent]: [region.name],
          },
          parentRegionList: Array.from(
            new Set([...state.parentRegionList, parent])
          ),
        };
      }
    case ReducerActionsType.SORT_PARENT_REGION_LIST:
      return {
        ...state,
        parentRegionList: state.parentRegionList.sort((a, b) => {
          if (a.includes("Other")) {
            return 1;
          } else if (b.includes("Other")) {
            return -1;
          }
          return a.localeCompare(b);
        }),
      };
    case ReducerActionsType.FILTER_CHECKED_PARENT_REGION_LIST:
      const { set } = payload;
      return {
        ...state,
        checkedParentRegionList: state.parentRegionList.filter(
          (parentRegionName) => set.has(parentRegionName)
        ),
      };
    default:
      return state;
  }
};

const RegionMenu: React.FC<Props> = ({ availableRegionList }) => {
  const [checkedRegionList, setRegion] = useSearchConfigStore((state) => [
    state.searchConfig.region,
    (regionList: string[]) => void state.update("region", regionList),
  ]);
  const router = useRouter();
  const { provider } = router.query;

  const [routeParamProvider, setRouteParamProvider] = useState<Set<string>>(
    new Set(["GCP", "AWS"])
  );
  const [state, dispatch] = useReducer(reducer, initialState);

  const activeAvailableRegionList = useMemo(() => {
    // all provider is included (AWS, GCP)
    if (routeParamProvider.size === 2) {
      return availableRegionList;
    }
    if (routeParamProvider.has("AWS")) {
      return availableRegionList.filter((region) =>
        region.providerCode.has("AWS")
      );
    }
    if (routeParamProvider.has("GCP")) {
      return availableRegionList.filter((region) =>
        region.providerCode.has("GCP")
      );
    }
    return [];
  }, [availableRegionList, routeParamProvider]);

  const isIndeterminate = useMemo(
    () =>
      (parentName: string): boolean => {
        const childRegionList = state.regionMap[parentName];
        const childSRegionSet = new Set(childRegionList);
        let count = 0;
        for (const region of checkedRegionList) {
          if (childSRegionSet.has(region)) {
            count++;
          }
        }

        return 0 < count && count < childRegionList.length;
      },
    [checkedRegionList, state.regionMap]
  );

  const getChildRegionNameList = (
    parentNameList: string[],
    filterOutIndeterminate: boolean = false
  ): string[] => {
    if (filterOutIndeterminate) {
      return activeAvailableRegionList
        .filter(
          (region) =>
            parentNameList.includes(getParentRegionName(region.name)) &&
            !isIndeterminate(getParentRegionName(region.name))
        )
        .map((region) => region.name);
    } else {
      return activeAvailableRegionList
        .filter((region) =>
          parentNameList.includes(getParentRegionName(region.name))
        )
        .map((region) => region.name);
    }
  };

  const handleParentRegionChange = (checkedList: CheckboxValueType[]) => {
    const includesIndeterminate = checkedList.some((parentName) =>
      isIndeterminate(parentName as string)
    );
    // Do different things depending on whether checkedList includes indeterminate parent regions.
    if (includesIndeterminate) {
      // First, filter out indeterminate parent regions by passing true to the second argument.
      const newRegionList = getChildRegionNameList(
        checkedList as string[],
        true
      );
      for (const parent of checkedList as string[]) {
        if (isIndeterminate(parent)) {
          // Then, add child regions of indeterminate parent regions back,
          // so that we keep the indeterminate state untouched.
          newRegionList.push(
            ...activeAvailableRegionList
              .filter((region) => state.regionMap[parent].includes(region.name))
              .map((region) => region.name)
              .filter((regionName) => checkedRegionList.includes(regionName))
          );
        }
      }
      setRegion(newRegionList);
    } else {
      const newRegionList = getChildRegionNameList(checkedList as string[]);
      setRegion(newRegionList);
    }
  };

  const handleChildRegionChange = (
    checkedChildRegionList: CheckboxValueType[]
  ) => void setRegion(checkedChildRegionList as string[]);

  useEffect(() => {
    if (typeof provider === "string") {
      setRouteParamProvider(new Set([provider.toUpperCase()]));
    }
  }, [provider]);

  // Initialize regionMap and parentRegionList.
  useEffect(() => {
    if (activeAvailableRegionList.length > 0) {
      dispatch({
        type: ReducerActionsType.CLEAR_MAP,
        payload: null,
      });

      for (const region of activeAvailableRegionList) {
        const parent = getParentRegionName(region.name);
        dispatch({
          type: ReducerActionsType.UPDATE_REGION_MAP,
          payload: { parent, region },
        });
      }
      dispatch({
        type: ReducerActionsType.SORT_PARENT_REGION_LIST,
        payload: null,
      });
    }
  }, [activeAvailableRegionList]);

  // Uncheck the parent region if all its child regions are unchecked.
  useEffect(() => {
    const set = new Set();
    for (const regionName of checkedRegionList) {
      set.add(getParentRegionName(regionName));
    }
    dispatch({
      type: ReducerActionsType.FILTER_CHECKED_PARENT_REGION_LIST,
      payload: { set },
    });
  }, [checkedRegionList, state.parentRegionList]);

  return (
    <div className="flex w-full justify-start pb-4 border-b">
      {/* parent region */}
      <div className="border-r flex-col mr-4 w-48">
        <Checkbox.Group
          className="mt-2"
          value={state.checkedParentRegionList}
          onChange={handleParentRegionChange}
        >
          {state.parentRegionList.map((parentRegion) => (
            <Checkbox
              className="!ml-2 pb-1 w-36 h-7"
              value={parentRegion}
              indeterminate={isIndeterminate(parentRegion)}
              key={parentRegion}
            >
              {parentRegion}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>

      {/* child region */}
      <div className="w-full">
        <Checkbox.Group
          className="mt-2 !flex flex-wrap justify-start"
          value={checkedRegionList}
          onChange={handleChildRegionChange}
        >
          {activeAvailableRegionList.map((region) => (
            <div className="pr-6 w-80 h-7 pb-1 flex" key={region.name}>
              <Checkbox value={region.name}>{region.name}</Checkbox>
              {region.providerCode.has("AWS") && (
                <div className="relative top-1 w-5 h-4 mr-2">
                  <Icon name="provider-aws" />
                </div>
              )}
              {region.providerCode.has("GCP") && (
                <div className="relative top-1 w-4 h-4">
                  <Icon name="provider-gcp" />
                </div>
              )}
            </div>
          ))}
        </Checkbox.Group>
      </div>
    </div>
  );
};

export default RegionMenu;
