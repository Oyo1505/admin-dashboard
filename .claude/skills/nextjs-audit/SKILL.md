---
name: nextjs-audit
description: Comprehensive Next.js application audit for performance optimization, accessibility compliance (WCAG/RGAA), and code quality. Use when analyzing Next.js projects for performance issues, accessibility violations, SEO problems, or when preparing technical audits for interviews or client projects.
---

# Next.js Performance & Accessibility Audit

Audit Next.js applications for performance, accessibility (WCAG 2.1 AA / RGAA 4.1), SEO, and code quality with automated checks and actionable recommendations.

## Audit Workflow

### Step 1: Project Structure Analysis

First, analyze the project:

```bash
# Check Next.js version and config
cat package.json | grep "next"
cat next.config.js  # or next.config.mjs

# List all pages and routes
find app -name "page.tsx" -o -name "page.jsx"  # App Router
find pages -name "*.tsx" -o -name "*.jsx"      # Pages Router
```

Look for:

- Next.js version (16+ recommended)
- App Router vs Pages Router usage
- Middleware configuration
- Image/font optimization settings

### Step 2: Automated Accessibility Check

Run the accessibility audit:

```bash
python scripts/check_accessibility.py <project-path>
```

This checks:

- Missing/empty alt text on images
- Invalid ARIA attributes
- Color contrast violations (WCAG AA)
- Keyboard navigation issues
- Semantic HTML structure
- Form accessibility

For detailed standards, see `references/accessibility_standards.md`.

### Step 3: Performance Analysis

Run the performance audit:

```bash
python scripts/analyze_performance.py <project-path>
```

Analyzes:

- Image optimization (next/image usage, formats)
- Bundle size and splitting
- Dynamic imports
- Font loading strategy
- Caching strategies
- Server/Client Component balance

See `references/nextjs_performance.md` for optimization patterns.

### Step 4: Generate Report

Create a structured audit report with:

**Critical Issues (P0)** - Block production deployment

- Accessibility blockers (WCAG A violations)
- Performance killers (LCP > 4s, CLS > 0.25)
- Security vulnerabilities

**Important Issues (P1)** - Fix before launch

- WCAG AA violations
- Non-optimized images/fonts
- Missing error boundaries
- Poor loading states

**Recommendations (P2)** - Quality improvements

- Code organization
- SEO enhancements
- Better caching strategies
- TypeScript strict mode

Include:

- Before/After code examples
- Expected impact (Lighthouse score improvements)
- Implementation time estimates

## Report Format Example

```markdown
# Next.js Audit Report - [Project Name]

## Executive Summary

- Lighthouse Score: [Current] → [Target]
- Accessibility Score: [X]/100
- Critical Issues: [N]
- Estimated Fix Time: [X] hours

## Critical Issues (P0)

### 1. Images Not Optimized

**Impact:** LCP of 4.2s (target: <2.5s)
**Files:** 15 images in /public without next/image

**Current:**
<Image src="/hero.png" alt="Hero" />

**Fix:**
import Image from 'next/image'
<Image src="/hero.png" alt="Hero" width={1200} height={600} priority />

**Expected Improvement:** LCP → 1.8s
```

## Available Resources

### Scripts

- `scripts/check_accessibility.py` - Scan JSX/TSX files for accessibility issues
- `scripts/analyze_performance.py` - Analyze bundle size, imports, and optimization

### References

- `references/accessibility_standards.md` - WCAG 2.1 AA & RGAA 4.1 compliance checklist
- `references/nextjs_performance.md` - Next.js optimization patterns and anti-patterns

## Common Anti-Patterns to Check

1. **Client Components Overuse**
   - 'use client' on every component
   - Should be server components by default

2. **Unoptimized Images**
   - Using <img> instead of <Image>
   - Missing width/height props
   - No priority for LCP images

3. **Poor Data Fetching**
   - Client-side fetch in useEffect
   - No caching strategy
   - Missing loading/error states

4. **Accessibility Issues**
   - Div buttons without keyboard support
   - Missing form labels
   - No skip links
   - Poor color contrast

5. **Bundle Bloat**
   - No dynamic imports for heavy libraries
   - Importing entire lodash instead of specific functions
   - Duplicate dependencies
