import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  Search, 
  Bell, 
  ChevronDown, 
  Plus, 
  Filter, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  Star, 
  HelpCircle, 
  BarChart3, 
  DollarSign, 
  ShoppingCart as ShoppingCartIcon, 
  Users as UsersIcon,
  User,
  LogOut,
  X,
  Upload,
  RefreshCw,
  Globe,
  ExternalLink
} from 'lucide-react'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { token, setToken } = useContext(ShopContext)
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    topProducts: [],
    recentOrders: []
  })
  const [showDropdown, setShowDropdown] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.relative')) {
        setShowDropdown(false)
      }
      if (showNotifications && !event.target.closest('.relative')) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown, showNotifications])
  
  const navigation = [
    { section: 'Main', items: [
      { name: 'Dashboard', icon: Home, current: activeTab === 'dashboard' },
      { name: 'Products', icon: Package, current: activeTab === 'products' },
      { name: 'Orders', icon: ShoppingCart, current: activeTab === 'orders' },
      { name: 'View Website', icon: Globe, current: false },
      { name: 'Help', icon: HelpCircle, current: activeTab === 'help' }
    ]}
  ]

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      // Use admin credentials for dashboard stats
      const adminToken = localStorage.getItem('adminToken') || token;
      console.log('Fetching dashboard stats with token:', !!adminToken);
      
      const [productsRes, ordersRes] = await Promise.all([
        axios.get(backendUrl + '/api/product/list'),
        axios.get(backendUrl + '/api/order/list', {
          headers: { 
            'Authorization': `Bearer ${adminToken}`,
            'token': adminToken,
            'admin-token': adminToken
          }
        })
      ])

      console.log('Dashboard responses:', {
        products: productsRes.data.success,
        orders: ordersRes.data.success,
        ordersCount: ordersRes.data.orders?.length
      });

      if (productsRes.data.success && ordersRes.data.success) {
        const products = productsRes.data.products
        const orders = ordersRes.data.orders

        // Calculate statistics
        const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0)
        const totalOrders = orders.length
        const totalProducts = products.length

        // Calculate top selling products
        const productSales = {}
        orders.forEach(order => {
          order.items?.forEach(item => {
            if (productSales[item.name]) {
              productSales[item.name] += item.quantity || 1
            } else {
              productSales[item.name] = item.quantity || 1
            }
          })
        })

        const topProducts = Object.entries(productSales)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([name, sales]) => {
            const product = products.find(p => p.name === name)
            return {
              name,
              sales,
              image: product?.image?.[0] || '',
              price: product?.price || 0
            }
          })

        // Get recent orders
        const recentOrders = orders.slice(0, 5)

        setDashboardStats({
          totalRevenue,
          totalOrders,
          totalProducts,
          topProducts,
          recentOrders
        })
        
        console.log('Dashboard stats updated:', { totalOrders, totalRevenue });
      }
    } catch (error) {
      console.log('Error fetching dashboard stats:', error.response?.data || error)
    }
  }

  // Fetch notifications (new orders)
  const fetchNotifications = async () => {
    try {
      // Use admin credentials for notifications
      const adminToken = localStorage.getItem('adminToken') || token;
      console.log('Fetching notifications with token:', !!adminToken);
      
      const response = await axios.get(backendUrl + '/api/order/list', {
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'token': adminToken,
          'admin-token': adminToken
        }
      })
      
      if (response.data.success) {
        const orders = response.data.orders
        
        // Get read notifications from localStorage
        const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        
        // Create notifications for unread orders only
        const unreadNotifications = orders.slice(0, 5).map(order => {
          const notificationId = order._id;
          const isRead = readNotifications.includes(notificationId);
          
          return {
            id: notificationId,
            type: 'order',
            title: 'New Order Received',
            message: `Order #${order._id.slice(-6)} - $${order.amount}`,
            time: new Date(order.date).toLocaleTimeString(),
            read: isRead,
            orderData: order
          };
        }).filter(notification => !notification.read); // Only show unread notifications
        
        setNotifications(unreadNotifications);
        console.log('Notifications set:', unreadNotifications.length);
      }
    } catch (error) {
      console.log('Error fetching notifications:', error.response?.data || error)
    }
  }

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    if (!readNotifications.includes(notificationId)) {
      readNotifications.push(notificationId);
      localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
    }
    
    // Remove from current notifications
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    toast.success('Notification marked as read');
  }

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    const currentNotificationIds = notifications.map(n => n.id);
    
    const updatedReadNotifications = [...new Set([...readNotifications, ...currentNotificationIds])];
    localStorage.setItem('readNotifications', JSON.stringify(updatedReadNotifications));
    
    setNotifications([]);
    toast.success('All notifications marked as read');
  }

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        console.log('Products fetched:', response.data.products);
        setProducts(response.data.products.reverse());
      }
    } catch (error) {
      console.log('Error fetching products:', error)
      toast.error(error.message)
    }
  }

  // Fetch orders
  const fetchOrders = async () => {
    try {
      // Use admin credentials for order management
      const adminToken = localStorage.getItem('adminToken') || token;
      console.log('Fetching orders with token:', !!adminToken);
      console.log('Making request to:', backendUrl + '/api/order/list');
      
      const response = await axios.get(backendUrl + '/api/order/list', {
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'token': adminToken,
          'admin-token': adminToken
        }
      })
      
      console.log('Orders response:', response.data);
      
      if (response.data.success) {
        // Enhance orders with customer information
        const ordersWithCustomerInfo = await Promise.all(
          response.data.orders.map(async (order) => {
            try {
              // Fetch customer details using new admin endpoint
              const customerResponse = await axios.get(backendUrl + '/api/user-profile/user', {
                headers: { 
                  'Authorization': `Bearer ${adminToken}`,
                  'token': adminToken,
                  'admin-token': adminToken
                },
                params: { userId: order.userId }
              });
              
              if (customerResponse.data.success) {
                const customer = customerResponse.data.user;
                return {
                  ...order,
                  customerInfo: {
                    name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.name || 'Unknown',
                    email: customer.email || 'No email',
                    phone: customer.phone || 'No phone'
                  }
                };
              }
            } catch (error) {
              console.log('Failed to fetch customer for order:', order._id, error);
            }
            
            // Fallback if customer fetch fails
            return {
              ...order,
              customerInfo: {
                name: `Customer ${order.userId?.slice(-6) || 'Unknown'}`,
                email: 'No email',
                phone: 'No phone'
              }
            };
          })
        );
        
        setOrders(ordersWithCustomerInfo.reverse());
        console.log('Orders set with customer info:', ordersWithCustomerInfo.length);
        toast.success(`Loaded ${ordersWithCustomerInfo.length} orders`);
      } else {
        console.log('Orders fetch failed:', response.data.message);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log('Error fetching orders:', error);
      console.log('Error response:', error.response?.data);
      console.log('Error status:', error.response?.status);
      console.log('Error URL:', error.config?.url);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login as admin again.');
      } else if (error.response?.status === 404) {
        toast.error('Orders endpoint not found. Check backend routes.');
      } else {
        toast.error(error.response?.data?.message || `Failed to fetch orders: ${error.message}`);
      }
    }
  }

  // Fetch data on component mount and tab change
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats()
      fetchNotifications()
    } else if (activeTab === 'products') {
      fetchProducts()
    } else if (activeTab === 'orders') {
      fetchOrders()
    }
  }, [activeTab])

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (activeTab === 'dashboard') {
      const interval = setInterval(() => {
        fetchNotifications()
        fetchDashboardStats()
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(interval)
    }
  }, [activeTab])

  // Auto-refresh orders every 30 seconds when on orders tab
  useEffect(() => {
    if (activeTab === 'orders') {
      const interval = setInterval(() => {
        fetchOrders()
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(interval)
    }
  }, [activeTab])

  // Add product
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!name || !description || !price) {
      toast.error("Name, description, and price are required");
      return;
    }

    if (sizes.length === 0) {
      toast.error("Please select at least one product size");
      return;
    }

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("subCategory", subCategory)
      formData.append("bestseller", bestseller)
      formData.append("sizes", JSON.stringify(sizes))

      image1 && formData.append("image1", image1)
      image2 && formData.append("image2", image2)
      image3 && formData.append("image3", image3)
      image4 && formData.append("image4", image4)

      const response = await axios.post(backendUrl + "/api/product/add", formData, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        setName('')
        setDescription('')
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
        setPrice('')
        setSizes([])
        setBestseller(false)
        setShowAddProduct(false)
        fetchProducts()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  // Remove product
  const removeProduct = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        fetchProducts()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts()
    } else if (activeTab === 'orders') {
      fetchOrders()
    }
  }, [activeTab])

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(products.map(p => p._id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const adminToken = localStorage.getItem('adminToken') || token;
      console.log('Updating order status:', { orderId, newStatus });
      
      const response = await axios.post(backendUrl + '/api/order/status', {
        orderId,
        status: newStatus
      }, {
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'token': adminToken,
          'admin-token': adminToken
        }
      });
      
      if (response.data.success) {
        toast.success('Order status updated successfully');
        fetchOrders(); // Refresh orders list
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.log('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'Order Placed': 'bg-blue-100 text-blue-800',
      'Packing': 'bg-yellow-100 text-yellow-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Out for Delivery': 'bg-orange-100 text-orange-800',
      'Delivered': 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (!token) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
          <p className="text-gray-600">Please log in as an administrator to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="ml-3 text-xl font-semibold text-gray-900">Clothify Admin</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-8">
          {navigation.map((section) => (
            <div key={section.section}>
              {sidebarOpen && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {section.section}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      if (item.name === 'Dashboard') setActiveTab('dashboard')
                      if (item.name === 'Products') setActiveTab('products')
                      if (item.name === 'Orders') setActiveTab('orders')
                      if (item.name === 'View Website') navigate('/')
                      if (item.name === 'Help') setActiveTab('help')
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      item.current
                        ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {sidebarOpen && <span className="ml-3">{item.name}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No new notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{notification.title}</p>
                                <p className="text-sm text-gray-600 truncate">{notification.message}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-xs text-gray-400">{notification.time}</p>
                                  <span className="text-xs text-blue-600 hover:text-blue-700">Click to view</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setActiveTab('orders');
                            setShowNotifications(false);
                          }}
                          className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View all orders
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button 
                      onClick={() => {
                        setShowDropdown(false)
                        toast.info('Profile feature coming soon!')
                      }}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <User className="w-4 h-4 mr-2" /> Profile
                    </button>
                    <button 
                      onClick={() => {
                        setShowDropdown(false)
                        toast.info('Settings feature coming soon!')
                      }}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-2" /> Settings
                    </button>
                    <hr className="my-1" />
                    <button 
                      onClick={() => {
                        setShowDropdown(false)
                        localStorage.removeItem('token')
                        localStorage.removeItem('adminToken')
                        setToken('')
                        toast.success('Logged out successfully!')
                        navigate('/login')
                      }}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                  <p className="text-gray-600">Overview of your business performance and analytics</p>
                </div>
                <button
                  onClick={() => {
                    fetchDashboardStats()
                    fetchNotifications()
                    toast.success('Dashboard refreshed')
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">${dashboardStats.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalOrders}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalProducts}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${dashboardStats.totalOrders > 0 ? (dashboardStats.totalRevenue / dashboardStats.totalOrders).toFixed(2) : '0.00'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Top Selling Products */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
                  {dashboardStats.topProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No sales data available</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dashboardStats.topProducts.map((product, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                            {index + 1}
                          </div>
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">${product.price} • {product.sales} sold</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">${(product.price * product.sales).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                  {dashboardStats.recentOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dashboardStats.recentOrders.map((order) => (
                        <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Order #{order._id.slice(-6)}</p>
                            <p className="text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">${order.amount}</p>
                            <p className="text-sm text-gray-600">{order.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
                <p className="text-gray-600">Manage your product inventory and catalog</p>
              </div>

              {/* Top Controls */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option>Show: All Products</option>
                      <option>Active Products</option>
                      <option>Inactive Products</option>
                    </select>

                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option>Sort by: Default</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Name: A to Z</option>
                    </select>

                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                  </div>

                  <button 
                    onClick={() => setShowAddProduct(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {products.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500 mb-4">Get started by adding your first product.</p>
                    <button 
                      onClick={() => setShowAddProduct(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center mx-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </button>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product._id)}
                              onChange={() => handleSelectProduct(product._id)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            {product.image && product.image.length > 0 ? (
                              <img
                                src={product.image[0]}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover"
                                onError={(e) => {
                                  console.log('Image failed to load:', product.image[0]);
                                  // Use a data URI fallback image
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMxOC40NzcyIDMyIDE0IDI3LjUyMjggMTQgMjJDMTQgMTYuNDc3MiAxOC40NzcyIDEyIDI0IDEyQzI5LjUyMjggMTIgMzQgMTYuNDc3MiAzNCAyMkMzNCAyNy41MjI4IDI5LjUyMjggMzIgMjQgMzJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yNCAyNkMyMi4zNDMxIDI2IDIxIDI0LjY1NjkgMjEgMjNDMjEgMjEuMzQzMSAyMi4zNDMxIDIwIDI0IDIwQzI1LjY1NjkgMjAgMjcgMjEuMzQzMSAyNyAyM0MyNyAyNC42NTY5IDI1LjY1NjkgMjYgMjQgMjZaIiBmaWxsPSIjNjM2NkYxIi8+Cjwvc3ZnPgo=';
                                }}
                                onLoad={() => {
                                  console.log('Image loaded successfully:', product.image[0]);
                                }}
                                crossOrigin="anonymous"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            ${product.price}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-1 text-purple-600 hover:bg-purple-50 rounded">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => removeProduct(product._id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <>
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
                  <p className="text-gray-600">Manage customer orders and fulfillment</p>
                </div>
                <button
                  onClick={() => {
                    fetchOrders()
                    toast.success('Orders refreshed')
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Orders
                </button>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {order._id.slice(-8)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {order.customerInfo?.name || 'Unknown Customer'}
                            </div>
                            <div className="text-gray-500">
                              ID: {order.userId?.slice(-6)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-900">
                              {order.customerInfo?.email || 'No email'}
                            </div>
                            <div className="text-gray-500">
                              {order.customerInfo?.phone || 'No phone'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {order.items?.length || 0} items
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${order.amount}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Packing">Packing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            <div>{new Date(order.date).toLocaleDateString()}</div>
                            <div className="text-gray-500 text-xs">
                              {new Date(order.date).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Help Tab */}
          {activeTab === 'help' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Help & Support</h1>
                <p className="text-gray-600">Find answers to common questions and get support</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Getting Started */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <HelpCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Getting Started</h3>
                  <p className="text-gray-600 mb-4">Learn the basics of using your admin dashboard</p>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">Adding Products</h4>
                      <p className="text-sm text-gray-600">Click "Add Product" to create new inventory items with images and details.</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">Managing Orders</h4>
                      <p className="text-sm text-gray-600">View and process customer orders from the Orders tab.</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">Dashboard Analytics</h4>
                      <p className="text-sm text-gray-600">Monitor sales performance and top products in real-time.</p>
                    </div>
                  </div>
                </div>

                {/* Common Issues */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Settings className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Common Issues</h3>
                  <p className="text-gray-600 mb-4">Solutions to frequently encountered problems</p>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">Images Not Uploading?</h4>
                      <p className="text-sm text-gray-600">Check Cloudinary credentials in your .env file.</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">Orders Not Showing?</h4>
                      <p className="text-sm text-gray-600">Ensure backend is running and database is connected.</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">Can't Login?</h4>
                      <p className="text-sm text-gray-600">Use admin@clothify.com with password admin123.</p>
                    </div>
                  </div>
                </div>

                {/* Contact Support */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Support</h3>
                  <p className="text-gray-600 mb-4">Get help from our support team</p>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">Email Support</h4>
                      <p className="text-sm text-gray-600">support@clothify.com</p>
                      <p className="text-xs text-gray-500">Response within 24 hours</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">Live Chat</h4>
                      <p className="text-sm text-gray-600">Available 9 AM - 6 PM EST</p>
                      <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">Start Chat</button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">Documentation</h4>
                      <p className="text-sm text-gray-600">Browse our comprehensive guides</p>
                      <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">View Docs</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Pro Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Use High-Quality Images</h4>
                      <p className="text-sm text-gray-600">Better images increase sales conversion.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Monitor Dashboard Daily</h4>
                      <p className="text-sm text-gray-600">Stay updated on sales trends.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Update Inventory Regularly</h4>
                      <p className="text-sm text-gray-600">Keep stock levels accurate.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 font-semibold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Respond to Orders Quickly</h4>
                      <p className="text-sm text-gray-600">Fast fulfillment improves customer satisfaction.</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold'>Add New Product</h3>
              <button
                onClick={() => setShowAddProduct(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <form onSubmit={onSubmitHandler} className='flex flex-col gap-4'>
              <div>
                <p className='mb-2'>Upload Images</p>
                <div className='flex gap-2'>
                  {[image1, image2, image3, image4].map((img, index) => (
                    <label key={index} htmlFor={`image${index + 1}`}>
                      <div className='w-20 h-20 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400'>
                        {img ? (
                          <img src={URL.createObjectURL(img)} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <input 
                        onChange={(e) => {
                          if (index === 0) setImage1(e.target.files[0])
                          if (index === 1) setImage2(e.target.files[0])
                          if (index === 2) setImage3(e.target.files[0])
                          if (index === 3) setImage4(e.target.files[0])
                        }} 
                        type="file" 
                        id={`image${index + 1}`} 
                        hidden 
                      />
                    </label>
                  ))}
                </div>
              </div>

              <input 
                onChange={(e) => setName(e.target.value)} 
                value={name} 
                className='w-full px-3 py-2 border border-gray-300 rounded-lg' 
                type="text" 
                placeholder='Product Name' 
                required 
              />

              <textarea 
                onChange={(e) => setDescription(e.target.value)} 
                value={description} 
                className='w-full px-3 py-2 border border-gray-300 rounded-lg' 
                placeholder='Product Description' 
                required 
              />

              <div className='flex gap-4'>
                <select 
                  onChange={(e) => setCategory(e.target.value)} 
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-lg'
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                </select>

                <select 
                  onChange={(e) => setSubCategory(e.target.value)} 
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-lg'
                >
                  <option value="Topwear">Topwear</option>
                  <option value="Bottomwear">Bottomwear</option>
                  <option value="Winterwear">Winterwear</option>
                </select>

                <input 
                  onChange={(e) => setPrice(e.target.value)} 
                  value={price} 
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-lg' 
                  type="Number" 
                  placeholder='Price' 
                />
              </div>

              <div>
                <p className='mb-2'>Product Sizes</p>
                <div className='flex gap-2'>
                  {["S", "M", "L", "XL", "XXL"].map((size) => (
                    <div 
                      key={size}
                      onClick={() => setSizes(prev => 
                        prev.includes(size) 
                          ? prev.filter(item => item !== size) 
                          : [...prev, size]
                      )}
                      className={`px-3 py-1 cursor-pointer rounded ${
                        sizes.includes(size) 
                          ? "bg-purple-100 text-purple-800 border border-purple-300" 
                          : "bg-gray-100 text-gray-800 border border-gray-300"
                      }`}
                    >
                      {size}
                    </div>
                  ))}
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <input 
                  onChange={() => setBestseller(prev => !prev)} 
                  checked={bestseller} 
                  type="checkbox" 
                  id='bestseller' 
                />
                <label className='cursor-pointer' htmlFor="bestseller">Add to Bestseller</label>
              </div>

              <div className='flex gap-2'>
                <button 
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className='flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className='flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
