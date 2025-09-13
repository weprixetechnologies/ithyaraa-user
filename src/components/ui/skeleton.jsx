import React from 'react';

const Skeleton = ({
    className = "h-4 bg-gray-200 animate-pulse rounded",
    width,
    height,
    ...props
}) => {
    const style = {
        ...(width && { width }),
        ...(height && { height }),
    };

    return (
        <div
            className={className}
            style={style}
            {...props}
        />
    );
};

// Predefined skeleton components for common use cases
export const CardSkeleton = ({ className = "" }) => (
    <div className={`p-4 border rounded-lg ${className}`}>
        <Skeleton className="h-4 bg-gray-200 animate-pulse rounded mb-2" />
        <Skeleton className="h-3 bg-gray-200 animate-pulse rounded mb-2 w-3/4" />
        <Skeleton className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
    </div>
);

export const ProductSkeleton = ({ className = "" }) => (
    <div className={`p-4 border rounded-lg ${className}`}>
        <Skeleton className="h-48 bg-gray-200 animate-pulse rounded-lg mb-3" />
        <Skeleton className="h-4 bg-gray-200 animate-pulse rounded mb-2" />
        <Skeleton className="h-3 bg-gray-200 animate-pulse rounded mb-2 w-3/4" />
        <Skeleton className="h-6 bg-gray-200 animate-pulse rounded w-1/3" />
    </div>
);

export const TableSkeleton = ({ rows = 3, className = "" }) => (
    <div className={`space-y-2 ${className}`}>
        {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex space-x-4 p-3 border rounded">
                <Skeleton className="h-4 bg-gray-200 animate-pulse rounded flex-1" />
                <Skeleton className="h-4 bg-gray-200 animate-pulse rounded w-20" />
                <Skeleton className="h-4 bg-gray-200 animate-pulse rounded w-16" />
            </div>
        ))}
    </div>
);

export const ListSkeleton = ({ items = 5, className = "" }) => (
    <div className={`space-y-3 ${className}`}>
        {Array.from({ length: items }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border rounded">
                <Skeleton className="h-10 w-10 bg-gray-200 animate-pulse rounded-full" />
                <div className="flex-1">
                    <Skeleton className="h-4 bg-gray-200 animate-pulse rounded mb-2" />
                    <Skeleton className="h-3 bg-gray-200 animate-pulse rounded w-2/3" />
                </div>
            </div>
        ))}
    </div>
);

export default Skeleton;
