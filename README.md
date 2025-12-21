# Eden Nails - Luxury Nail Salon Website

A modern, responsive website for Eden Nails, a luxury nail salon. Built with Next.js 15, TypeScript, and Tailwind CSS.

## ✨ Features

- **Modern Design**: Beautiful, responsive design with gradient backgrounds and smooth animations
- **Mobile-First**: Fully responsive design that works perfectly on all devices
- **Interactive Components**: 
  - Service cards with booking functionality
  - Contact form with validation
  - Mobile navigation with hamburger menu
  - Smooth scrolling navigation
- **Professional Sections**:
  - Hero section with call-to-action buttons
  - Services showcase with pricing
  - Gallery section for nail art
  - About section with company information
  - Contact section with booking form
  - Footer with quick links

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd eden-nails
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Fonts**: Geist Sans and Geist Mono
- **Icons**: Emoji icons and SVG icons
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
eden-nails/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx            # Main homepage
│   │   └── globals.css         # Global styles and Tailwind
│   └── components/
│       ├── ServiceCard.tsx     # Reusable service card component
│       ├── ContactForm.tsx     # Contact form with validation
│       └── MobileNav.tsx       # Mobile navigation component
├── public/                     # Static assets
├── package.json
└── README.md
```

## 🎨 Customization

### Colors
The website uses a custom color palette defined in `globals.css`:
- Primary: Pink (#f472b6)
- Primary Dark: Red (#e11d48)
- Secondary: Light Gray (#f8fafc)
- Accent: Yellow (#fbbf24)

### Content
To customize the content:
1. Update service information in `src/app/page.tsx`
2. Modify contact information in the contact section
3. Replace placeholder images in the gallery section
4. Update the about section with your salon's story

### Styling
- All styling is done with Tailwind CSS classes
- Custom CSS variables are defined in `globals.css`
- Responsive design uses Tailwind's responsive prefixes

## 📱 Responsive Design

The website is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms

The project can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new components in `src/components/`
2. Add new pages in `src/app/`
3. Update navigation in the main page
4. Test responsiveness on different screen sizes

## 📞 Contact & Support

For questions or support:
- Email: tranthai0615@gmail.com


## 🙏 Acknowledgments

- Built with Next.js and Tailwind CSS
- Icons from various sources
- Design inspiration from modern nail salon websites

---

**Eden Nails** - Experience luxury nail care in a relaxing environment. 💅✨
