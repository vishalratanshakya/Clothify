import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import UserProfile from './pages/UserProfile'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify'
// import Admin from './pages/Admin' // Pre-existing admin page - not using for this task
import CombinedAdmin from './pages/CombinedAdmin'
import Privacy from './pages/Privacy'

const App = () => {
  const location = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // Check if current route is admin dashboard: we hide main navbar only on the dashboard itself
  const isAdminRoute = location.pathname === '/admin' || location.pathname === '/admin-dashboard'

  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer />
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <SearchBar />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/collection' element={<Collection />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/login' element={<Login />} />
        <Route path='/place-order' element={<PlaceOrder />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/profile' element={<UserProfile />} />
        <Route path='/verify' element={<Verify />} />
        <Route path='/admin' element={<CombinedAdmin />} />
        <Route path='/admin-dashboard' element={<CombinedAdmin />} />
        <Route path='/home' element={<Home />} />
        <Route path='/privacy' element={<Privacy />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </div>
  )
}

export default App
