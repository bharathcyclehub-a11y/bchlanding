# Frontend Update Required - Manual Changes

## ⚠️ IMPORTANT: File Updates Not Applied

The automated file updates to ProductDetailPage.jsx appear to have been reverted by a file watcher or linter. These changes must be applied manually.

## Required Changes

### 1. ProductDetailPage.jsx - UPDATE IMPORTS

**File**: `src/pages/ProductDetailPage.jsx`

**Current (Line 3-4)**:
```javascript
import { categories, products } from '../data/products';
import ProductCard from '../components/ProductCard';
```

**Change to**:
```javascript
import { categories } from '../data/products';
import ProductCard from '../components/ProductCard';
import { getProduct, getProducts } from '../utils/auth-api';
```

**Action**: Remove `products` from the import and add the API import.

---

### 2. ProductDetailPage.jsx - UPDATE useEffect

**File**: `src/pages/ProductDetailPage.jsx`

**Current (Lines 64-85)**:
```javascript
  // Load product from local data
  useEffect(() => {
    try {
      setLoading(true);
      setError(null);

      // Find product in local data
      const productData = products.find(p => p.id === productId);

      if (!productData) {
        setError('Product not found');
      } else {
        setProduct(productData);
        setAllProducts(products);
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [productId]);
```

**Change to**:
```javascript
  // Fetch product and all products for similar section
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch current product and all products in parallel
        const [productData, productsData] = await Promise.all([
          getProduct(productId),
          getProducts({ limit: 100 })
        ]);

        setProduct(productData);
        setAllProducts(productsData);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);
```

**Action**: Replace the synchronous products.find() with async API fetch.

---

## Verification

After making these changes:

1. **Check ProductsPage.jsx** - Should already have API fetching:
   ```bash
   grep -n "getProducts" src/pages/ProductsPage.jsx
   ```
   Should show: `const data = await getProducts({ limit: 100 });`

2. **Check ProductDetailPage.jsx** - Should have API fetching:
   ```bash
   grep -n "getProduct.*getProducts" src/pages/ProductDetailPage.jsx
   ```
   Should show: `await Promise.all([ getProduct(productId), getProducts({ limit: 100 }) ])`

3. **Test the pages**:
   - Start dev server: `npm run dev`
   - Visit: `http://localhost:5175/products`
   - Click on any product → should load detail page from API
   - Check browser console for API calls (should see `/api/products` requests)

---

## Why These Changes Are Needed

**Before**: Both pages imported products from static `products.js` file
- No loading states
- No real-time updates
- Products can't be added/edited without code changes

**After**: Both pages fetch from Firestore via API
- Shows loading spinner during fetch
- Products update in real-time
- Admin can add/edit products through admin panel

---

## Current Status

✅ **ProductsPage.jsx** - Already updated, fetches from API
⚠️ **ProductDetailPage.jsx** - **NEEDS MANUAL UPDATE** (changes were reverted)

---

## Testing After Changes

1. **Test Products Page** (`/products`):
   - Should show loading spinner briefly
   - Should display all 50 products
   - Category filter should work
   - Click product card → navigate to detail page

2. **Test Product Detail Page** (`/products/kids-001`):
   - Should show loading spinner briefly
   - Should display product details
   - Similar products section should show related bikes
   - Navigate to another product → should fetch new data

3. **Test 404 Handling** (`/products/invalid-id`):
   - Should show "Product not found" error
   - Back button should work

---

## Troubleshooting

### If products don't load:
1. Check browser console for errors
2. Verify dev server is running with API: `npm run dev`
3. Test API directly: `curl http://localhost:5175/api/products`
4. Check Firebase Console → Firestore → `products` collection

### If file changes keep reverting:
1. Stop dev server
2. Check for file watchers (Vite HMR, linter, Prettier)
3. Make changes with server stopped
4. Restart server

---

**Last Updated**: February 9, 2026
**Status**: Manual update required for ProductDetailPage.jsx
