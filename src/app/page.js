"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import productCatalog from "@/lib/product-catalog";

const { products: initialProducts } = productCatalog;
const categories = [
  "Semua produk",
  "Audio",
  "Komputer",
  "Smartphone",
  "Wearable",
  "Kamera",
];

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function ProductCard({ product, onAdd, isAdded }) {
  return (
    <article className="product-card">
      <div className={`product-visual tone-${product.tone}`}>
        <Image
          src={product.image}
          alt={product.name}
          width={640}
          height={480}
          unoptimized
        />
        <span className="product-badge">{product.badge}</span>
        <button
          className={`add-button${isAdded ? " is-added" : ""}`}
          type="button"
          onClick={() => onAdd(product.id)}
          aria-label={`Tambah ${product.name} ke keranjang`}
          title="Tambah ke keranjang"
        >
          {isAdded ? <Check size={19} /> : <Plus size={19} />}
        </button>
      </div>
      <div className="product-info">
        <span className="product-brand">{product.brand}</span>
        <h3>{product.name}</h3>
        <div className="price-line">
          <strong>{formatRupiah(product.price)}</strong>
          {product.oldPrice && <del>{formatRupiah(product.oldPrice)}</del>}
        </div>
      </div>
    </article>
  );
}

function CartItem({ product, quantity, onChangeQuantity }) {
  return (
    <div className="cart-item">
      <div className={`cart-thumb tone-${product.tone}`}>
        <Image
          src={product.image}
          alt=""
          width={100}
          height={100}
          unoptimized
        />
      </div>
      <div className="cart-item-detail">
        <span>{product.brand}</span>
        <b>{product.name}</b>
        <strong>{formatRupiah(product.price)}</strong>
        <div className="quantity-control">
          <button
            type="button"
            aria-label={`Kurangi jumlah ${product.name}`}
            onClick={() => onChangeQuantity(product.id, -1)}
          >
            <Minus size={13} />
          </button>
          <span>{quantity}</span>
          <button
            type="button"
            aria-label={`Tambah jumlah ${product.name}`}
            onClick={() => onChangeQuantity(product.id, 1)}
          >
            <Plus size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Semua produk");
  const [searchQuery, setSearchQuery] = useState("");
  const [catalog, setCatalog] = useState(initialProducts);
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;

    fetch("/api/products")
      .then((response) => {
        if (!response.ok) throw new Error("Katalog tidak tersedia");
        return response.json();
      })
      .then(({ products: databaseProducts }) => {
        if (isActive && databaseProducts.length) {
          setCatalog(databaseProducts);
        }
      })
      .catch(() => {});

    return () => {
      isActive = false;
    };
  }, []);

  const visibleProducts = catalog.filter((product) => {
    const matchesCategory =
      selectedCategory === "Semua produk" ||
      product.category === selectedCategory;
    const searchableDetails =
      `${product.name} ${product.brand} ${product.category}`.toLowerCase();
    const matchesSearch = searchableDetails.includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const cartItems = Object.entries(cart)
    .map(([productId, quantity]) => ({
      product: catalog.find((item) => item.id === productId),
      quantity,
    }))
    .filter((item) => item.product);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  function addToCart(productId) {
    setCart((currentCart) => ({
      ...currentCart,
      [productId]: (currentCart[productId] || 0) + 1,
    }));
  }

  function changeQuantity(productId, amount) {
    setCart((currentCart) => {
      const nextQuantity = (currentCart[productId] || 0) + amount;

      if (nextQuantity <= 0) {
        const updatedCart = { ...currentCart };
        delete updatedCart[productId];
        return updatedCart;
      }

      return { ...currentCart, [productId]: nextQuantity };
    });
  }

  async function submitOrder(event) {
    event.preventDefault();
    setCheckoutError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const orderDetails = {
      customerName: formData.get("customerName"),
      email: formData.get("email"),
      address: formData.get("address"),
      items: cartItems.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      })),
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderDetails),
      });

      if (!response.ok) {
        throw new Error("Pesanan belum tersimpan. Coba lagi sebentar, ya.");
      }

      setIsOrderPlaced(true);
      setCart({});
    } catch (error) {
      setCheckoutError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function closePanels() {
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    setIsOrderPlaced(false);
  }

  function showAllProducts() {
    setSearchQuery("");
    setSelectedCategory("Semua produk");
  }

  return (
    <div className="shop-shell">
      <div className="announcement">
        <span className="announcement-dot" />
        Gratis ongkir untuk pesanan di atas Rp1.000.000
        <span className="announcement-right">Toko resmi. Garansi pasti.</span>
      </div>

      <header className="site-header">
        <a className="brand-mark" href="#top" aria-label="Ruang Elektronik, beranda">
          <span className="brand-icon">r.</span>
          <span>
            ruang<span className="brand-light">elektronik</span>
          </span>
        </a>
        <label className="search-box">
          <Search size={19} aria-hidden="true" />
          <input
            type="search"
            placeholder="Cari headphone, laptop, kamera..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
        <button
          className="cart-trigger"
          type="button"
          onClick={() => setIsCartOpen(true)}
          aria-label={`Buka keranjang, ${cartCount} barang`}
        >
          <ShoppingBag size={19} />
          <span>Keranjang</span>
          <b>{cartCount}</b>
        </button>
      </header>

      <main id="top" className="store-main">
        <div className="catalog-intro">
          <div>
            <div className="eyebrow">
              <span /> PILIHAN BUAT HARI INI
            </div>
            <h1>Teknologi yang bikin hari lebih mudah.</h1>
            <p>
              Perangkat pilihan, harga jujur, dan garansi resmi. Tinggal pilih
              yang cocok buat kamu.
            </p>
          </div>
          <a className="all-products-link" href="#produk">
            Lihat semua produk <ArrowRight size={17} />
          </a>
        </div>

        <section
          className="catalog-section"
          id="produk"
          aria-label="Katalog produk elektronik"
        >
          <div className="catalog-toolbar">
            <div
              className="category-list"
              role="tablist"
              aria-label="Kategori produk"
            >
              {categories.map((category) => (
                <button
                  className={`category-tab${selectedCategory === category ? " active" : ""}`}
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="results-heading">
            <div>
              <h2>
                {selectedCategory === "Semua produk"
                  ? "Lagi banyak dicari"
                  : selectedCategory}
              </h2>
              <span>{visibleProducts.length} produk pilihan</span>
            </div>
            <span className="results-note">Harga sudah termasuk pajak</span>
          </div>

          {visibleProducts.length ? (
            <div className="product-grid">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={addToCart}
                  isAdded={Boolean(cart[product.id])}
                />
              ))}
            </div>
          ) : (
            <div className="empty-results">
              <Search size={24} />
              <h3>Belum ketemu barangnya</h3>
              <p>Coba kata kunci atau kategori yang lain.</p>
              <button type="button" onClick={showAllProducts}>
                Tampilkan semua produk
              </button>
            </div>
          )}
        </section>

        <section className="trust-strip" aria-label="Keunggulan berbelanja">
          <div>
            <span className="trust-number">01</span>
            <div>
              <b>Produk original</b>
              <small>Langsung dari distributor resmi</small>
            </div>
          </div>
          <div>
            <span className="trust-number">02</span>
            <div>
              <b>Garansi jelas</b>
              <small>Garansi resmi, tanpa tanda bintang</small>
            </div>
          </div>
          <div>
            <span className="trust-number">03</span>
            <div>
              <b>Belanja tenang</b>
              <small>Pembayaran aman dan terlindungi</small>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand-mark footer-brand" href="#top">
          <span className="brand-icon">r.</span>
          <span>
            ruang<span className="brand-light">elektronik</span>
          </span>
        </a>
        <span>Perangkat baik, hidup lebih praktis.</span>
        <span>© 2026 Ruang Elektronik</span>
      </footer>

      {(isCartOpen || isCheckoutOpen) && (
        <button
          className="screen-dimmer"
          type="button"
          aria-label="Tutup panel"
          onClick={closePanels}
        />
      )}

      {isCartOpen && (
        <aside className="cart-drawer" aria-label="Keranjang belanja">
          <div className="drawer-heading">
            <div>
              <span className="eyebrow">BELANJAANMU</span>
              <h2>Keranjang ({cartCount})</h2>
            </div>
            <button
              className="icon-button"
              type="button"
              onClick={() => setIsCartOpen(false)}
              aria-label="Tutup keranjang"
            >
              <X size={20} />
            </button>
          </div>

          {cartItems.length ? (
            <>
              <div className="cart-items">
                {cartItems.map(({ product, quantity }) => (
                  <CartItem
                    key={product.id}
                    product={product}
                    quantity={quantity}
                    onChangeQuantity={changeQuantity}
                  />
                ))}
              </div>
              <div className="cart-summary">
                <span>Subtotal</span>
                <strong>{formatRupiah(subtotal)}</strong>
              </div>
              <p className="shipping-note">
                {subtotal >= 1000000
                  ? "Asyik, kamu dapat gratis ongkir."
                  : `Tambah ${formatRupiah(1000000 - subtotal)} lagi untuk gratis ongkir.`}
              </p>
              <button
                className="checkout-button"
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
              >
                Lanjut checkout <ArrowRight size={17} />
              </button>
            </>
          ) : (
            <div className="empty-cart">
              <ShoppingBag size={30} />
              <h3>Keranjangmu masih kosong</h3>
              <p>Produk pilihanmu akan muncul di sini.</p>
              <button type="button" onClick={() => setIsCartOpen(false)}>
                Mulai belanja
              </button>
            </div>
          )}
        </aside>
      )}

      {isCheckoutOpen && (
        <section
          className="checkout-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-title"
        >
          <div className="drawer-heading">
            <div>
              <span className="eyebrow">LANGKAH TERAKHIR</span>
              <h2 id="checkout-title">Checkout</h2>
            </div>
            <button
              className="icon-button"
              type="button"
              onClick={() => setIsCheckoutOpen(false)}
              aria-label="Tutup checkout"
            >
              <X size={20} />
            </button>
          </div>

          {isOrderPlaced ? (
            <div className="order-success">
              <span>
                <Check size={25} />
              </span>
              <h3>Pesanan tercatat!</h3>
              <p>Terima kasih sudah belanja di Ruang Elektronik.</p>
              <button
                className="checkout-button"
                type="button"
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setIsOrderPlaced(false);
                }}
              >
                Kembali ke toko
              </button>
            </div>
          ) : (
            <form className="checkout-form" onSubmit={submitOrder}>
              <label>
                Nama lengkap
                <input
                  name="customerName"
                  required
                  autoComplete="name"
                  placeholder="Nama penerima"
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nama@email.com"
                />
              </label>
              <label>
                Alamat pengiriman
                <textarea
                  name="address"
                  required
                  autoComplete="street-address"
                  placeholder="Jalan, kota, kode pos"
                  rows={3}
                />
              </label>
              <div className="checkout-total">
                <span>Total pesanan</span>
                <strong>{formatRupiah(subtotal)}</strong>
              </div>
              {checkoutError && (
                <p className="checkout-error" role="alert">
                  {checkoutError}
                </p>
              )}
              <button
                className="checkout-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan pesanan..." : "Buat pesanan"}
                <ArrowRight size={17} />
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
