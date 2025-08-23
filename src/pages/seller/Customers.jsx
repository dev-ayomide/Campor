import { useState } from 'react';
import { Link } from 'react-router-dom';
import SellerLayout from '../../layouts/SellerLayout';

export default function SellerCustomersPage() {
  const [customers] = useState([
    {
      id: 1,
      name: "Mr John doe",
      email: "johndoe@run.edu.ng",
      orders: 45,
      totalSpent: 245000,
      joined: "2023-06-15"
    },
    {
      id: 2,
      name: "Mrs Aisha",
      email: "aiwoko@run.edu.ng",
      orders: 29,
      totalSpent: 245000,
      joined: "2023-06-15"
    },
    {
      id: 3,
      name: "Felix Adebayo",
      email: "felixade@run.edu.ng",
      orders: 123,
      totalSpent: 245000,
      joined: "2023-06-15"
    },
    {
      id: 4,
      name: "Mr Adeniyi",
      email: "iadeniyi@run.edu.ng",
      orders: 1,
      totalSpent: 245000,
      joined: "2023-06-15"
    },
    {
      id: 5,
      name: "Sarah Banks",
      email: "iamsarahbanks@run.edu.ng",
      orders: 22,
      totalSpent: 245000,
      joined: "2023-06-15"
    }
  ]);

  return (
    <SellerLayout>
      <div className="max-w-full overflow-hidden">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">›</span>
          <Link to="/seller" className="hover:text-gray-700">Sell</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Customers</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Customers</h1>
          <p className="text-gray-600">View and manage your customer relationships.</p>
        </div>

        {/* Search and Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              Filter
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">456</p>
              <p className="text-sm text-green-600 font-medium">+23% from last month</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">New This Month</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">32</p>
              <p className="text-sm text-green-600 font-medium">+5 from last month</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Avg. Order Value</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">₦18,500</p>
              <p className="text-sm text-green-600 font-medium">+8% from last month</p>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Orders</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Total Spent</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Joined</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">{customer.name}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-900">{customer.email}</td>
                    <td className="py-4 px-6 text-gray-900">{customer.orders}</td>
                    <td className="py-4 px-6 text-gray-900">₦{customer.totalSpent.toLocaleString()}</td>
                    <td className="py-4 px-6 text-gray-900">{customer.joined}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="View Customer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Contact Customer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center mt-8">
          <nav className="flex items-center space-x-1">
            <button className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">1</button>
            <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">2</button>
            <span className="px-3 py-2 text-sm text-gray-500">...</span>
            <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">9</button>
            <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">10</button>
            
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>

        {/* Empty State if no customers */}
        {customers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers yet</h3>
            <p className="text-gray-600 mb-6">Your customers will appear here when you start making sales</p>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
