# Premium Dropdown Components Documentation

UIverse-inspired dropdown components with smooth animations, search functionality, and multiple variants.

## Components

### 1. Dropdown (Basic)
[src/components/Dropdown.jsx](src/components/Dropdown.jsx)

Premium dropdown with three visual variants and smooth animations.

#### Features
- 3 visual variants (default, premium, glass)
- Smooth Framer Motion animations
- Click outside to close
- Keyboard accessible
- Option descriptions support
- Visual selection indicators

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | "Select Option" | Label displayed above dropdown |
| `options` | array | [] | Array of option objects |
| `value` | string | - | Currently selected value |
| `onChange` | function | - | Callback when selection changes |
| `placeholder` | string | "Choose an option..." | Placeholder text |
| `className` | string | "" | Additional CSS classes |
| `variant` | string | "default" | Visual variant: "default", "premium", "glass" |

#### Option Object Structure

```javascript
{
  value: 'unique-id',      // Required: unique identifier
  label: 'Display Text',   // Required: shown to user
  description: 'Optional additional info'  // Optional: subtext
}
```

#### Usage Example

```jsx
import Dropdown from './components/Dropdown';

const cycleOptions = [
  {
    value: 'mountain',
    label: 'Mountain Bike',
    description: 'Perfect for off-road trails'
  },
  {
    value: 'road',
    label: 'Road Bike',
    description: 'Lightweight and fast'
  }
];

function MyComponent() {
  const [selectedCycle, setSelectedCycle] = useState('');

  return (
    <Dropdown
      label="Choose Your Cycle Type"
      options={cycleOptions}
      value={selectedCycle}
      onChange={setSelectedCycle}
      placeholder="Select a cycle..."
      variant="premium"
    />
  );
}
```

#### Variants

**Default Variant**
- Clean white background
- Subtle borders
- Simple hover effects
- Best for: Standard forms, admin panels

**Premium Variant**
- Gradient backgrounds
- Enhanced shadows with color
- Bold hover effects
- Best for: Landing pages, premium features

**Glass Variant**
- Glassmorphism effect
- Backdrop blur
- Translucent backgrounds
- Best for: Hero sections, overlays

---

### 2. DropdownAdvanced
[src/components/DropdownAdvanced.jsx](src/components/DropdownAdvanced.jsx)

Advanced dropdown with search, multi-select, icons, and premium animations.

#### Features
- Live search/filter functionality
- Multi-select support
- Icon support for options
- Clear button
- Animated gradient background
- Empty state handling
- Selection counter (multi-select)
- Auto-focus search input

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | "Select Option" | Label displayed above dropdown |
| `options` | array | [] | Array of option objects |
| `value` | string/array | - | Selected value(s) |
| `onChange` | function | - | Callback when selection changes |
| `placeholder` | string | "Choose an option..." | Placeholder text |
| `className` | string | "" | Additional CSS classes |
| `searchable` | boolean | false | Enable search functionality |
| `showIcons` | boolean | false | Display option icons |
| `multiSelect` | boolean | false | Enable multiple selection |

#### Option Object Structure (Advanced)

```javascript
{
  value: 'unique-id',      // Required: unique identifier
  label: 'Display Text',   // Required: shown to user
  description: 'Optional info',  // Optional: subtext
  icon: '🚴'              // Optional: emoji or icon
}
```

#### Usage Examples

**Basic Search**
```jsx
import DropdownAdvanced from './components/DropdownAdvanced';

const cityOptions = [
  {
    value: 'jayanagar',
    label: 'Jayanagar',
    description: '15 min delivery',
    icon: '📍'
  },
  // ...more options
];

<DropdownAdvanced
  label="Select Delivery Location"
  options={cityOptions}
  value={selectedCity}
  onChange={setSelectedCity}
  searchable={true}
  showIcons={true}
/>
```

**Multi-Select with Search**
```jsx
const [selectedAccessories, setSelectedAccessories] = useState([]);

const accessoryOptions = [
  {
    value: 'helmet',
    label: 'Helmet',
    description: '₹499 - Safety first',
    icon: '🪖'
  },
  // ...more options
];

<DropdownAdvanced
  label="Select Accessories"
  options={accessoryOptions}
  value={selectedAccessories}  // Array for multi-select
  onChange={setSelectedAccessories}
  searchable={true}
  showIcons={true}
  multiSelect={true}
/>
```

---

## Demo Pages

### Basic Dropdown Demo
[src/pages/DropdownDemo.jsx](src/pages/DropdownDemo.jsx)

Showcases all three variants of the basic dropdown component with live examples.

**To view:** Add route to your router:
```jsx
import DropdownDemo from './pages/DropdownDemo';

// In your router config
<Route path="/dropdown-demo" element={<DropdownDemo />} />
```

