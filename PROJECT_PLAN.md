# Moodie - Project Plan

> AI-Powered Moodboard Platform for Interior Designers

This document outlines the implementation plan for Moodie, broken down into phases with actionable checkboxes. Each phase builds upon the previous, ensuring a structured development process.

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend/Database:** Convex
- **Authentication:** Clerk
- **Payments:** Polar
- **AI Services:** Google Nano Banana Pro (image generation), Claude Agents SDK (assistant)
- **Canvas:** ReactFlow

## Design System

- **Headings:** Display serif font (e.g., Playfair Display, Fraunces)
- **Body copy:** Helvetica / Helvetica Neue
- **UI Elements:** Rounded corners, soft shadows
- **Style:** Clean, premium aesthetic

---

## Phase 1: Foundation (Weeks 1-3)

### 1.1 Project Setup

- [ ] Initialize Next.js project with App Router
- [ ] Configure Tailwind CSS with custom theme
- [ ] Set up custom fonts (display serif for headings, Helvetica for body)
- [ ] Create base design tokens (colors, spacing, shadows, border-radius)
- [ ] Set up ESLint and Prettier
- [ ] Configure TypeScript strict mode
- [ ] Create project folder structure

### 1.2 Convex Setup

- [ ] Install and configure Convex
- [ ] Create initial schema file with data models
  - [ ] Users table
  - [ ] Projects table
  - [ ] Moodboards table
  - [ ] Subscriptions table
  - [ ] Products table
  - [ ] Comments table
  - [ ] Files table
- [ ] Set up Convex development environment
- [ ] Create basic queries and mutations for users

### 1.3 Authentication (Clerk)

- [ ] Install and configure Clerk
- [ ] Create Clerk application and get API keys
- [ ] Implement Clerk Provider wrapper
- [ ] Create sign-up page
  - [ ] Email/password sign-up
  - [ ] Google OAuth sign-up
  - [ ] Email verification flow
- [ ] Create sign-in page
  - [ ] Email/password login
  - [ ] Google OAuth login
  - [ ] "Forgot password" flow
- [ ] Implement protected routes middleware
- [ ] Create user sync between Clerk and Convex
- [ ] Implement session persistence ("remember me")

### 1.4 Basic Layout & Navigation

- [ ] Create app shell layout component
- [ ] Build responsive navigation header
- [ ] Create sidebar navigation (for dashboard views)
- [ ] Implement mobile-responsive navigation
- [ ] Create loading states and skeletons
- [ ] Build toast notification system

### 1.5 Dashboard UI

- [ ] Create dashboard page layout
- [ ] Build empty state component for no projects
- [ ] Create project card component
- [ ] Implement projects grid layout
- [ ] Add project filtering (All/Active/Archived)
- [ ] Add project sorting (name, date created, last updated)
- [ ] Implement project search functionality

### 1.6 Project CRUD Operations

- [ ] Create "New Project" modal/page
  - [ ] Project name field (required)
  - [ ] Client name field (optional)
  - [ ] Client email field (optional)
  - [ ] Project description field (optional)
  - [ ] Status selector (Active/Archived)
- [ ] Implement project creation mutation
- [ ] Create project detail view page
- [ ] Implement project edit functionality
- [ ] Implement project archive/unarchive
- [ ] Implement project deletion with confirmation modal
- [ ] Create Convex queries for listing projects

### Phase 1 Completion Criteria

- [ ] User can create account and log in
- [ ] User can create, view, edit, delete projects
- [ ] Empty moodboard list displays in project view
- [ ] All authentication flows work correctly
- [ ] Dashboard displays projects with filtering/sorting

---

## Phase 2: Canvas Core (Weeks 4-6)

### 2.1 Moodboard Data Layer

- [ ] Create moodboard Convex mutations (create, update, delete)
- [ ] Create moodboard Convex queries (list by project, get by ID)
- [ ] Implement auto-save functionality with debouncing (300ms)
- [ ] Create optimistic update patterns

### 2.2 Moodboard Creation Flow

- [ ] Create "New Moodboard" button in project view
- [ ] Build moodboard creation modal
  - [ ] Moodboard name input
  - [ ] Starting point selector (Upload/Generate/Blank)
