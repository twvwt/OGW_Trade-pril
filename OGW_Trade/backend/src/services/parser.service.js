const Product = require('../models/Product');
const fs = require('fs');
const csv = require('csv-parser');

const parseProductsFromFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    const products = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        products.push({
          name: row.name || row.title,
          description: row.description || '',
          price: parseFloat(row.price),
          category: row.category || 'uncategorized',
          images: row.images ? row.images.split('|') : [],
          stock: parseInt(row.stock) || 0,
          attributes: {
            weight: row.weight ? parseFloat(row.weight) : undefined,
            dimensions: row.dimensions,
            color: row.color,
          },
        });
      })
      .on('end', () => {
        resolve(products);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

const syncProductsWithDatabase = async (products) => {
  const operations = products.map(product => ({
    updateOne: {
      filter: { name: product.name },
      update: { $set: product },
      upsert: true,
    },
  }));
  
  await Product.bulkWrite(operations);
};

module.exports = {
  parseProductsFromFile,
  syncProductsWithDatabase,
};