### Advanced Dropdown Demo
[src/pages/DropdownAdvancedDemo.jsx](src/pages/DropdownAdvancedDemo.jsx)

Interactive demo showing search, multi-select, and icon features.

**To view:** Add route to your router:
```jsx
import DropdownAdvancedDemo from './pages/DropdownAdvancedDemo';

// In your router config
<Route path="/dropdown-advanced-demo" element={<DropdownAdvancedDemo />} />
```

---

## Styling Guide

### Colors Used

Components use your existing Tailwind color scheme:
- **Primary**: `#DC2626` (Red)
- **Dark**: `#0A0A0A`
- **Gray**: Text `#737373`, Light `#D4D4D4`, BG `#F5F5F5`

### Customization

All components support custom classes via the `className` prop:

```jsx
<Dropdown
  className="max-w-md mx-auto"
  // ...other props
/>
```

### Animation Customization

Animations use Framer Motion. To modify:

1. **Open the component file**
2. **Find motion components** (e.g., `motion.button`, `motion.div`)
3. **Adjust animation properties**:
   - `initial` - Starting state
   - `animate` - End state
   - `transition` - Animation timing

Example:
```jsx
// Make dropdown appear faster
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.1 }}  // Changed from 0.2
>
```

---

## Integration Examples

### In a Quiz/Form Flow

```jsx
import { useState } from 'react';
import Dropdown from './components/Dropdown';

function CycleQuiz() {
  const [answers, setAnswers] = useState({
    type: '',
    brand: '',
    budget: ''
  });

  return (
    <div className="space-y-6">
      <Dropdown
        label="What type of cycling do you do?"
        options={cycleTypeOptions}
        value={answers.type}
        onChange={(value) => setAnswers({...answers, type: value})}
        variant="premium"
      />

      {answers.type && (
        <Dropdown
          label="Preferred Brand"
          options={brandOptions}
          value={answers.brand}
          onChange={(value) => setAnswers({...answers, brand: value})}
          variant="premium"
        />
      )}
    </div>
  );
}
```

### In Contact Form

```jsx
import DropdownAdvanced from './components/DropdownAdvanced';

function ContactForm() {
  const [formData, setFormData] = useState({
    location: '',
    interests: []
  });

  return (
    <form>
      <DropdownAdvanced
        label="Your Location"
        options={locationOptions}
        value={formData.location}
        onChange={(value) => setFormData({...formData, location: value})}
        searchable={true}
        showIcons={true}
      />

      <DropdownAdvanced
        label="Interested In"
        options={interestOptions}
        value={formData.interests}
        onChange={(value) => setFormData({...formData, interests: value})}
        searchable={true}
        multiSelect={true}
      />
    </form>
  );
}
```

---

## Accessibility Features

Both components include:
- ✅ Keyboard navigation
- ✅ Click outside to close
- ✅ Focus management
- ✅ ARIA attributes (partial - can be enhanced)
- ✅ Clear visual feedback
- ✅ Screen reader compatible labels

### To Enhance Accessibility

Add ARIA attributes:
```jsx
<button
  role="combobox"
  aria-expanded={isOpen}
  aria-haspopup="listbox"
  aria-label="Select option"
>
```

---

## Performance Tips

1. **Large option lists**: Use `searchable={true}` to help users find items quickly
2. **Many dropdowns**: Consider lazy loading options
3. **Animation performance**: Reduce motion for users who prefer it (already handled via `prefers-reduced-motion`)

---

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

Requires:
- React 17+
- Framer Motion
- Tailwind CSS

---

## Troubleshooting

### Dropdown not closing on click outside
Make sure the dropdown has a unique ref and the effect is set up correctly. Already implemented in both components.

### Search not working
Ensure `searchable={true}` prop is passed to DropdownAdvanced component.

### Icons not showing
1. Use emoji icons (recommended): `icon: '🚴'`
2. Or use icon components - modify the component to accept icon components instead of strings

### Animations choppy
1. Reduce complexity in `transition` props
2. Use `will-change` CSS property (already applied)
3. Check for conflicting CSS

---

## Future Enhancements

Potential additions:
- [ ] Group options (optgroup support)
- [ ] Virtual scrolling for 1000+ options
- [ ] Keyboard shortcuts (arrow keys, enter to select)
- [ ] Custom option rendering
- [ ] Async option loading
- [ ] Integration with form libraries (React Hook Form, Formik)

---

## Questions or Issues?

These components follow your existing design system and are fully customizable. Modify the source files directly to match your specific needs.

**Component Locations:**
- [src/components/Dropdown.jsx](src/components/Dropdown.jsx)
- [src/components/DropdownAdvanced.jsx](src/components/DropdownAdvanced.jsx)
- [src/pages/DropdownDemo.jsx](src/pages/DropdownDemo.jsx)
- [src/pages/DropdownAdvancedDemo.jsx](src/pages/DropdownAdvancedDemo.jsx)
