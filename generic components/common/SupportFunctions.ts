
export function flattenTree(arr: any[], arrFieldName: string): any[] {
    const result: any[] = [];

    function helper(nodes: any[]) {
        for (const node of nodes) {
            const { [arrFieldName]: children, ...rest } = node;
            result.push(rest); // Add node without children
            if (children && children.length > 0) {
                helper(children);
            }
        }
    }

    helper(arr);
    return result;
}

export function formatRevenue(value: number, currency?: string) {
    if (currency === 'INR') {
        if (value >= 1_00_00_000) {
            return Math.round(value / 1_00_00_00) / 10 + 'Cr';
        }
        if (value >= 1_00_000) {
            return Math.round(value / 1_00_00) / 10 + 'L';
        }
        if (value >= 1_0_00) {
            return Math.round(value / 1_00) / 10 + 'K';
        }
        return Math.round(value * 10) / 10;
    } else {
        if (value >= 1_000_000_000) {
            return Math.round(value / 1_000_000_00) / 10 + 'B';
        }
        if (value >= 1_000_000) {
            return Math.round(value / 1_000_00) / 10 + 'M';
        }
        if (value >= 1_0_00) {
            return Math.round(value / 1_00) / 10 + 'K';
        }
        return Math.round(value * 10) / 10;
    }
}

export const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

// export const getExpressionSVGIcon = (string: string, color?: string, height?: number, width?: number): JSX.Element => {
//     const style = height || width ? { height: height ? `${height}px` : undefined, width: width ? `${width}px` : undefined } : undefined;

//     switch (string) {
//         case 'expectation':
//             return <ExpectationSvgIcon style={style} stroke={color} />;
//         case 'commitment':
//             return <CommitmentSvgIcon style={style} stroke={color} />;
//         case 'information':
//             return <InformationSvgIcon style={style} stroke={color} />;
//         case 'delight':
//             return <DelightSvgIcon style={style} stroke={color} />;
//         case 'issue':
//             return <IssueSvgIcon style={style} stroke={color} />;
//         case 'opportunity':
//             return <OpportunitySvgIcon style={style} stroke={color} />;
//         case 'opportunities_created_by':
//             return <OpportunitiesCreatedBySvgIcon style={style} stroke={color} />;
//         case 'meeting_members_divider_line':
//             return <MeetingMembersdividerLineIcon />;
//         default:
//             return <ExpectationSvgIcon style={style} stroke={color} />;
//     }   
// }


// Helper function to generate MongoDB ObjectId
export const generateObjectId = () => {
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
    const randomValue = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const counter = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    return timestamp + randomValue + counter + '00000'.slice(0, 5);
};

export const formatCompactNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  }).format(value);
};

// export const generateUniqueId = (): string => {
//     return uuidv4();
// };


// export function flattenTreeFromUserId(arr: any[], userId: string) {
//     let targetNode = null;

//     // helper to find the user anywhere in the tree
//     function findNode(nodes: any[]) {
//         for (const node of nodes) {
//             if (node._id === userId) {
//                 targetNode = node;
//                 return;
//             }
//             if (node.children && node.children.length > 0) {
//                 findNode(node.children);
//             }
//         }
//     }

//     // flatten tree into single array
//     function flatten(nodes: any[], result: any[]) {
//         for (const node of nodes) {
//             result.push(node);
//             if (node.children && node.children.length > 0) {
//                 flatten(node.children, result);
//             }
//         }
//     }

//     // 1️⃣ find the starting user node
//     findNode(arr);

//     // 2️⃣ if found, flatten its subtree
//     if (targetNode) {
//         const result: any[] = [];
//         flatten([targetNode], result);
//         return result;
//     }

//     return []; // not found
// }
