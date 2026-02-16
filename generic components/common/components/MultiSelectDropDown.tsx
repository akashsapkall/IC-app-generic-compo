import { useCallback, useMemo, useRef, memo } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { Dropdown } from 'apps/app-ui/src/common/Dropdown';
import { ChevronDown } from 'lucide-react';
import SearchBox from './SearchBox';

interface MultiSelectDropDownProps {
  filteredItems: any[];
  dataFieldToUseForSelection: string;
  extraDataFieldToUseForSelection?: string;
  uniqueIdFieldToUseForSelection: string;
  checkboxItems: any[];
  setCheckboxItems: (items: any[] | ((prev: any[]) => any[])) => void;
  typeOfData?: string;
  wantToShowSearchBox?: boolean;
  setSearchText?: (text: string) => void;
  searchText?: string;
  wantToShowSelectedItems?: boolean;
  dropDownContentCss?: string;
  dropDownContentTitleCss?: string;
  triggerTextCss?: string;
  chevronIconCss?: string;
  alwaysOpen?: boolean;
  hideTrigger?: boolean;
  /** Height of each item in the virtualized list (default: 36) */
  itemHeight?: number;
  /** Maximum height for the virtualized list area (default: 280) */
  listMaxHeight?: number;
}

// Constants for virtualization
const ITEM_HEIGHT = 36;
const DIVIDER_HEIGHT = 32;
const LIST_MAX_HEIGHT = 280;
const VIRTUALIZATION_THRESHOLD = 50; // Use virtualization when items exceed this count

// Helper function to highlight search text - moved outside component
const highlightText = (text: string, search: string) => {
  if (!search || !text) return text;

  const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <span key={index} className="font-bold">
        {part}
      </span>
    ) : (
      part
    )
  );
};

// Row component for virtualized list - moved outside and memoized
interface VirtualizedRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: any[];
    dataField: string;
    extraDataField?: string;
    searchText: string;
    onCheckboxChange: (item: any) => void;
  };
}

