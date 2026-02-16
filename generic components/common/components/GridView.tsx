import React, { CSSProperties, Fragment, useEffect, useState } from 'react';

import {
  Column,
  Table as ReactTable,
  ColumnFiltersState,
  FilterFn,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnPinningState,
  ColumnSizingState,
  Header
} from '@tanstack/react-table';

import { rankItem } from '@tanstack/match-sorter-utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Resize Handle Component with Excel-style icon
const ResizeHandle = ({ header, table }: { header: Header<any, unknown>, table: ReactTable<any> }) => {
  return (
    <div
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      className="absolute right-0 top-0 h-full w-[2px] cursor-col-resize select-none touch-none group hover:bg-gray-800 transition-all duration-200"
      style={{
        transform: header.column.getIsResizing() ? 'translateX(0)' : '',
        zIndex: 999,
      }}
    >
      {/* Excel-style resize icon -translate-x-1/2 */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2  opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <svg
          width="4"
          height="16"
          viewBox="0 0 4 16"
          fill="none"
          className="text-gray-800"
        >
          <rect x="0" y="0" width="1" height="16" fill="currentColor" />
          <rect x="3" y="0" width="1" height="16" fill="currentColor" />
        </svg>
      </div>

      {/* Hover area indicator */}
      <div
        className="absolute right-0 top-0 h-full w-1 opacity-0 group-hover:opacity-100 bg-gray-800 transition-all duration-200"
        style={{ width: '2px' }}
      />
    </div>
  );
};

// Column Filter
const Filter = ({
  column,
}: {
  column: Column<any, unknown>;
  table: ReactTable<any>;
}) => {
  const columnFilterValue = column.getFilterValue();

  return (
    <>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? '') as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder="Search..."
        className="w-36 border shadow rounded"
        list={column.id + 'list'}
      />
      <div className="h-1" />
    </>
  );
};

