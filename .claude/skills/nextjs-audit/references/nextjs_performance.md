# Next.js Performance Optimization Guide

Comprehensive patterns and best practices for optimizing Next.js 14+ applications.

## Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| FID (First Input Delay) | ≤ 100ms | 100ms - 300ms | > 300ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| FCP (First Contentful Paint) | ≤ 1.8s | 1.8s - 3.0s | > 3.0s |
| TTFB (Time to First Byte) | ≤ 800ms | 800ms - 1800ms | > 1800ms |

## 1. Image Optimization

### Always Use next/image

```tsx
// ❌ Bad - Standard img tag
<img src="/hero.jpg" alt="Hero image" />

// ✅ Good - next/image with optimization
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority  // For LCP images
/>
```

### Priority for Above-the-Fold Images

```tsx
// ✅ Good - Priority for hero images
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority  // Prevents lazy loading, preloads image
/>

// ✅ Good - Lazy load below-the-fold images
<Image
  src="/gallery-1.jpg"
  alt="Gallery"
  width={400}
  height={300}
  // No priority = lazy loaded by default
/>
```

### Responsive Images

```tsx
// ✅ Good - Responsive with sizes
<Image
  src="/responsive.jpg"
  alt="Responsive image"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

// ✅ Good - Fill container
<div style={{ position: 'relative', width: '100%', height: '400px' }}>
  <Image
    src="/bg.jpg"
    alt="Background"
    fill
    style={{ objectFit: 'cover' }}
  />
</div>
```

### Modern Formats

```tsx
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  }
}
```

**Impact:**
- AVIF: ~50% smaller than JPEG
- WebP: ~30% smaller than JPEG
- Automatic format selection based on browser support

## 2. Font Optimization

### Use next/font

```tsx
// ❌ Bad - External Google Fonts link
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700" rel="stylesheet" />

// ✅ Good - next/font/google
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

### Local Fonts

```tsx
// ✅ Good - Self-hosted fonts
import localFont from 'next/font/local'

const myFont = localFont({
  src: [
    {
      path: './fonts/MyFont-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/MyFont-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-my-font',
  display: 'swap',
})
```

**Benefits:**
- Eliminates external font request
- Automatic font subsetting
- Zero layout shift (font-display: swap)
- Preloaded automatically

## 3. Server vs Client Components

### Default to Server Components

```tsx
// ✅ Good - Server Component (default)
// app/page.tsx
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  return <div>{data}</div>
}

// ❌ Bad - Unnecessary client component
'use client'
export default function Page() {
  const data = useSWR('https://api.example.com/data')
  return <div>{data}</div>
}
```

### Client Components Only When Needed

Use 'use client' only for:
- Event handlers (onClick, onChange, etc.)
- Hooks (useState, useEffect, etc.)
- Browser APIs (localStorage, window, etc.)
- Context providers

```tsx
// ✅ Good - Server wrapper with client island
// app/page.tsx (Server Component)
export default function Page() {
  return (
    <div>
      <h1>Static Header</h1>
      <InteractiveButton />  {/* Client Component */}
    </div>
  )
}

// components/InteractiveButton.tsx
'use client'
export default function InteractiveButton() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### Composition Pattern

```tsx
// ✅ Good - Pass server components as children to client components
'use client'
export default function ClientWrapper({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  return <div>{isOpen && children}</div>
}

// app/page.tsx
export default function Page() {
  return (
    <ClientWrapper>
      <ServerComponent />  {/* Stays as server component! */}
    </ClientWrapper>
  )
}
```

## 4. Data Fetching

### Server-Side Fetching

```tsx
// ✅ Good - Fetch in Server Component
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'force-cache',  // or 'no-store' for dynamic
  })
  return <div>{JSON.stringify(data)}</div>
}

// ✅ Good - Parallel data fetching
export default async function Page() {
  const [users, posts] = await Promise.all([
    fetch('https://api.example.com/users'),
    fetch('https://api.example.com/posts'),
  ])
  return <div>...</div>
}
```

### Caching Strategies

```tsx
// Static - Revalidate every hour
fetch('https://api.example.com/data', {
  next: { revalidate: 3600 }
})

// Dynamic - Never cache
fetch('https://api.example.com/data', {
  cache: 'no-store'
})

// Static by default
fetch('https://api.example.com/data')
// Same as: { cache: 'force-cache' }
```

### Route Segment Config

```tsx
// app/page.tsx
export const dynamic = 'force-static'  // or 'force-dynamic', 'error', 'auto'
export const revalidate = 3600  // Revalidate every hour

export default function Page() {
  return <div>Content</div>
}
```

## 5. Code Splitting & Lazy Loading

### Dynamic Imports

```tsx
// ✅ Good - Dynamic import for heavy component
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false,  // Disable SSR if component uses window/document
})

export default function Page() {
  return <HeavyComponent />
}
```

### Conditional Dynamic Imports

```tsx
// ✅ Good - Load only when needed
'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const Modal = dynamic(() => import('./Modal'))

export default function Page() {
  const [showModal, setShowModal] = useState(false)
  
  return (
    <div>
      <button onClick={() => setShowModal(true)}>Open Modal</button>
      {showModal && <Modal />}
    </div>
  )
}
```

### Library Code Splitting

```tsx
// ❌ Bad - Import entire library
import _ from 'lodash'
const result = _.debounce(fn, 300)

// ✅ Good - Import specific function
import debounce from 'lodash/debounce'
const result = debounce(fn, 300)

// ✅ Good - Dynamic import for heavy libraries
const loadChart = async () => {
  const Chart = (await import('chart.js')).default
  return new Chart(ctx, config)
}
```

## 6. Bundle Optimization

### Analyze Bundle

```bash
# Install bundle analyzer
npm install -D @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // your config
})

# Run analysis
ANALYZE=true npm run build
```

### Tree Shaking

```tsx
// ❌ Bad - Imports entire module
import * as utils from './utils'
utils.formatDate(date)

// ✅ Good - Named import enables tree shaking
import { formatDate } from './utils'
formatDate(date)
```

### Reduce Dependencies

```tsx
// ❌ Bad - Heavy dependency for simple task
import moment from 'moment'  // 288KB
const formatted = moment(date).format('YYYY-MM-DD')

// ✅ Good - Native alternative
const formatted = new Intl.DateTimeFormat('en-US').format(date)

// Or use date-fns (tree-shakeable)
import { format } from 'date-fns'  // Only ~2KB for this function
const formatted = format(date, 'yyyy-MM-dd')
```

## 7. Loading States & Suspense

### Loading UI

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />
}

