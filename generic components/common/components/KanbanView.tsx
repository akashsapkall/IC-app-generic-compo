import React, { useState } from 'react';
// import { FilePlusIcon } from '../../app/assests/icons/icons';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatRevenue } from '../SupportFunctions';
import KanbanItem from './KanbanItem';

interface KanbanItemProps {
    ele: any;
}
interface Bucket {
    id: string;
    bucket: string;
    mainBucket?: string;
}
interface KanbanViewProps {
  buckets: any[];
  dataFieldToMatchBuckets: string;
  filterdListOfItems: any[];
  typeOfItemSingular?: string;
    typeOfItemPlural?: string;
  itemValueField?: string;
  currencySymbol?: string;
  currency?: string;
  children?: (props: KanbanItemProps) => React.ReactNode;
  isLoading?: boolean;
  needToShowCreateNewInBucket?: boolean;
  updateItemFunc?: any;
  onCreateNew?: () => void;
  itemDetailView?: (id: any) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({
    buckets,                    //columnsArray,
    dataFieldToMatchBuckets,  // data field to match with column,
    filterdListOfItems,  //list of items
    typeOfItemSingular = '', // types of data item like task, opportunity
    typeOfItemPlural = '', // types of data item like tasks, opportunities
    itemValueField = '', // field to calculate total value in each column
    currencySymbol = '$',
    currency = 'USD',
    children,
    isLoading = false,
    needToShowCreateNewInBucket = false,
    updateItemFunc,
    onCreateNew,
    itemDetailView,
}) => {
  const [draggedOver, setDraggedOver] = useState<Bucket | null>(null);
  const [draggedItem, setDraggedItem] = useState<any | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [cssFordraggedItem, setCssFordraggedItem] = useState<string>('');

  const onDragOver = (event: React.DragEvent, column: Bucket) => {
    event.preventDefault();
    setDraggedOver(column);
  };

    const onDrop = async (event: React.DragEvent) => {
        event.preventDefault();
        if (draggedOver === null || draggedItem === null) {
            setDraggedOver(null);
            setDraggedItem(null);
            setDragOverIndex(null);
            setCssFordraggedItem('');
            return;
        }
        if (draggedOver?.bucket?.toLowerCase() === draggedItem?.[dataFieldToMatchBuckets]?.toLowerCase()) {
            setDraggedOver(null);
            setDraggedItem(null);
        } else {
            if (draggedItem && draggedOver && updateItemFunc) {
                const updatedItem = {
                    ...draggedItem, firstUpdatedDataField: draggedOver?.bucket, secondUpdatedDataField: draggedOver?.mainBucket
                        || ''
                };
                try {
                    await updateItemFunc(updatedItem);
                    toast.success(`${typeOfItemSingular} updated successfully`);
                } catch (error) {
                    toast.error(`Failed to update ${typeOfItemSingular}`);
                    console.error('Error updating item:', error);
                }
            }
        }
        // Reset drag state
        setCssFordraggedItem('');
        setDraggedOver(null);
        setDraggedItem(null);
        setDragOverIndex(null);
    };

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      toast.info('Create new functionality not implemented');
    }
  };
  const getColumnCount = (column: Bucket) => {
    return filterdListOfItems?.filter(
      (ele: any) =>
        ele?.[dataFieldToMatchBuckets]?.toLowerCase() ===
        column?.bucket?.toLowerCase()
    ).length;
  };

    const getColumnTotalValue = (column: Bucket) => {
        return itemValueField ? formatRevenue(filterdListOfItems.filter((item) => item[dataFieldToMatchBuckets]?.toLowerCase() === column.bucket.toLowerCase()).reduce((sum, item) => sum + (item[itemValueField] || 0), 0), currency) : 'NA';
    };
    return (
        <div className="h-full">
            {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-2">
                    <div
                        className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-white border-r-[#80c2fe] align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                        role="status"
                    >
                        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                            Loading...
                        </span>
                    </div>
                </div>
            ) : (
                <div className="flex border-t-[1px] border-gray-200 bg-[#F9FAFB] overflow-x-auto pl-7 overflow-y-hidden scroll h-full">
                    {filterdListOfItems?.length > 0 ? (
                        <div className="flex">
                            {buckets.filter((bucket) => bucket.selected).map((column, i) => (
                                <div
                                    key={i}
                                    className={`column-container !scroll !w-[470px] h-full !px-[30px] overflow-y-auto border-r-[1px] last:border-none border-[#E4E7EC] box-border `}
                                    onDragOver={(e) => onDragOver(e, column)}
                                    onDrop={onDrop}
                                >
                                    <div className="mt-[24px] relative">
                                        <div className="text-[#637083] font-normal text-[14px] flex items-center justify-between mb-4">
                                            <span>{column?.bucket}</span>
                                            <span className="flex items-center gap-1">
                                                <span>{getColumnCount(column)}</span>
                                                {itemValueField && (<span className='h-3 border-l border-[#E4E7EC] mx-1'></span>)}
                                                {itemValueField && (<span>{currencySymbol}{getColumnTotalValue(column)}</span>)}
                                            </span>
                                        </div>
                                        {/* <h6 className="text-[#637083] font-normal text-[14px] mb-4">
                                            {column?.bucket}
                                        </h6> */}
                                        {i === 0 && needToShowCreateNewInBucket && (
                                            <div className="my-4">
                                                <button
                                                    type="button"
                                                    onClick={handleCreateNew}
                                                    className="text-[#414E62] text-base btn text-left w-full rounded-md px-3 border-[#E4E7EC]"
                                                >
                                                    <Plus className="inline-block size-4 mr-2" />
                                                    <span className="align-middle relative top-[-1px]">
                                                        Create new {typeOfItemSingular?.toLocaleLowerCase() || 'item'}
                                                    </span>
                                                </button>
                                            </div>
                                        )}
                                        {filterdListOfItems?.length === 0 ? (
                                            <div className="flex justify-center mt-20 text-center">
                                                <span className="text-[24px] text-center text-gray-400">
                                                </span>
                                            </div>
                                        ) : (
                                            filterdListOfItems?.filter((ele: any) => ele?.[dataFieldToMatchBuckets]?.toLowerCase() === column?.bucket?.toLowerCase()).map((ele: any, j: number) => (
                                                <KanbanItem
                                                    key={ele._id || ele.id || j}
                                                    item={ele}
                                                    dataFieldToMatchBuckets={dataFieldToMatchBuckets}
                                                    isDraggable={true}
                                                    setDraggedItem={setDraggedItem}
                                                    draggedItem={draggedItem}
                                                    draggedOver={draggedOver}
                                                    setDragOverIndex={setDragOverIndex}
                                                    setCssFordraggedItem={setCssFordraggedItem}
                                                    cssFordraggedItem={cssFordraggedItem}
                                                    onClick={() => itemDetailView?.(ele._id)}
                                                >
                                                    {children &&
                                                        children({
                                                            ele,
                                                        })}
                                                </KanbanItem>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5 items-center w-full h-full">
                            <div className="flex flex-col items-center justify-center pt-[150px] gap-6">
                                {/* <span>
                                    <FilePlusIcon className="text-[#141C24]" />
                                </span> */}
                                <div className="flex text-center !text-[#141C24] !font-normal">
                                    No {typeOfItemPlural?.toLocaleLowerCase() || 'items'} to show
                                    {/* <br /> Let's create a new {typeOfItem} to get started */}
                                </div>
                                {/* <button
                                    type="button"
                                    onClick={handleCreateNew}
                                    className="bg-[#F9FAFB] px-[14px] font-medium rounded-md pb-[8px] text-[#141C24] btn border-[#637083] dark:ring-custom-400/20"
                                >
                                    Create new {typeOfItem}
                                </button> */}
                            </div>
                        </div>
                    )}
                </div>
            )} //
        </div>
    );
};

export default KanbanView;
//  h-[calc(100vh-8.875rem)]