# Accessibility Standards Reference

Comprehensive guide for WCAG 2.1 Level AA and RGAA 4.1 compliance in Next.js applications.

## Quick Reference

### WCAG 2.1 AA Critical Criteria

| Criterion | Level | RGAA | Description |
|-----------|-------|------|-------------|
| 1.1.1 | A | 1.1 | Non-text content has text alternatives |
| 1.3.1 | A | 9.1 | Info and relationships are programmatically determinable |
| 1.4.3 | AA | 3.2 | Color contrast ratio of at least 4.5:1 |
| 2.1.1 | A | 7.1 | All functionality available via keyboard |
| 2.4.1 | A | 12.1 | Mechanism to skip repetitive content |
| 2.4.4 | A | 6.1 | Link purpose clear from link text |
| 3.3.1 | A | 11.10 | Input errors are identified |
| 3.3.2 | A | 11.11 | Labels or instructions for user input |
| 4.1.1 | A | 8.1 | HTML is valid and properly nested |
| 4.1.2 | A | 8.2 | Name, role, value available for components |

## 1. Images and Media (WCAG 1.1.1 / RGAA 1)

### Images

**Critical:** Every image must have an alt attribute.

```tsx
// ❌ Bad
<img src="/photo.jpg" />
<Image src="/photo.jpg" width={500} height={300} />

// ✅ Good - Informative image
<img src="/photo.jpg" alt="Team celebrating product launch" />
<Image src="/photo.jpg" alt="Sales graph showing 40% growth" width={500} height={300} />

// ✅ Good - Decorative image
<img src="/decoration.svg" alt="" />
<Image src="/pattern.png" alt="" width={500} height={300} />
```

**Rules:**
- Informative images: Describe the content/function
- Decorative images: Use empty alt="" (not missing alt)
- Complex images: Provide long description nearby
- Text in images: Include the text in alt

### Background Images

```tsx
// ❌ Bad - Information in CSS background
<div style={{ backgroundImage: 'url(/promo.jpg)' }} />

// ✅ Good - Use img with role="presentation" or provide alternative
<div role="img" aria-label="50% off summer sale">
  <div style={{ backgroundImage: 'url(/promo.jpg)' }} />
</div>
```

## 2. Semantic HTML (WCAG 1.3.1 / RGAA 9.1)

### Heading Hierarchy

```tsx
// ❌ Bad - Skipped levels
<h1>Main Title</h1>
<h3>Subtitle</h3>  {/* Skipped h2 */}

// ✅ Good - Proper hierarchy
<h1>Main Title</h1>
<h2>Subtitle</h2>
<h3>Sub-section</h3>
```

**Rules:**
- One h1 per page (usually in layout.tsx or page.tsx)
- Don't skip heading levels
- Don't use headings for styling (use CSS)

### Landmarks

```tsx
// ✅ Good - Semantic structure
<header>
  <nav aria-label="Main navigation">
    {/* Navigation links */}
  </nav>
</header>

<main>
  <article>
    <h1>Page Title</h1>
    {/* Main content */}
  </article>
  
  <aside aria-label="Related articles">
    {/* Sidebar content */}
  </aside>
</main>

<footer>
  {/* Footer content */}
</footer>
```

## 3. Keyboard Navigation (WCAG 2.1.1 / RGAA 7)

### Interactive Elements

**Critical:** All interactive elements must be keyboard accessible.

```tsx
// ❌ Bad - Div button without keyboard support
<div onClick={handleClick}>Click me</div>

// ✅ Good - Proper button
<button onClick={handleClick}>Click me</button>

// ✅ Good - Div button with keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }}
>
  Click me
</div>
```

### Skip Links

```tsx
// ✅ Good - Skip to main content
export default function Layout({ children }) {
  return (
    <html>
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        
        <header>{/* Navigation */}</header>
        
        <main id="main">{children}</main>
      </body>
    </html>
  )
}

// CSS for skip link
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### Focus Management

```tsx
// ✅ Good - Custom focus styles
<button className="btn">
  Click me
</button>

// CSS
.btn:focus-visible {
  outline: 2px solid #4A90E2;
  outline-offset: 2px;
}

// Never do this:
button {
  outline: none; /* ❌ Bad - removes focus indicator */
}
```

## 4. Forms (WCAG 3.3 / RGAA 11)

### Labels

```tsx
// ❌ Bad - No label
<input type="text" placeholder="Enter email" />

// ✅ Good - Visible label
<label htmlFor="email">Email address</label>
<input type="email" id="email" required />

