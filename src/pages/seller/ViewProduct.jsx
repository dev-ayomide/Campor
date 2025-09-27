import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { getSellerProducts } from '../../services/authService';
import { ProductDetailSkeleton, Breadcrumb } from '../../components/common';

const ViewProduct = ({ toggleMobileMenu }) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        if (user?.seller?.id) {
          const products = await getSellerProducts(user.seller.id);
          const foundProduct = products.find(p => p.id === productId);
          
          if (foundProduct) {
            console.log('🔍 ViewProduct: Found product:', foundProduct);
            console.log('🔍 ViewProduct: Product description:', foundProduct.description);
            console.log('🔍 ViewProduct: Product createdAt:', foundProduct.createdAt);
            setProduct(foundProduct);
          } else {
            setError('Product not found');
          }
        }
      } catch (err) {
        console.error('❌ Failed to fetch product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, user]);

  const getProductStatus = (product) => {
    if (product.status) {
      return product.status;
    }
    if (product.stockQuantity === 0) return 'OUT_OF_STOCK';
    return 'DRAFT';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplayName = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'OUT_OF_STOCK':
        return 'Out of Stock';
      case 'DRAFT':
        return 'Draft';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <SellerLayout>
        <ProductDetailSkeleton />
      </SellerLayout>
    );
  }

  if (error) {
    return (
      <SellerLayout>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">Error loading product</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </SellerLayout>
    );
  }

  if (!product) {
    return (
      <SellerLayout>
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Product not found</h3>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/seller/products"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Products
          </Link>
        </div>
      </SellerLayout>
    );
  }

  const status = getProductStatus(product);
  const sales = product._count?.orderItems || 0;

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Dashboard', href: '/seller/dashboard' },
            { label: 'Products', href: '/seller/products' },
            { label: product.name }
          ]} 
        />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/seller/products')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          </div>
          <Link
            to={`/seller/products/edit/${product.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Product
          </Link>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="md:flex">
            {/* Product Images */}
            <div className="md:w-1/2">
              <div className="aspect-square bg-gray-200">
                {product.imageUrls && product.imageUrls.length > 0 ? (
                  <img 
                    src={product.imageUrls[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Product Information */}
            <div className="md:w-1/2 p-6">
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {getStatusDisplayName(status)}
                  </span>
                </div>

                {/* Price */}
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">₦{parseFloat(product.price).toLocaleString()}</h3>
                </div>

                {/* Stock */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Stock Quantity</h4>
                  <p className="text-lg text-gray-600">{product.stockQuantity} units</p>
                </div>

                {/* Sales */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Sales</h4>
                  <p className="text-lg text-gray-600">{sales.toLocaleString()} orders</p>
                </div>

                {/* Category */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Category</h4>
                  <p className="text-lg text-gray-600">{product.category?.name || 'No category'}</p>
                </div>

                {/* Created Date */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Created</h4>
                  <p className="text-lg text-gray-600">
                    {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Date not available'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600 leading-relaxed">
              {product.description || 'No description available'}
            </p>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};

export default ViewProduct;
