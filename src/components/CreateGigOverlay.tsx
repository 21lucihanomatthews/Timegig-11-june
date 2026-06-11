import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle, ImageIcon, X, MapPin, Coins } from 'lucide-react';
import { Gig } from '../types';

export function CreateGigOverlay({ onClose, onAddGig }: { onClose: () => void, onAddGig: (gig: Gig) => void, key?: string }) {
  const [created, setCreated] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [isImmediate, setIsImmediate] = useState(true);
  const [customDate, setCustomDate] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file as File));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreated(true);
    
    const gig: Gig = {
      id: Date.now().toString(),
      images,
      description,
      location,
      price: parseFloat(price) || 0,
      startDate: isImmediate ? 'Immediately' : customDate,
      ownerId: 'owner1'
    };

    onAddGig(gig);

    setTimeout(() => {
      setCreated(false);
      onClose();
    }, 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 bg-white z-50 flex flex-col"
    >
      <div className="flex items-center p-4 border-b border-gray-100 bg-white z-10">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-50 transition">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-medium ml-2">Create Casual Gig</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {created ? (
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="h-full flex flex-col items-center justify-center text-center space-y-4"
           >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-gray-900">Congratulations!</h3>
              <p className="text-gray-500 max-w-xs">Your casual gig is now live and visible to seekers.</p>
           </motion.div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-6 max-w-lg mx-auto pb-8">
            <div className="space-y-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
                <div className="flex space-x-3 overflow-x-auto pb-2">
                   {images.map((img, i) => (
                     <div key={i} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200">
                       <img src={img} alt="Gig preview" className="w-full h-full object-cover" />
                       <button 
                         type="button" 
                         onClick={() => removeImage(i)}
                         className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                       >
                         <X size={14} />
                       </button>
                     </div>
                   ))}
                   <div className="relative w-24 h-24 flex-shrink-0 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:border-blue-400 transition cursor-pointer">
                     <ImageIcon size={24} className="mb-1" />
                     <span className="text-xs font-medium">Add</span>
                     <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none h-28 resize-none text-gray-900" 
                  placeholder="What needs to be done?" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <MapPin size={20} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input 
                    type="text" 
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900" 
                    placeholder="E.g., Downtown Park, Remote" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (Coins)</label>
                <div className="relative">
                  <Coins size={20} className="absolute left-3.5 top-3.5 text-yellow-500" />
                  <input 
                    type="number" 
                    min="1"
                    step="1"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900" 
                    placeholder="10" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">When do you need this done?</label>
                <div className="flex space-x-3 mb-3">
                  <button type="button" onClick={() => setIsImmediate(true)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isImmediate ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Immediately</button>
                  <button type="button" onClick={() => setIsImmediate(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${!isImmediate ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Set Date</button>
                </div>
                {!isImmediate && (
                  <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} required={!isImmediate} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900" />
                )}
              </div>
              
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white font-medium py-4 rounded-xl hover:bg-blue-700 transition shadow-md active:scale-[0.98] transform">
              Create Gig
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
