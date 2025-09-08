import { useLocation } from 'react-router-dom';

export default function SellerPageHeader() {
  const location = useLocation();
  
  const getPageTitle = () => {
    if (location.pathname === '/seller/dashboard') {
      return 'Seller Dashboard';
    } else if (location.pathname.startsWith('/seller/products')) {
      return 'Products Management';
    } else if (location.pathname === '/seller/orders') {
      return 'Orders Management';
    } else if (location.pathname === '/seller/customers') {
      return 'Customers Management';
    } else if (location.pathname === '/seller/analytics') {
      return 'Analytics';
    } else if (location.pathname === '/seller/settings') {
      return 'Settings';
    }
    return 'Seller Dashboard';
  };

  const getPageSubtitle = () => {
    if (location.pathname === '/seller/dashboard') {
      return "Welcome back! Here's what's happening with your store today.";
    } else if (location.pathname.startsWith('/seller/products')) {
      return 'Manage your product inventory and listings.';
    } else if (location.pathname === '/seller/orders') {
      return 'Track and manage customer orders.';
    } else if (location.pathname === '/seller/customers') {
      return 'View and manage your customer base.';
    } else if (location.pathname === '/seller/analytics') {
      return 'Analyze your store performance and insights.';
    } else if (location.pathname === '/seller/settings') {
      return 'Manage your store settings and preferences.';
    }
    return "Welcome back! Here's what's happening with your store today.";
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{getPageTitle()}</h1>
      <p className="text-gray-600">{getPageSubtitle()}</p>
    </div>
  );
}
