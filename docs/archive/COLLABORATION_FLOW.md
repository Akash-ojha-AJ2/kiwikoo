# Collaboration Flow Documentation

## Overview
This document outlines the complete collaboration flow for both **Brands** and **Influencers** in the TRIA platform.

## User Roles & Routes

### Brand Routes
- `/brand/dashboard` - Brand dashboard
- `/brand/marketplace` - Discover influencers
- `/brand/influencers/[influencerId]` - View influencer profile & request collaboration
- `/brand/collaborations` - View sent collaboration requests
- `/brand/products` - Manage products
- `/brand/campaigns` - Manage campaigns
- `/brand/ads` - Generate UGC ads
- `/inbox` - View notifications

### Influencer Routes
- `/influencer/dashboard` - Influencer dashboard
- `/marketplace` - Browse products
- `/marketplace/[productId]` - Product detail page
- `/influencer/try-on` - Virtual try-on studio
- `/influencer/collaborations` - View received collaboration requests
- `/inbox` - View notifications
- `/profile` - Manage profile

## Collaboration Flow

### 1. Brand Initiates Collaboration

**Flow:**
1. Brand navigates to `/brand/marketplace`
2. Brand browses influencers with filters
3. Brand clicks "View Profile" on an influencer
4. Brand lands on `/brand/influencers/[influencerId]`
5. Brand clicks "Request Collaboration" button
6. Modal opens with collaboration form
7. Brand fills in:
   - Budget
   - Timeline
   - Goals
   - Notes
   - (Optional) Product ID
8. Brand submits request
9. API creates collaboration request with status "pending"
10. Notification sent to influencer
11. Brand redirected to `/brand/collaborations` to see sent requests

**API Endpoints:**
- `POST /api/collaborations` - Create collaboration request
- `GET /api/collaborations?type=sent` - Get sent requests (brand)
- `GET /api/notifications` - Get notifications

### 2. Influencer Receives & Responds

**Flow:**
1. Influencer receives notification in `/inbox`
2. Influencer clicks notification
3. Navigates to `/influencer/collaborations`
4. Sees collaboration request with:
   - Brand name
   - Proposal message
   - Budget
   - Timeline
   - Goals
   - Status badge
5. Influencer can:
   - **Accept** - Changes status to "accepted"
   - **Decline** - Changes status to "declined"
6. Notification sent to brand about decision
7. Both parties can view updated status

**API Endpoints:**
- `GET /api/collaborations?type=received` - Get received requests (influencer)
- `PATCH /api/collaborations` - Accept/decline request (influencer only)

### 3. Product-Based Collaboration

**Flow:**
1. Influencer browses `/marketplace`
2. Clicks on a product
3. Lands on `/marketplace/[productId]`
4. Sees "Request Collaboration" button
5. Clicks button, modal opens
6. Fills collaboration details
7. Request sent to product's brand
8. Brand receives notification
9. Brand views in `/brand/collaborations`

## Pages & Components

### Brand Pages
- **Brand Collaborations Page** (`/brand/collaborations`)
  - Shows all sent collaboration requests
  - Filter by status (All, Pending, Accepted, Declined)
  - View influencer details
  - See proposal details (budget, timeline, goals)

### Influencer Pages
- **Influencer Collaborations Page** (`/influencer/collaborations`)
  - Shows all received collaboration requests
  - Filter by status (All, Pending, Accepted, Declined)
  - Accept/Decline buttons for pending requests
  - View brand details
  - See proposal details

### Shared Components
- **RequestCollaborationButton** - Button to open collaboration modal
- **RequestModal** - Modal form for creating collaboration requests
- **Inbox Page** - Shows notifications, navigates to appropriate collaboration page

## API Endpoints

### `/api/collaborations`

**POST** - Create collaboration request
- Body: `{ influencerId?, brandId?, productId?, budget, timeline, goals, notes }`
- Returns: Created collaboration object
- Creates notification for recipient

**GET** - Get collaborations
- Query params: `type=sent` (for brands) or `type=received` (for influencers)
- Returns: Array of collaboration requests with related data

**PATCH** - Update collaboration status
- Body: `{ id, status: 'accepted' | 'declined' }`
- Only influencers can accept/decline
- Creates notification for brand

### `/api/notifications`

**GET** - Get user notifications
- Returns: `{ notifications: [], unreadCount: number }`
- Includes metadata with `requestId` for collaboration notifications

**POST /api/notifications/[id]/read** - Mark notification as read

**POST /api/notifications/read-all** - Mark all as read

## Navigation Flow

### From Inbox to Collaborations
- Click collaboration notification
- If Brand → `/brand/collaborations`
- If Influencer → `/influencer/collaborations`
- Notification marked as read

### From Marketplace to Collaboration
- Brand: `/brand/marketplace` → `/brand/influencers/[id]` → Request Collaboration
- Influencer: `/marketplace` → `/marketplace/[productId]` → Request Collaboration

## Status Flow

```
pending → accepted (by influencer)
pending → declined (by influencer)
```

Once accepted or declined, status cannot be changed.

## Data Structure

### CollaborationRequest (Prisma)
```prisma
{
  id: string
  brandId: string
  influencerId: string
  message: string
  proposalDetails: {
    budget?: number
    timeline?: string
    goals?: string[]
    notes?: string
    productId?: string
  }
  status: "pending" | "accepted" | "declined"
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Notification (Prisma)
```prisma
{
  id: string
  userId: string
  type: "collab_request" | "collab_accepted" | "collab_declined"
  content: string
  isRead: boolean
  metadata: {
    requestId?: string
  }
  createdAt: DateTime
}
```

## Testing Checklist

- [ ] Brand can browse influencers
- [ ] Brand can request collaboration from influencer profile
- [ ] Brand can view sent requests in collaborations page
- [ ] Influencer receives notification
- [ ] Influencer can view received requests
- [ ] Influencer can accept/decline requests
- [ ] Brand receives notification when request is accepted/declined
- [ ] Status updates correctly
- [ ] Filters work on both collaboration pages
- [ ] Navigation from inbox works correctly
- [ ] Product-based collaboration works
- [ ] All API endpoints return correct data

