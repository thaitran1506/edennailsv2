# Promotion Section - Maintenance Guide

This guide explains how to easily maintain and modify the promotion section of the Eden Nails website.

## 📁 File Structure

```
src/
├── lib/
│   └── promotions.ts              # Main configuration and data
├── hooks/
│   └── usePromotions.ts           # Custom hook for promotion logic
└── components/
    ├── PromotionSection.tsx       # Main section component
    └── promotions/
        ├── PromotionCard.tsx      # Individual promotion card
        ├── PromotionGrid.tsx      # Grid layout component
        ├── PromotionHeader.tsx    # Section header component
        └── README.md             # This file
```

## 🔧 Adding New Promotions

### 1. Add to the PROMOTIONS array in `src/lib/promotions.ts`:

```typescript
{
  id: 'unique-id',                    // Unique identifier
  title: 'Promotion Title',           // Display title
  description: 'Promotion description', // Detailed description
  discount: '20% OFF',               // Discount text
  originalPrice: '$50',              // Original price (optional)
  newPrice: '$40',                   // New price (optional)
  validUntil: '2025-12-31',          // Expiry date (YYYY-MM-DD)
  image: '/images/promotion.jpg',     // Image path
  category: 'seasonal',              // Category type
  isActive: true,                    // Whether promotion is active
  priority: 5                        // Display order (lower = first)
}
```

### 2. Available Categories:
- `seasonal` - Seasonal promotions
- `new-customer` - New customer offers
- `package` - Package deals
- `referral` - Referral programs
- `loyalty` - Loyalty rewards
- `holiday` - Holiday specials

## 🎨 Customizing Categories

### Add a new category in `src/lib/promotions.ts`:

1. Add to the `PromotionCategory` type:
```typescript
export type PromotionCategory = 'seasonal' | 'new-customer' | 'package' | 'referral' | 'loyalty' | 'holiday' | 'your-new-category';
```

2. Add configuration in `PROMOTION_CONFIG.categories`:
```typescript
'your-new-category': {
  color: 'bg-gradient-to-r from-blue-500 to-purple-500',
  icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  label: 'YOUR CATEGORY'
}
```

## 🖼️ Adding Images

1. Place images in the `public/images/` directory
2. Use descriptive filenames (e.g., `valentines-special.jpg`)
3. Recommended size: 400x192px (2:1 aspect ratio)
4. Use WebP format for better performance

## ⚙️ Configuration Options

### In `src/lib/promotions.ts`:

```typescript
export const PROMOTION_CONFIG: PromotionConfig = {
  categories: { /* category configurations */ },
  defaultImage: '/images/nail-art-1.jpg',  // Fallback image
  maxPromotions: 6                         // Maximum promotions to display
};
```

## 🔄 Utility Functions

The promotion system includes several utility functions:

- `getActivePromotions()` - Get all active promotions sorted by priority
- `getPromotionsByCategory(category)` - Get promotions by category
- `getPromotionById(id)` - Get specific promotion
- `isPromotionExpired(validUntil)` - Check if promotion is expired
- `formatValidUntil(validUntil)` - Format expiry date for display

## 🎯 Customizing Components

### PromotionCard Component
- Modify `src/components/promotions/PromotionCard.tsx`
- Customize card layout, styling, or behavior
- Add new features like countdown timers or social sharing

### PromotionHeader Component
- Modify `src/components/promotions/PromotionHeader.tsx`
- Change title, subtitle, or icon
- Add seasonal themes or animations

### PromotionGrid Component
- Modify `src/components/promotions/PromotionGrid.tsx`
- Change grid layout (columns, spacing, etc.)
- Add filtering or sorting options

## 📱 Responsive Design

The promotion section is fully responsive:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 4 columns

To modify breakpoints, edit the grid classes in `PromotionGrid.tsx`:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
```

## 🎨 Styling

### Colors
- Primary: `#eb477e` (Eden Nails pink)
- Secondary: `#d63d6e` (Darker pink)
- Text: `#181113` (Dark)
- Muted: `#88636f` (Gray)

### Animations
- Scroll-triggered animations using Intersection Observer
- Staggered card animations (100ms delay between cards)
- Hover effects with smooth transitions

## 🚀 Performance Tips

1. **Images**: Use optimized images (WebP format, proper sizing)
2. **Lazy Loading**: Images are automatically lazy-loaded by Next.js
3. **Animations**: Animations are CSS-based for better performance
4. **Data**: Promotion data is static and doesn't require API calls

## 🧪 Testing

### Manual Testing Checklist:
- [ ] All promotions display correctly
- [ ] Images load properly
- [ ] Animations work on scroll
- [ ] Responsive design works on all devices
- [ ] "Book Now" buttons scroll to booking section
- [ ] Expired promotions show correct status
- [ ] Category badges display with correct colors

### Adding Test Promotions:
```typescript
// Add test promotion with immediate expiry
{
  id: 'test-promotion',
  title: 'Test Promotion',
  description: 'This is a test promotion',
  discount: 'TEST',
  validUntil: '2024-01-01', // Past date
  image: '/images/nail-art-1.jpg',
  category: 'seasonal',
  isActive: true,
  priority: 999
}
```

## 🔧 Common Modifications

### Change Maximum Promotions:
```typescript
// In src/lib/promotions.ts
export const PROMOTION_CONFIG: PromotionConfig = {
  // ...
  maxPromotions: 8  // Change from 6 to 8
};
```

### Add Seasonal Theme:
```typescript
// In src/components/promotions/PromotionHeader.tsx
<PromotionHeader 
  isVisible={isVisible}
  title="Holiday Specials"  // Change title
  subtitle="Celebrate the season with our festive nail art!"  // Change subtitle
/>
```

### Modify Card Layout:
```typescript
// In src/components/promotions/PromotionCard.tsx
// Change card height, padding, or layout structure
<div className="p-8">  // Increase padding from p-6
```

## 📞 Support

For questions or issues with the promotion system:
1. Check this README first
2. Review the TypeScript interfaces for proper data structure
3. Test changes in development before deploying
4. Use browser dev tools to debug styling issues

## 🔄 Future Enhancements

Potential improvements for the promotion system:
- Admin panel for managing promotions
- Dynamic promotion loading from CMS
- A/B testing for different promotion layouts
- Analytics tracking for promotion clicks
- Social media integration
- Email marketing integration
