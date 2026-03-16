import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {

    const { products } = useContext(ShopContext);
    const [latestProducts,setLatestProducts] = useState([]);

    useEffect(()=>{
        setLatestProducts(products.slice(0,8));
    },[products])

  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
          <Title text1={'LATEST'} text2={'COLLECTIONS'} />
          <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Discover our newest arrivals featuring trendy designs, premium fabrics, and perfect fits for every style and occasion.
          </p>
      </div>

      {/* Rendering Products */}
      <div className='grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 gap-y-4 sm:gap-y-6'>
        {
          latestProducts.map((item,index)=>(
            <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} />
          ))
        }
      </div>

      {/* View More Button */}
      <div className='flex justify-center mt-8'>
        <Link 
          to='/collection' 
          className='bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-300'
        >
          View More
        </Link>
      </div>
    </div>
  )
}

export default LatestCollection
