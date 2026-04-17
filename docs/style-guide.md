# Kiwikoo Brand & Design Guide

This guide defines the visual language of the Kiwikoo platform for the UI/UX team, focusing on brand colors, typography, and core layouts.

---

## 🎨 Color Palette

We use a layered color system comprising our base UI colors and two distinct brand themes: **Neo-Brutal** (High Contrast) and **Kiwikoo Core**.

### Core UI Colors
Used for the application framework, navigation, and standard components.

| Name | HEX Code | Usage |
| :--- | :--- | :--- |
| **Pure White** | `#FFFFFF` | Primary background for cards and pages |
| **Onyx Black** | `#252525` | Primary text and dark UI elements |
| **Deep Charcoal** | `#333333` | Primary action buttons and navigation accents |
| **Soft Gray** | `#F7F7F7` | Secondary backgrounds and hover states |
| **Alert Red** | `#E60000` | Error messages and destructive actions |
| **Surface Border** | `#EBEBEB` | Dividers and thin component borders |

### Brand Themes

#### 💥 Neo-Brutal Theme
A bold, high-contrast design language characterized by heavy strokes and vibrant accents.
- **Background (Cream)**: `#F9F8F4`
- **Primary Action (Coral)**: `#FF8C69`
- **Highlight (Lime)**: `#B4F056`
- **Strokes**: `4px Solid Black`
- **Elevations**: Hard black shadows (`8px` offset)

### 👥 Role-Based Branding
We use specific color associations to distinguish between user perspectives within the platform:

| Role / Side | Primary Color | Visual Identity |
| :--- | :--- | :--- |
| **Influencer Side** | **Orange (Coral)** | Used for influencer dashboards, profiles, and action items |
| **Brand Side** | **Green (Kiwi/Lime)** | Used for brand campaigns, marketplace browsing, and analytics |

#### 🥝 Kiwikoo Core (Landing)
The signature brand palette used for marketing and landing pages.
- **Kiwikoo Green**: `#caff33`
- **Soft Coral**: `#ff8a73`
- **Vibrant Purple**: `#d8b4fe`
- **Off-Black**: `#111111`
- **Off-White**: `#faf9f6`

---

## 🔡 Typography

We use three primary font families to distinguish between UI, Headings, and specialized content.

| Font Name | Usage Type | Design Intent |
| :--- | :--- | :--- |
| **Plus Jakarta Sans** | **Headlines** | Used for landing page hero sections and bold titles |
| **Playfair Display** | **Accent Serif** | Used for elegant headings and editorial-style emphasis |
| **Inter** | **Primary UI** | Default font for all body text, dashboard labels, and buttons |
| **SF Mono** | **Monospace** | Technical data and code-related snippets |

---

## 📐 Layout & Structure

### Global Containers
- **Content Max-Width**: Standard viewports are capped at `2000px` for ultra-wide support, with standard content constrained to `1280px` (7xl).
- **Mobile Gutters**: Standard `16px` padding on mobile, scaling to `32px` on desktop.

### Navigation Architecture
- **Sticky Header**: Navigation remains fixed (`z-index: 50`) with a `backdrop-blur` effect to maintain context while scrolling.
- **Safe Area Insets**: Layouts are designed to respect 'notches' and home indicators on iOS and Android devices automatically.

### Motion & Interaction
- **60fps Transitions**: Complex interactive elements use GPU-accelerated transforms for smooth scaling and fades.
- **Glassmorphism**: Subtle translucency is applied to headers and overlays to create depth.
