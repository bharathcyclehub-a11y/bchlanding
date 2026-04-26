const products = require('../src/data/products.js').products;

const electric = products.filter(p => p.category === 'electric');
console.log('Total electric bikes:', electric.length);

const withoutSubcat = electric.filter(p => !p.subcategory && !p.subCategory);
console.log('\nElectric bikes WITHOUT subcategory/subCategory:', withoutSubcat.length);

const withSubcat = electric.filter(p => p.subcategory || p.subCategory);
console.log('Electric bikes WITH subcategory/subCategory:', withSubcat.length);

console.log('\n=== Bikes WITHOUT subcategory ===');
withoutSubcat.forEach((p, i) => {
  console.log(`${i + 1}. ${p.id} - ${p.name}`);
});