// app/dashboard/page.tsx
export default async function Dashboard() {
  const data = await fetchDashboardData()
  return <DashboardContent data={data} />
}
```

### Streaming with Suspense

```tsx
// ✅ Good - Stream different parts independently
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <Suspense fallback={<Skeleton />}>
        <FastComponent />
      </Suspense>
      
      <Suspense fallback={<Skeleton />}>
        <SlowComponent />  {/* Won't block fast component */}
      </Suspense>
    </div>
  )
}
```

## 8. Metadata & SEO

### Static Metadata

```tsx
// app/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home | My App',
  description: 'Welcome to my app',
  openGraph: {
    title: 'Home | My App',
    description: 'Welcome to my app',
    images: ['/og-image.jpg'],
  },
}
```

### Dynamic Metadata

```tsx
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await fetchPost(params.slug)
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [post.coverImage],
    },
  }
}
```

## 9. Middleware & Edge

### Lightweight Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server'

export function middleware(request) {
  // Only use middleware for simple logic
  // Heavy processing should be in API routes
  
  const country = request.geo?.country || 'US'
  const response = NextResponse.next()
  response.headers.set('x-country', country)
  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

## 10. Common Anti-Patterns

### ❌ Client-Side Data Fetching in useEffect

```tsx
// ❌ Bad
'use client'
export default function Page() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData)
  }, [])
  
  if (!data) return <div>Loading...</div>
  return <div>{data}</div>
}

// ✅ Good - Server Component
export default async function Page() {
  const data = await fetch('/api/data')
  return <div>{data}</div>
}
```

### ❌ Too Many Client Components

```tsx
// ❌ Bad - Everything is a client component
'use client'
export default function Layout({ children }) {
  return <div>{children}</div>  // No interactivity needed!
}

// ✅ Good - Only interactive parts are client
export default function Layout({ children }) {
  return (
    <div>
      <StaticHeader />
      {children}
      <InteractiveFooter />  {/* Only this is 'use client' */}
    </div>
  )
}
```

### ❌ Not Using Image Optimization

```tsx
// ❌ Bad
<img src={user.avatar} width={40} height={40} />

// ✅ Good
<Image src={user.avatar} width={40} height={40} alt={user.name} />
```

## Performance Checklist

### Build Time
- [ ] Bundle size < 200KB for main bundle
- [ ] Use dynamic imports for routes > 50KB
- [ ] Analyze with @next/bundle-analyzer
- [ ] Check for duplicate dependencies

### Images
- [ ] All images use next/image
- [ ] LCP images have priority prop
- [ ] Specify width/height to prevent CLS
- [ ] Use modern formats (AVIF/WebP)

### Fonts
- [ ] Use next/font for all fonts
- [ ] Preload critical fonts
- [ ] Use font-display: swap

### Components
- [ ] Server components by default
- [ ] Client components only when needed
- [ ] Heavy components dynamically imported
- [ ] Avoid large client component trees

### Data Fetching
- [ ] Fetch in Server Components
- [ ] Use caching strategies appropriately
- [ ] Parallel fetch when possible
- [ ] Stream with Suspense for slow data

### Lighthouse Scores (Target)
- [ ] Performance: > 90
- [ ] Accessibility: > 95
- [ ] Best Practices: > 90
- [ ] SEO: > 90

## Monitoring

### Add Performance Monitoring

```tsx
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
```

### Custom Performance Tracking

```tsx
// utils/performance.ts
export function measurePageLoad() {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const perfData = window.performance.timing
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
      
      // Send to analytics
      console.log('Page load time:', pageLoadTime)
    })
  }
}
```

## Resources

- [Next.js Performance Docs](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Vercel Analytics](https://vercel.com/analytics)