// ✅ Good - ARIA label (when visual label not needed)
<input 
  type="search" 
  aria-label="Search products"
  placeholder="Search..."
/>
```

### Error Handling

```tsx
// ✅ Good - Accessible form with errors
'use client'
import { useState } from 'react'

export default function ContactForm() {
  const [errors, setErrors] = useState({})
  
  return (
    <form aria-describedby="form-instructions">
      <div id="form-instructions">
        All fields marked with * are required
      </div>
      
      <div>
        <label htmlFor="name">
          Name <span aria-label="required">*</span>
        </label>
        <input
          id="name"
          type="text"
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
          required
        />
        {errors.name && (
          <div id="name-error" role="alert">
            {errors.name}
          </div>
        )}
      </div>
      
      <button type="submit">Submit</button>
    </form>
  )
}
```

## 5. Color Contrast (WCAG 1.4.3 / RGAA 3.2)

### Contrast Ratios

**Required:**
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

```tsx
// ❌ Bad - Insufficient contrast
<p style={{ color: '#767676', background: '#fff' }}>
  Text with 4.54:1 contrast (borderline)
</p>

// ✅ Good - Sufficient contrast
<p style={{ color: '#595959', background: '#fff' }}>
  Text with 7:1 contrast
</p>
```

**Tools:**
- Chrome DevTools Contrast Checker
- WebAIM Contrast Checker
- Figma contrast plugins

## 6. ARIA Attributes (WCAG 4.1.2 / RGAA 8.2)

### Common Patterns

```tsx
// Expandable section
<div>
  <button
    aria-expanded={isOpen}
    aria-controls="content-1"
    onClick={toggle}
  >
    Toggle content
  </button>
  <div id="content-1" hidden={!isOpen}>
    Content here
  </div>
</div>

// Modal dialog
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-desc"
>
  <h2 id="dialog-title">Confirm action</h2>
  <p id="dialog-desc">Are you sure you want to proceed?</p>
  <button>Confirm</button>
  <button>Cancel</button>
</div>

// Live region (for dynamic content)
<div aria-live="polite" aria-atomic="true">
  {successMessage}
</div>
```

### ARIA Best Practices

1. **Don't override semantics:** Use native HTML first
2. **Require keyboard support:** ARIA doesn't add functionality
3. **Don't use ARIA to hide content:** Use CSS or `hidden` attribute
4. **Keep ARIA updated:** aria-expanded, aria-selected, etc.

## 7. Next.js Specific Considerations

### Client vs Server Components

```tsx
// ✅ Server Component - Better for accessibility
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// ⚠️ Client Component - Ensure progressive enhancement
'use client'
export default function InteractiveWidget() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### Loading States

```tsx
// ✅ Good - Accessible loading state
<div aria-live="polite" aria-busy="true">
  <Spinner />
  <span className="sr-only">Loading content...</span>
</div>

// Screen reader only class
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Route Changes

```tsx
// ✅ Announce route changes to screen readers
'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function RouteAnnouncer() {
  const pathname = usePathname()
  
  useEffect(() => {
    const announcement = `Navigated to ${pathname}`
    const announcer = document.getElementById('route-announcer')
    if (announcer) {
      announcer.textContent = announcement
    }
  }, [pathname])
  
  return (
    <div
      id="route-announcer"
      aria-live="assertive"
      aria-atomic="true"
      className="sr-only"
    />
  )
}
```

## Testing Checklist

### Automated Tests
- [ ] Run check_accessibility.py script
- [ ] Use axe DevTools browser extension
- [ ] Check Lighthouse accessibility score
- [ ] Validate HTML with W3C validator

### Manual Tests
- [ ] Navigate entire site with keyboard only (Tab, Shift+Tab, Enter, Space, Arrow keys)
- [ ] Test with screen reader (NVDA on Windows, VoiceOver on Mac)
- [ ] Check color contrast for all text
- [ ] Verify focus indicators are visible
- [ ] Test all forms with assistive technology
- [ ] Verify skip links work
- [ ] Check that dynamic content updates are announced

### User Testing
- [ ] Test with users who use assistive technology
- [ ] Get feedback on keyboard navigation flow
- [ ] Verify voice control compatibility (Dragon, Voice Control)

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [RGAA 4.1](https://www.numerique.gouv.fr/publications/rgaa-accessibilite/)
- [WebAIM Articles](https://webaim.org/articles/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Next.js Accessibility Docs](https://nextjs.org/docs/architecture/accessibility)
