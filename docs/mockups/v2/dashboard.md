# Dashboard v2 Mockup

## Overall Design Principles
- **Style:** Flat Design, minimalist, clean lines, typography-focused.
- **Color Palette:** Utilizing the generated palette with professional blues, greens, and muted tones.
- **Typography:** Headings (h1, h2) in Cormorant Garamond, body text in Crimson Pro, conveying an academia/scholarly mood.
- **Interactions:** Simple hover effects (color/opacity shift), fast loading, clean transitions (150-200ms ease), no gradients/shadows on interactive elements.
- **Accessibility:** Ensure high contrast and clear focus states.

## Layout
- **Container:** Maintain `max-w-3xl mx-auto` for content, but review overall page padding/margin (e.g., `px-6 py-8 md:px-8`) to ensure a spacious yet controlled feel.
- **Z-Index:** For any future overlapping elements, define a clear z-index scale (e.g., z-10, z-20, z-30).
- **Content Loading:** Ensure all dynamically loaded content (e.g., featured song, announcements) has reserved space (like `SkeletonCard`) to prevent layout shifts.

## Components & Sections

### 1. Header (Greeting)
- **Title (`h1`):** "Hey, {name} 👋" - Font: `Cormorant Garamond`, `font-bold text-2xl`.
- **Description (`p`):** "Here's what's happening with your choir." - Font: `Crimson Pro`, `text-sm text-harmonic-muted`.

### 2. Next Service Section
- **Section Title (`h2`):** "NEXT SERVICE" - Font: `Cormorant Garamond`, `text-xs font-semibold uppercase tracking-widest text-harmonic-muted`.
- **Card (`NextServiceCard`):**
    - **Design:** Flat design. Remove `shadow-card` and `shadow-card-hover`. Replace with a subtle border (e.g., `border border-harmonic-border`) and a background color change on hover (e.g., `hover:bg-harmonic-muted/20`).
    - **Border Radius:** Increase `rounded-card` to a value corresponding to `8px-12px` for a softer feel.
    - **Icon (`CalendarDays`):** `w-12 h-12 rounded-xl`, background to be a solid color from the palette (e.g., `--color-primary` or `--color-secondary`), icon color `text-white`.
    - **Service Title:** `font-semibold text-harmonic-text text-sm` in `Crimson Pro`.
    - **Date/Time:** More prominent, perhaps slightly larger font, `Crimson Pro`.
    - **Availability Badges:** Use semantic colors from the new palette (or map `harmonic-success`, `harmonic-warning`, `harmonic-danger` to the new palette) with solid background, no shadows.
    - **Buttons:** `Button variant="primary"` uses `--color-primary`, `Button variant="outlined"` uses `--color-primary` for border and text. Ensure flat appearance, no shadow.

### 3. Quick Actions (Director Only)
- **Section Title (`h2`):** "QUICK ACTIONS" - Font: `Cormorant Garamond`, `text-xs font-semibold uppercase tracking-widest text-harmonic-muted`.
- **Action Items:**
    - **Design:** Remove `shadow-card` and `shadow-card-hover`. Replace with `border border-harmonic-border` and `hover:bg-harmonic-muted/20`.
    - **Icon Container:** `w-10 h-10 rounded-full`, background to be `--color-muted` or a slightly darker `--color-background`, icon color `text-harmonic-primary`.
    - **Label:** `text-xs font-medium text-harmonic-text leading-tight` in `Crimson Pro`.
    - **Touch Target:** Ensure `min-h-[44px]` is maintained.

### 4. Featured Song (Member Only)
- **Section Title (`h2`):** "FEATURED SONG" - Font: `Cormorant Garamond`, `text-xs font-semibold uppercase tracking-widest text-harmonic-muted`.
- **Card:**
    - **Design:** Similar flat card design as `NextServiceCard`.
    - **Icon (`Sparkles`):** Replace `bg-featured-song-gradient` with a solid color from the palette (e.g., `--color-primary`), icon color `text-white`.
    - **Song Title:** `font-semibold text-sm text-harmonic-text` in `Crimson Pro`.
    - **Artist/Key:** `text-xs text-harmonic-muted` in `Crimson Pro`.

### 5. Upcoming Services
- **Section Title (`h2`):** "UPCOMING SERVICES" - Font: `Cormorant Garamond`.
- **List Items:**
    - **Design:** Similar flat card design.
    - **Service Title:** `font-medium text-sm text-harmonic-text` in `Crimson Pro`.
    - **Date:** `text-harmonic-muted text-xs` in `Crimson Pro`.
    - **Badge:** Flat design, using semantic colors.
    - **Chevron Icon:** `text-harmonic-muted`.

### 6. Recent Announcements
- **Section Title (`h2`):** "RECENT ACTIVITY" / "LATEST ANNOUNCEMENTS" - Font: `Cormorant Garamond`.
- **List Items:**
    - **Design:** Similar flat card design.
    - **Icon (`Megaphone`):** `w-8 h-8 rounded-full bg-harmonic-surface`, background to be `--color-muted`, icon color `text-harmonic-primary`.
    - **Announcement Title:** `font-semibold text-sm text-harmonic-text` in `Crimson Pro`.
    - **Author/Date:** `text-harmonic-muted text-xs` in `Crimson Pro`.

### 7. Skeleton Cards & Empty States
- Ensure `SkeletonCard`s adopt the new muted colors for their loading animation.
- `EmptyState` components should also follow the new typography and color scheme.

## Implementation Notes
- All hardcoded color values should be replaced with Tailwind CSS variables derived from the generated color palette (e.g., `text-harmonic-text` should map to `var(--color-foreground)`).
- Review all components in `src/components/ui` to ensure they align with the Flat Design principles (e.g., `Card`, `Button`, `Badge`, `Input`, `Select`, `Textarea`, etc.).
- Update `tailwind.config.ts` to include the new color palette and font families.
- Consider creating new Tailwind utility classes or modifying existing ones to enforce the "no shadows/gradients" rule more strictly.