- [ ] Implement moodboard creation mutation
- [ ] Redirect to canvas editor after creation

### 2.3 ReactFlow Canvas Setup

- [ ] Install and configure ReactFlow
- [ ] Create canvas editor page layout
- [ ] Implement ReactFlow provider and base canvas
- [ ] Create custom node types
  - [ ] Image node
  - [ ] Product node
  - [ ] Text note node
  - [ ] Color swatch node
- [ ] Style nodes with rounded corners and soft shadows
- [ ] Implement node selection states

### 2.4 Canvas Navigation

- [ ] Implement pan functionality (click and drag)
- [ ] Implement zoom with mouse scroll wheel
- [ ] Implement pinch-to-zoom for trackpad
- [ ] Create zoom controls toolbar (+/-/fit)
- [ ] Build minimap component
- [ ] Persist canvas position in state

### 2.5 Image Upload

- [ ] Set up Convex file storage
- [ ] Create file upload mutation
- [ ] Implement drag-and-drop image upload
- [ ] Create file picker button
- [ ] Add file validation (JPG, PNG, WEBP, max 10MB)
- [ ] Build upload progress indicator
- [ ] Create uploaded image as canvas node

### 2.6 Node Operations

- [ ] Implement node movement (drag)
- [ ] Implement node resizing (corner handles)
- [ ] Implement node deletion (delete key)
- [ ] Create node context menu
- [ ] Implement multi-select nodes
- [ ] Add copy/paste functionality

### 2.7 Edge/Connection System

- [ ] Enable edge creation between nodes
- [ ] Create connection handles on nodes
- [ ] Implement curved and straight edge options
- [ ] Add edge color customization
- [ ] Implement edge deletion

### 2.8 Canvas Organization Tools

- [ ] Create alignment tools (left, center, right, top, middle, bottom)
- [ ] Create distribution tools (horizontal, vertical)
- [ ] Implement node grouping
- [ ] Add node locking functionality
- [ ] Create grid snapping toggle
- [ ] Implement undo/redo (Cmd+Z / Cmd+Shift+Z)

### 2.9 Canvas Toolbar

- [ ] Build floating toolbar component
- [ ] Add zoom controls
- [ ] Add alignment/distribution controls
- [ ] Add undo/redo buttons
- [ ] Add grid snap toggle
- [ ] Create save status indicator ("Saving..." / "Saved")

### 2.10 Moodboard Management

- [ ] Create moodboard thumbnail generation
- [ ] Display moodboards as cards in project view
- [ ] Show moodboard metadata (name, last updated, share status)
- [ ] Implement moodboard deletion with confirmation

### Phase 2 Completion Criteria

- [ ] User can create moodboard and upload starting image
- [ ] User can add multiple images to canvas
- [ ] User can arrange and connect elements
- [ ] Canvas state persists across sessions
- [ ] Undo/redo works correctly
- [ ] Canvas performance is smooth

---

## Phase 3: Product Library (Weeks 7-8)

### 3.1 Product Data Layer

- [ ] Create product Convex mutations (create, update, delete)
- [ ] Create product Convex queries (list, search, filter)
- [ ] Set up search index for product names
- [ ] Create category and filter indexes

### 3.2 Product Library Panel UI

- [ ] Create collapsible side panel for product library
- [ ] Build product thumbnail grid
- [ ] Create product card component (image, name, price, source)
- [ ] Implement infinite scroll or pagination
- [ ] Add image optimization/lazy loading
- [ ] Create "My Products" tab

### 3.3 Product Search & Filter

- [ ] Build search bar with debounced input
- [ ] Implement search query against product names/descriptions
- [ ] Create filter dropdowns
  - [ ] Category filter (Furniture, Lighting, Textiles, Decor)
  - [ ] Room type filter (Living room, Bedroom, Kitchen, etc.)
  - [ ] Style filter (Modern, Traditional, Mid-century, etc.)
  - [ ] Price range slider
- [ ] Display active filters as removable pills
- [ ] Add "Clear all filters" button
- [ ] Create empty search results state

### 3.4 Add Product via URL

