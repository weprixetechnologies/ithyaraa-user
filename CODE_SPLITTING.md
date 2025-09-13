# Code Splitting Implementation

This document outlines the code splitting implementation in the ITHYARAA user application to improve performance and reduce initial bundle size.

## 🚀 Implementation Overview

### 1. Lazy Loading Components

#### Profile Page (`/app/profile/page.jsx`)
- **AccountDetail**: Lazy loaded with Suspense boundary
- **Addresses**: Lazy loaded with Suspense boundary  
- **GiftCard**: Lazy loaded with Suspense boundary
- **ApplyAffiliate**: Lazy loaded with Suspense boundary
- **Payout**: Lazy loaded with Suspense boundary

#### Home Page (`/app/page.jsx`)
- **Slider**: Dynamic import with loading fallback
- **TilledMiniCategories**: Dynamic import with loading fallback
- **RollingText**: Dynamic import with loading fallback
- **FeaturingBlock**: Dynamic import with loading fallback
- **ProductSection**: Dynamic import with loading fallback

#### Product Page (`/app/products/[productID]/page.jsx`)
- **ProductGallery**: Lazy loaded with Suspense
- **ProductTabs**: Lazy loaded with Suspense
- **ProductSection**: Lazy loaded with Suspense
- **Reviews**: Lazy loaded with Suspense

#### Cart Page (`/app/cart/page.jsx`)
- **BreakdownCart**: Lazy loaded with Suspense
- **CartItems**: Lazy loaded with Suspense
- **SelectAddress**: Lazy loaded with Suspense
- **SelectPayment**: Lazy loaded with Suspense
- **ValidateCoupon**: Lazy loaded with Suspense

### 2. Bundle Optimization

#### Webpack Configuration (`next.config.mjs`)
- **Vendor Chunks**: Separates node_modules into vendor bundle
- **React Icons Chunk**: Dedicated chunk for react-icons library
- **UI Components Chunk**: Groups all UI components
- **Profile Components Chunk**: Groups profile-related components
- **Product Components Chunk**: Groups product-related components
- **Common Chunk**: Shared code between pages

#### Package Import Optimization
- Optimized imports for `react-icons`, `react-spinners`, `react-toastify`
- Centralized import utilities in `/lib/imports.js`

### 3. Loading States

#### Skeleton Components (`/components/ui/skeleton.jsx`)
- **Skeleton**: Base skeleton component
- **CardSkeleton**: Predefined card loading state
- **ProductSkeleton**: Product card loading state
- **TableSkeleton**: Table loading state
- **ListSkeleton**: List loading state

#### Loading Fallbacks
- Custom loading states for each component type
- Consistent design with skeleton animations
- Appropriate sizing for different content types

### 4. Performance Monitoring

#### Performance Monitor (`/components/ui/performanceMonitor.jsx`)
- Tracks bundle loading performance
- Monitors code splitting effectiveness
- Logs chunk loading statistics
- Measures page load metrics

## 📊 Benefits

### Performance Improvements
1. **Reduced Initial Bundle Size**: Only essential code loads initially
2. **Faster Page Loads**: Components load on-demand
3. **Better Caching**: Separate chunks can be cached independently
4. **Improved Core Web Vitals**: Better LCP, FID, and CLS scores

### User Experience
1. **Progressive Loading**: Content appears as it loads
2. **Smooth Transitions**: Skeleton loaders provide visual feedback
3. **Faster Navigation**: Cached chunks load instantly on revisit

### Developer Experience
1. **Better Bundle Analysis**: Clear separation of concerns
2. **Easier Debugging**: Isolated component chunks
3. **Performance Insights**: Built-in monitoring and logging

## 🔧 Usage

### Adding New Lazy Components

```jsx
import { Suspense, lazy } from 'react';
import { CardSkeleton } from '@/components/ui/skeleton';

const MyComponent = lazy(() => import('@/components/MyComponent'));

// In JSX
<Suspense fallback={<CardSkeleton className="h-64" />}>
  <MyComponent />
</Suspense>
```

### Using Dynamic Imports

```jsx
import dynamic from 'next/dynamic';

const MyComponent = dynamic(() => import('@/components/MyComponent'), {
  loading: () => <div className="h-32 bg-gray-200 animate-pulse rounded-lg" />
});
```

### Custom Skeleton Components

```jsx
import { Skeleton, ProductSkeleton } from '@/components/ui/skeleton';

// Custom skeleton
<Skeleton className="h-4 bg-gray-200 animate-pulse rounded" />

// Predefined skeleton
<ProductSkeleton className="mb-4" />
```

## 📈 Monitoring

The performance monitor automatically tracks:
- Bundle loading times
- Chunk count and sizes
- Page load performance
- Code splitting effectiveness

Check browser console for detailed performance logs.

## 🎯 Best Practices

1. **Lazy load heavy components**: Only load what's needed initially
2. **Use appropriate loading states**: Match skeleton size to content
3. **Group related components**: Keep related code in same chunks
4. **Monitor performance**: Use built-in monitoring tools
5. **Test loading states**: Ensure smooth user experience

## 🔄 Future Optimizations

1. **Route-based splitting**: Further split by page routes
2. **Preloading**: Preload critical components
3. **Service Worker**: Cache chunks for offline use
4. **Bundle analysis**: Regular bundle size monitoring
5. **A/B testing**: Test different splitting strategies
