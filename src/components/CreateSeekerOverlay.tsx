import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, ImageIcon, X, MapPin, User, FileText } from 'lucide-react';
import { Seeker } from '../types';

export function CreateSeekerOverlay({ onClose, onAddSeeker, userProfile }: { onClose: () => void, onAddSeeker: (seeker: Seeker) => void, userProfile: any, key?: string }) {
  const [created, setCreated] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [workDescription, setWorkDescription] = useState('');
  const [experience, setExperience] = useState('');
  const [availability, setAvailability] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreated(true);
    
    const seeker: Seeker = {
      id: Date.now().toString(),
      profilePic,
      fullName: userProfile.fullName || 'New Seeker',
      experience,
      hasCv: userProfile.hasCv,
      portfolioImages: [],
      workDescription,
      availability
    };

    onAddSeeker(seeker);

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
        <h2 className="text-xl font-medium ml-2">Create Seeker Profile</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {created ? (
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="h-full flex flex-col items-center justify-center text-center space-y-4"
           >
              <div className="w-20 h-20 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center mb-2">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-gray-900">Profile Created!</h3>
              <p className="text-gray-500 max-w-xs">Your seeker profile is now visible for gig owners.</p>
           </motion.div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-6 max-w-lg mx-auto pb-8">
            <div className="space-y-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Description</label>
                <input 
                  type="text" 
                  value={workDescription}
                  onChange={e => setWorkDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900" 
                  placeholder="What service do you offer?" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <textarea 
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none h-28 resize-none text-gray-900" 
                  placeholder="Describe your skills and experience." 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <input 
                  type="text" 
                  value={availability}
                  onChange={e => setAvailability(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900" 
                  placeholder="E.g., Weekends, Immediately" 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-purple-600 text-white font-medium py-4 rounded-xl hover:bg-purple-700 transition shadow-md active:scale-[0.98] transform">
              Create Profile
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
