import React from 'react';

// Base skeleton component with shimmer effect
const SkeletonBase = ({ className = '', children, ...props }) => {
  return (
    <div 
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Product Card Skeleton
export const ProductCardSkeleton = ({ viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-row items-center p-4 gap-4">
        {/* Product Image Skeleton - List View */}
        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          <SkeletonBase className="w-full h-full" />
        </div>

        {/* Product Info Skeleton - List View */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col justify-between h-full">
            <div className="flex-1">
              {/* Rating Stars */}
              <div className="flex items-center gap-0.5 mb-1">
                {[...Array(5)].map((_, i) => (
                  <SkeletonBase key={i} className="w-3 h-3 rounded" />
                ))}
              </div>
              
              {/* Product Name */}
              <div className="mb-2">
                <SkeletonBase className="h-5 w-full rounded mb-1" />
                <SkeletonBase className="h-5 w-3/4 rounded" />
              </div>

              {/* Seller Info */}
              <div className="flex items-center gap-2 mb-2">
                <SkeletonBase className="w-6 h-6 rounded-full" />
                <SkeletonBase className="h-4 w-24 rounded" />
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <SkeletonBase className="h-6 w-20 rounded" />
              <div className="flex items-center gap-2">
                <SkeletonBase className="h-8 w-20 rounded" />
                <SkeletonBase className="h-8 w-8 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (default)
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Product Image Skeleton */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <SkeletonBase className="w-full h-full" />
      </div>

      {/* Product Info Skeleton */}
      <div className="p-4">
        {/* Category Badge Skeleton */}
        <div className="mb-2">
          <SkeletonBase className="h-5 w-16 rounded" />
        </div>

        {/* Product Name Skeleton */}
        <div className="mb-2">
          <SkeletonBase className="h-5 w-full rounded mb-1" />
          <SkeletonBase className="h-5 w-3/4 rounded" />
        </div>

        {/* Price and Stock Skeleton */}
        <div className="flex items-center justify-between mb-3">
          <SkeletonBase className="h-6 w-20 rounded" />
          <SkeletonBase className="h-4 w-16 rounded" />
        </div>

        {/* Seller Info Skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <SkeletonBase className="w-6 h-6 rounded-full" />
          <SkeletonBase className="h-4 w-24 rounded" />
        </div>

        {/* Rating Skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <SkeletonBase key={i} className="w-3 h-3 rounded" />
            ))}
          </div>
          <SkeletonBase className="h-3 w-8 rounded" />
        </div>

        {/* Buttons Skeleton */}
        <div className="mt-auto">
          <div className="flex items-center gap-2">
            <SkeletonBase className="h-10 flex-1 rounded" />
            <SkeletonBase className="h-10 w-10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Grid Skeleton - Individual cards without grid wrapper
export const ProductGridSkeleton = ({ count = 8, viewMode = 'grid' }) => {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <ProductCardSkeleton key={index} viewMode={viewMode} />
      ))}
    </>
  );
};

// Product Detail Skeleton
export const ProductDetailSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery Skeleton */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <SkeletonBase className="w-full h-full" />
          </div>
          
          {/* Thumbnail Images */}
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                <SkeletonBase className="w-full h-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          {/* Category */}
          <SkeletonBase className="h-5 w-20 rounded" />
          
          {/* Product Name */}
          <div className="space-y-2">
            <SkeletonBase className="h-8 w-full rounded" />
            <SkeletonBase className="h-8 w-3/4 rounded" />
          </div>

          {/* Price */}
          <SkeletonBase className="h-10 w-32 rounded" />

          {/* Description */}
          <div className="space-y-2">
            <SkeletonBase className="h-4 w-full rounded" />
            <SkeletonBase className="h-4 w-full rounded" />
            <SkeletonBase className="h-4 w-2/3 rounded" />
          </div>

          {/* Stock Info */}
          <SkeletonBase className="h-5 w-24 rounded" />

          {/* Quantity and Add to Cart */}
          <div className="flex items-center gap-4">
            <SkeletonBase className="h-12 w-32 rounded" />
            <SkeletonBase className="h-12 w-40 rounded" />
          </div>

          {/* Seller Info */}
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
            <SkeletonBase className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <SkeletonBase className="h-4 w-32 rounded" />
              <SkeletonBase className="h-3 w-24 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="mt-12">
        <div className="flex gap-8 mb-6">
          {['Reviews', 'Specifications', 'Shipping'].map((tab) => (
            <SkeletonBase key={tab} className="h-8 w-24 rounded" />
          ))}
        </div>
        
        <div className="space-y-4">
          <SkeletonBase className="h-4 w-full rounded" />
          <SkeletonBase className="h-4 w-full rounded" />
          <SkeletonBase className="h-4 w-3/4 rounded" />
        </div>
      </div>
    </div>
  );
};

// Cart Item Skeleton
export const CartItemSkeleton = () => {
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
      {/* Product Image */}
      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
        <SkeletonBase className="w-full h-full" />
      </div>

      {/* Product Info */}
      <div className="flex-1 space-y-2">
        <SkeletonBase className="h-5 w-3/4 rounded" />
        <SkeletonBase className="h-4 w-1/2 rounded" />
        <SkeletonBase className="h-4 w-1/4 rounded" />
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <SkeletonBase className="w-8 h-8 rounded" />
        <SkeletonBase className="h-8 w-12 rounded" />
        <SkeletonBase className="w-8 h-8 rounded" />
      </div>

      {/* Price */}
      <SkeletonBase className="h-6 w-20 rounded" />
    </div>
  );
};

