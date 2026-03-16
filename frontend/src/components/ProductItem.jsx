import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import {Link} from 'react-router-dom'

const ProductItem = ({id,image,name,price}) => {
    
    const {currency} = useContext(ShopContext);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageError = () => {
        setImageError(true);
    };

  return (
    <Link onClick={()=>scrollTo(0,0)} className='text-gray-700 cursor-pointer group' to={`/product/${id}`}>
      <div className='relative overflow-hidden bg-gray-100 rounded-lg aspect-square'>
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className='absolute inset-0 bg-gray-200 animate-pulse' />
        )}
        
        {/* Error placeholder */}
        {imageError && (
          <div className='absolute inset-0 bg-gray-200 flex items-center justify-center'>
            <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
            </svg>
          </div>
        )}
        
        {/* Main image with responsive attributes */}
        <img 
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          src={image[0]} 
          alt={name}
          loading='lazy'
          onLoad={handleImageLoad}
          onError={handleImageError}
          sizes='
            (max-width: 640px) 50vw,
            (max-width: 768px) 33vw,
            (max-width: 1024px) 25vw,
            20vw
          '
          style={{
            aspectRatio: '1/1',
            objectFit: 'cover'
          }}
        />
      </div>
      
      {/* Product info */}
      <div className='pt-3 pb-1'>
        <p className='text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors'>
          {name}
        </p>
        <p className='text-sm font-bold text-gray-900 mt-1'>
          {currency}{price}
        </p>
      </div>
    </Link>
  )
}

export default ProductItem