- [ ] Create "Add Product" button and modal
- [ ] Build URL input field
- [ ] Implement basic product scraping action
  - [ ] Extract product image
  - [ ] Extract product name
  - [ ] Extract price
  - [ ] Extract description
- [ ] Create editable form for scraped data
- [ ] Add category and tag selectors
- [ ] Implement fallback for failed scraping (manual entry)
- [ ] Save product to Convex

### 3.5 Product Canvas Integration

- [ ] Enable drag-and-drop from library to canvas
- [ ] Implement double-click to add at default position
- [ ] Create product node type with link indicator
- [ ] Add click handler to open source URL
- [ ] Style product nodes distinctly from regular images

### 3.6 My Products Management

- [ ] Filter library to show user's added products
- [ ] Enable editing of user's products
- [ ] Enable deletion of user's products
- [ ] Show product count and usage stats

### Phase 3 Completion Criteria

- [ ] User can add products via URL
- [ ] User can browse, search, filter product library
- [ ] User can add products from library to canvas
- [ ] Products display with source links
- [ ] Product scraping works for major retailers

---

## Phase 4: AI Integration (Weeks 9-11)

### 4.1 AI Assistant Panel UI

- [ ] Create AI assistant button in canvas toolbar
- [ ] Build slide-in panel from right side
- [ ] Create chat message interface
- [ ] Build message input with send button
- [ ] Implement panel collapse/expand
- [ ] Add panel resize functionality
- [ ] Create message history display

### 4.2 Claude Agents SDK Integration

- [ ] Install Claude Agents SDK
- [ ] Create Convex action for AI chat
- [ ] Implement conversation context management
- [ ] Create system prompts for design assistant
- [ ] Handle streaming responses
- [ ] Display typing indicators

### 4.3 Nano Banana Pro - Image Generation

- [ ] Set up Nano Banana Pro API integration
- [ ] Create "Generate Room" modal
  - [ ] Text prompt input
  - [ ] Room type dropdown
  - [ ] Style dropdown
- [ ] Implement image generation action
- [ ] Create loading state with progress
- [ ] Add generated image to canvas
- [ ] Implement regeneration option

### 4.4 Nano Banana Pro - Image Editing

- [ ] Create image selection context for AI
- [ ] Implement image edit prompts (e.g., "Change sofa to navy blue")
- [ ] Send edit requests to Nano Banana Pro
- [ ] Display loading state during processing
- [ ] Show before/after comparison
- [ ] Implement accept/reject changes
- [ ] Update canvas with edited image

### 4.5 AI Canvas Operations

- [ ] Implement AI-driven element addition
- [ ] Implement AI-driven element removal
- [ ] Enable AI layout rearrangement
- [ ] Allow AI to connect elements
- [ ] Add confirmation for destructive operations
- [ ] Create action preview before execution

### 4.6 AI Product Suggestions

- [ ] Implement "Find matching products" command
- [ ] Create visual similarity search (if available)
- [ ] Display product suggestions in assistant panel
- [ ] Enable one-click add to canvas
- [ ] Suggest adding new product if no match

### Phase 4 Completion Criteria

- [ ] User can generate room images via AI prompt
- [ ] User can modify images via natural language
- [ ] AI can perform canvas operations (add, remove, arrange)
- [ ] AI can search product library
- [ ] Conversation history is maintained

---

## Phase 5: Client Sharing (Weeks 12-13)

### 5.1 Share Link Generation

- [ ] Create "Share" button in canvas toolbar
- [ ] Generate unique shareId for moodboard
- [ ] Implement share link generation
- [ ] Auto-copy link to clipboard
- [ ] Show toast confirmation
- [ ] Store shareEnabled status in database

### 5.2 Public Moodboard View

- [ ] Create /share/[shareId] route
- [ ] Implement public moodboard query
- [ ] Build read-only canvas view
- [ ] Enable pan/zoom without editing
- [ ] Make products clickable for details
- [ ] Show designer branding in header
- [ ] Create mobile-responsive layout

### 5.3 Client Commenting - UI

- [ ] Add comment indicators on elements
- [ ] Create comment input popover on element click
- [ ] Build comment form (name, email, message)
- [ ] Display comment threads per element
- [ ] Show comment count badges