// Cart Skeleton
export const CartSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <SkeletonBase className="h-8 w-48 rounded mb-2" />
        <SkeletonBase className="h-4 w-32 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {[...Array(3)].map((_, i) => (
            <CartItemSkeleton key={i} />
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="p-6 border border-gray-200 rounded-lg">
            <SkeletonBase className="h-6 w-32 rounded mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <SkeletonBase className="h-4 w-20 rounded" />
                <SkeletonBase className="h-4 w-16 rounded" />
              </div>
              <div className="flex justify-between">
                <SkeletonBase className="h-4 w-16 rounded" />
                <SkeletonBase className="h-4 w-12 rounded" />
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <SkeletonBase className="h-5 w-24 rounded" />
                  <SkeletonBase className="h-5 w-20 rounded" />
                </div>
              </div>
            </div>
            <SkeletonBase className="h-12 w-full rounded mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Wishlist Skeleton
export const WishlistSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <SkeletonBase className="h-8 w-48 rounded mb-2" />
        <SkeletonBase className="h-4 w-32 rounded" />
      </div>

      {/* Wishlist Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

// Category List Skeleton
export const CategoryListSkeleton = () => {
  return (
    <div className="flex flex-wrap gap-2">
      {[...Array(6)].map((_, i) => (
        <SkeletonBase key={i} className="h-8 w-20 rounded-full" />
      ))}
    </div>
  );
};

// Search Results Skeleton
export const SearchResultsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <SkeletonBase className="h-6 w-48 rounded" />
        <SkeletonBase className="h-8 w-24 rounded" />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <SkeletonBase className="h-10 w-32 rounded" />
        <SkeletonBase className="h-10 w-24 rounded" />
        <SkeletonBase className="h-10 w-28 rounded" />
      </div>

      {/* Results Grid */}
      <ProductGridSkeleton count={12} />
    </div>
  );
};

// Profile Skeleton
export const ProfileSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-8">
        <SkeletonBase className="w-24 h-24 rounded-full" />
        <div className="space-y-3">
          <SkeletonBase className="h-8 w-48 rounded" />
          <SkeletonBase className="h-4 w-32 rounded" />
          <SkeletonBase className="h-4 w-40 rounded" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 mb-6">
        {['Account', 'Orders', 'Wishlist'].map((tab) => (
          <SkeletonBase key={tab} className="h-8 w-24 rounded" />
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SkeletonBase className="h-6 w-32 rounded" />
            <SkeletonBase className="h-10 w-full rounded" />
            <SkeletonBase className="h-10 w-full rounded" />
            <SkeletonBase className="h-10 w-full rounded" />
          </div>
          <div className="space-y-4">
            <SkeletonBase className="h-6 w-32 rounded" />
            <SkeletonBase className="h-10 w-full rounded" />
            <SkeletonBase className="h-10 w-full rounded" />
            <SkeletonBase className="h-10 w-full rounded" />
          </div>
        </div>
        <SkeletonBase className="h-12 w-32 rounded" />
      </div>
    </div>
  );
};

// Chat Message Skeleton
export const ChatMessageSkeleton = () => {
  return (
    <div className="flex items-start gap-3 p-4">
      <SkeletonBase className="w-8 h-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonBase className="h-4 w-16 rounded" />
        <div className="space-y-1">
          <SkeletonBase className="h-4 w-full rounded" />
          <SkeletonBase className="h-4 w-3/4 rounded" />
        </div>
      </div>
    </div>
  );
};

// Chat List Skeleton
export const ChatListSkeleton = () => {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border-b border-gray-100">
          <SkeletonBase className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonBase className="h-4 w-24 rounded" />
            <SkeletonBase className="h-3 w-32 rounded" />
          </div>
          <SkeletonBase className="h-3 w-12 rounded" />
        </div>
      ))}
    </div>
  );
};

// Order Item Skeleton
export const OrderItemSkeleton = () => {
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
      <SkeletonBase className="w-16 h-16 rounded-lg" />
      <div className="flex-1 space-y-2">
        <SkeletonBase className="h-5 w-3/4 rounded" />
        <SkeletonBase className="h-4 w-1/2 rounded" />
        <SkeletonBase className="h-4 w-1/4 rounded" />
      </div>
      <div className="text-right space-y-2">
        <SkeletonBase className="h-5 w-20 rounded" />
        <SkeletonBase className="h-4 w-16 rounded" />
      </div>
    </div>
  );
};

// Seller Dashboard Skeleton
export const SellerDashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <SkeletonBase className="h-6 w-24 rounded mb-2" />
            <SkeletonBase className="h-8 w-16 rounded mb-1" />
            <SkeletonBase className="h-3 w-20 rounded" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <SkeletonBase className="h-6 w-32 rounded mb-4" />
          <SkeletonBase className="h-64 w-full rounded" />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <SkeletonBase className="h-6 w-32 rounded mb-4" />
          <SkeletonBase className="h-64 w-full rounded" />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <SkeletonBase className="h-6 w-32 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <OrderItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Generic skeleton for any content
export const Skeleton = ({ className = '', ...props }) => {
  return <SkeletonBase className={className} {...props} />;
};

export default Skeleton;
