# AquaNexa Frontend Documentation

## Project Overview
AquaNexa is a scientific data management system focused on marine research data. The frontend is built with React and uses a modular CSS approach with custom design tokens.

## Tech Stack
- React 18+ with Vite
- React Router v6 for navigation
- CSS Modules with custom design system
- React-Toastify for notifications
- React-Dropzone for file uploads

## Project Structure
```
client/
├── src/
│   ├── components/        # Reusable React components
│   │   ├── FileUpload/   # File upload functionality
│   │   ├── FilePreview/  # File preview component
│   │   └── Navbar/       # Navigation component
│   ├── assets/           # Static assets
│   ├── App.css          # Global styles and design tokens
│   ├── App.jsx          # Root component
│   └── main.jsx         # Entry point
├── public/              # Static files
└── package.json        # Dependencies and scripts
```

## Design System
The project uses a custom design system defined in `App.css` with the following key features:

### Color Palette
```css
--color-primary-100: #ccdbdc;  /* Platinum */
--color-primary-200: #9ad1d4;  /* Non-photo blue */
--color-primary-300: #80ced7;  /* Non-photo blue 2 */
--color-primary-400: #007ea7;  /* Cerulean */
--color-primary-500: #003249;  /* Prussian blue */
--color-primary-600: #002133;  /* Darker Prussian blue */
```

### Typography
- Font Family: System font stack with fallbacks
- Font Sizes: Range from xs (0.75rem) to 4xl (2.25rem)
- Font Weights: Regular (400) to Bold (700)

### Spacing
Consistent 4px-based spacing scale:
- --spacing-1: 0.25rem (4px)
- --spacing-2: 0.5rem (8px)
- --spacing-4: 1rem (16px)
etc.

## Component Guidelines

### File Upload Component
The `FileUpload` component handles:
- Drag and drop file uploads
- File type validation
- Upload progress tracking
- Server status monitoring
- File metadata display

Usage:
```jsx
<FileUpload 
  maxFileSize={500 * 1024 * 1024} // 500MB
  acceptedTypes={['image/*', '.csv', '.xlsx']}
/>
```

### Navigation
Uses React Router v6 with the following structure:
```jsx
<BrowserRouter>
  <Routes>
    <Route path="/*" element={<App />}>
      <Route path="upload" element={<FileUpload />} />
      <Route path="preview/:id" element={<FilePreview />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### CSS Class Naming Convention
We follow a BEM-like naming convention:
- Block: `.upload`
- Element: `.upload__title`
- Modifier: `.upload--active`

Example:
```css
.upload-zone {
  /* Base styles */
}

.upload-zone__title {
  /* Element styles */
}

.upload-zone--active {
  /* Modified state */
}
```

## Common Patterns

### Error Handling
Use react-toastify for user notifications:
```jsx
import { toast } from 'react-toastify';

// Success notification
toast.success('File uploaded successfully!');

// Error notification
toast.error('Upload failed: ' + error.message);
```

### Loading States
Use the built-in loading states:
```jsx
const [loading, setLoading] = useState(false);

// In components
<div className={`card ${loading ? 'card--loading' : ''}`}>
```

### Form Inputs
Standard form input styling:
```css
.upload-form__input {
  width: 100%;
  padding: var(--spacing-2);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
}
```

## Performance Considerations
- Use `React.lazy()` for route-based code splitting
- Implement proper loading states
- Use optimized images and SVGs
- Implement proper caching strategies

## Accessibility Guidelines
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation
- Maintain color contrast ratios
- Support screen readers

## Development Workflow
1. Create new components in `/src/components`
2. Use CSS modules for component styles
3. Follow the existing naming conventions
4. Add proper TypeScript types (when implemented)
5. Test components in isolation
6. Integrate with routing if needed