# UX Audit Findings

## src/pages/auth/SignUp.tsx

### Findings:

1.  **Missing `name` attribute for `Input` components**
    *   **Description**: The custom `Input` components used for name, email, password, and confirm password lack the `name` attribute. While `autoComplete` is present, `name` is crucial for proper form data submission and can affect browser autofill behavior.
    *   **Guideline Violated**: Web Interface Guidelines: "Inputs need `autocomplete` and meaningful `name`."
    *   **Severity**: High
    *   **Impact**: Potential issues with form submission, reduced reliability of browser autofill, and accessibility for some assistive technologies.
    *   **Recommendation**: Update `src/pages/auth/SignUp.tsx` to pass a `name` prop to each `Input` component corresponding to its field (e.g., `<Input name="name" ... />`, `<Input name="email" ... />`).

2.  **General error message placement**
    *   **Description**: Validation errors (e.g., "Password must be at least 8 characters.") are currently displayed in a general alert box at the top of the form, even for field-specific issues. While `role="alert"` is used, inline error messages placed directly below the relevant input fields provide a better user experience. The `Input` component supports an `error` prop for this purpose.
    *   **Guideline Violated**: Web Interface Guidelines: "Errors inline next to fields; focus first error on submit."
    *   **Severity**: Medium
    *   **Impact**: Users may need to visually scan the form to identify which field corresponds to a specific error message, leading to a less efficient and potentially frustrating experience.
    *   **Recommendation**: Update `src/pages/auth/SignUp.tsx` to pass field-specific error messages to the `error` prop of the respective `Input` components.

---

## src/pages/auth/SignIn.tsx

### Findings:

1.  **Missing `name` attribute for `Input` components**
    *   **Description**: The custom `Input` components used for email and password lack the `name` attribute. While `autoComplete` is present, `name` is crucial for proper form data submission and can affect browser autofill behavior. (Identical to `SignUp.tsx` finding)
    *   **Guideline Violated**: Web Interface Guidelines: "Inputs need `autocomplete` and meaningful `name`."
    *   **Severity**: High
    *   **Impact**: Potential issues with form submission, reduced reliability of browser autofill, and accessibility for some assistive technologies.
    *   **Recommendation**: Update `src/pages/auth/SignIn.tsx` to pass a `name` prop to each `Input` component corresponding to its field (e.g., `<Input name="email" ... />`, `<Input name="password" ... />`).

2.  **General error message placement**
    *   **Description**: Validation errors (e.g., "Incorrect email or password.") are currently displayed in a general alert box at the top of the form. For field-specific errors, it would be more user-friendly to display the error directly next to the relevant input field. The `Input` component supports an `error` prop for this purpose. (Similar to `SignUp.tsx` finding)
    *   **Guideline Violated**: Web Interface Guidelines: "Errors inline next to fields; focus first error on submit."
    *   **Severity**: Medium
    *   **Impact**: Users may need to visually scan the form to identify which field corresponds to a specific error message, leading to a less efficient experience.
    *   **Recommendation**: Update `src/pages/auth/SignIn.tsx` to pass field-specific error messages to the `error` prop of the respective `Input` components.

3.  **Usage of inline style for color**
    *   **Description**: The `SoulSPCE` text in the footer uses an inline `style` attribute for its color (`color: '#560056'`).
    *   **Guideline Violated**: `ui-ux-pro-max` design system (Color Strategy: "Use semantic color tokens not raw hex in components").
    *   **Severity**: Low
    *   **Impact**: Inconsistent theming, harder to manage, and violates the established design system's color strategy.
    *   **Recommendation**: Define this specific brand color as a semantic color token within the project's CSS/Tailwind configuration and reference it (e.g., `text-soulspce-brand`).

---

## src/pages/auth/ForgotPassword.tsx

### Findings:

1.  **Missing `name` attribute for `Input` components**
    *   **Description**: The `Input` component used for the email address lacks the `name` attribute. While `autoComplete` is present, `name` is crucial for proper form data submission and can affect browser autofill behavior. (Consistent recurring issue).
    *   **Guideline Violated**: Web Interface Guidelines: "Inputs need `autocomplete` and meaningful `name`."
    *   **Severity**: High
    *   **Impact**: Potential issues with form submission, reduced reliability of browser autofill, and accessibility for some assistive technologies.
    *   **Recommendation**: Update `src/pages/auth/ForgotPassword.tsx` to pass a `name` prop to the `Input` component (e.g., `<Input name="email" ... />`).

2.  **General error message placement**
    *   **Description**: The `error` message (if `setError` is triggered for "Something went wrong.") is displayed in a general alert box at the top. The `Input` component supports an `error` prop for this purpose. (Consistent recurring issue).
    *   **Guideline Violated**: Web Interface Guidelines: "Errors inline next to fields; focus first error on submit."
    *   **Severity**: Medium
    *   **Impact**: Users may need to visually scan the form to identify which field corresponds to a specific error message, leading to a less efficient experience.
    *   **Recommendation**: Update `src/pages/auth/ForgotPassword.tsx` to pass field-specific error messages to the `error` prop of the respective `Input` components.

3.  **Nested interactive elements (Link wrapping Button)**
    *   **Description**: The "Back to sign in" button in the success state is implemented as a `Button` component nested inside a `Link` component (`<Link to="/sign-in"><Button ...>...</Button></Link>`). This can create confusing semantics for assistive technologies.
    *   **Guideline Violated**: Web Interface Guidelines: "`<button>` for actions, `<a>`/`<Link>` for navigation (not `<div onClick>`)".
    *   **Severity**: Medium
    *   **Impact**: Potential accessibility issues for keyboard navigation and screen reader users.
    *   **Recommendation**: Re-implement this as a styled `Link` component that looks like a button, or ensure the `Button` component itself can render as an `<a>` tag when a `to` prop is provided, maintaining correct semantic HTML.

---

## src/pages/auth/VerifyEmail.tsx

### Findings:

1.  **Usage of inline style for background gradient**
    *   **Description**: A decorative `div` containing the `Mail` icon uses an inline `style` attribute to define a `linear-gradient` background.
    *   **Guideline Violated**: `ui-ux-pro-max` design system: "Use semantic color tokens not raw hex in components" and "No gradients/shadows" (implying adherence to defined key effects).
    *   **Severity**: Low
    *   **Impact**: Inconsistent theming, harder to manage, and deviates from the established design system's emphasis on minimal effects and token-based styling.
    *   **Recommendation**: Define this gradient as a CSS custom property or a Tailwind CSS utility class if possible, or use a semantic token for the colors within the gradient to maintain consistency with the design system.

---

## src/components/auth/AuthLogo.tsx

### Findings:

1.  **Usage of inline style for background gradient**
    *   **Description**: The `div` containing the SVG logo uses an inline `style` attribute for its background gradient: `linear-gradient(135deg, #18005F 0%, #560056 100%)`.
    *   **Guideline Violated**: `ui-ux-pro-max` design system: "Use semantic color tokens not raw hex in components" and "No gradients/shadows".
    *   **Severity**: Low
    *   **Impact**: Inconsistent theming, harder to manage, and deviates from the established design system's emphasis on minimal effects and token-based styling.
    *   **Recommendation**: Define this gradient as a CSS custom property or a Tailwind CSS utility class and use that instead of inline style.
