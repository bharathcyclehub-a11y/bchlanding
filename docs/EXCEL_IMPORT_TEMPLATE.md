# Excel Import Template for Products

## Download Template

To import products via Excel, create a spreadsheet with the following columns:

## Required Columns

| Column Name | Type | Description | Example |
|------------|------|-------------|---------|
| name | Text | Product name | "Hero Sprint Pro 26T" |
| category | Text | Category slug (must match existing category) | "geared" |
| price | Number | Selling price in ₹ | 15999 |

## Optional Columns

| Column Name | Type | Description | Example |
|------------|------|-------------|---------|
| mrp | Number | Maximum Retail Price | 19999 |
| discount | Number | Discount percentage | 20 |
| stock | Number | Stock quantity | 25 |
| stockStatus | Text | Stock status | "in_stock", "low_stock", "out_of_stock" |
| lowStockThreshold | Number | Alert threshold | 5 |
| description | Text | Product description | "Lightweight 21-speed bicycle..." |
| brand | Text | Brand name | "Hero" |
| ageRange | Text | Target age range | "8-12 years" |
| isFeatured | Boolean | Featured on homepage | true/false |
| isNew | Boolean | New arrival badge | true/false |
| tags | Text (comma-separated) | Search tags | "kids,colorful,lightweight" |
| images | Text (comma-separated URLs) | Image URLs | "https://example.com/img1.jpg,https://example.com/img2.jpg" |

## Specification Columns

| Column Name | Type | Description | Example |
|------------|------|-------------|---------|
| frameSize | Text | Frame size | "14 inch" |
| wheelSize | Text | Wheel diameter | "26 inch" |
| gears | Number | Number of gears | 21 |
| weight | Text | Product weight | "12 kg" |
| maxLoad | Text | Maximum load capacity | "75 kg" |
| brakeType | Text | Brake system | "V-brake" |
| suspension | Text | Suspension type | "Front suspension" |
| material | Text | Frame material | "Steel alloy" |

## Example Excel Data

```
| name | category | price | mrp | stock | description | frameSize | wheelSize | gears | brakeType |
|------|----------|-------|-----|-------|-------------|-----------|-----------|-------|-----------|
| Hero Sprint Pro 26T | geared | 15999 | 19999 | 25 | 21-speed bicycle for adults | 18 inch | 26 inch | 21 | V-brake |
| Hero Blast 20T | kids | 7999 | 9999 | 30 | Kids bicycle with training wheels | 12 inch | 20 inch | 1 | Drum brake |
```

## Category Slugs

Make sure to use the exact category slug from your system:
- kids
- geared
- mountain
- city
- electric
- (or any custom category you've created)

## File Format Support

- Excel 2007+ (.xlsx) - **Recommended**
- Excel 97-2003 (.xls)
- CSV (.csv)

## Upload Steps

1. Visit Admin Dashboard → Products Tab
2. Click "Import Excel" button
3. Select your Excel file (.xlsx, .xls, or .csv)
4. Wait for upload and processing
5. Review success message and any errors

## Error Handling

If some products fail to import:
- Check the browser console for detailed error messages
- Verify all required fields (name, category, price) are present
- Ensure category slugs match existing categories
- Fix errors in the Excel file and re-upload

## Tips

- **Stock Status**: If not provided, it's auto-calculated based on stock quantity
  - quantity > 10 → "in_stock"
  - 0 < quantity ≤ 10 → "low_stock"
  - quantity = 0 → "out_of_stock"

- **Discount**: If not provided, it's auto-calculated: `((mrp - price) / mrp) * 100`

- **MRP**: If not provided, it defaults to the price

- **Images**: Provide comma-separated URLs without spaces
  - ✅ Good: "url1.jpg,url2.jpg,url3.jpg"
  - ❌ Bad: "url1.jpg, url2.jpg, url3.jpg" (spaces cause issues)

- **Tags**: Provide comma-separated keywords for search
  - Example: "kids,colorful,lightweight,training-wheels"

## Bulk Import Limits

- Maximum file size: 10 MB
- Maximum products per file: 1000 (recommended)
- For larger imports, split into multiple files

## Sample Excel File

Download a pre-filled sample: [Coming Soon]

## Support

If you encounter issues:
1. Check the format matches this template
2. Verify all category slugs exist in Categories Manager
3. Check browser console for detailed errors
4. Contact support with the error message