// Global Filter
const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [debounce, onChange, value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

interface GridViewProps {
  columns?: any;
  data?: any;
  tableclassName?: any;
  divclassName?: any;
  thclassName?: any;
  trclassName?: any;
  tableClass?: any;
  tdclassName?: any;
  searchTerm?: string;
  theadclassName?: any;
  tbodyclassName?: any;
  isTfoot?: boolean;
  isSelect?: boolean;
  isBordered?: boolean;
  customPageSize?: number;
  isGlobalFilter?: boolean;
  isPagination?: boolean;
  PaginationClassName?: string;
  SearchPlaceholder?: string;
  emptyPlaceHolderForTable?: string;
  showColumnFilters?: boolean;
  pinnedColumns?: ColumnPinningState;
  enableColumnPinning?: boolean;
  showPinningControls?: boolean;
}

const GridView = ({
  columns,
  data,
  tableclassName,
  theadclassName,
  divclassName,
  trclassName,
  thclassName,
  tdclassName,
  tbodyclassName,
  isTfoot,
  searchTerm,
  isSelect,
  isPagination,
  customPageSize,
  isGlobalFilter,
  PaginationClassName,
  SearchPlaceholder,
  emptyPlaceHolderForTable,
  showColumnFilters = false,
  pinnedColumns,
  enableColumnPinning = false,
  showPinningControls = false,
}: GridViewProps) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [newData, setNewData] = useState<any>([]);

  const fuzzyFilter: FilterFn<any> = (
    row: any,
    columnId: any,
    value: any,
    addMeta: any
  ) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({
      itemRank,
    });
    return itemRank.passed;
  };

  useEffect(() => {
    const filteredArray = data?.filter((item: any) => {
      let obj;
      if (item.user && 'is_active' in item) {
        obj = JSON?.stringify(item.user)?.toLowerCase();
      } else {
        obj = JSON?.stringify(item)?.toLowerCase();
      }
      if (searchTerm) {
        return obj?.includes(searchTerm?.toLowerCase());
      } else {
        return true;
      }
    });
    setNewData(filteredArray);
  }, [searchTerm, data]);

  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(
    pinnedColumns || { left: [], right: [] }
  );
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  const table = useReactTable({
    columns,
    data: newData,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
      columnPinning,
      columnSizing
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnPinningChange: setColumnPinning,
    onColumnSizingChange: setColumnSizing,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: true,
    enableColumnPinning: enableColumnPinning,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  });

  const {
    getHeaderGroups,
    getFooterGroups,
    getRowModel,
    getPageOptions,
    setPageIndex,
    setPageSize,
    getState,
    getCanPreviousPage,
    getCanNextPage,
    nextPage,
    previousPage,
  } = table;

  useEffect(() => {
    Number(customPageSize) && setPageSize(Number(customPageSize));
  }, [customPageSize, setPageSize]);

  // Helper function to pin/unpin all columns in a group
  const pinGroupColumns = (header: any, pinSide: 'left' | 'right' | false) => {
    if (header.subHeaders && header.subHeaders.length > 0) {
      header.subHeaders.forEach((subHeader: any) => {
        if (subHeader.column && subHeader.column.getCanPin()) {
          subHeader.column.pin(pinSide);
        }
      });
    }
  };

  // Helper function to check if all columns in a group are pinned to the same side
  const getGroupPinStatus = (header: any): 'left' | 'right' | 'mixed' | false => {
    if (!header.subHeaders || header.subHeaders.length === 0) {
      return false;
    }

    const pinnedStates = header.subHeaders.map((subHeader: any) =>
      subHeader.column?.getIsPinned()
    );

    const leftPinned = pinnedStates.filter((state: any) => state === 'left').length;
    const rightPinned = pinnedStates.filter((state: any) => state === 'right').length;
    const unpinned = pinnedStates.filter((state: any) => !state).length;

    if (leftPinned === header.subHeaders.length) return 'left';
    if (rightPinned === header.subHeaders.length) return 'right';
    if (leftPinned > 0 || rightPinned > 0) return 'mixed';
    return false;
  };

  // Helper function to create virtual group headers for mixed pinning scenarios
  const createVirtualGroupHeaders = (headerGroup: any) => {
    const virtualHeaders: any[] = [];

    headerGroup.headers.forEach((header: any) => {
      if (!header.subHeaders || header.subHeaders.length === 0) {
        // Regular column, add as is
        virtualHeaders.push(header);
        return;
      }

      // Group header with sub-columns
      const leftPinnedChildren = header.subHeaders.filter((subHeader: any) =>
        subHeader.column.getIsPinned() === 'left'
      );
      const rightPinnedChildren = header.subHeaders.filter((subHeader: any) =>
        subHeader.column.getIsPinned() === 'right'
      );
      const unpinnedChildren = header.subHeaders.filter((subHeader: any) =>
        !subHeader.column.getIsPinned()
      );

      // If all children have the same pinning state, add the original header
      if (leftPinnedChildren.length === header.subHeaders.length ||
        rightPinnedChildren.length === header.subHeaders.length ||
        unpinnedChildren.length === header.subHeaders.length) {
        virtualHeaders.push(header);
        return;
      }

      // Mixed state: create virtual group headers for each section
      if (leftPinnedChildren.length > 0) {
        virtualHeaders.push({
          ...header,
          id: `${header.id}-left-pinned`,
          subHeaders: leftPinnedChildren,
          colSpan: leftPinnedChildren.length,
          virtualGroup: true,
          virtualGroupType: 'left-pinned'
        });
      }

      if (unpinnedChildren.length > 0) {
        virtualHeaders.push({
          ...header,
          id: `${header.id}-unpinned`,
          subHeaders: unpinnedChildren,
          colSpan: unpinnedChildren.length,
          virtualGroup: true,
          virtualGroupType: 'unpinned'
        });
      }

      if (rightPinnedChildren.length > 0) {
        virtualHeaders.push({
          ...header,
          id: `${header.id}-right-pinned`,
          subHeaders: rightPinnedChildren,
          colSpan: rightPinnedChildren.length,
          virtualGroup: true,
          virtualGroupType: 'right-pinned'
        });
      }
    });

    return virtualHeaders;
  };

  // Helper function to get styles for virtual group headers
  const getVirtualGroupHeaderStyles = (header: any): CSSProperties => {
    if (!header.virtualGroup) {
      return getGroupHeaderPinningStyles(header);
    }

    const { virtualGroupType, subHeaders } = header;

    // Check if any of the subheaders are non-editable
    const hasNonEditableColumns = subHeaders.some((subHeader: any) =>
      (subHeader.column?.columnDef?.meta as any)?.isEditable === false
    );

    // Use gray background if any column is non-editable, otherwise white
    const backgroundColor = hasNonEditableColumns ? '#f9fafb' : '#ffffff';

    switch (virtualGroupType) {
      case 'left-pinned':
        return {
          left: `${Math.min(...subHeaders.map((subHeader: any) =>
            subHeader.column.getStart('left')
          ))}px`,
          position: 'sticky',
          minWidth: subHeaders.reduce((sum: number, subHeader: any) =>
            sum + subHeader.column.getSize(), 0),
          maxWidth: subHeaders.reduce((sum: number, subHeader: any) =>
            sum + subHeader.column.getSize(), 0),
          width: subHeaders.reduce((sum: number, subHeader: any) =>
            sum + subHeader.column.getSize(), 0),
          zIndex: 15,
          backgroundColor,
        };

      case 'right-pinned':
        return {
          right: `${Math.min(...subHeaders.map((subHeader: any) =>
            subHeader.column.getAfter('right')
          ))}px`,
          position: 'sticky',
          minWidth: subHeaders.reduce((sum: number, subHeader: any) =>
            sum + subHeader.column.getSize(), 0),
          maxWidth: subHeaders.reduce((sum: number, subHeader: any) =>
            sum + subHeader.column.getSize(), 0),
          width: subHeaders.reduce((sum: number, subHeader: any) =>
            sum + subHeader.column.getSize(), 0),
          zIndex: 15,
          backgroundColor,
        };

      case 'unpinned':
      default:
        return {
          position: 'relative',
          minWidth: subHeaders.reduce((sum: number, subHeader: any) =>
            sum + subHeader.column.getSize(), 0),
          maxWidth: subHeaders.reduce((sum: number, subHeader: any) =>
            sum + subHeader.column.getSize(), 0),
          width: subHeaders.reduce((sum: number, subHeader: any) =>
            sum + subHeader.column.getSize(), 0),
          zIndex: 0,
        };
    }
  };

  // Helper function to calculate group header positioning for pinned columns
  const getGroupHeaderPinningStyles = (header: any): CSSProperties => {
    if (!header.subHeaders || header.subHeaders.length === 0) {
      return getCommonPinningStyles(header.column);
    }

    // Check if this is a group header with pinned children
    const leftPinnedChildren = header.subHeaders.filter((subHeader: any) =>
      subHeader.column.getIsPinned() === 'left'
    );
    const rightPinnedChildren = header.subHeaders.filter((subHeader: any) =>
      subHeader.column.getIsPinned() === 'right'
    );
    const unpinnedChildren = header.subHeaders.filter((subHeader: any) =>
      !subHeader.column.getIsPinned()
    );

    // Helper function to check if group has non-editable columns
    const getGroupBackgroundColor = (children: any[]) => {
      const hasNonEditableColumns = children.some((subHeader: any) =>
        (subHeader.column?.columnDef?.meta as any)?.isEditable === false
      );
      return hasNonEditableColumns ? '#f9fafb' : '#ffffff';
    };

    // If all children are pinned to the same side
    if (leftPinnedChildren.length === header.subHeaders.length) {
      return {
        left: `${Math.min(...leftPinnedChildren.map((subHeader: any) =>
          subHeader.column.getStart('left')
        ))}px`,
        position: 'sticky',
        minWidth: leftPinnedChildren.reduce((sum: number, subHeader: any) =>
          sum + subHeader.column.getSize(), 0),
        maxWidth: leftPinnedChildren.reduce((sum: number, subHeader: any) =>
          sum + subHeader.column.getSize(), 0),
        width: leftPinnedChildren.reduce((sum: number, subHeader: any) =>
          sum + subHeader.column.getSize(), 0),
        zIndex: 15,
        backgroundColor: getGroupBackgroundColor(leftPinnedChildren),
      };
    }

    if (rightPinnedChildren.length === header.subHeaders.length) {
      return {
        right: `${Math.min(...rightPinnedChildren.map((subHeader: any) =>
          subHeader.column.getAfter('right')
        ))}px`,
        position: 'sticky',
        minWidth: rightPinnedChildren.reduce((sum: number, subHeader: any) =>
          sum + subHeader.column.getSize(), 0),
        maxWidth: rightPinnedChildren.reduce((sum: number, subHeader: any) =>
          sum + subHeader.column.getSize(), 0),
        width: rightPinnedChildren.reduce((sum: number, subHeader: any) =>
          sum + subHeader.column.getSize(), 0),
        zIndex: 15,
        backgroundColor: getGroupBackgroundColor(rightPinnedChildren),
      };
    }

    // If no children are pinned, show normal width for unpinned columns only
    if (leftPinnedChildren.length === 0 && rightPinnedChildren.length === 0) {
      return {
        position: 'relative',
        minWidth: unpinnedChildren.reduce((sum: number, subHeader: any) =>
          sum + subHeader.column.getSize(), 0),
        maxWidth: unpinnedChildren.reduce((sum: number, subHeader: any) =>
          sum + subHeader.column.getSize(), 0),
        width: unpinnedChildren.reduce((sum: number, subHeader: any) =>
          sum + subHeader.column.getSize(), 0),
        zIndex: 0,
      };
    }

    // Mixed case: some children are pinned
    // For mixed groups, we need to hide the group header as it will overlap
    // The group header will be handled by virtual headers for each section
    return {
      display: 'none', // Hide the original group header
      width: 0,
      minWidth: 0,
      maxWidth: 0,
    };
  };

  // Helper function to get sticky styles for pinned columns
  const getCommonPinningStyles = (column: Column<any>): CSSProperties => {
    const isPinned = column.getIsPinned();
    const isLastLeftPinnedColumn =
      isPinned === 'left' && column.getIsLastColumn('left');
    const isFirstRightPinnedColumn =
      isPinned === 'right' && column.getIsFirstColumn('right');

    // Determine background color based on editable status and pinned state
    const isEditable = (column?.columnDef?.meta as any)?.isEditable;
    let backgroundColor: string | undefined = undefined;

    if (isPinned) {
      backgroundColor = isEditable === false ? '#f9fafb' : '#ffffff';
    }

    return {
      left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
      right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
      position: isPinned ? 'sticky' : 'relative',
      minWidth: column.getSize(),
      maxWidth: column.getSize(),
      width: column.getSize(),
      zIndex: isPinned ? 10 : 0,
      backgroundColor,
    };
  };

  return (
    <Fragment>
      <div className="grid grid-cols-12 lg:grid-cols-12 gap-3">
        {isSelect && (
          <div className="self-center col-span-12 lg:col-span-6">
            <label>
              Show
              <select
                name="basic_tables_length"
                aria-controls="basic_tables"
                className="px-3 py-2 form-select border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200 inline-block w-auto"
                onClick={(event: any) => setPageSize(event.target.value)}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </label>
          </div>
        )}

        <div className="self-center col-span-12 lg:col-span-6 lg:place-self-end">
          {isGlobalFilter && (
            <label>
              Search:{' '}
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={(value) => setGlobalFilter(String(value))}
                className="py-2 pr-4 text-sm text-topbar-item bg-topbar border border-topbar-border rounded pl-2 placeholder:text-slate-400 form-control focus-visible:outline-0 min-w-[200px] focus:border-blue-400 group-data-[topbar=dark]:bg-topbar-dark group-data-[topbar=dark]:border-topbar-border-dark group-data-[topbar=dark]:placeholder:text-slate-500 group-data-[topbar=dark]:text-topbar-item-dark group-data-[topbar=brand]:bg-topbar-brand group-data-[topbar=brand]:border-topbar-border-brand group-data-[topbar=brand]:placeholder:text-blue-300 group-data-[topbar=brand]:text-topbar-item-brand group-data-[topbar=dark]:dark:bg-zink-700 group-data-[topbar=dark]:dark:border-zink-500 group-data-[topbar=dark]:dark:text-zink-100"
                placeholder={SearchPlaceholder}
              />
            </label>
          )}
        </div>
      </div>

      <div className={divclassName} style={{ overflowX: 'auto', position: 'relative' }}>
        <table
          className={tableclassName}
          style={{
            borderCollapse: 'separate',
            borderSpacing: 0,
            position: 'relative',
            width: table.getCenterTotalSize(),
            // tableLayout: 'fixed', // Force fixed table layout for better height control
          }}
        >
          <thead className={theadclassName}

          >
            {getHeaderGroups()?.map((headerGroup: any) => (
              <tr key={headerGroup.id} className={trclassName}

              >
                {createVirtualGroupHeaders(headerGroup).map((header: any, headerIndex: number) => {
                  const isGroupHeader = (header.subHeaders && header.subHeaders.length > 0) || header.virtualGroup;
                  const headerStyles = header.virtualGroup
                    ? getVirtualGroupHeaderStyles(header)
                    : isGroupHeader
                      ? getGroupHeaderPinningStyles(header)
                      : getCommonPinningStyles(header.column);

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        ...headerStyles,
                        zIndex: (headerStyles.position === 'sticky') ? 20 : 15, // Higher z-index for sticky headers
                        backgroundColor: headerStyles.backgroundColor || ((!isGroupHeader && (header.column?.columnDef?.meta as any)?.isEditable === false) ? '#f9fafb' : 'inherit'), // Preserve pinned background, then non-editable gray
                        // borderTopLeftRadius: (header.depth === 1 && headerIndex === 0) ? '8px' : '0',
                        borderTop: header.depth === 1 ? '1px solid #e5e7eb' : 'none',
                        borderBottom: '1px solid #E4E7EC',
                        borderLeft: headerIndex === 0 ? '1px solid #e5e7eb' : 'none',
                        borderRight: '1px solid #E4E7EC',
                        position: headerStyles.position || 'relative', // Use position from headerStyles first
                        // borderRadius: '8px',

                      }}
                      className={` ${header.column?.getCanSort() ? 'cursor-pointer select-none group' : ''} ${thclassName} ${header.getSize() ? 'w-' + header.getSize() + 'px' : ''} ${(!isGroupHeader && (header.column?.columnDef?.meta as any)?.isEditable === false) ? 'bg-gray-50' : ''}`}
                    >
                      {header.isPlaceholder ? null : (
                        <React.Fragment>
                          <div
                            className={`flex items-center justify-between ${isGroupHeader ? 'font-semibold' : ''}`}
                            onClick={header.column?.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                          >
                            {header.virtualGroup ? (
                              // For virtual group headers, show the original header text with suffix
                              <span>
                                {flexRender(
                                  header.column?.columnDef?.header || header.id.replace('-left-pinned', '').replace('-right-pinned', '').replace('-unpinned', ''),
                                  header.getContext()
                                )}
                                {header.virtualGroupType === 'left-pinned'}
                                {header.virtualGroupType === 'right-pinned'}
                              </span>
                            ) : (
                              flexRender(
                                header.column?.columnDef?.header || header.id,
                                header.getContext()
                              )
                            )}
                            {header.column?.getCanSort() && (
                              <span className={`flex flex-col gap-1 mr-2 transition-opacity duration-200 ${header.column.getIsSorted() ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none" className={`rotate-180 ${header.column.getIsSorted() === 'desc' ? 'opacity-40' : ''}`}>
                                  <path d="M1.07733 0.912031C1.40277 0.586615 1.9304 0.586615 2.25584 0.912031L4.99992 3.65612L7.744 0.912031C8.06942 0.586615 8.59709 0.586615 8.9225 0.912031C9.24792 1.23745 9.24792 1.76511 8.9225 2.09053L5.58917 5.42387C5.26375 5.74928 4.73609 5.74928 4.41067 5.42387L1.07733 2.09053C0.751894 1.76511 0.751894 1.23745 1.07733 0.912031Z" fill="black" />
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none" className={`${header.column.getIsSorted() === 'asc' ? 'opacity-40' : ''}`}>
                                  <path d="M1.07733 0.912031C1.40277 0.586615 1.9304 0.586615 2.25584 0.912031L4.99992 3.65612L7.744 0.912031C8.06942 0.586615 8.59709 0.586615 8.9225 0.912031C9.24792 1.23745 9.24792 1.76511 8.9225 2.09053L5.58917 5.42387C5.26375 5.74928 4.73609 5.74928 4.41067 5.42387L1.07733 2.09053C0.751894 1.76511 0.751894 1.23745 1.07733 0.912031Z" fill="black" />
                                </svg>
                              </span>
                            )}
                          </div>
                          <span>
                          </span>
                          {showColumnFilters && header.column?.getCanFilter() && (
                            <Filter column={header.column} table={table} />
                          )}

                          {/* Add resize handle for columns */}
                          {header.column?.getCanResize() && !isGroupHeader && (
                            <ResizeHandle header={header} table={table} />
                          )}
                        </React.Fragment>
                      )
                      }
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          {getRowModel().rows?.length !== 0 ? (
            <>
              <tbody className={tbodyclassName}>
                {getRowModel().rows.map((row: any) => {
                  return (
                    <tr key={row.id} className={trclassName}>
                      {row.getVisibleCells().map((cell: any, cellIndex: number) => {
                        return (
                          <td
                            key={cell.id}
                            className={`${tdclassName} ${(cell.column?.columnDef?.meta as any)?.isEditable === false ? 'bg-gray-50' : ''}`}
                            style={{
                              ...getCommonPinningStyles(cell.column),
                              backgroundColor: getCommonPinningStyles(cell.column).backgroundColor || ((cell.column?.columnDef?.meta as any)?.isEditable === false ? '#f9fafb' : undefined),
                              borderTop: 'none', // Top border handled by header
                              borderBottom: '1px solid #E4E7EC',
                              borderLeft: cellIndex === 0 ? '1px solid #e5e7eb' : 'none',
                              borderRight: '1px solid #E4E7EC',
                              height: '36px',
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </>
          ) : (
            <tbody className={`my-2 text-gray-900 ${tbodyclassName}`}>
              <tr className="text-center text-[14px] text-gray-600 py-2">
                <td colSpan={columns?.length} className="py-2 text-center">
                  {emptyPlaceHolderForTable}
                </td>
              </tr>
            </tbody>
          )}

          {isTfoot && (
            <tfoot>
              {getFooterGroups()?.map((footer: any, tfKey: number) => (
                <tr key={tfKey}>
                  {footer.headers?.map((tf: any, key: number) => {
                    const isFooterGroupHeader = tf.subHeaders && tf.subHeaders.length > 0;
                    const footerStyles = isFooterGroupHeader
                      ? getGroupHeaderPinningStyles(tf)
                      : getCommonPinningStyles(tf.column);

                    return (
                      <th
                        key={key}
                        style={{
                          ...footerStyles,
                          backgroundColor: footerStyles.backgroundColor || (footerStyles.position === 'sticky' ?
                            ((tf.column?.columnDef?.meta as any)?.isEditable === false ? '#f9fafb' : '#ffffff') :
                            undefined),
                        }}
                        className="p-3 text-left group-[.bordered]:border group-[.bordered]:border-slate-200 group-[.bordered]:dark:border-zink-500"
                      >
                        {flexRender(tf.column?.columnDef?.header || tf.id, tf.getContext())}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>

      {
        isPagination && (
          <div className={PaginationClassName}>
            <div className="mb-4 grow md:mb-0">
              <div className="text-slate-500 dark:text-zinc-200">
                Showing {table.getRowModel().rows.length.toLocaleString()} of{' '}
                {table.getRowCount().toLocaleString()} Results
              </div>
            </div>
            <ul className="flex flex-wrap items-center gap-2 shrink-0">
              <li>
                <div
                  className={`!cursor-pointer inline-flex items-center justify-center bg-white dark:bg-zink-700 h-8 px-3 transition-all duration-150 ease-linear border !rounded border-slate-200 dark:border-zink-500 text-slate-500 dark:text-zink-200 hover:text-custom-500 dark:hover:text-custom-500 hover:bg-custom-50 dark:hover:bg-custom-500/10 focus:bg-custom-50 dark:focus:bg-custom-500/10 focus:text-custom-500 dark:focus:text-custom-500 [&.active]:text-custom-500 dark:[&.active]:text-custom-500 [&.active]:bg-custom-50 dark:[&.active]:bg-custom-500/10 [&.active]:border-custom-50 dark:[&.active]:border-custom-500/10 [&.active]:hover:text-custom-700 dark:[&.active]:hover:text-custom-700 [&.disabled]:text-slate-400 dark:[&.disabled]:text-zink-300 [&.disabled]:cursor-auto ${!getCanPreviousPage() && 'disabled'
                    }`}
                  onClick={previousPage}
                >
                  <ChevronLeft className="size-4 mr-1 rtl:rotate-180"></ChevronLeft>{' '}
                  Prev
                </div>
              </li>
              {getPageOptions().map((item: any, key: number) => (
                <React.Fragment key={key}>
                  <li>
                    <div
                      className={`!cursor-pointer inline-flex items-center justify-center bg-white dark:bg-zink-700 size-8 transition-all duration-150 ease-linear border !rounded border-slate-200 dark:border-zink-500 text-slate-500 dark:text-zink-200 hover:text-custom-500 dark:hover:text-custom-500 hover:bg-custom-100 dark:hover:bg-custom-500/10 focus:bg-custom-50 dark:focus:bg-custom-500/10 focus:text-custom-500 dark:focus:text-custom-500 [&.active]:text-white dark:[&.active]:text-white [&.active]:bg-custom-500 dark:[&.active]:bg-custom-500 [&.active]:border-custom-500 dark:[&.active]:border-custom-500 [&.active]:hover:text-custom-700 dark:[&.active]:hover:text-custom-700 [&.disabled]:text-slate-400 dark:[&.disabled]:text-zink-300 [&.disabled]:cursor-auto ${getState().pagination.pageIndex === item && 'active'
                        }`}
                      onClick={() => setPageIndex(item)}
                    >
                      {item + 1}
                    </div>
                  </li>
                </React.Fragment>
              ))}
              <li>
                <div
                  className={`cursor-pointer inline-flex items-center justify-center bg-white dark:bg-zink-700 h-8 px-3 transition-all duration-150 ease-linear border !rounded border-slate-200 dark:border-zink-500 text-slate-500 dark:text-zink-200 hover:text-custom-500 dark:hover:text-custom-500 hover:bg-custom-50 dark:hover:bg-custom-500/10 focus:bg-custom-50 dark:focus:bg-custom-500/10 focus:text-custom-500 dark:focus:text-custom-500 [&.active]:text-custom-500 dark:[&.active]:text-custom-500 [&.active]:bg-custom-50 dark:[&.active]:bg-custom-500/10 [&.active]:border-custom-50 dark:[&.active]:border-custom-500/10 [&.active]:hover:text-custom-700 dark:[&.active]:hover:text-custom-700 [&.disabled]:text-slate-400 dark:[&.disabled]:text-zink-300 [&.disabled]:cursor-auto 
                ${!getCanNextPage() && ''}`}
                  onClick={() => getCanNextPage() && nextPage()}
                >
                  Next{' '}
                  <ChevronRight className="size-4 ml-1 rtl:rotate-180"></ChevronRight>{' '}
                </div>
              </li>
            </ul>
          </div>
        )
      }
    </Fragment >
  );
};

export default GridView;