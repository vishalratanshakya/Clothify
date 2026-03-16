import React from 'react'

const Logo = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="text-2xl font-bold text-gray-800">
        <span className="text-black">Cloth</span>
        <span className="text-gray-600">ify</span>
      </div>
    </div>
  )
}

export default Logo
