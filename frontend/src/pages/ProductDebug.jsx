import { useState, useEffect } from 'react';
import { productAPI } from '../utils/api';

const ProductDebug = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productAPI.getProducts();
        console.log('All products:', response.data);
        
        if (response.data.success) {
          setProducts(response.data.data.products || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="p-8">Loading products...</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Product Debug - Available Products</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Total Products: {products.length}</h2>
        
        {products.length === 0 ? (
          <p className="text-gray-500">No products found in database</p>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={product.id || index} className="border-b pb-4">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">
                  <strong>ID:</strong> {product.id}<br/>
                  <strong>Slug:</strong> {product.slug || 'No slug'}<br/>
                  <strong>Price:</strong> NPR {product.price}<br/>
                  <strong>Stock:</strong> {product.stock}<br/>
                  <strong>Images:</strong> {product.images ? JSON.stringify(product.images) : 'No images'}<br/>
                  <strong>Category:</strong> {product.category?.name || 'No category'}
                </p>
                <a 
                  href={`/products/${product.slug}`}
                  className="text-blue-500 hover:underline text-sm"
                >
                  View Product Page
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDebug;
