import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../redux/slices/productSlice';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { Plus, Pencil, Trash2, Star, ImagePlus, Film, X } from 'lucide-react';

const CATEGORIES = ['skincare', 'haircare', 'wellness', 'aromatherapy', 'supplements', 'home'];

const emptyForm = {
  name: '', description: '', price: '', category: 'skincare',
  stock: '', featured: false,
  storage: '', shelfLife: '', suitableFor: '', howToUse: '',
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
  const [categoryOpen, setCategoryOpen] = useState(false);

  // File states
  const [mainPhoto, setMainPhoto] = useState(null);
  const [mainPhotoPreview, setMainPhotoPreview] = useState(null);
  const [additionalPhotos, setAdditionalPhotos] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 }));
  }, [dispatch]);

  const resetFileStates = () => {
    setMainPhoto(null);
    setMainPhotoPreview(null);
    setAdditionalPhotos([]);
    setAdditionalPreviews([]);
    setVideoFile(null);
    setVideoPreview(null);
    setUploadProgress('');
  };

  const openCreate = () => {
    setSelectedProduct(null);
    setForm(emptyForm);
    resetFileStates();
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setSelectedProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      featured: product.featured,
      storage: product.details?.storage || '',
      shelfLife: product.details?.shelfLife || '',
      suitableFor: product.details?.suitableFor || '',
      howToUse: product.howToUse?.join('\n') || '',
    });
    resetFileStates();
    // Show existing main image as preview
    if (product.images?.[0]) {
      setMainPhotoPreview(product.images[0]);
    }
    // Show existing additional images
    if (product.images?.length > 1) {
      setAdditionalPreviews(product.images.slice(1));
    }
    // Show existing video
    if (product.video) {
      setVideoPreview(product.video);
    }
    setModalOpen(true);
  };

  // Handle main photo selection
  const handleMainPhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainPhoto(file);
      setMainPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Handle additional photos selection (max 5)
  const handleAdditionalPhotos = (e) => {
    const newFiles = Array.from(e.target.files);
    let combined = [...additionalPhotos, ...newFiles];
    if (combined.length > 5) {
      toast.error('Maximum 5 additional photos allowed. Only keeping the first 5.');
      combined = combined.slice(0, 5);
    }
    setAdditionalPhotos(combined);
    setAdditionalPreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const removeAdditionalPhoto = (idxToRemove) => {
    const updatedPhotos = additionalPhotos.filter((_, i) => i !== idxToRemove);
    const updatedPreviews = additionalPreviews.filter((_, i) => i !== idxToRemove);
    setAdditionalPhotos(updatedPhotos);
    setAdditionalPreviews(updatedPreviews);
  };

  // Handle video selection
  const handleVideo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validate main photo for new products
    if (!selectedProduct && !mainPhoto) {
      toast.error('Main photo is required!');
      return;
    }

    setSaving(true);

    try {
      let allImageUrls = [];
      let videoUrl = '';

      // 1. Upload main photo
      if (mainPhoto) {
        setUploadProgress('Uploading main photo...');
        const mainFormData = new FormData();
        mainFormData.append('productName', form.name);
        mainFormData.append('images', mainPhoto);
        const mainRes = await api.post('/upload/images', mainFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        allImageUrls.push(...mainRes.data.urls);
      } else if (selectedProduct?.images?.[0]) {
        // Keep existing main image when editing
        allImageUrls.push(selectedProduct.images[0]);
      }

      // 2. Upload additional photos
      if (additionalPhotos.length > 0) {
        setUploadProgress('Uploading additional photos...');
        const addFormData = new FormData();
        addFormData.append('productName', form.name);
        for (const file of additionalPhotos) {
          addFormData.append('images', file);
        }
        const addRes = await api.post('/upload/images', addFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        allImageUrls.push(...addRes.data.urls);
      } else if (selectedProduct?.images?.length > 1) {
        // Keep existing additional images when editing
        allImageUrls.push(...selectedProduct.images.slice(1));
      }

      // 3. Upload video
      if (videoFile) {
        setUploadProgress('Uploading video (this may take a moment)...');
        const vidFormData = new FormData();
        vidFormData.append('productName', form.name);
        vidFormData.append('video', videoFile);
        const vidRes = await api.post('/upload/video', vidFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        videoUrl = vidRes.data.url;
      } else if (selectedProduct?.video) {
        videoUrl = selectedProduct.video;
      }

      setUploadProgress('Saving product...');

      const data = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: allImageUrls,
        video: videoUrl,
        details: {
          storage: form.storage,
          shelfLife: form.shelfLife,
          suitableFor: form.suitableFor,
        },
        howToUse: form.howToUse.split('\n').filter(s => s.trim() !== ''),
      };

      if (selectedProduct) {
        await dispatch(updateProduct({ id: selectedProduct._id, data })).unwrap();
        toast.success('Product updated successfully');
      } else {
        await dispatch(createProduct(data)).unwrap();
        toast.success('Product created successfully');
      }
      setModalOpen(false);
      dispatch(fetchProducts({ limit: 100 }));
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Save failed');
    } finally {
      setSaving(false);
      setUploadProgress('');
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
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input label="Product Name" id="prod-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="sm:col-span-2 flex flex-col">
              <label className="input-label" htmlFor="prod-desc">Description</label>
              <div className="w-full bg-botanical-surface border border-botanical-border rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-botanical-primary focus-within:border-botanical-primary transition-all duration-300">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full h-full px-5 py-3.5 bg-transparent font-sans text-sm text-botanical-text placeholder-botanical-muted focus:outline-none resize-none"
                  id="prod-desc"
                  required
                />
              </div>
            </div>
            <Input label="Price (₹)" id="prod-price" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <Input label="Stock" id="prod-stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
            
            <div className="sm:col-span-2 border-t border-botanical-border pt-4 mt-2">
              <h3 className="font-serif text-lg font-semibold text-botanical-text mb-4">Product Details & Usage</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Storage Instructions" id="prod-storage" value={form.storage} onChange={(e) => setForm({ ...form, storage: e.target.value })} placeholder="e.g. Cool & Dry Place" />
                <Input label="Shelf Life" id="prod-shelflife" value={form.shelfLife} onChange={(e) => setForm({ ...form, shelfLife: e.target.value })} placeholder="e.g. 24 Months" />
                <div className="sm:col-span-2">
                  <Input label="Suitable For" id="prod-suitable" value={form.suitableFor} onChange={(e) => setForm({ ...form, suitableFor: e.target.value })} placeholder="e.g. All Skin Types" />
                </div>
                <div className="sm:col-span-2 flex flex-col">
                  <label className="input-label" htmlFor="prod-how">How to Use (One step per line)</label>
                  <div className="w-full bg-botanical-surface border border-botanical-border rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-botanical-primary focus-within:border-botanical-primary transition-all duration-300">
                    <textarea
                      value={form.howToUse}
                      onChange={(e) => setForm({ ...form, howToUse: e.target.value })}
                      rows={4}
                      className="w-full h-full px-5 py-3.5 bg-transparent font-sans text-sm text-botanical-text placeholder-botanical-muted focus:outline-none resize-none"
                      id="prod-how"
                      placeholder="Clean and dry the area thoroughly&#10;Apply a small amount evenly&#10;..."
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="input-label">Category</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryOpen(!categoryOpen)}
                  className="input-field flex items-center justify-between capitalize w-full focus:outline-none focus:ring-2 focus:ring-botanical-primary focus:border-botanical-primary bg-white"
                >
                  <span>{form.category}</span>
                  <svg className={`fill-current h-4 w-4 text-botanical-muted transition-transform duration-300 ${categoryOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </button>
                
                {/* Overlay to catch outside clicks */}
                {categoryOpen && (
                  <div className="fixed inset-0 z-40" onClick={() => setCategoryOpen(false)} />
                )}
                
                <div className={`absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-botanical-border rounded-2xl shadow-soft overflow-hidden transition-all duration-300 transform origin-top ${categoryOpen ? 'opacity-100 scale-y-100 py-2' : 'opacity-0 scale-y-0 h-0 border-none'}`}>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setForm({ ...form, category: c }); setCategoryOpen(false); }}
                      className={`w-full text-left px-5 py-2.5 font-sans text-sm capitalize transition-colors ${form.category === c ? 'bg-botanical-primary/10 text-botanical-primary font-medium' : 'text-botanical-text hover:bg-botanical-surface'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Main Photo (Required) ── */}
            <div className="sm:col-span-2">
              <label className="input-label flex items-center gap-1.5">
                <ImagePlus className="w-4 h-4" /> Main Photo <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                {mainPhotoPreview && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-botanical-primary/30 flex-shrink-0">
                    <img src={mainPhotoPreview} alt="Main" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setMainPhoto(null); setMainPhotoPreview(null); }}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  id="prod-main-photo"
                  accept="image/*"
                  onChange={handleMainPhoto}
                  className="w-full text-sm text-botanical-muted file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-botanical-secondary file:text-botanical-text hover:file:bg-botanical-primary hover:file:text-white transition-all cursor-pointer"
                />
              </div>
              {!selectedProduct && (
                <p className="text-xs text-botanical-muted mt-1">This will be the hero image shown on product cards</p>
              )}
            </div>

            {/* ── Additional Photos (Optional, max 5) ── */}
            <div className="sm:col-span-2">
              <label className="input-label flex items-center gap-1.5">
                <ImagePlus className="w-4 h-4" /> Additional Photos <span className="text-botanical-muted text-xs font-normal">(Optional, 1-5 photos)</span>
              </label>
              {additionalPreviews.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                  {additionalPreviews.map((src, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-botanical-border flex-shrink-0">
                      <img src={src} alt={`Additional ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeAdditionalPhoto(idx)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow"
                      >
                        <X className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                type="file"
                id="prod-additional-photos"
                multiple
                accept="image/*"
                onChange={handleAdditionalPhotos}
                className="w-full text-sm text-botanical-muted file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-botanical-secondary file:text-botanical-text hover:file:bg-botanical-primary hover:file:text-white transition-all cursor-pointer"
              />
            </div>

            {/* ── Video (Optional) ── */}
            <div className="sm:col-span-2">
              <label className="input-label flex items-center gap-1.5">
                <Film className="w-4 h-4" /> Product Video <span className="text-botanical-muted text-xs font-normal">(Optional)</span>
              </label>
              {videoPreview && (
                <div className="relative mb-2">
                  <video src={videoPreview} controls className="w-full max-h-40 rounded-xl border border-botanical-border object-contain bg-black" />
                  <button
                    type="button"
                    onClick={() => { setVideoFile(null); setVideoPreview(null); }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              )}
              <input
                type="file"
                id="prod-video"
                accept="video/*"
                onChange={handleVideo}
                className="w-full text-sm text-botanical-muted file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-botanical-secondary file:text-botanical-text hover:file:bg-botanical-primary hover:file:text-white transition-all cursor-pointer"
              />
              <p className="text-xs text-botanical-muted mt-1">MP4, WebM, MOV supported</p>
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

          {/* Upload progress */}
          {uploadProgress && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-botanical-surface rounded-xl">
              <Spinner size="sm" />
              <span className="font-sans text-sm text-botanical-text">{uploadProgress}</span>
            </div>
          )}

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