### 5.4 Client Commenting - Backend

- [ ] Create comment Convex mutations
- [ ] Create comment Convex queries
- [ ] Store comments with element associations
- [ ] Handle anonymous (no auth) commenters

### 5.5 Designer Comment Management

- [ ] Create comments panel in canvas view
- [ ] Display all comments grouped by element
- [ ] Highlight element when clicking comment
- [ ] Show new/unread comment indicators
- [ ] Add comment count badge to share button

### 5.6 Comment Replies

- [ ] Enable designer replies to comments
- [ ] Display replies in thread
- [ ] Implement comment resolution/closing
- [ ] Add resolved thread hiding toggle

### 5.7 Email Notifications

- [ ] Choose and configure email provider (Resend/SendGrid)
- [ ] Create email templates
- [ ] Send notification when client comments
- [ ] Send notification when designer replies
- [ ] Implement notification preferences

### 5.8 Share Settings

- [ ] Create share settings modal
- [ ] Enable/disable share link toggle
- [ ] Generate new link (invalidate old)
- [ ] Add optional link expiration date
- [ ] Add optional password protection
- [ ] Show share status in moodboard list

### Phase 5 Completion Criteria

- [ ] Designer can generate share link
- [ ] Client can view moodboard without account
- [ ] Client can comment on elements
- [ ] Designer can view and reply to comments
- [ ] Email notifications work correctly

---

## Phase 6: Payments & Subscription (Week 14)

### 6.1 Polar.sh Setup

- [ ] Create Polar.sh account and configure
- [ ] Set up subscription products/plans
- [ ] Get API keys and configure environment
- [ ] Create webhook endpoint in Convex

### 6.2 Pricing Page

- [ ] Design pricing page layout
- [ ] Display subscription tiers and features
- [ ] Create feature comparison table
- [ ] Add FAQ section
- [ ] Style with premium aesthetic

### 6.3 Checkout Integration

- [ ] Implement Polar.sh embedded checkout
- [ ] Create checkout trigger from pricing page
- [ ] Handle successful payment callback
- [ ] Create/update subscription in Convex
- [ ] Redirect to dashboard with success message

### 6.4 Subscription Data Model

- [ ] Create subscription Convex queries
- [ ] Create subscription Convex mutations
- [ ] Implement webhook handler for Polar events
  - [ ] Handle subscription created
  - [ ] Handle subscription updated
  - [ ] Handle subscription canceled
  - [ ] Handle payment failed
- [ ] Sync subscription status in real-time

### 6.5 Free Tier Enforcement

- [ ] Define free tier limits (1 project, 2 moodboards, 5 AI generations)
- [ ] Create limit checking functions
- [ ] Display usage in dashboard
- [ ] Show upgrade prompts when approaching limits
- [ ] Create upgrade modal when limits exceeded
- [ ] Implement 3-day grace period for failed payments

### 6.6 Subscription Management

- [ ] Create subscription settings page
- [ ] Link to Polar.sh customer portal
- [ ] Display current plan and billing info
- [ ] Show billing history and invoices
- [ ] Implement cancel subscription flow
- [ ] Handle cancellation at period end

### Phase 6 Completion Criteria

- [ ] User can subscribe via Polar.sh embedded checkout
- [ ] Subscription status syncs to Convex via webhooks
- [ ] Free tier limits are enforced
- [ ] User can manage subscription (update payment, cancel)
- [ ] Pricing page displays plans clearly

---

## Phase 7: Polish & Launch Prep (Weeks 15-16)

### 7.1 Onboarding Flow

- [ ] Create onboarding data collection
  - [ ] Business name
  - [ ] Typical project type
  - [ ] Experience level
- [ ] Build 3-step interactive tutorial
  - [ ] Create project walkthrough
  - [ ] Create moodboard walkthrough
  - [ ] Use AI walkthrough
- [ ] Add skip onboarding option
- [ ] Link to onboarding from settings
- [ ] Persist onboarding completion status

### 7.2 Empty States & Loading States