const VirtualizedRowComponent = memo(({ index, style, data }: VirtualizedRowProps) => {
  const { items, dataField, extraDataField, searchText, onCheckboxChange } = data;
  const item = items[index];

  if (item?.value === '_divider_') {
    return (
      <div
        style={style}
        className="border-t border-[#E4E7EC] pt-1 pl-1 text-[#97A1AF] text-sm flex items-center"
      >
        {item.label}
      </div>
    );
  }

  const itemLabel = item?.[dataField] + ' ' + (extraDataField ? item?.[extraDataField] : '');

  return (
    <div style={style}>
      <div
        className="flex items-center gap-2 ps-2 rounded cursor-pointer h-full"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onCheckboxChange(item);
        }}
        role="checkbox"
        tabIndex={0}
        aria-checked={item?.selected || false}
        aria-labelledby={`item-label-${index}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            e.preventDefault();
            onCheckboxChange(item);
          }
        }}
      >
        <div
          className={`
            w-4 h-4 border-[1px] flex-shrink-0
            flex items-center justify-center rounded-md box-border
            ${item?.selected
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-gray-300 bg-white'
            }
          `}
        >
          {item?.selected && (
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <span
          id={`item-label-${index}`}
          className="text-[14px] font-normal text-[#202B37] text-nowrap truncate flex-1 min-w-0"
          title={itemLabel}
        >
          {highlightText(itemLabel, searchText)}
        </span>
      </div>
    </div>
  );
});

VirtualizedRowComponent.displayName = 'VirtualizedRowComponent';

const MultiSelectDropDown: React.FC<MultiSelectDropDownProps> = ({
  filteredItems,
  dataFieldToUseForSelection,
  extraDataFieldToUseForSelection,
  uniqueIdFieldToUseForSelection,
  checkboxItems,
  setCheckboxItems,
  typeOfData = 'items',
  wantToShowSearchBox = true,
  setSearchText,
  searchText = '',
  wantToShowSelectedItems = false,
  dropDownContentCss = "w-[296px]",
  dropDownContentTitleCss = "text-sm font-medium text-[#97A1AF]",
  triggerTextCss = '',
  chevronIconCss = 'left-[6px]',
  alwaysOpen = false,
  hideTrigger = false,
  itemHeight = ITEM_HEIGHT,
  listMaxHeight = LIST_MAX_HEIGHT,
}) => {
  const listRef = useRef<List<any>>(null);

  const { allSelected, noneSelected } = useMemo(() => {
    const selected = checkboxItems.filter(item => item.selected).length;
    const allSel = selected === checkboxItems.length && checkboxItems.length > 0;
    const noneSel = selected === 0;

    return {
      allSelected: allSel,
      noneSelected: noneSel
    };
  }, [checkboxItems]);

  const handleCheckboxChange = useCallback((item: any) => {
    setCheckboxItems((prevState: any) =>
      prevState.map((ele: any) =>
        ele[uniqueIdFieldToUseForSelection] === item[uniqueIdFieldToUseForSelection] 
          ? { ...ele, selected: !ele.selected } 
          : ele
      )
    );
  }, [setCheckboxItems, uniqueIdFieldToUseForSelection]);

  // Select all items
  const selectAll = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (allSelected) return;
    setCheckboxItems(prevState => {
      const newState = prevState.map(item => 
        item[uniqueIdFieldToUseForSelection] !== '_divider_' 
          ? { ...item, selected: true } 
          : item
      );
      return newState;
    });
  }, [allSelected, setCheckboxItems, uniqueIdFieldToUseForSelection]);

  // Clear all selections
  const clearAll = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (noneSelected) return;
    setCheckboxItems(prevState => {
      const newState = prevState.map(item => ({ ...item, selected: false }));
      return newState;
    });
  }, [noneSelected, setCheckboxItems]);

  // Determine if we should use virtualization based on item count
  const shouldVirtualize = useMemo(() => {
    return filteredItems && filteredItems.length > VIRTUALIZATION_THRESHOLD;
  }, [filteredItems]);

  // Calculate the list height based on items
  const calculatedListHeight = useMemo(() => {
    if (!filteredItems || filteredItems.length === 0) return 0;
    const totalHeight = filteredItems.reduce((acc, item) => {
      return acc + (item.value === '_divider_' ? DIVIDER_HEIGHT : itemHeight);
    }, 0);
    return Math.min(totalHeight, listMaxHeight);
  }, [filteredItems, itemHeight, listMaxHeight]);

  // Item data for virtualized list
  const itemData = useMemo(() => ({
    items: filteredItems,
    dataField: dataFieldToUseForSelection,
    extraDataField: extraDataFieldToUseForSelection,
    searchText: searchText,
    onCheckboxChange: handleCheckboxChange,
  }), [filteredItems, dataFieldToUseForSelection, extraDataFieldToUseForSelection, searchText, handleCheckboxChange]);

  // Non-virtualized list item renderer
  const renderListItem = useCallback((item: any, index: number) => {
    if (item.value === '_divider_') {
      return (
        <div
          key={`divider-${index}`}
          className="my-2 border-t border-[#E4E7EC] pt-1 pl-1 text-[#97A1AF] text-sm"
        >
          {item.label}
        </div>
      );
    }

    const itemLabel = item?.[dataFieldToUseForSelection] + ' ' +
      (extraDataFieldToUseForSelection ? item?.[extraDataFieldToUseForSelection] : '');

    return (
      <div key={item._id || item.id || index}>
        <div
          className="flex items-center gap-2 ps-2 rounded my-[1px] cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleCheckboxChange(item);
          }}
          role="checkbox"
          tabIndex={0}
          aria-checked={item?.selected || false}
          aria-labelledby={`item-label-${index}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              e.preventDefault();
              handleCheckboxChange(item);
            }
          }}
        >
          <div
            className={`
              w-4 h-4 border-[1px] flex-shrink-0
              flex items-center justify-center rounded-md box-border
              ${item?.selected
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300 bg-white'
              }
            `}
          >
            {item?.selected && (
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <span
            id={`item-label-${index}`}
            className="text-[14px] font-normal text-[#202B37] text-nowrap truncate flex-1 min-w-0 py-2"
            title={itemLabel}
          >
            {highlightText(itemLabel, searchText)}
          </span>
        </div>
      </div>
    );
  }, [dataFieldToUseForSelection, extraDataFieldToUseForSelection, handleCheckboxChange, searchText]);

  // Dropdown content - rendered inline, not as a component
  const dropdownContent = (
    <div
      className="h-fit flex flex-col"
      aria-labelledby="dropdownMenuIconButton"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Sticky Header */}
      <div className="top-0 z-10 bg-white">
        {/* Title and Select All/Clear buttons */}
        <div className="w-full h-9 flex items-center justify-between py-1">
          <h3
            id={`${typeOfData}-filter-title`}
            className={` ${dropDownContentTitleCss}`}
          >
            {typeOfData}
          </h3>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              disabled={allSelected}
              className={`
                px-1 py-1 text-xs font-medium
                focus:outline-none focus:ring-none
                ${allSelected
                  ? 'text-[#97A1AF] cursor-not-allowed'
                  : 'text-[#3B82F6]'
                }
              `}
              aria-label={`Select all ${typeOfData.toLowerCase()} options`}
            >
              Select all
            </button>
            <span className="h-3 border-l border-[#E4E7EC]"></span>
            <button
              type="button"
              onClick={clearAll}
              disabled={noneSelected}
              className={`
                px-1 py-1 text-xs font-medium
                focus:outline-none focus:ring-none
                ${noneSelected
                  ? 'text-[#97A1AF] cursor-not-allowed'
                  : 'text-[#3B82F6]'
                }
              `}
              aria-label={`Clear all ${typeOfData.toLowerCase()} selections`}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Search Box */}
        {wantToShowSearchBox && (
          <div className="h-11 pb-1" onClick={(e) => e.stopPropagation()}>
            <SearchBox
              setSearchText={setSearchText}
              searchText={searchText}
              dataType={typeOfData}
              needBorder={true}
            />
          </div>
        )}
      </div>

      {/* Scrollable list area */}
      <div className="h-fit flex-1 ">
        {shouldVirtualize ? (
          filteredItems && filteredItems.length > 0 && (
            <List
              ref={listRef}
              height={calculatedListHeight}
              itemCount={filteredItems.length}
              itemSize={itemHeight}
              width="100%"
              className="scroll-container"
              overscanCount={5}
              itemData={itemData}
            >
              {VirtualizedRowComponent}
            </List>
          )
        ) : (
          <div className="overflow-y-auto scroll" style={{ maxHeight: listMaxHeight }}>
            {filteredItems?.map((item, index) => renderListItem(item, index))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dropdown className="inline-flex w-full relative">
      {!hideTrigger && (
        <Dropdown.Trigger
          type="button"
          className={`w-full min-h-[32px] bg-white text-[#202B37] border-[1px] border-[#CED2DA] font-[500] box-border rounded-[8px] text-[12px] px-2 py-2 flex items-center justify-center ${triggerTextCss}`}
          id="dropdownMenuButton"
          data-bs-toggle="dropdown"
        >
          <div
            className={`w-full flex items-center justify-between gap-1 ${triggerTextCss}`}
          >
            <div
              className={`flex items-center justify-start flex-wrap gap-1 flex-1 ${triggerTextCss} overflow-hidden`}
            >
              {wantToShowSelectedItems ? (
                noneSelected ? (
                  <p> {typeOfData || ' '}</p>
                ) : (
                  checkboxItems
                    .filter((item: any) => item.selected)
                    ?.map((item: any) => (
                      <div
                        className="flex m-[2px] items-center rounded-[2px] bg-[#e6e6e6] box-border"
                        key={item.id}
                      >
                        <div className="truncate whitespace-nowrap rounded text-gray-800 text-sm py-[3px] pl-[6px] box-border">
                          {item?.[dataFieldToUseForSelection] +
                            ' ' +
                            (extraDataFieldToUseForSelection
                              ? item?.[extraDataFieldToUseForSelection]
                              : '')}
                        </div>
                        <div
                          role="button"
                          className="flex items-center rounded px-1 box-border"
                          aria-label={`Remove ${item.id}`}
                          onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                            e.stopPropagation();
                            e.preventDefault();
                            e.nativeEvent.stopImmediatePropagation();
                            handleCheckboxChange(item);
                          }}
                        >
                          <svg
                            height="16"
                            width="16"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                            focusable="false"
                            className="css-tj5bde-Svg"
                          >
                            <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
                          </svg>
                        </div>
                      </div>
                    ))
                )
              ) : (
                <p> {typeOfData || ''}</p>
              )}
            </div>
            <ChevronDown
              className={`text-[#637083] w-[16px] h-[16px] ${chevronIconCss} flex-shrink-0`}
            />
          </div>
        </Dropdown.Trigger>
      )}
      {alwaysOpen ? (
        <div
          className={`ltr:text-left rtl:text-right min-w-[250px] bg-white border-[1px] border-[#CED2DA] rounded-lg shadow-lg dropdown-menu ${dropDownContentCss}`}
          aria-labelledby="dropdownMenuButton"
        >
          {dropdownContent}
        </div>
      ) : (
        <Dropdown.Content
          placement="bottom"
          className={`absolute top-full mt-1 z-[9999] p-[6px] ltr:text-left rtl:text-right min-w-[250px] bg-white border-[1px] border-[#CED2DA] rounded-lg shadow-lg dropdown-menu ${dropDownContentCss}`}
          aria-labelledby="dropdownMenuButton"
        >
          {dropdownContent}
        </Dropdown.Content>
      )}
    </Dropdown>
  );
};

export default MultiSelectDropDown;