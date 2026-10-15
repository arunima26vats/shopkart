import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Wishlist state
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const [wishlistLoading, setWishlistLoading] = useState<
    Record<string, boolean>
  >({});

  const [wishlistErrors, setWishlistErrors] = useState<Record<string, string>>(
    {}
  );

  // ======================================================
  // FETCH PRODUCTS
  // ======================================================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const params: {
        search?: string;
        category?: string;
        sort?: string;
      } = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (category) {
        params.category = category;
      }

      if (sort) {
        params.sort = sort;
      }

      const response = await api.get('/products', {
        params,
      });

      setProducts(response.data.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FETCH WISHLIST
  // ======================================================
  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist');

      const wishlist = response.data.wishlist || [];

      const ids = new Set<string>(
        wishlist.map((product: Product) => product._id)
      );

      setWishlistIds(ids);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    }
  };

  // ======================================================
  // LOAD PRODUCTS WHEN FILTER/SORT CHANGES
  // ======================================================
  useEffect(() => {
    fetchProducts();
  }, [category, sort]);

  // ======================================================
  // LOAD WISHLIST
  // ======================================================
  useEffect(() => {
    fetchWishlist();
  }, []);

  // ======================================================
  // SEARCH
  // ======================================================
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    fetchProducts();
  };

  // ======================================================
  // TOGGLE WISHLIST
  // ======================================================
  const handleWishlistToggle = async (productId: string) => {
    // Prevent duplicate requests
    if (wishlistLoading[productId]) {
      return;
    }

    try {
      // Clear previous error
      setWishlistErrors((currentErrors) => {
        const updatedErrors = { ...currentErrors };
        delete updatedErrors[productId];
        return updatedErrors;
      });

      // Show loading state
      setWishlistLoading((currentLoading) => ({
        ...currentLoading,
        [productId]: true,
      }));

      const response = await api.patch(`/wishlist/${productId}/toggle`);

      const saved = response.data.saved;

      // Update wishlist state
      setWishlistIds((currentIds) => {
        const updatedIds = new Set(currentIds);

        if (saved) {
          updatedIds.add(productId);
        } else {
          updatedIds.delete(productId);
        }

        return updatedIds;
      });

      // Tell Navbar to refresh wishlist count
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (err: any) {
      console.error('Wishlist toggle failed:', err);

      setWishlistErrors((currentErrors) => ({
        ...currentErrors,
        [productId]:
          err.response?.data?.message ||
          'Unable to update wishlist. Please try again.',
      }));
    } finally {
      // Stop loading
      setWishlistLoading((currentLoading) => ({
        ...currentLoading,
        [productId]: false,
      }));
    }
  };

  return (
    <>
      {/* ==================================================
          NAVBAR
          ================================================== */}
      <Navbar />

      {/* ==================================================
          PRODUCTS PAGE
          ================================================== */}
      <div style={styles.page}>
        <header style={styles.header}>
          <h1 style={styles.title}>ShopKart Products</h1>

          <p style={styles.subtitle}>Discover products you'll love.</p>

          {/* Search */}
          <form onSubmit={handleSearch} style={styles.searchContainer}>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              style={styles.searchInput}
            />

            <button type="submit" style={styles.searchButton}>
              Search
            </button>
          </form>

          {/* Filters */}
          <div style={styles.controlsContainer}>
            <div style={styles.filterContainer}>
              <label htmlFor="category" style={styles.label}>
                Category:
              </label>

              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                style={styles.select}
              >
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Books">Books</option>
                <option value="Home">Home</option>
              </select>
            </div>

            <div style={styles.filterContainer}>
              <label htmlFor="sort" style={styles.label}>
                Sort By:
              </label>

              <select
                id="sort"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                style={styles.select}
              >
                <option value="">Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </header>

        {/* ==================================================
            LOADING
            ================================================== */}
        {loading && (
          <div style={styles.center}>
            <p style={styles.message}>Loading products...</p>
          </div>
        )}

        {/* ==================================================
            ERROR
            ================================================== */}
        {!loading && error && (
          <div style={styles.center}>
            <p style={styles.error}>{error}</p>

            <button
              type="button"
              onClick={fetchProducts}
              style={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        )}

        {/* ==================================================
            EMPTY
            ================================================== */}
        {!loading && !error && products.length === 0 && (
          <div style={styles.empty}>
            <h2>No products found</h2>

            <p>Try changing your search or category filter.</p>
          </div>
        )}

        {/* ==================================================
            PRODUCTS
            ================================================== */}
        {!loading && !error && products.length > 0 && (
          <main style={styles.grid}>
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onClick={() => navigate(`/products/${product._id}`)}
                isSaved={wishlistIds.has(product._id)}
                wishlistLoading={wishlistLoading[product._id] || false}
                wishlistError={wishlistErrors[product._id]}
                onWishlistToggle={() => handleWishlistToggle(product._id)}
              />
            ))}
          </main>
        )}
      </div>
    </>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles: {
  [key: string]: CSSProperties;
} = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '40px',
  },

  header: {
    maxWidth: '1200px',
    margin: '0 auto 40px',
    textAlign: 'center',
  },

  title: {
    margin: 0,
    fontSize: '42px',
    color: '#111827',
  },

  subtitle: {
    marginTop: '10px',
    fontSize: '18px',
    color: '#6b7280',
  },

  searchContainer: {
    maxWidth: '700px',
    margin: '30px auto 20px',
    display: 'flex',
    gap: '10px',
  },

  searchInput: {
    flex: 1,
    padding: '13px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
  },

  searchButton: {
    padding: '13px 24px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
  },

  controlsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '30px',
    flexWrap: 'wrap',
  },

  filterContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
  },

  label: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#374151',
  },

  select: {
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontSize: '15px',
    color: '#111827',
    cursor: 'pointer',
  },

  grid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },

  center: {
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  message: {
    fontSize: '20px',
    color: '#374151',
  },

  error: {
    fontSize: '18px',
    color: '#dc2626',
    marginBottom: '16px',
  },

  retryButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '15px',
  },

  empty: {
    maxWidth: '600px',
    margin: '80px auto',
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    color: '#374151',
  },
};

export default Products;
