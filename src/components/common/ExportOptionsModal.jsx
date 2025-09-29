import React, { useState } from 'react';

const ExportOptionsModal = ({ isOpen, onClose, onExport, data, title = "Export Data" }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [selectedFields, setSelectedFields] = useState({
    orderCode: true,
    customer: true,
    date: true,
    status: true,
    amount: true,
    items: true,
    paymentMethod: false,
    shippingAddress: false
  });
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const fieldOptions = [
    { key: 'orderCode', label: 'Order Code' },
    { key: 'customer', label: 'Customer Name' },
    { key: 'date', label: 'Order Date' },
    { key: 'status', label: 'Status' },
    { key: 'amount', label: 'Amount' },
    { key: 'items', label: 'Items Count' },
    { key: 'paymentMethod', label: 'Payment Method' },
    { key: 'shippingAddress', label: 'Shipping Address' }
  ];

  const handleFieldToggle = (fieldKey) => {
    setSelectedFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedFields).every(Boolean);
    const newFields = {};
    fieldOptions.forEach(field => {
      newFields[field.key] = !allSelected;
    });
    setSelectedFields(newFields);
  };

  const filterDataByDateRange = (data) => {
    if (dateRange === 'all') return data;
    
    const now = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case 'custom':
        if (!customDateRange.startDate || !customDateRange.endDate) return data;
        startDate = new Date(customDateRange.startDate);
        endDate = new Date(customDateRange.endDate);
        break;
      default:
        return data;
    }

    return data.filter(order => {
      const orderDate = new Date(order.order?.createdAt || order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  const handleExport = () => {
    const filteredData = filterDataByDateRange(data);
    const selectedFieldKeys = Object.keys(selectedFields).filter(key => selectedFields[key]);
    
    onExport({
      format: exportFormat,
      data: filteredData,
      fields: selectedFieldKeys,
      dateRange: dateRange,
      customDateRange: customDateRange
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {title}
                </h3>

                {/* Export Format */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="csv"
                        checked={exportFormat === 'csv'}
                        onChange={(e) => setExportFormat(e.target.value)}
                        className="mr-2"
                      />
                      CSV
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="excel"
                        checked={exportFormat === 'excel'}
                        onChange={(e) => setExportFormat(e.target.value)}
                        className="mr-2"
                      />
                      Excel
                    </label>
                  </div>
                </div>

                {/* Date Range */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>

                  {dateRange === 'custom' && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={customDateRange.startDate}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Start Date"
                      />
                      <input
                        type="date"
                        value={customDateRange.endDate}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="End Date"
                      />
                    </div>
                  )}
                </div>

                {/* Fields Selection */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Fields
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {Object.values(selectedFields).every(Boolean) ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {fieldOptions.map(field => (
                      <label key={field.key} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={selectedFields[field.key]}
                          onChange={() => handleFieldToggle(field.key)}
                          className="mr-2"
                        />
                        {field.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Data Count */}
                <div className="text-sm text-gray-600 mb-4">
                  {dateRange === 'all' 
                    ? `Total records: ${data.length}`
                    : `Filtered records: ${filterDataByDateRange(data).length} of ${data.length}`
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleExport}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Export {exportFormat.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportOptionsModal;
