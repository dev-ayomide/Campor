import React, { useState } from 'react';
import { 
  ProductCardSkeleton,
  ProductGridSkeleton,
  ProductDetailSkeleton,
  CartSkeleton,
  WishlistSkeleton,
  CategoryListSkeleton,
  SearchResultsSkeleton,
  ProfileSkeleton,
  ChatListSkeleton,
  SellerDashboardSkeleton
} from './SkeletonLoader';

export default function SkeletonDemo() {
  const [activeDemo, setActiveDemo] = useState('product-grid');
  const [viewMode, setViewMode] = useState('grid');

  const demos = [
    { id: 'product-grid', name: 'Product Grid', component: <ProductGridSkeleton count={8} viewMode={viewMode} /> },
    { id: 'product-detail', name: 'Product Detail', component: <ProductDetailSkeleton /> },
    { id: 'cart', name: 'Cart', component: <CartSkeleton /> },
    { id: 'wishlist', name: 'Wishlist', component: <WishlistSkeleton /> },
    { id: 'profile', name: 'Profile', component: <ProfileSkeleton /> },
    { id: 'categories', name: 'Categories', component: <CategoryListSkeleton /> },
    { id: 'search', name: 'Search Results', component: <SearchResultsSkeleton /> },
    { id: 'chat', name: 'Chat List', component: <ChatListSkeleton /> },
    { id: 'dashboard', name: 'Seller Dashboard', component: <SellerDashboardSkeleton /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Skeleton Loader Demo</h1>
          <p className="text-gray-600 mb-6">
            Sleek and modern skeleton loaders for your Campor marketplace. 
            These loaders provide a smooth loading experience while content is being fetched.
          </p>
          
          {/* Demo Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {demos.map((demo) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeDemo === demo.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {demo.name}
              </button>
            ))}
          </div>

          {/* View Mode Controls (only for Product Grid) */}
          {activeDemo === 'product-grid' && (
            <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">View Mode:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Demo Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {demos.find(d => d.id === activeDemo)?.name} Skeleton
            </h2>
            <p className="text-gray-600 text-sm">
              This skeleton loader mimics the structure of the actual {demos.find(d => d.id === activeDemo)?.name.toLowerCase()} component.
            </p>
          </div>
          
          <div className={`border border-gray-200 rounded-lg p-4 bg-gray-50 ${
            activeDemo === 'product-grid' 
              ? viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6' 
                : 'flex flex-col gap-4'
              : ''
          }`}>
            {demos.find(d => d.id === activeDemo)?.component}
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">✨ Smooth Animations</h3>
            <p className="text-gray-600 text-sm">
              Beautiful shimmer effect that creates a professional loading experience with smooth transitions.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Accurate Layouts</h3>
            <p className="text-gray-600 text-sm">
              Each skeleton matches the exact structure of its corresponding component for seamless transitions.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📱 Responsive Design</h3>
            <p className="text-gray-600 text-sm">
              All skeleton loaders are fully responsive and work perfectly across all device sizes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
