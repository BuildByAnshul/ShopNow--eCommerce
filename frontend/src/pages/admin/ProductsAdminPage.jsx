import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../redux/slices/productSlice';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';

const CATEGORIES = ['skincare', 'haircare', 'wellness', 'aromatherapy', 'supplements', 'home'];

const emptyForm = {
  name: '', description: '', price: '', category: 'skincare',
  images: '', stock: '', featured: false,
};

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const AdminProductsPage = () => {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((s) => s.products);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 }));
  }, [dispatch]);

  const openCreate = () => {
    setSelectedProduct(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setSelectedProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images?.join(', ') || '',
      stock: product.stock,
      featured: product.featured,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      images: form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };
    try {
      if (selectedProduct) {
        await dispatch(updateProduct({ id: selectedProduct._id, data })).unwrap();
      } else {
        await dispatch(createProduct(data)).unwrap();
      }
      setModalOpen(false);
      dispatch(fetchProducts({ limit: 100 }));
    } catch (err) {
      alert(err || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    await dispatch(deleteProduct(selectedProduct._id));
    setDeleteModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen pt-24">
      <div className="section-container !py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="section-heading mb-1">
              Manage <em className="italic text-botanical-primary">Products</em>
            </h1>
            <p className="font-sans text-botanical-muted text-sm">{products.length} products</p>
          </div>
          <Button onClick={openCreate} variant="primary">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>

        {loading ? (
          <Spinner size="lg" className="mt-20" />
        ) : (
          <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-botanical-border">
                    {['Product', 'Category', 'Price', 'Stock', 'Featured', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-4 text-left font-sans text-xs text-botanical-muted uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b border-botanical-border/50 hover:bg-botanical-surface/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-botanical-surface flex-shrink-0">
                            <img
                              src={product.images?.[0] || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=100'}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-sans text-sm font-medium text-botanical-text line-clamp-2 max-w-xs">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-sans text-sm text-botanical-muted capitalize">{product.category}</td>
                      <td className="px-6 py-4 font-sans text-sm font-semibold text-botanical-text">{formatPrice(product.price)}</td>
                      <td className="px-6 py-4">
                        <span className={`font-sans text-sm font-medium ${product.stock === 0 ? 'text-red-500' : product.stock < 5 ? 'text-amber-500' : 'text-green-600'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.featured ? (
                          <Star className="w-4 h-4 text-botanical-accent" fill="#C27B66" />
                        ) : (
                          <span className="text-botanical-muted/30">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-2 rounded-xl hover:bg-botanical-surface text-botanical-muted hover:text-botanical-text transition-all"
                            aria-label="Edit product"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedProduct(product); setDeleteModalOpen(true); }}
                            className="p-2 rounded-xl hover:bg-red-50 text-botanical-muted hover:text-red-500 transition-all"
                            aria-label="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedProduct ? 'Edit Product' : 'Add New Product'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Input label="Product Name" id="prod-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="sm:col-span-2">
              <label className="input-label">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="input-field resize-none"
                id="prod-desc"
                required
              />
            </div>
            <Input label="Price (₹)" id="prod-price" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <Input label="Stock" id="prod-stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
            <div className="sm:col-span-2">
              <label className="input-label" htmlFor="prod-category">Category</label>
              <select
                id="prod-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field capitalize"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Input label="Image URLs (comma-separated)" id="prod-images" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="prod-featured"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="accent-botanical-primary w-4 h-4"
              />
              <label htmlFor="prod-featured" className="font-sans text-sm text-botanical-text cursor-pointer">
                Mark as Featured
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving} variant="primary" className="flex-1">
              {selectedProduct ? 'Save Changes' : 'Create Product'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Product" maxWidth="max-w-sm">
        <p className="font-sans text-sm text-botanical-muted mb-6">
          Are you sure you want to delete <strong className="text-botanical-text">{selectedProduct?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button onClick={handleDelete} variant="accent" className="flex-1">Delete</Button>
          <Button onClick={() => setDeleteModalOpen(false)} variant="secondary">Cancel</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProductsPage;
