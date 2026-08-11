import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchProducts, updateProduct } from '../../redux/slices/productSlice';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { Tag, Sparkles, X, Search, Filter } from 'lucide-react';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const AdminOffersPage = () => {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((s) => s.products);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({ discountPercentage: 0, offerStartsAt: '', offerExpiresAt: '' });
  const [saving, setSaving] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, active, none

  useEffect(() => {
    dispatch(fetchProducts({ limit: 500 })); // Fetch enough products to manage offers locally
  }, [dispatch]);

  const now = new Date();

  // Helper to determine if product has an active/upcoming offer
  const hasOffer = (product) => product.offer && product.offer.discountPercentage > 0;
  const isActive = (product) => 
    hasOffer(product) && 
    new Date(product.offer.expiresAt) > now && 
    (!product.offer.startsAt || new Date(product.offer.startsAt) <= now);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      // Filter
      if (filterType === 'active') return isActive(p);
      if (filterType === 'none') return !hasOffer(p);
      return true;
    });
  }, [products, searchQuery, filterType]);

  const openOfferModal = (product) => {
    setSelectedProduct(product);
    setForm({
      discountPercentage: product.offer?.discountPercentage || 0,
      offerStartsAt: product.offer?.startsAt ? new Date(product.offer.startsAt).toISOString().slice(0, 16) : '',
      offerExpiresAt: product.offer?.expiresAt ? new Date(product.offer.expiresAt).toISOString().slice(0, 16) : ''
    });
    setModalOpen(true);
  };

  const handleSaveOffer = async () => {
    if (form.discountPercentage < 0 || form.discountPercentage > 100) {
      return toast.error('Discount must be between 0 and 100');
    }
    if (form.discountPercentage > 0 && !form.offerExpiresAt) {
      return toast.error('Expiry date is required for an active offer');
    }

    setSaving(true);
    try {
      const offerData = form.discountPercentage > 0 ? {
        discountPercentage: Number(form.discountPercentage),
        startsAt: form.offerStartsAt ? new Date(form.offerStartsAt).toISOString() : null,
        expiresAt: new Date(form.offerExpiresAt).toISOString()
      } : {
        discountPercentage: 0,
        startsAt: null,
        expiresAt: null
      }; // Clear offer if discount is 0

      // Only updating the offer field of the product
      await dispatch(updateProduct({ id: selectedProduct._id, data: { offer: offerData } })).unwrap();
      toast.success('Offer updated successfully');
      setModalOpen(false);
    } catch (err) {
      toast.error(err?.message || err || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveOffer = async () => {
    setSaving(true);
    try {
      await dispatch(updateProduct({ 
        id: selectedProduct._id, 
        data: { offer: { discountPercentage: 0, startsAt: null, expiresAt: null } } 
      })).unwrap();
      toast.success('Offer removed successfully');
      setModalOpen(false);
    } catch (err) {
      toast.error(err?.message || err || 'Removal failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-24">
      <div className="section-container !py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="section-heading mb-1">
              Manage <em className="italic text-botanical-primary">Offers</em>
            </h1>
            <p className="font-sans text-botanical-muted text-sm">Create and manage discounts for your products</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-botanical-muted" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-botanical-border rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-botanical-primary"
            />
          </div>
          <div className="flex bg-white border border-botanical-border rounded-xl p-1">
            {['all', 'active', 'none'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-6 py-2 rounded-lg font-sans text-sm font-medium capitalize transition-colors ${
                  filterType === type ? 'bg-botanical-primary text-white shadow-sm' : 'text-botanical-muted hover:text-botanical-text'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <Spinner size="lg" className="mt-20" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
              const active = isActive(product);
              const discountedPrice = hasOffer(product)
                ? product.price - (product.price * product.offer.discountPercentage / 100)
                : product.price;

              return (
                <div key={product._id} className="bg-white rounded-3xl p-5 shadow-soft flex gap-5 border border-transparent hover:border-botanical-border transition-colors">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-botanical-surface flex-shrink-0 relative">
                    <img src={product.images?.[0] || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover" />
                    {active && (
                      <div className="absolute inset-x-0 bottom-0 bg-red-500/90 text-white text-[10px] font-bold uppercase tracking-widest text-center py-1">
                        {product.offer.discountPercentage}% OFF
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <p className="font-serif font-semibold text-botanical-text truncate mb-1">{product.name}</p>
                    <p className="font-sans text-xs text-botanical-muted uppercase tracking-wider mb-3">{product.category}</p>
                    <div className="flex items-end justify-between mt-auto">
                      <div>
                        {active ? (
                          <>
                            <p className="font-sans text-[10px] text-botanical-muted line-through">{formatPrice(product.price)}</p>
                            <p className="font-sans font-semibold text-botanical-accent">{formatPrice(discountedPrice)}</p>
                          </>
                        ) : (
                          <p className="font-sans font-medium text-botanical-text">{formatPrice(product.price)}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => openOfferModal(product)}
                        className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-colors ${
                          hasOffer(product) 
                            ? 'bg-botanical-surface text-botanical-primary hover:bg-botanical-primary hover:text-white'
                            : 'border border-botanical-border text-botanical-muted hover:bg-botanical-surface hover:text-botanical-text'
                        }`}
                      >
                        {hasOffer(product) ? 'Edit Offer' : 'Add Offer'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-botanical-muted font-sans">
                No products found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Offer Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Manage Offer"
        maxWidth="max-w-md"
      >
        {selectedProduct && (
          <div className="space-y-6 pt-2">
            
            {/* Product Summary Mini */}
            <div className="flex items-center gap-4 bg-botanical-surface p-4 rounded-2xl">
              <img src={selectedProduct.images?.[0] || 'https://via.placeholder.com/150'} alt={selectedProduct.name} className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <p className="font-serif font-semibold text-botanical-text text-sm">{selectedProduct.name}</p>
                <p className="font-sans text-xs text-botanical-muted">Original Price: {formatPrice(selectedProduct.price)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="input-label">Discount Percentage (%)</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-botanical-primary" />
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={form.discountPercentage}
                    onChange={e => setForm({ ...form, discountPercentage: e.target.value })}
                    className="pl-11"
                    placeholder="e.g. 20"
                  />
                </div>
              </div>

              {Number(form.discountPercentage) > 0 && (
                <>
                  <div>
                    <label className="input-label">Start Date (Optional)</label>
                    <Input
                      type="datetime-local"
                      value={form.offerStartsAt}
                      onChange={e => setForm({ ...form, offerStartsAt: e.target.value })}
                    />
                    <p className="text-[10px] text-botanical-muted mt-1">Leave empty to start immediately</p>
                  </div>

                  <div>
                    <label className="input-label">End Date <span className="text-red-500">*</span></label>
                    <Input
                      type="datetime-local"
                      value={form.offerExpiresAt}
                      onChange={e => setForm({ ...form, offerExpiresAt: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-botanical-border">
              <Button onClick={handleSaveOffer} loading={saving} variant="primary" className="flex-1 py-3 bg-botanical-accent hover:bg-[#a56651]">
                Save Offer
              </Button>
              {hasOffer(selectedProduct) && (
                <Button onClick={handleRemoveOffer} loading={saving} variant="secondary" className="px-6 py-3 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300">
                  Remove
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default AdminOffersPage;
