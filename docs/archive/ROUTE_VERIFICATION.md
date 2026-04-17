# Route & Endpoint Verification

## Complete Route Map

### Brand Routes ✅
- `/brand/dashboard` - Brand dashboard
- `/brand/marketplace` - Discover influencers (with filters)
- `/brand/influencers/[influencerId]` - View influencer profile & request collaboration
- `/brand/collaborations` - View sent collaboration requests (with filters)
- `/brand/products` - Manage products
- `/brand/campaigns` - Manage campaigns with AI assistant
- `/brand/ads` - Generate UGC ads
- `/inbox` - View notifications (navigates to collaborations on click)

### Influencer Routes ✅
- `/influencer/dashboard` - Influencer dashboard
- `/marketplace` - Browse products
- `/marketplace/[productId]` - Product detail page (with try-on & collaboration request)
- `/influencer/try-on` - Virtual try-on studio
- `/influencer/collaborations` - View received collaboration requests (with accept/decline)
- `/inbox` - View notifications (navigates to collaborations on click)
- `/profile` - Manage profile

### Shared Routes ✅
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Redirects based on role
- `/inbox` - Notifications (role-aware navigation)
- `/profile` - User profile
- `/favorites` - Favorite products
- `/onboarding/brand` - Brand onboarding
- `/onboarding/influencer` - Influencer onboarding

## API Endpoints

### Collaborations API ✅
- `POST /api/collaborations` - Create collaboration request
  - Supports both brand → influencer and influencer → brand
  - Creates notifications automatically
  - Returns created collaboration object

- `GET /api/collaborations?type=sent` - Get sent requests (brands)
  - Returns: Array with influencer data and proposalDetails

- `GET /api/collaborations?type=received` - Get received requests (influencers)
  - Returns: Array with brand data and proposalDetails

- `PATCH /api/collaborations` - Accept/decline request
  - Body: `{ id, status: 'accepted' | 'declined' }`
  - Only influencers can accept/decline
  - Creates notification for brand

### Notifications API ✅
- `GET /api/notifications` - Get user notifications
  - Returns: `{ notifications: [], unreadCount: number }`
  - Includes metadata with requestId

- `POST /api/notifications/[id]/read` - Mark as read

- `POST /api/notifications/read-all` - Mark all as read

### Other APIs ✅
- `GET /api/influencers` - Get influencers (brand only)
- `GET /api/products` - Get products
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

## Navigation Flow Verification

### Brand Flow ✅
1. Brand Dashboard → Marketplace → Influencer Profile → Request Collaboration
2. Inbox → Click notification → Collaborations page
3. Collaborations page shows all sent requests with filters

### Influencer Flow ✅
1. Influencer Dashboard → Marketplace → Product → Request Collaboration
2. Inbox → Click notification → Collaborations page
3. Collaborations page shows all received requests with accept/decline buttons

## Potential Issues & Fixes

### ✅ Fixed Issues
1. **Inbox Navigation** - Now routes correctly based on user role
2. **Influencer Collaborations Page** - Created with proper layout
3. **Brand Collaborations Page** - Enhanced with filters and better layout
4. **API Endpoints** - All endpoints properly handle both roles
5. **Proposal Details** - Included in API responses

### ⚠️ To Verify
1. Test collaboration request creation from both sides
2. Test accept/decline functionality
3. Test notification flow
4. Test filters on collaboration pages
5. Test navigation from inbox

## Testing Checklist

### Brand Testing
- [ ] Can browse influencers
- [ ] Can view influencer profile
- [ ] Can request collaboration
- [ ] Can view sent requests
- [ ] Can filter sent requests
- [ ] Receives notification when request accepted/declined

### Influencer Testing
- [ ] Can browse products
- [ ] Can view product details
- [ ] Can request collaboration on product
- [ ] Receives notification for collaboration request
- [ ] Can view received requests
- [ ] Can filter received requests
- [ ] Can accept collaboration request
- [ ] Can decline collaboration request
- [ ] Brand receives notification on accept/decline

### Shared Testing
- [ ] Inbox shows notifications correctly
- [ ] Clicking notification navigates to correct page
- [ ] Notification marked as read on click
- [ ] All routes are accessible
- [ ] Role-based access control works

