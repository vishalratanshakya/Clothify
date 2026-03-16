import React, { useState, useRef, useEffect } from 'react';

const ResponsiveImage = ({ 
  src, 
  alt, 
  className = '', 
  sizes = '(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw',
  priority = false,
  aspectRatio = '1/1',
  onLoad,
  onError,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!priority) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        {
          rootMargin: '50px', // Start loading 50px before image comes into view
        }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    } else {
      setIsInView(true); // Load immediately if priority
    }
  }, [priority]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  // Generate responsive srcset (you can enhance this with actual different image sizes)
  const generateSrcSet = (baseSrc) => {
    // For local assets, we'll use the same image
    // In production, you'd have different sized versions
    return `${baseSrc} 1x, ${baseSrc} 2x`;
  };

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      style={{ aspectRatio }}
    >
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200">
          <div className="image-skeleton absolute inset-0" />
        </div>
      )}

      {/* Error placeholder */}
      {hasError && (
        <div className="image-error absolute inset-0 flex flex-col items-center justify-center">
          <svg 
            className="w-8 h-8 text-gray-400 mb-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <span className="text-xs text-gray-500">Image not available</span>
        </div>
      )}

      {/* Main image */}
      {isInView && !hasError && (
        <img
          src={src}
          srcSet={generateSrcSet(src)}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full object-cover transition-all duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            hover:scale-110
          `}
          {...props}
        />
      )}
    </div>
  );
};

export default ResponsiveImage;
