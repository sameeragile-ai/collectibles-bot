import React, { useState } from 'react';
import { ShippingProfile } from '../../types';
import { useDroplineStore } from '../../store/useDroplineStore';
import { CreditCard, MapPin, Check, Plus, User, Phone } from 'lucide-react';

interface ProfileCardProps {
  mode?: 'form' | 'list';
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ mode = 'form' }) => {
  const { profiles, addProfile, setDefaultProfile } = useDroplineStore();

  const [isFormOpen, setIsFormOpen] = useState(mode === 'form');
  const [formData, setFormData] = useState({
    name: 'Office VIP',
    fullName: 'Alex Mercer',
    address: '220 Bay Street, Floor 14',
    city: 'Toronto',
    state: 'ON',
    zip: 'M5J 2W4',
    country: 'Canada',
    phone: '+1 (416) 555-4920',
    maskedCard: 'Visa ending 9940',
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProfile({
      name: formData.name,
      fullName: formData.fullName,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      country: formData.country,
      phone: formData.phone,
      maskedCard: formData.maskedCard,
      isDefault: profiles.length === 0,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsFormOpen(false);
    }, 1200);
  };

  return (
    <div className="w-full max-w-xl bg-white border border-stone-200/90 rounded-2xl p-4.5 shadow-sm space-y-4">
      {/* Existing Profiles View */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-semibold text-stone-900 tracking-tight">
              Shipping & Checkout Profiles
            </h4>
          </div>
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 font-medium transition-colors"
          >
            <Plus className="w-3 h-3 text-rose-500" />
            {isFormOpen ? 'View Profiles' : 'New Profile'}
          </button>
        </div>

        {!isFormOpen && (
          <div className="mt-3 space-y-2">
            {profiles.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-stone-50/80 border border-stone-200/60 flex items-start justify-between text-xs hover:border-stone-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900">{p.name}</span>
                    {p.isDefault && (
                      <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200/60 font-medium px-2 py-0.2 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-stone-500 text-[11px]">
                    {p.fullName} · {p.address}, {p.city} {p.zip}
                  </p>
                  <div className="flex items-center gap-1.5 text-stone-600 font-mono text-[11px]">
                    <CreditCard className="w-3 h-3 text-stone-400" />
                    <span>{p.maskedCard}</span>
                  </div>
                </div>

                {!p.isDefault && (
                  <button
                    onClick={() => setDefaultProfile(p.id)}
                    className="text-[11px] text-stone-500 hover:text-stone-900 font-medium hover:underline"
                  >
                    Set Default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mini Inline Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-stone-500 text-[11px] mb-1">Profile Label</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-900 text-xs focus:bg-white focus:outline-none focus:border-rose-400"
              />
            </div>
            <div>
              <label className="block text-stone-500 text-[11px] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-900 text-xs focus:bg-white focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-stone-500 text-[11px] mb-1">Street Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-900 text-xs focus:bg-white focus:outline-none focus:border-rose-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <label className="block text-stone-500 text-[11px] mb-1">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-stone-900 text-xs focus:bg-white focus:outline-none focus:border-rose-400"
              />
            </div>
            <div>
              <label className="block text-stone-500 text-[11px] mb-1">State / Prov</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-stone-900 text-xs focus:bg-white focus:outline-none focus:border-rose-400"
              />
            </div>
            <div>
              <label className="block text-stone-500 text-[11px] mb-1">Postal / Zip</label>
              <input
                type="text"
                required
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-stone-900 text-xs focus:bg-white focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-stone-500 text-[11px] mb-1">Payment Method</label>
              <select
                value={formData.maskedCard}
                onChange={(e) => setFormData({ ...formData, maskedCard: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-stone-900 text-xs focus:bg-white focus:outline-none focus:border-rose-400"
              >
                <option value="Visa ending 4242">Visa ending 4242</option>
                <option value="Amex ending 8192">Amex ending 8192</option>
                <option value="Mastercard ending 5510">Mastercard ending 5510</option>
                <option value="Apple Pay Vault">Apple Pay Vault</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-500 text-[11px] mb-1">Mobile Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-900 text-xs focus:bg-white focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savedSuccess}
              className="px-4 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-all shadow-xs flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Saved!
                </>
              ) : (
                'Save Profile'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
