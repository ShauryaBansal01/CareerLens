# CareerLens Design System

## Core Aesthetic: Minimal, Simple, Futuristic
A profound focus on typography, extreme minimalism, negative space, deep space blacks, and subtle neon glows indicating interactivity. The UI should feel like a high-end HUD or operating system from the near future.

## 1. Typography
- **Primary Font**: `Inter` (Sans-serif). Used for headers, body copy, and primary UI text. Weights: 300 (Light), 400 (Regular), 500 (Medium). Avoid heavy bold weights.
- **Monospace Font**: `JetBrains Mono`. Used for code snippets, raw data, version numbers, and technical metadata.
- **Hierarchy**:
  - `h1`: 2rem, weight 500, tight tracking (-0.02em).
  - `h2`: 1.5rem, weight 400, tight tracking.
  - `body`: 0.875rem or 1rem, weight 300/400, loose line-height (1.6) for readability.

## 2. Color Palette
- **Backgrounds**:
  - Main Surface: `#000000` (Pure Black) or `#050505` (Deep Space).
  - Panels/Cards: `rgba(255, 255, 255, 0.02)` to `rgba(255, 255, 255, 0.05)` (Ultra-sheer white over black).
- **Accents (Neon/Futuristic)**:
  - Primary Glow: `#6366f1` (Indigo).
  - Secondary/Cyber: `#3b82f6` (Blue).
  - Success/Status: `#10b981` (Emerald).
  - Error/Destructive: `#ef4444` (Red).
- **Text**:
  - High Contrast: `#ffffff` (Pure White).
  - Muted/Secondary: `#a1a1aa` (Zinc-400) or `#71717a` (Zinc-500).

## 3. Materials & Effects (Glassmorphism)
- **Blur**: Extensive use of `backdrop-blur-md` (12px) and `backdrop-blur-xl` (24px).
- **Borders**: Hairline borders defining shapes without adding weight: `1px solid rgba(255, 255, 255, 0.05)`. No thick borders.
- **Shadows/Glows**:
  - Ambient Panel Shadow: `0 8px 32px rgba(0, 0, 0, 0.5)`.
  - Neon Interactive Glow (Buttons/Inputs on focus): `0 0 15px rgba(99, 102, 241, 0.3)`.

## 4. Components
- **Buttons**:
  - Primary: Gradient (`from-blue-600 to-indigo-600`), rounded-full, subtle outer glow.
  - Secondary/Ghost: Transparent with sheer border (`rgba(255,255,255,0.05)`), text turns white on hover.
- **Inputs**:
  - Deep dark background (`#0A0A0A`), hair-thin border. Focus state triggers a subtle indigo outer glow and border change.
- **Cards/Panels**:
  - No solid colors. Always a transparent overlay with backdrop-blur. High border-radius (`16px` to `24px`) for a soft, friendly futuristic look.

## 5. Spacing & Layout
- Generous padding (`p-6` or `p-8` minimum on cards).
- Wide margins between sections. Let the UI "breathe".
- Centered, single-column layouts where possible to eliminate clutter.