- [ ] Create empty state illustrations
- [ ] Write helpful empty state copy
- [ ] Build skeleton loading components
- [ ] Add loading spinners where needed
- [ ] Ensure all async operations show loading

### 7.3 Error Handling

- [ ] Create error boundary components
- [ ] Build error message UI components
- [ ] Add retry mechanisms for failed operations
- [ ] Implement offline detection
- [ ] Create user-friendly error messages
- [ ] Add error logging/reporting

### 7.4 Performance Optimization

- [ ] Audit and optimize bundle size
- [ ] Implement code splitting
- [ ] Optimize image loading and compression
- [ ] Add caching strategies
- [ ] Profile and optimize canvas performance (50+ nodes)
- [ ] Implement virtualization for large canvases if needed

### 7.5 Mobile Responsiveness

- [ ] Audit all pages on mobile viewports
- [ ] Optimize dashboard for mobile
- [ ] Ensure canvas works on tablet
- [ ] Create mobile-friendly navigation
- [ ] Test touch interactions

### 7.6 Analytics Integration

- [ ] Choose analytics tool (PostHog/Mixpanel/Vercel)
- [ ] Implement page view tracking
- [ ] Track key user events
  - [ ] Account creation
  - [ ] Project creation
  - [ ] Moodboard creation
  - [ ] AI usage
  - [ ] Product additions
  - [ ] Share link creation
- [ ] Create conversion funnels
- [ ] Set up dashboards

### 7.7 Product Library Seeding

- [ ] Curate initial product list (100+ items)
- [ ] Categorize and tag all products
- [ ] Add variety across categories and styles
- [ ] Ensure high-quality product images
- [ ] Verify all source URLs work

### 7.8 Landing Page

- [ ] Design hero section
- [ ] Create feature highlights
- [ ] Add social proof section (testimonials)
- [ ] Build call-to-action sections
- [ ] Optimize for SEO
- [ ] Add meta tags and OG images

### 7.9 Final Testing

- [ ] End-to-end testing of all user flows
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Test payment flows in production mode
- [ ] Security audit
- [ ] Accessibility audit (WCAG compliance)
- [ ] Load testing

### 7.10 Documentation & Legal

- [ ] Write user documentation/help center
- [ ] Create Terms of Service
- [ ] Create Privacy Policy
- [ ] Add GDPR compliance notices (if applicable)
- [ ] Set up support email/system

### Phase 7 Completion Criteria

- [ ] All user flows work smoothly end-to-end
- [ ] No critical bugs
- [ ] Performance acceptable (canvas smooth with 50 nodes)
- [ ] Mobile experience is usable
- [ ] Analytics tracking in place
- [ ] Ready for beta users

---

## Post-Launch Backlog (Future Phases)

These items are out of scope for v1 but documented for future consideration:

- [ ] Collaborative editing (multiple designers)
- [ ] Version history (restore previous versions)
- [ ] Export to PDF/PNG
- [ ] Procurement integration
- [ ] White-labeling for design firms
- [ ] Native mobile apps (iOS/Android)
- [ ] Offline mode
- [ ] Brand partnerships (pre-loaded catalogs)
- [ ] AI product matching (auto-match generated items to real products)
- [ ] 3D visualization
- [ ] Client approval workflow
- [ ] Team accounts
- [ ] Annual billing

---

## Open Questions to Resolve

- [ ] Pricing tiers: What are the specific price points?
- [ ] Free tier limits: Confirm 1 project / 2 moodboards / 5 AI generations
- [ ] Product scraping: Build custom or use third-party API?
- [ ] Image storage: Convex file storage vs external (Cloudinary, S3)?
- [ ] AI cost pass-through: Include in subscription or charge per use?
- [ ] Product moderation: How to handle inappropriate products?
- [ ] Analytics tool: PostHog, Mixpanel, or Vercel Analytics?
- [ ] Email provider: Resend, SendGrid, or Convex actions?
- [ ] Domain selection: moodie.app / moodie.design / getmoodie.com?

---

## Getting Started

To begin Phase 1, run:

```bash
npx create-next-app@latest moodie --typescript --tailwind --eslint --app
cd moodie
npm install convex
npx convex dev
```

Then follow the Phase 1 checklist above.
