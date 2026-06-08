# Services List v2 Mockup

## Overall Design Principles
- **Style:** Flat Design, minimalist, clean lines, typography-focused.
- **Color Palette:** Utilizing the generated palette with professional blues, greens, and muted tones.
- **Typography:** Headings (h1, h2) in Cormorant Garamond, body text in Crimson Pro.
- **Interactions:** Simple hover effects (color/opacity shift), fast loading, clean transitions (150-200ms ease), no gradients/shadows on interactive elements.
- **Accessibility:** Ensure high contrast and clear focus states, maintain touch target sizes.

## Layout
- **Container:** Maintain `max-w-3xl mx-auto` for content, similar to the Dashboard.
- **Content Loading:** Ensure all dynamically loaded content has reserved space to prevent layout shifts.

## Components & Sections

### 1. Page Header
- **Title (`PageHeader`):** "Services" - Font: `Cormorant Garamond`, `font-bold text-2xl` (or similar for PageHeader title).
- **Subtitle (`PageHeader`):** `{choir?.name}` - Font: `Crimson Pro`, `text-sm text-harmonic-muted`.
- **Actions (Button):** "New service" button.
    - **Design:** Flat design. Use `--color-primary` background with `--color-on-primary` text. No `shadow-card`, no `shadow-card-hover`.

### 2. Filters (Tablist)
- **Container:** `flex gap-2` should have sufficient spacing.
- **Buttons (`role="tab"`):**
    - **Active State:** Background: `var(--color-primary)`, Text: `var(--color-on-primary)`. No shadows.
    - **Inactive State:** Background: `var(--color-background)` or `var(--color-muted)`, Text: `var(--color-foreground)`.
    - **Hover State (Inactive):** Background: `var(--color-primary)` with low opacity (e.g., `var(--color-primary)/10`), Text: `var(--color-primary)`.
    - **Touch Target:** Ensure `min-h-[40px]` is maintained.
    - **Border Radius:** `rounded-pill` is consistent with Flat Design.

### 3. Service List Items
- **Card:**
    - **Design:** Flat design. Remove `shadow-card` and `shadow-card-hover`. Replace with a subtle border (e.g., `border border-harmonic-border`) and a background color change on hover (e.g., `hover:bg-harmonic-muted/20`).
    - **Border Radius:** Increase `rounded-card` to a value corresponding to `8px-12px`.
    - **Icon (`CalendarDays`):** `w-10 h-10 rounded-full`, background to be `var(--color-muted)`, icon color `var(--color-primary)`.
    - **Service Title:** `font-medium text-sm text-harmonic-text` in `Crimson Pro`.
    - **Date/Time:** `text-harmonic-muted text-xs` in `Crimson Pro`.
    - **Badge:** Flat design, using semantic colors from the new palette (e.g., `var(--color-success)`, `var(--color-warning)`, `var(--color-danger)`) with solid background, no shadows.
    - **Chevron Icon:** `text-harmonic-muted`.

### 4. Empty State
- **Design:** `EmptyState` component should follow the new typography and color scheme. The action button within `EmptyState` should also be Flat Design.

### 5. Load More Button
- **Design:** Flat design `variant="outlined"` button. Border and text color should be `var(--color-primary)`. No shadows.

## Implementation Notes
- All hardcoded color values should be replaced with Tailwind CSS variables derived from the generated color palette.
- Review and update components in `src/components/ui` (`Card`, `Button`, `Badge`, `PageHeader`) to ensure consistent Flat Design application.
- Update `tailwind.config.ts` if needed for new color variables or font families.
