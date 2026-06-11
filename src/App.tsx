import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, MessageCircle, Users, Wallet, User, Plus, Send, ArrowLeft, CheckCircle, Upload, MapPin, DollarSign, Image as ImageIcon, X, Calendar, Search, List, LayoutGrid, Coins, ArrowUpRight, ArrowDownLeft, FileText, Shield, Eye, Download, Lock, Mail, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Gig, GigApplication, UserProfile, Seeker } from './types';
import { CreateGigOverlay } from './components/CreateGigOverlay';

type Tab = 'gigs' | 'seekers' | 'apps' | 'messages';
type Overlay = 'wallet' | 'profile' | 'create-gig' | 'create-seeker' | null;

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('gigs');
  const [activeOverlay, setActiveOverlay] = useState<Overlay>(null);
  const [activeApplyGig, setActiveApplyGig] = useState<Gig | null>(null);
  const [activeSeekerProfile, setActiveSeekerProfile] = useState<Seeker | null>(null);
  const [gigsViewMode, setGigsViewMode] = useState<'grid' | 'list'>('grid');
  const [seekersViewMode, setSeekersViewMode] = useState<'grid' | 'list'>('grid');
  const [applications, setApplications] = useState<GigApplication[]>(() => {
    const saved = localStorage.getItem('gp_applications');
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [notifications, setNotifications] = useState<{id: string, text: string, type: 'info' | 'success' | 'message', contactId?: string}[]>([]);
  const [chats, setChats] = useState<any[]>(() => {
    const saved = localStorage.getItem('gp_chats');
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [gigs, setGigs] = useState<Gig[]>(() => {
    const saved = localStorage.getItem('gp_gigs');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'g-sarah-1',
        description: 'Dog Walk required: Needs a friendly pet walker to take care of my active Golden Retriever in Regent’s Park.',
        location: 'Marylebone, London',
        price: 50,
        startDate: 'Immediately',
        images: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=450'],
        ownerId: 'sarah@gigs.com'
      },
      {
        id: 'g-marcus-1',
        description: 'Need urgent fence painting helper and path sweeping today.',
        location: 'Camden Town, London',
        price: 40,
        startDate: 'Today',
        images: ['https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=450'],
        ownerId: 'marcus@gigs.com'
      }
    ];
  });
  const [seekers, setSeekers] = useState<Seeker[]>(() => {
    const saved = localStorage.getItem('gp_seekers');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'sarah@gigs.com',
        fullName: 'Sarah Mitchell',
        experience: '2 years of pet care experience, highly rated dog walker.',
        hasCv: true,
        profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        portfolioImages: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=450'],
        workDescription: 'Dog Walking & Pet Sitting services in South London.',
        availability: 'Immediately'
      },
      {
        id: 'marcus@gigs.com',
        fullName: 'Marcus Vance',
        experience: 'Handyman & general landscape worker with 4+ years of customer service.',
        hasCv: false,
        profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        portfolioImages: [],
        workDescription: 'Lawn mowing, yard cleanup, leaf cleaning services.',
        availability: 'Immediately'
      }
    ];
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: '',
    experience: '',
    profilePic: null,
    hasCv: false,
    cvName: undefined,
    hasIdDoc: false,
    idDocName: undefined,
    isOwner: true
  });
  const [activeChatContactId, setActiveChatContactId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Auth & registration workflow states
  const [currentUser, setCurrentUser] = useState<any>(null); // null if not logged in
  const [authMode, setAuthMode] = useState<'register' | 'login' | 'congratulations'>('register');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authAcceptedTerms, setAuthAcceptedTerms] = useState(false);
  const [authError, setAuthError] = useState('');
  const [verifiedUsers, setVerifiedUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem('gp_verified_users');
    if (saved) return JSON.parse(saved);
    return [
      { email: 'sarah@gigs.com', password: 'password123', name: 'Sarah Mitchell', verified: true },
      { email: 'marcus@gigs.com', password: 'password123', name: 'Marcus Vance', verified: true }
    ];
  });

  const currentUserId = currentUser?.email?.toLowerCase() || 'owner1';

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('gp_verified_users', JSON.stringify(verifiedUsers));
  }, [verifiedUsers]);

  useEffect(() => {
    localStorage.setItem('gp_gigs', JSON.stringify(gigs));
  }, [gigs]);

  useEffect(() => {
    localStorage.setItem('gp_seekers', JSON.stringify(seekers));
  }, [seekers]);

  useEffect(() => {
    localStorage.setItem('gp_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('gp_chats', JSON.stringify(chats));
  }, [chats]);

  const addNotification = (text: string, type: 'info' | 'success' | 'message' = 'info', contactId?: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setNotifications(prev => [...prev, { id, text, type, contactId }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Email and Password are required fields.');
      return;
    }
    
    if (!authEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    
    if (authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }
    
    if (!authAcceptedTerms) {
      setAuthError('You must agree to the Terms and Conditions to register.');
      return;
    }
    
    const existingUser = verifiedUsers.find(u => u.email.toLowerCase() === authEmail.toLowerCase());
    if (existingUser) {
      if (existingUser.password === authPassword) {
        setCurrentUser(existingUser);
        addNotification(`🎉 Verified: Connected as ${existingUser.name}! Enjoy the secure GigPlatform.`, 'success');
        return;
      } else {
        setAuthError('This email is already registered. Incorrect password entered for this existing account.');
        return;
      }
    }
    
    const displayName = authEmail.split('@')[0];
    const newUser = {
      email: authEmail.toLowerCase(),
      password: authPassword,
      name: displayName,
      verified: true
    };
    
    setVerifiedUsers(prev => [...prev, newUser]);
    setAuthMode('congratulations');
    setAuthError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please enter both your email and password.');
      return;
    }
    
    const user = verifiedUsers.find(
      u => u.email.toLowerCase() === authEmail.toLowerCase()
    );
    
    if (!user) {
      setAuthError('No registered account was found with this email. Please register first.');
      return;
    }
    
    if (user.password !== authPassword) {
      setAuthError('Incorrect password entered. Please try again.');
      return;
    }
    
    setCurrentUser(user);
    addNotification(`🎉 Verified: Connected as ${user.name}! Enjoy the secure GigPlatform.`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthEmail('');
    setAuthPassword('');
    setActiveOverlay(null);
    addNotification('🔒 Signed out. Your session has ended securely.', 'info');
  };

  useEffect(() => {
    if (currentUser) {
      const emailId = currentUser.email.toLowerCase();
      
      // Load or initialize wallet balance
      const savedBalance = localStorage.getItem(`gp_wallet_${emailId}`);
      if (savedBalance !== null) {
        setWalletBalance(parseFloat(savedBalance));
      } else {
        setWalletBalance(150); // initial registration/login reward
      }

      // Load or initialize transactions list
      const savedTx = localStorage.getItem(`gp_tx_${emailId}`);
      if (savedTx) {
        setTransactions(JSON.parse(savedTx));
      } else {
        setTransactions([
          {
            id: 't-init',
            title: 'Verification Pre-Credit',
            type: 'credit',
            amount: 150,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
          }
        ]);
      }

      // Load or initialize user profile configuration
      const savedProfile = localStorage.getItem(`gp_profile_${emailId}`);
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      } else {
        // Initial fallback profile
        const displayName = currentUser.name || currentUser.email.split('@')[0];
        const initialProfile: UserProfile = {
          fullName: displayName.charAt(0).toUpperCase() + displayName.slice(1),
          experience: 'High-trust helper verified and fully prepared on the platform.',
          profilePic: currentUser.profilePic || null,
          hasCv: false,
          cvName: undefined,
          hasIdDoc: false,
          idDocName: undefined,
          isOwner: true
        };
        setUserProfile(initialProfile);
      }
    } else {
      setWalletBalance(0);
      setTransactions([]);
      setUserProfile({
        fullName: '',
        experience: '',
        profilePic: null,
        hasCv: false,
        cvName: undefined,
        hasIdDoc: false,
        idDocName: undefined,
        isOwner: true
      });
    }
  }, [currentUser]);

  // Persist wallet balance when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`gp_wallet_${currentUser.email.toLowerCase()}`, walletBalance.toString());
    }
  }, [walletBalance, currentUser]);

  // Persist transactions when they change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`gp_tx_${currentUser.email.toLowerCase()}`, JSON.stringify(transactions));
    }
  }, [transactions, currentUser]);

  // Persist userProfile when we save or alter it
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`gp_profile_${currentUser.email.toLowerCase()}`, JSON.stringify(userProfile));
      
      // Keep user.name in verifiedUsers up to date
      setVerifiedUsers(prev => prev.map(u => u.email.toLowerCase() === currentUser.email.toLowerCase() ? { ...u, name: userProfile.fullName } : u));
      
      // Keep user in seekers list updated or insert them as seeker!
      setSeekers(prev => {
        const emailId = currentUser.email.toLowerCase();
        const existingSeekerIndex = prev.findIndex(s => s.id === emailId);
        const seekerPic = userProfile.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
        const seekerData: Seeker = {
          id: emailId,
          fullName: userProfile.fullName,
          experience: userProfile.experience || 'Professional help provider.',
          hasCv: userProfile.hasCv,
          profilePic: seekerPic,
          portfolioImages: [],
          workDescription: userProfile.experience ? userProfile.experience.slice(0, 80) : 'Available for helping tasks.',
          availability: 'Immediately'
        };
        
        if (existingSeekerIndex > -1) {
          const updated = [...prev];
          updated[existingSeekerIndex] = seekerData;
          return updated;
        } else {
          return [seekerData, ...prev];
        }
      });
    }
  }, [userProfile, currentUser]);

  const handleTopUp = (amount: number) => {
    setWalletBalance(b => b + amount);
    setTransactions(prev => [
      {
        id: 'topup-' + Date.now().toString(),
        title: 'Coins Top-Up',
        type: 'credit',
        amount: amount,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      },
      ...prev
    ]);
  };

  const handleAddGig = (newGig: Gig) => {
    const gigWithOwner = {
      ...newGig,
      ownerId: currentUserId
    };
    setGigs(prev => [gigWithOwner, ...prev]);
    
    // Choose an available seeker to instantly apply
    const availableSeekers = seekers.filter(s => s.id !== currentUserId);
    if (availableSeekers.length > 0) {
      const seeker = availableSeekers[Math.floor(Math.random() * availableSeekers.length)];
      setTimeout(() => {
        const simulatedApp: GigApplication = {
          id: 'sim-' + Date.now().toString(),
          gigId: newGig.id,
          seekerId: seeker.id,
          seekerName: seeker.fullName,
          seekerPic: seeker.profilePic,
          status: 'pending',
          message: `Hello! I would love to assist with "${newGig.description}". I am highly experienced and available to discuss terms immediately.`,
          shareCv: seeker.hasCv,
          shareId: true,
          cvUrl: seeker.hasCv ? `${seeker.fullName.replace(/\s+/g, '_')}_Resume.pdf` : undefined,
          idDocumentUrl: `Verified_ID_${seeker.fullName.replace(/\s+/g, '_')}.pdf`
        };
        setApplications(prev => [...prev, simulatedApp]);
        addNotification(`🎉 New instant application on your gig from ${seeker.fullName}!`, 'success');
      }, 1500);
    }
  };

  const handleApproveApplication = (app: GigApplication) => {
    // 1. Update application status to approved
    setApplications(prev => prev.map(a => a.id === app.id ? {...a, status: 'approved'} : a));

    // Get gig definition
    const gig = gigs.find(g => g.id === app.gigId);
    const gigDescSnippet = gig && gig.description ? (gig.description.length > 30 ? `${gig.description.substring(0, 30)}...` : gig.description) : 'your gig';

    // Get seeker details
    const seeker = seekers.find(s => s.id === app.seekerId);
    const seekerName = seeker?.fullName || app.seekerName || 'Helper';
    const seekerPic = seeker?.profilePic || app.seekerPic || null;
    const seekerRole = seeker?.workDescription || 'Verified Helper';

    // 2. Add or resume chat thread
    setChats(prevChats => {
      const existingIdx = prevChats.findIndex(c => c.id === app.seekerId);
      
      const newSystemMsg = {
        id: 'msg-approve-' + Date.now(),
        sender: 'me',
        text: `🎉 Application Approved! I've approved your application to help with "${gigDescSnippet}". Let's arrange scheduling and execution details here!`,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      };

      if (existingIdx > -1) {
        const updatedChats = [...prevChats];
        updatedChats[existingIdx] = {
          ...updatedChats[existingIdx],
          messages: [...updatedChats[existingIdx].messages, newSystemMsg]
        };
        return updatedChats;
      } else {
        const newChat = {
          id: app.seekerId,
          contactName: seekerName,
          role: seekerRole,
          profilePic: seekerPic,
          messages: [newSystemMsg]
        };
        return [newChat, ...prevChats];
      }
    });

    // 3. Switch tab and select active contact profile chat
    setActiveTab('messages');
    setActiveChatContactId(app.seekerId);
    setActiveOverlay(null);

    addNotification(`💬 Continuing to Chat with ${seekerName}!`, 'success');
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-4 font-sans relative overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-[-30%] left-[-30%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[-30%] w-[80%] h-[80%] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 p-8 flex flex-col">
          {/* Header title */}
          <div className="flex items-center justify-center space-x-2.5 mb-8">
            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
              G
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              GigPlatform
            </span>
          </div>

          <AnimatePresence mode="wait">
            {authMode === 'register' && (
              <motion.form
                key="register"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold tracking-tight text-white">Create Verification Account</h2>
                  <p className="text-xs text-slate-400 mt-1">Register state before viewing or applying for security-marked gigs.</p>
                </div>

                {authError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium flex items-center space-x-2 leading-relaxed">
                    <span>⚠️</span>
                    <span className="flex-1">{authError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="email" 
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="name@gigs.com" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="password" 
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Minimum 6 characters long</p>
                </div>

                <div className="flex items-start space-x-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="terms-checkbox"
                    checked={authAcceptedTerms}
                    onChange={(e) => setAuthAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-opacity-25 mt-0.5 cursor-pointer accent-blue-600"
                  />
                  <label htmlFor="terms-checkbox" className="text-xs text-slate-350 leading-relaxed cursor-pointer select-none">
                    I read, understand and accept the Lucci Platform <span className="text-blue-400 hover:underline">Terms of Service</span> and <span className="text-blue-400 hover:underline">Gig Security Consent agreements</span>.
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-900/20 transition active:scale-[0.98] mt-6 cursor-pointer"
                >
                  Create User Account
                </button>

                <div className="text-center pt-4">
                  <p className="text-xs text-slate-400">
                    Already registered?{' '}
                    <button 
                      type="button" 
                      onClick={() => { setAuthMode('login'); setAuthError(''); }}
                      className="text-blue-400 font-bold hover:underline"
                    >
                      Log In Securely
                    </button>
                  </p>
                </div>
              </motion.form>
            )}

            {authMode === 'congratulations' && (
              <motion.div
                key="congratulations"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center space-y-6"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/5">
                    <CheckCircle size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-emerald-400 tracking-tight">Congratulations! 🎉</h2>
                  <p className="text-xs text-slate-300 mt-2 font-medium">Your user account has been successfully verified.</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-left space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Email Username</span>
                    <span className="text-xs font-mono text-slate-200 font-bold truncate max-w-[180px]">{authEmail}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Verification status</span>
                    <span className="inline-flex items-center text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-sans tracking-wide uppercase">
                      VERIFIED
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Wallet Pre-Credit</span>
                    <span className="text-xs font-bold text-yellow-500">150 Coins Active</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Your credentials have been securely encoded in the security clearance database. You are now prepared to log in.
                </p>

                <button 
                  type="button" 
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-900/20 transition active:scale-[0.98] cursor-pointer"
                >
                  Proceed to Sign In 🔑
                </button>
              </motion.div>
            )}

            {authMode === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold tracking-tight text-white">Sign In</h2>
                  <p className="text-xs text-slate-400 mt-1">Access your high-trust gig verification account credentials.</p>
                </div>

                {authError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium flex items-center space-x-2 leading-relaxed">
                    <span>⚠️</span>
                    <span className="flex-1">{authError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="email" 
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="name@gigs.com" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="password" 
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-900/20 transition active:scale-[0.98] mt-6 cursor-pointer"
                >
                  Sign In Securely
                </button>

                <div className="text-center pt-4">
                  <p className="text-xs text-slate-400">
                    Need a secure, verified account?{' '}
                    <button 
                      type="button" 
                      onClick={() => { setAuthMode('register'); setAuthError(''); }}
                      className="text-blue-400 font-bold hover:underline"
                    >
                      Register Now
                    </button>
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 text-gray-900 font-sans overflow-hidden relative">
      {/* Real-time Toast Notifications */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 space-y-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              onClick={() => {
                if (n.contactId) {
                  setActiveChatContactId(n.contactId);
                  setActiveTab('messages');
                }
              }}
              className={`pointer-events-auto p-4 rounded-2xl shadow-xl flex items-start space-x-3 border cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                n.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-950 shadow-emerald-100/40' 
                  : n.type === 'message'
                  ? 'bg-purple-50 border-purple-100 text-purple-950 shadow-purple-100/40'
                  : 'bg-blue-50 border-blue-100 text-blue-950 shadow-blue-100/40'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                    {n.type === 'message' ? 'New Message' : n.type === 'success' ? 'Reciprocal Application' : 'System Notice'}
                  </p>
                </div>
                <p className="text-xs font-semibold leading-relaxed">{n.text}</p>
                {n.contactId && <span className="text-[10px] font-bold text-purple-600 block mt-1.5 underline">Click to reply instantly</span>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Top Bar with user profile and wallet balance */}
      <header className="flex-shrink-0 bg-white border-b border-gray-150 h-16 flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="bg-gradient-to-tr from-blue-600 to-purple-600 w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
            G
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            GigPlatform
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Wallet Trigger */}
          <button 
            id="topbar-wallet"
            onClick={() => setActiveOverlay('wallet')}
            className={`flex items-center space-x-2 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200/60 px-3.5 py-1.5 rounded-full transition-all duration-200 text-yellow-700 shadow-sm cursor-pointer hover:scale-105 active:scale-95 ${activeOverlay === 'wallet' ? 'ring-2 ring-yellow-400' : ''}`}
          >
            <Coins size={16} className="text-yellow-500" />
            <span className="text-xs font-semibold">{walletBalance} Coins</span>
          </button>
          
          {/* Profile Trigger */}
          <button 
            id="topbar-profile"
            onClick={() => setActiveOverlay('profile')}
            className={`w-9 h-9 rounded-full overflow-hidden bg-gray-100 border-2 transition-all duration-200 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 ${userProfile.profilePic ? 'border-purple-600' : 'border-gray-200'} ${activeOverlay === 'profile' ? 'ring-2 ring-purple-500' : ''}`}
          >
            {userProfile.profilePic ? (
              <img src={userProfile.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-gray-500" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-gray-50 pb-16 sm:pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'gigs' && (
            <div key="gigs">
              <GigsView 
                gigs={gigs} 
                onCreateClick={() => setActiveOverlay('create-gig')} 
                onApplyGig={(gig) => setActiveApplyGig(gig)}
                viewMode={gigsViewMode}
                onViewModeChange={setGigsViewMode}
              />
            </div>
          )}
          {activeTab === 'seekers' && (
            <div key="seekers">
              <SeekersView 
                seekers={seekers} 
                onCreateClick={() => setActiveOverlay('create-seeker')} 
                viewMode={seekersViewMode}
                onViewModeChange={setSeekersViewMode}
                setActiveChatContactId={setActiveChatContactId}
                setActiveTab={setActiveTab}
              />
            </div>
          )}
          {activeTab === 'apps' && (
            <div key="apps">
              <ApplicationsView
                applications={applications.filter(a => gigs.find(g => g.id === a.gigId)?.ownerId === currentUserId)}
                onApprove={handleApproveApplication}
                onReject={(app) => setApplications(prev => prev.map(a => a.id === app.id ? {...a, status: 'rejected'} : a))}
                seekers={seekers}
                userProfile={userProfile}
                onViewSeeker={(seeker) => setActiveSeekerProfile(seeker)}
                currentUserId={currentUserId}
              />
            </div>
          )}
          {activeTab === 'messages' && (
            <div key="messages" className="absolute inset-0 flex flex-col overflow-hidden pb-16 sm:pb-20">
              <ChatView
                chats={chats}
                setChats={setChats}
                activeChatContactId={activeChatContactId}
                setActiveChatContactId={setActiveChatContactId}
              />
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 h-16 sm:h-20 flex justify-around items-center px-2 sm:px-6 z-20 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
        <NavItem
          id="nav-seekers"
          icon={<div className="bg-gradient-to-br from-purple-400 to-purple-600 p-2 rounded-xl shadow-lg border border-white/20"><Users size={20} className="text-white" /></div>}
          label="Seekers"
          isActive={activeTab === 'seekers' && !activeOverlay}
          onClick={() => { setActiveTab('seekers'); setActiveOverlay(null); }}
        />
        <NavItem
          id="nav-gigs"
          icon={<div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-xl shadow-lg border border-white/20"><Briefcase size={20} className="text-white" /></div>}
          label="GIGs"
          isActive={activeTab === 'gigs' && !activeOverlay}
          onClick={() => { setActiveTab('gigs'); setActiveOverlay(null); }}
        />
        <NavItem
          id="nav-apps"
          icon={<div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-xl shadow-lg border border-white/20"><CheckCircle size={20} className="text-white" /></div>}
          label="Apps"
          isActive={activeTab === 'apps' && !activeOverlay}
          onClick={() => { setActiveTab('apps'); setActiveOverlay(null); }}
          count={applications.filter(a => a.status === 'pending' && gigs.find(g => g.id === a.gigId)?.ownerId === currentUserId).length}
        />
        <NavItem
          id="nav-messages"
          icon={<div className="bg-gradient-to-br from-pink-400 to-pink-600 p-2 rounded-xl shadow-lg border border-white/20"><MessageCircle size={20} className="text-white" /></div>}
          label="Messages"
          isActive={activeTab === 'messages' && !activeOverlay}
          onClick={() => { setActiveTab('messages'); setActiveOverlay(null); }}
        />
      </nav>

      {/* Overlays */}
      <AnimatePresence>
        {activeOverlay === 'wallet' && (
          <WalletOverlay 
            key="wallet" 
            onClose={() => setActiveOverlay(null)} 
            balance={walletBalance}
            onTopUp={handleTopUp}
            transactions={transactions}
          />
        )}
        {activeOverlay === 'profile' && (
          <ProfileOverlay 
            key="profile" 
            onClose={() => setActiveOverlay(null)} 
            userProfile={userProfile} 
            setUserProfile={setUserProfile} 
            myApplications={applications.filter(a => gigs.find(g => g.id === a.gigId)?.ownerId === currentUserId)}
            onApproveApplication={handleApproveApplication}
            onRejectApplication={(app) => setApplications(prev => prev.map(a => a.id === app.id ? {...a, status: 'rejected'} : a))}
            onLogout={handleLogout}
          />
        )}
        {activeOverlay === 'create-gig' && (
          <CreateGigOverlay key="create-gig" onClose={() => setActiveOverlay(null)} onAddGig={handleAddGig} />
        )}
        {activeOverlay === 'create-seeker' && (
          <CreateSeekerOverlay key="create-seeker" onClose={() => setActiveOverlay(null)} userProfile={userProfile} onAddSeeker={(seeker) => setSeekers(prev => [seeker, ...prev])} />
        )}
        {activeApplyGig && (
          <div key="apply-gig">
            <ApplyGigOverlay 
              gig={activeApplyGig} 
              userProfile={userProfile}
              onClose={() => setActiveApplyGig(null)} 
              onApply={(gigId, message, shareCv, shareId) => {
                const gig = gigs.find(g => g.id === gigId);
                if (gig && gig.ownerId === currentUserId) return; // Cannot apply to own gig

                const alreadyApplied = applications.some(a => a.gigId === gigId && a.seekerId === currentUserId);
                if (alreadyApplied) {
                  return; // Stop early if already applied
                }
                const newApp: GigApplication = {
                  id: Date.now().toString(),
                  gigId,
                  seekerId: currentUserId,
                  seekerName: userProfile.fullName || 'Anonymous',
                  seekerPic: userProfile.profilePic,
                  status: 'pending',
                  message,
                  shareCv,
                  shareId,
                  cvUrl: shareCv ? userProfile.cvName || 'Resume.pdf' : undefined,
                  idDocumentUrl: shareId ? userProfile.idDocName || 'ID_Passport.pdf' : undefined
                };
                setApplications(prev => [...prev, newApp]);

                // Clear success feedback
                addNotification("⚡ Your application was received immediately by the gig owner!", "success");

                // Seamlessly trigger simulated response message from the owner in 1.5 seconds
                if (gig && gig.ownerId && gig.ownerId !== currentUserId) {
                  const contactId = gig.ownerId;
                  const ownerName = seekers.find(s => s.id === contactId)?.fullName || 'Gig Owner';
                  const ownerRole = seekers.find(s => s.id === contactId)?.workDescription || 'Gig Poster';
                  const ownerPic = seekers.find(s => s.id === contactId)?.profilePic || null;

                  setTimeout(() => {
                    setChats(prevChats => {
                      const existingChatIdx = prevChats.findIndex(c => c.id === contactId);
                      const responseMsg = {
                        id: 'msg-' + Date.now(),
                        sender: 'them',
                        text: `Hi there! I just received your application for "${gig.description}" instantly! Let's chat more about this helper assignment.`,
                        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                      };

                      if (existingChatIdx > -1) {
                        const updated = [...prevChats];
                        updated[existingChatIdx] = {
                          ...updated[existingChatIdx],
                          messages: [...updated[existingChatIdx].messages, responseMsg]
                        };
                        return updated;
                      } else {
                        return [
                          ...prevChats,
                          {
                            id: contactId,
                            contactName: ownerName,
                            role: ownerRole,
                            profilePic: ownerPic,
                            messages: [responseMsg]
                          }
                        ];
                      }
                    });

                    addNotification(`💬 New message from ${ownerName}: "I received your application instantly!..."`, 'message', contactId);
                  }, 1500);
                }
              }}
            />
          </div>
        )}
        {activeSeekerProfile && (
          <div key="seeker-profile">
            <SeekerProfileOverlay 
              seeker={activeSeekerProfile} 
              onClose={() => setActiveSeekerProfile(null)} 
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SeekerProfileOverlay({ seeker, onClose }: { seeker: Seeker, onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: '10%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '10%' }}
      className="absolute inset-0 bg-white z-50 p-6 flex flex-col"
    >
      <div className="flex items-center mb-6">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-500 rounded-full hover:bg-gray-100">
           <X size={24} />
        </button>
        <h2 className="text-xl font-medium ml-2">Seeker Profile</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {seeker.profilePic && (
          <img src={seeker.profilePic} alt={seeker.fullName} className="w-24 h-24 rounded-full mx-auto mb-4" />
        )}
        <h3 className="text-2xl font-bold text-center">{seeker.fullName}</h3>
        <p className="text-center text-gray-600 mb-6">{seeker.workDescription}</p>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900">Experience</h4>
            <p className="text-gray-600">{seeker.experience}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Availability</h4>
            <p className="text-gray-600">{seeker.availability}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Portfolio</h4>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {seeker.portfolioImages.map((img, i) => (
                <img key={i} src={img} alt="Portfolio" className="w-full h-32 object-cover rounded-lg" />
              ))}
            </div>
            {seeker.portfolioImages.length === 0 && <p className="text-gray-500 text-sm">No portfolio images.</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ApplicationsView({ 
  applications, 
  onApprove, 
  onReject, 
  seekers,
  userProfile,
  onViewSeeker,
  currentUserId
}: { 
  applications: GigApplication[], 
  onApprove: (app: GigApplication) => void, 
  onReject: (app: GigApplication) => void,
  seekers: Seeker[],
  userProfile: UserProfile,
  onViewSeeker: (seeker: Seeker) => void,
  currentUserId: string
}) {
  const [selectedApp, setSelectedApp] = useState<GigApplication | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="p-5 h-full flex flex-col relative"
    >
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Gig Applications</h2>
          <p className="text-xs text-gray-500 mt-1">Review applicant profiles, CV papers, and identities.</p>
        </div>
        <div className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
          {applications.length} Received
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-20">
        {applications.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center space-y-2 bg-white rounded-2xl border border-gray-100 p-6">
            <CheckCircle size={32} className="text-gray-300" />
            <p className="text-sm font-semibold text-gray-700">All caught up!</p>
            <p className="text-xs text-gray-400">Applications submitted to your gigs will appear here instantly.</p>
          </div>
        ) : (
          applications.map(app => {
            // Find corresponding seeker or fall back to user profile
            const isUser = app.seekerId === currentUserId;
            const profilePic = isUser ? userProfile.profilePic : (app.seekerPic || seekers.find(s => s.id === app.seekerId)?.profilePic);
            const statusColor = 
              app.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
              app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
              'bg-amber-50 text-amber-700 border-amber-100';

            return (
              <div 
                key={app.id} 
                onClick={() => setSelectedApp(app)}
                className="group p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm flex-shrink-0">
                    {profilePic ? (
                      <img src={profilePic} alt={app.seekerName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold uppercase text-xs">
                        {app.seekerName[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {app.seekerName}
                      </h4>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${statusColor}`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3 pr-2">
                      {app.message}
                    </p>
                    
                    <div className="flex items-center space-x-2.5 pt-2.5 border-t border-gray-50">
                      <div className="flex items-center text-[10px] text-gray-400 font-medium">
                        <FileText size={12} className="mr-1" />
                        {app.shareCv ? <span className="text-emerald-600 font-semibold">CV Shared</span> : <span>CV Locked</span>}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-gray-200" />
                      <div className="flex items-center text-[10px] text-gray-400 font-medium">
                        <Shield size={12} className="mr-1" />
                        {app.shareId ? <span className="text-emerald-600 font-semibold">ID Verified Shared</span> : <span>ID Locked</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Details Slide-Over / Lightbox Layer */}
      <AnimatePresence>
        {selectedApp && (
          <FullApplicationOverlay 
            application={selectedApp} 
            seeker={seekers.find(s => s.id === selectedApp.seekerId) || null}
            userProfile={userProfile}
            onClose={() => setSelectedApp(null)} 
            onApprove={(app) => {
              onApprove(app);
              setSelectedApp(null);
            }} 
            onReject={(app) => {
              onReject(app);
              setSelectedApp(null);
            }} 
            currentUserId={currentUserId}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- Detailed Work Overlay for Applications ---

function FullApplicationOverlay({
  application,
  seeker,
  userProfile,
  onClose,
  onApprove,
  onReject,
  currentUserId
}: {
  application: GigApplication,
  seeker: Seeker | null,
  userProfile: UserProfile,
  onClose: () => void,
  onApprove: (app: GigApplication) => void,
  onReject: (app: GigApplication) => void,
  currentUserId: string
}) {
  const [showCvModal, setShowCvModal] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
  
  const [cvRequested, setCvRequested] = useState(false);
  const [idRequested, setIdRequested] = useState(false);

  const isUser = application.seekerId === currentUserId;
  const profilePic = isUser ? userProfile.profilePic : (seeker?.profilePic || application.seekerPic);
  const experienceText = isUser ? userProfile.experience : (seeker?.experience || 'General worker details.');
  const cvName = isUser ? userProfile.cvName : application.cvUrl;
  const idDocName = isUser ? userProfile.idDocName : application.idDocumentUrl;

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className="absolute inset-0 bg-white z-[100] flex flex-col h-full"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0 bg-white shadow-sm">
        <div className="flex items-center space-x-1">
          <button onClick={onClose} className="p-2 -ml-2 text-gray-500 rounded-full hover:bg-gray-100 transition">
            <ArrowLeft size={22} className="text-gray-700" />
          </button>
          <span className="text-base font-bold text-gray-900 tracking-tight">Full Candidate Application</span>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
          application.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          application.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
          'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {application.status}
        </span>
      </div>

      {/* Scrollable Center View */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-28">
        
        {/* Applicant Profile Head */}
        <div className="flex flex-col items-center justify-center text-center pb-5 border-b border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full overflow-hidden border-2 border-white shadow-md mb-2">
            {profilePic ? (
              <img src={profilePic} alt={application.seekerName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold uppercase text-lg">
                {application.seekerName[0]}
              </div>
            )}
          </div>
          <h3 className="text-base font-bold text-gray-900">{application.seekerName}</h3>
          <p className="text-xs text-gray-500 max-w-sm font-medium mt-0.5">
            {seeker?.workDescription || 'Professional Gig Candidate'}
          </p>
        </div>

        {/* Message Intro Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Introduction Cover Note</h4>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
            <p className="text-sm text-gray-800 leading-relaxed italic">
              "{application.message}"
            </p>
          </div>
        </div>

        {/* Dynamic bio section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Candidate Profile Experience</h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            {experienceText}
          </p>
        </div>

        {/* Secure Trust Documents Display */}
        <div className="space-y-3.5">
          <div className="flex items-center space-x-2">
            <span className="p-0.5 px-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">Secure Trust Documents</span>
            <span className="text-xs text-gray-400">Identity Center</span>
          </div>

          <div className="space-y-3">
            {/* CV Document Rendering */}
            <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="text-indigo-600" size={20} />
                  <div>
                    <h5 className="text-sm font-bold text-gray-900">Applicant CV / Resume</h5>
                    <p className="text-[10px] text-gray-400">Verifying qualifications, past work and training</p>
                  </div>
                </div>
                {application.shareCv ? (
                  <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-1.5 py-0.5 rounded uppercase">
                    Shared
                  </span>
                ) : (
                  <span className="text-[8px] bg-amber-50 text-amber-700 border border-amber-100 font-bold px-1.5 py-0.5 rounded uppercase">
                    Permission Required
                  </span>
                )}
              </div>

              {application.shareCv ? (
                <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="text-xs font-mono font-bold text-gray-700 truncate max-w-[150px]">
                    {cvName || 'Sarah_Mitchell_Resume.pdf'}
                  </span>
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <button 
                      onClick={() => setShowCvModal(true)}
                      className="inline-flex items-center space-x-1 text-[11px] font-bold bg-white text-blue-600 px-3 py-1.5 rounded-lg border border-gray-150 hover:bg-gray-100 transition active:scale-95"
                    >
                      <Eye size={12} />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-amber-900 font-semibold mb-2">The applicant has not shared their CV credentials yet.</p>
                  <button 
                    disabled={cvRequested}
                    onClick={() => {
                      setCvRequested(true);
                      alert(`Access request sent to ${application.seekerName}! You'll be notified as soon as they authorize authorization.`);
                    }}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border shadow-sm transition-all flex items-center space-x-1.5 ${
                      cvRequested 
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                        : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-100/50'
                    }`}
                  >
                    <span>{cvRequested ? '🔓 Requested (Pending)' : '🔒 Request Document Permission'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* ID Document Rendering */}
            <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Shield className="text-indigo-600" size={20} />
                  <div>
                    <h5 className="text-sm font-bold text-gray-900">National ID & Passport Verification</h5>
                    <p className="text-[10px] text-gray-400">Legal verification cert & face-match security check</p>
                  </div>
                </div>
                {application.shareId ? (
                  <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-1.5 py-0.5 rounded uppercase">
                    Verified
                  </span>
                ) : (
                  <span className="text-[8px] bg-amber-50 text-amber-700 border border-amber-100 font-bold px-1.5 py-0.5 rounded uppercase">
                    Permission Required
                  </span>
                )}
              </div>

              {application.shareId ? (
                <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="text-xs font-mono font-bold text-gray-700 truncate max-w-[150px]">
                    {idDocName || 'ID_Certificate_Passed.pdf'}
                  </span>
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <button 
                      onClick={() => setShowIdModal(true)}
                      className="inline-flex items-center space-x-1 text-[11px] font-bold bg-white text-blue-600 px-3 py-1.5 rounded-lg border border-gray-150 hover:bg-gray-100 transition active:scale-95"
                    >
                      <Eye size={12} />
                      <span>Verify ID</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-amber-900 font-semibold mb-2">The applicant restricted their identity verification status.</p>
                  <button 
                    disabled={idRequested}
                    onClick={() => {
                      setIdRequested(true);
                      alert(`ID security check request successfully transmitted to ${application.seekerName}!`);
                    }}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border shadow-sm transition-all flex items-center space-x-1.5 ${
                      idRequested 
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                        : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-100/50'
                    }`}
                  >
                    <span>{idRequested ? '🔓 Requested (Pending)' : '🔒 Request Identity Access'}</span>
                  </button>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>

      {/* Decision Footer Buttons */}
      {application.status === 'pending' && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-20 flex space-x-3">
          <button 
            onClick={() => {
              onReject(application);
            }}
            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 py-3.5 rounded-2xl font-bold transition active:scale-95 text-sm cursor-pointer"
          >
            Reject Canditate
          </button>
          <button 
            onClick={() => {
              onApprove(application);
            }}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition active:scale-95 shadow-md text-sm cursor-pointer"
          >
            Approve & Hire
          </button>
        </div>
      )}

      {/* SIMULATED CV LIGHTBOX VIEW */}
      <AnimatePresence>
        {showCvModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 bg-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-md h-[80vh] flex flex-col overflow-hidden shadow-2xl border border-gray-155"
            >
              {/* Box head */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <FileText className="text-blue-600" size={18} />
                  <span className="text-sm font-bold text-gray-900 truncate max-w-[200px]">CV Preview - {application.seekerName}</span>
                </div>
                <button onClick={() => setShowCvModal(false)} className="bg-gray-100 p-1.5 rounded-full hover:bg-gray-200 transition">
                  <X size={16} />
                </button>
              </div>

              {/* Dynamic Simulated Resume Content */}
              <div className="flex-1 overflow-y-auto p-5 font-sans space-y-5 bg-stone-50/50">
                <div className="text-center pb-4 border-b border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900 uppercase tracking-wide">{application.seekerName}</h4>
                  <p className="text-xs text-blue-600 font-semibold mt-0.5">Verified Gig Helper Profile</p>
                  <p className="text-[10px] text-gray-400 mt-1">Address: Kensington, London, UK | Status: ID Verified Status</p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Professional Statement</h5>
                  <p className="text-xs text-gray-600 leading-normal pl-2 border-l-2 border-blue-500">
                    Highly motivated and extremely detail-oriented freelance gig worker. Focused on providing the absolute best house service assistance, garden care work, pet handling, and physical helper assignments. Fast worker, punctual, and reliable with custom-vouched reference validation status.
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Core Skill Sets</h5>
                  <div className="flex flex-wrap gap-1.5 pl-2">
                    {['Lawn Maintenance', 'Lifting & Moving Assistance', 'Furniture Assembly', 'Pet-sitting & Dog Walking', 'Effective English Communication', 'Reliability Premium Partner'].map((skill, si) => (
                      <span key={si} className="text-[10px] bg-white text-gray-800 border border-gray-200 px-2 py-0.5 rounded-md font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Professional Timeline</h5>
                  <div className="space-y-2.5 pl-2">
                    <div className="relative pl-3 border-l border-gray-250">
                      <div className="absolute -left-[4.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold text-gray-900">Lead Independent Helper Partner</span>
                        <span className="text-[9px] text-gray-400">2023 - Present</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">Assisted various private households and office managers with seasonal mowing, organizing garages, packing debris, and moving premium items securely.</p>
                    </div>

                    <div className="relative pl-3 border-l border-gray-250">
                      <div className="absolute -left-[4.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-400" />
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold text-gray-900">Professional Customer Host</span>
                        <span className="text-[9px] text-gray-400">2021 - 2023</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">Ensured client satisfaction, handled inventory logistics, clean spaces compliance, and team assignments Coordination.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Certified Work Vouching</h5>
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 flex items-start space-x-2 pl-2">
                    <CheckCircle size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-emerald-850 font-bold">Secure Background Cleared & Approved</p>
                      <p className="text-[9px] text-emerald-700/80">Vetted and checked on 2026-06-11 via secure cloud authority audit protocols.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box feet */}
              <div className="p-3 border-t border-gray-100 bg-white flex justify-end">
                <button 
                  onClick={() => alert('Vouched PDF CV successfully downloaded offline!')}
                  className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  <Download size={13} />
                  <span>Download CV</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIMULATED ID VERIFICATION STATUS MODAL */}
      <AnimatePresence>
        {showIdModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 bg-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-zinc-900 text-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-zinc-800"
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <Shield size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Security Checked Identification Card</span>
                </div>
                <button onClick={() => setShowIdModal(false)} className="bg-zinc-800 p-1.5 rounded-full hover:bg-zinc-700 transition text-gray-300">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Official Passport / Smart ID Card Layout */}
                <div className="relative bg-gradient-to-br from-indigo-950 via-zinc-900 to-slate-900 p-5 rounded-2xl border-2 border-indigo-500/20 shadow-lg overflow-hidden">
                  {/* Digital chip graphic and background watermark */}
                  <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-[10px] font-black text-indigo-400 tracking-widest uppercase">Certified Union Smart Identity PASSPORT</h4>
                      <p className="text-[8px] text-zinc-500">Decentralized Trust Authority ID System</p>
                    </div>
                    {/* Chip representation */}
                    <div className="w-7 h-5 bg-amber-400/80 rounded-sm border border-amber-500 flex flex-col justify-between p-0.5">
                      <div className="w-full h-0.5 bg-amber-600/30" />
                      <div className="w-full h-1 bg-amber-600/30" />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    {/* Picture of applicant */}
                    <div className="w-20 h-24 bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 flex-shrink-0 relative">
                      {profilePic ? (
                        <img src={profilePic} alt={application.seekerName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white bg-zinc-700 font-extrabold uppercase">
                          {application.seekerName[0]}
                        </div>
                      )}
                      {/* Secure Overlay Watermark */}
                      <div className="absolute inset-x-0 bottom-0 bg-indigo-600/30 py-0.5 text-center text-[7px] tracking-widest font-black uppercase">
                        VERIFIED
                      </div>
                    </div>

                    {/* Person Metadata */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <div>
                        <span className="block text-[7px] text-zinc-500 uppercase tracking-widest">Full Name</span>
                        <span className="block text-xs font-bold text-zinc-200 truncate">{application.seekerName}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-left">
                        <div>
                          <span className="block text-[7px] text-zinc-500 uppercase tracking-widest">Nationality</span>
                          <span className="block text-[10px] font-bold text-zinc-200">United Kingdom</span>
                        </div>
                        <div>
                          <span className="block text-[7px] text-zinc-500 uppercase tracking-widest">Document No.</span>
                          <span className="block text-[10px] font-bold text-zinc-400 font-mono">UK-61129A8</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-left">
                        <div>
                          <span className="block text-[7px] text-zinc-500 uppercase tracking-widest">Verified At</span>
                          <span className="block text-[9px] font-bold text-emerald-400">2026-06-11</span>
                        </div>
                        <div>
                          <span className="block text-[7px] text-zinc-500 uppercase tracking-widest">Expiry Date</span>
                          <span className="block text-[9px] font-bold text-zinc-300">2036-06-10</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security seal and signature */}
                  <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-[8px] text-emerald-400 font-mono uppercase tracking-wider">
                      <CheckCircle size={10} />
                      <span>Match Score: 99.8% Perfect Match</span>
                    </div>
                    {/* Simulated hand drawn signature */}
                    <span className="text-[11px] font-serif italic text-indigo-400/70 tracking-widest font-thin border-b border-indigo-400/20 pr-4">
                      {application.seekerName.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Identity Verification details */}
                <div className="space-y-3 text-xs text-zinc-400">
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Verification Audit Certificate</span>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 space-y-1.5">
                    <p className="text-[10px] text-zinc-300">
                      This digital identification passport certificate has been encrypted, cryptographically checked, and verified by our third-party secure biometric SDK logic.
                    </p>
                    <div className="flex items-center space-x-1.5 text-xs text-emerald-400 pt-1 font-semibold">
                      <CheckCircle size={12} />
                      <span>Security Standard Compliant</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-zinc-950 border-t border-zinc-850 flex justify-end">
                <button 
                  onClick={() => setShowIdModal(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  Close Certificate Viewer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- Views ---

function ApplyGigOverlay({ 
  gig, 
  userProfile, 
  onClose, 
  onApply 
}: { 
  gig: Gig, 
  userProfile: UserProfile, 
  onClose: () => void, 
  onApply: (gigId: string, message: string, shareCv: boolean, shareId: boolean) => void 
}) {
  const [message, setMessage] = useState('');
  const [shareCv, setShareCv] = useState(userProfile.hasCv);
  const [shareId, setShareId] = useState(userProfile.hasIdDoc);
  
  const [localHasCv, setLocalHasCv] = useState(userProfile.hasCv);
  const [localCvName, setLocalCvName] = useState(userProfile.cvName || 'Lucci_Resume.pdf');
  const [localHasIdDoc, setLocalHasIdDoc] = useState(userProfile.hasIdDoc);
  const [localIdDocName, setLocalIdDocName] = useState(userProfile.idDocName || 'Lucci_ID_Passport.pdf');

  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isUploadingId, setIsUploadingId] = useState(false);

  const simulateUploadCv = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const name = e.target.files[0].name;
      setIsUploadingCv(true);
      setTimeout(() => {
        setLocalCvName(name);
        setLocalHasCv(true);
        setShareCv(true);
        setIsUploadingCv(false);
      }, 1000);
    }
  };

  const simulateUploadId = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const name = e.target.files[0].name;
      setIsUploadingId(true);
      setTimeout(() => {
        setLocalIdDocName(name);
        setLocalHasIdDoc(true);
        setShareId(true);
        setIsUploadingId(false);
      }, 1000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      className="absolute inset-0 bg-white z-50 flex flex-col h-full overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0 bg-white shadow-sm bg-gradient-to-r from-blue-50/5 via-white to-purple-50/5">
        <div className="flex items-center space-x-1">
          <button onClick={onClose} className="p-2 -ml-2 text-gray-500 rounded-full hover:bg-gray-100 transition">
             <X size={22} />
          </button>
          <span className="text-lg font-bold text-gray-900 tracking-tight">Apply to Gig Assignment</span>
        </div>
        <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
          Reward: {gig.price} Coins
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-28">
        {/* Gig Description Summary */}
        <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1.5">Selected Assignment</span>
          <p className="text-gray-800 text-sm leading-relaxed font-semibold">{gig.description}</p>
          <div className="flex items-center text-[11px] text-gray-500 mt-3 space-x-4 border-t border-gray-50 pt-2.5">
            <span className="flex items-center"><MapPin size={13} className="mr-1 text-gray-400" /> {gig.location}</span>
            <span className="flex items-center"><Calendar size={13} className="mr-1 text-gray-400" /> Starts: {gig.startDate}</span>
          </div>
        </div>

        {/* Form Message */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Introduction Message</label>
          <textarea 
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Hi there! Explain why you're a great fit for this assignment, your previous experience, and when you can start."
            className="w-full h-28 p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 resize-none leading-relaxed transition-all shadow-inner"
          />
        </div>

        {/* Secure Document Trust Panel */}
        <div className="space-y-3.5">
          <div className="flex items-center space-x-2">
            <span className="p-1 px-2.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold uppercase tracking-wider">🔒 Security Consent</span>
            <span className="text-xs text-gray-400">Trust Options</span>
          </div>
          <p className="text-xs text-gray-500 leading-normal">
            Employers are 90% more likely to approve apps with verified credentials. Select documents to share alongside your message:
          </p>

          <div className="space-y-3">
            {/* CV Toggle Card */}
            <div className={`p-4 rounded-2xl border transition-all duration-200 ${
              shareCv && localHasCv
                ? 'bg-blue-50/60 border-blue-200 shadow-sm'
                : 'bg-white border-gray-150'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm font-bold text-gray-900">📄 Resume / CV Document</span>
                    {localHasCv && (
                      <span className="inline-flex items-center text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                        Configured
                      </span>
                    )}
                  </div>
                  {localHasCv ? (
                    <div className="mt-2 text-xs text-blue-700 font-mono tracking-tight bg-blue-100/30 px-2 py-1 rounded inline-block">
                      {localCvName}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-500">
                      No CV file was found in your profile.
                      <div className="mt-2 relative inline-block">
                        <button type="button" className="text-[11px] font-bold bg-white text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-all">
                          Upload CV Now
                        </button>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={simulateUploadCv} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>
                  )}
                </div>
                {localHasCv && (
                  <button
                    type="button"
                    onClick={() => setShareCv(!shareCv)}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 cursor-pointer ${
                      shareCv ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                      shareCv ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                )}
              </div>
            </div>

            {/* ID Document Toggle Card */}
            <div className={`p-4 rounded-2xl border transition-all duration-200 ${
              shareId && localHasIdDoc
                ? 'bg-blue-50/60 border-blue-200 shadow-sm'
                : 'bg-white border-gray-150'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm font-bold text-gray-900">🛡️ Verified Identity Document</span>
                    {localHasIdDoc && (
                      <span className="inline-flex items-center text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                        Passport ID
                      </span>
                    )}
                  </div>
                  {localHasIdDoc ? (
                    <div className="mt-2 text-xs text-blue-700 font-mono tracking-tight bg-blue-100/30 px-2 py-1 rounded inline-block">
                      {localIdDocName}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-500">
                      No verification document found on your profile.
                      <div className="mt-2 relative inline-block">
                        <button type="button" className="text-[11px] font-bold bg-white text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-all">
                          Verify Identity Document
                        </button>
                        <input type="file" accept=".pdf,image/*" onChange={simulateUploadId} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>
                  )}
                </div>
                {localHasIdDoc && (
                  <button
                    type="button"
                    onClick={() => setShareId(!shareId)}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 cursor-pointer ${
                      shareId ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                      shareId ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Bottom Submission Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-20">
        <button 
          onClick={() => { 
            onApply(gig.id, message, shareCv && localHasCv, shareId && localHasIdDoc); 
            onClose(); 
          }}
          disabled={!message.trim()}
          className={`w-full text-white py-3.5 rounded-2xl font-bold transition shadow-md flex items-center justify-center space-x-2 ${
            message.trim() 
              ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 cursor-pointer' 
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          <span>Submit Verified Application</span>
        </button>
      </div>
    </motion.div>
  );
}

type GigsViewProps = {
  gigs: Gig[],
  onCreateClick: () => void,
  onApplyGig: (gig: Gig) => void,
  viewMode: 'grid' | 'list',
  onViewModeChange: (mode: 'grid' | 'list') => void
};

function GigsView(props: GigsViewProps) {
  const { gigs, onCreateClick, onApplyGig, viewMode, onViewModeChange } = props;
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGig, setExpandedGig] = useState<Gig | null>(null);

  const filteredGigs = gigs.filter(g => 
    g.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {expandedGig && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col p-4 sm:p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setExpandedGig(null)} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100">
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold">Gig Details</h2>
             <div className="w-10"></div>
          </div>
           {expandedGig.images.length > 0 && (
             <div className="h-64 mb-6 rounded-2xl overflow-hidden shadow-sm">
               <img src={expandedGig.images[0]} alt="Gig" className="w-full h-full object-cover" />
             </div>
           )}
           <h3 className="text-2xl font-bold mb-2">{expandedGig.description}</h3>
            <div className="flex items-center text-gray-500 mb-2">
            <Calendar size={18} className="mr-2 text-gray-400" />
            Starts: <span className="ml-1 text-gray-700 font-medium">{expandedGig.startDate}</span>
          </div>
          <div className="flex items-center text-gray-500 mb-6">
            <MapPin size={18} className="mr-2 text-gray-400" />
            {expandedGig.location}
          </div>
          <div className="flex-1"></div>
          <div className="border-t border-gray-100 pt-6">
             <div className="flex justify-between items-center mb-6">
                <span className="text-lg text-gray-500">Reward</span>
                <span className="text-3xl font-bold text-blue-600">{expandedGig.price} Coins</span>
             </div>
             <button
              onClick={() => { onApplyGig(expandedGig); setExpandedGig(null); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 rounded-2xl transition active:scale-95"
            >
              Apply Now
            </button>
          </div>
        </div>
      )}
    
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="p-6 h-full flex flex-col"
    >
      <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <div className="relative flex-1 mr-3">
            <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search gigs..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-900"
            />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-sm">
            <button 
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {filteredGigs.length === 0 ? (
          <div className={`flex flex-col items-center justify-center text-center ${gigs.length > 0 ? 'mt-10' : 'h-full'}`}>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Briefcase size={32} />
            </div>
            <h2 className="text-2xl font-medium tracking-tight mb-2">
              {gigs.length === 0 ? "Available GIGs" : "No results found"}
            </h2>
            <p className="text-gray-500 max-w-sm mb-6">
              {gigs.length === 0 
                ? "Find available opportunities or post a new gig."
                : "Try adjusting your search terms to find what you're looking for."}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="space-y-6 pb-24">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6">Available GIGs</h2>
            {filteredGigs.map((gig) => (
              <div key={gig.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer" onClick={() => setExpandedGig(gig)}>
                {gig.images.length > 0 && (
                   <div className="h-48 w-full bg-gray-100 flex overflow-x-auto snap-x snap-mandatory">
                     {gig.images.map((img, i) => (
                       <img key={i} src={img} alt="Gig preview" className="h-full w-full object-cover flex-shrink-0 snap-center" />
                     ))}
                   </div>
                )}
                <div className="p-5">
                  <p className="text-gray-900 font-medium text-lg leading-snug mb-3">
                    {gig.description}
                  </p>
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <Calendar size={16} className="mr-1.5 text-gray-400" />
                    Starts: <span className="ml-1 text-gray-700 font-medium">{gig.startDate}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4 border-t border-gray-100 pt-4 pb-2">
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin size={16} className="mr-1.5 text-gray-400" />
                      {gig.location}
                    </div>
                    <div className="font-semibold text-blue-600 text-lg flex items-center">
                      🪙 {gig.price} Coins
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 pb-24">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6">Available GIGs</h2>
            {filteredGigs.map((gig) => (
              <div 
                key={gig.id} 
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 transition group cursor-pointer"
                onClick={() => setExpandedGig(gig)}
              >
                {gig.images.length > 0 ? (
                  <img src={gig.images[0]} alt="Gig" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Briefcase size={20} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 font-semibold text-sm truncate mr-2">{gig.description}</p>
                    <span className="font-bold text-blue-600 text-sm whitespace-nowrap flex items-center">🪙 {gig.price} Coins</span>
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex items-center text-[11px] text-gray-500">
                      <MapPin size={12} className="mr-1 text-gray-400" />
                      <span className="truncate max-w-[100px]">{gig.location.split(',')[0]}</span>
                    </div>
                    <div className="flex items-center text-[11px] text-gray-500">
                      <Calendar size={12} className="mr-1 text-gray-400" />
                      <span>{gig.startDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="fixed bottom-20 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <button 
          onClick={onCreateClick}
          className="bg-blue-600 text-white font-semibold px-4.5 py-2.2 rounded-full flex items-center justify-center space-x-1.5 hover:bg-blue-700 transition shadow-lg pointer-events-auto active:scale-[0.98] text-sm"
        >
          <Plus size={16} />
          <span>Create Gig</span>
        </button>
      </div>
    </motion.div>
    </>
  );
}

// --- Views ---

function ChatView({ 
  chats, 
  setChats, 
  activeChatContactId, 
  setActiveChatContactId 
}: any) {
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const activeChat = chats.find((c: any) => c.id === activeChatContactId);
  
  const filteredChats = chats.filter((c: any) => 
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.role && c.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChatContactId) return;

    const newMessage = {
      id: 'msg-' + Date.now(),
      sender: 'me',
      text: input,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    };

    setChats((prev: any[]) => prev.map(c => {
      if (c.id === activeChatContactId) {
        return {
          ...c,
          messages: [...c.messages, newMessage]
        };
      }
      return c;
    }));

    setInput('');

    // Trigger instant mock response from the other person
    setTimeout(() => {
      const responseMessage = {
        id: 'msg-reply-' + Date.now(),
        sender: 'them',
        text: `Awesome! I received that instantly. Let's arrange details!`,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      };
      setChats((prev: any[]) => prev.map(c => {
        if (c.id === activeChatContactId) {
          return {
            ...c,
            messages: [...c.messages, responseMessage]
          };
        }
        return c;
      }));
    }, 1200);
  };

  if (activeChatContactId && activeChat) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex flex-col h-full bg-white relative z-10"
      >
        {/* Chat top header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0 bg-white">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setActiveChatContactId(null)} 
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition mr-1"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border">
              {activeChat.profilePic ? (
                <img src={activeChat.profilePic} alt={activeChat.contactName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-purple-50">
                  {activeChat.contactName.slice(0, 2)}
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight text-sm">{activeChat.contactName}</p>
              <p className="text-[11px] text-gray-500 font-medium">{activeChat.role || 'Contact'}</p>
            </div>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-50/50 pb-24">
          {activeChat.messages.length === 0 ? (
            <div className="text-center text-gray-400 text-xs py-8">
              No messages yet. Send a message to start!
            </div>
          ) : (
            activeChat.messages.map((m: any) => (
              <div 
                key={m.id} 
                className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  m.sender === 'me' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                }`}>
                  <p className="leading-relaxed">{m.text}</p>
                  <p className={`text-[9px] mt-1 text-right font-medium ${m.sender === 'me' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {m.time}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex items-center space-x-2 bg-white absolute bottom-0 left-0 right-0 z-20 shadow-lg">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message instantly..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full transition shadow-sm active:scale-95"
          >
            <Send size={16} />
          </button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="p-6 h-full flex flex-col max-w-sm mx-auto w-full"
    >
      <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-4 flex-shrink-0">Messages</h2>
      
      {/* Search contacts */}
      <div className="relative mb-4 flex-shrink-0">
        <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search contacts..."
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-900"
        />
      </div>

      {/* Chat item list */}
      <div className="flex-1 overflow-y-auto space-y-2 pb-24">
        {filteredChats.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-8">
            <MessageCircle className="mx-auto text-gray-300 mb-2" size={32} />
            <p className="text-gray-500 text-sm font-medium">No conversation history yet.</p>
            <p className="text-xs text-gray-400 mt-1">Hire a seeker or apply to a gig to start chatting instantly!</p>
          </div>
        ) : (
          filteredChats.map((c: any) => {
            const lastMsg = c.messages[c.messages.length - 1];
            return (
              <div 
                key={c.id} 
                onClick={() => setActiveChatContactId(c.id)}
                className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3.5 cursor-pointer hover:border-blue-200 transition-colors bg-opacity-95 hover:bg-opacity-100"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-50 flex-shrink-0 border relative">
                  {c.profilePic ? (
                    <img src={c.profilePic} alt={c.contactName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-purple-50">
                      {c.contactName.slice(0, 2)}
                    </div>
                  )}
                  {/* Green status online dot */}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-bold text-gray-800 text-sm truncate leading-tight">{c.contactName}</p>
                    {lastMsg && <span className="text-[10px] text-gray-400 font-mono">{lastMsg.time}</span>}
                  </div>
                  {c.role && <p className="text-[10px] text-purple-600 font-semibold mb-1 uppercase tracking-wider">{c.role}</p>}
                  {lastMsg ? (
                    <p className="text-xs text-gray-500 truncate leading-normal">{lastMsg.text}</p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No messages yet</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

function SeekersView({ seekers, onCreateClick, viewMode, onViewModeChange, setActiveChatContactId, setActiveTab }: { seekers: Seeker[], onCreateClick: () => void, viewMode: 'grid' | 'list', onViewModeChange: (mode: 'grid' | 'list') => void, setActiveChatContactId: (id: string) => void, setActiveTab: (tab: Tab) => void, key?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSeeker, setExpandedSeeker] = useState<Seeker | null>(null);
  
  const filteredSeekers = seekers.filter(s => 
    (s.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.workDescription || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.experience || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {expandedSeeker && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col p-4 sm:p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setExpandedSeeker(null)} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100">
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold">Seeker Profile</h2>
             <div className="w-10"></div>
          </div>
           {expandedSeeker.profilePic && (
             <div className="h-64 mb-6 rounded-2xl overflow-hidden shadow-sm">
               <img src={expandedSeeker.profilePic} alt="Profile" className="w-full h-full object-cover" />
             </div>
           )}
           <h3 className="text-2xl font-bold mb-2">{expandedSeeker.fullName}</h3>
           <p className="text-purple-600 font-semibold mb-6">{expandedSeeker.workDescription}</p>
            <div className="flex items-center text-gray-500 mb-2">
            <Calendar size={18} className="mr-2 text-gray-400" />
            Available: <span className="ml-1 text-gray-700 font-medium">{expandedSeeker.availability}</span>
          </div>
          <div className="flex-1"></div>
          <button 
            onClick={() => {
               setActiveChatContactId(expandedSeeker.id);
               setActiveTab('messages');
               setExpandedSeeker(null);
            }}
            className="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl"
          >
            Hire
          </button>
        </div>
      )}

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="p-6 h-full flex flex-col"
    >
      <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <div className="relative flex-1 mr-3">
            <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search seekers..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm text-gray-900"
            />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-sm">
            <button 
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {filteredSeekers.length === 0 ? (
          <div className={`flex flex-col items-center justify-center text-center ${seekers.length > 0 ? 'mt-10' : 'h-full'}`}>
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <Users size={32} />
            </div>
            <h2 className="text-2xl font-medium tracking-tight mb-2">
              {seekers.length === 0 ? "Talent Seekers" : "No results found"}
            </h2>
            <p className="text-gray-500 max-w-sm mb-6">
              {seekers.length === 0 
                ? "Browse profiles of people seeking talent or gig workers."
                : "Try adjusting your search terms to find what you're looking for."}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="space-y-6 pb-24">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6 px-2">Talent Seekers</h2>
            <div className="space-y-4">
              {filteredSeekers.map((seeker) => (
                <div key={seeker.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col p-5 group hover:border-purple-200 transition-colors cursor-pointer" onClick={() => setExpandedSeeker(seeker)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-purple-50 group-hover:border-purple-200 transition-colors">
                        {seeker.profilePic ? (
                          <img src={seeker.profilePic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <User size={28} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">{seeker.fullName || "Anonymous Seeker"}</h3>
                          {seeker.hasCv && (
                             <span className="flex-shrink-0 inline-flex items-center text-[9px] font-black uppercase tracking-tighter text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 ml-2">
                               CV
                             </span>
                          )}
                        </div>
                        <p className="text-sm text-purple-600 font-semibold mt-0.5 leading-tight">
                          {seeker.workDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {seeker.experience || "Available for general tasks and quick assignments."}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar size={14} className="mr-1.5 text-purple-400" />
                      <span>{seeker.availability}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 pb-24">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6 px-2">Talent Seekers</h2>
            {filteredSeekers.map((seeker) => (
              <div 
                key={seeker.id} 
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 transition group cursor-pointer"
                onClick={() => setExpandedSeeker(seeker)}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                  {seeker.profilePic ? (
                    <img src={seeker.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <User size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 font-semibold text-sm truncate mr-2">{seeker.fullName || "Anonymous Seeker"}</p>
                    {seeker.hasCv && (
                       <span className="flex-shrink-0 text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded border border-emerald-100">CV</span>
                    )}
                  </div>
                  <p className="text-xs text-purple-600 font-medium truncate mt-0.5">{seeker.workDescription}</p>
                  <div className="flex items-center text-[10px] text-gray-500 mt-1">
                    <Calendar size={10} className="mr-1 text-gray-400" />
                    <span className="truncate">{seeker.availability}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="fixed bottom-20 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <button 
          onClick={onCreateClick}
          className="bg-purple-600 text-white font-semibold px-4.5 py-2.2 rounded-full flex items-center justify-center space-x-1.5 hover:bg-purple-700 transition shadow-lg pointer-events-auto active:scale-[0.98] text-sm"
        >
          <Plus size={16} />
          <span>Create a Profile</span>
        </button>
      </div>
    </motion.div>
    </>
  );
}

// --- Overlays ---

function WalletOverlay({ onClose, balance, onTopUp, transactions }: { onClose: () => void, balance: number, onTopUp: (amount: number) => void, transactions: any[], key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 bg-white z-50 flex flex-col"
    >
      {/* Top Header */}
      <div className="flex items-center p-4 border-b border-gray-100 flex-shrink-0 bg-white">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-50 transition">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-medium ml-2">My Wallet</h2>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-6">
        
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/15 rounded-full blur-xl"></div>
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-black/10 rounded-full"></div>
          
          <div className="relative flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-xs font-semibold tracking-wider uppercase">Available Coins Balance</p>
                <div className="flex items-baseline mt-2">
                  <Coins size={36} className="text-yellow-101 mr-2 self-center drop-shadow" />
                  <span className="text-5xl font-black tracking-tight">{balance}</span>
                  <span className="text-lg font-bold ml-1 text-yellow-100">Coins</span>
                </div>
              </div>
              <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
                <Wallet size={24} className="text-white" />
              </div>
            </div>
            
            <div className="border-t border-white/20 pt-3 flex justify-between items-center text-xs text-white/90">
              <span>Status: Active Wallet</span>
              <span className="font-semibold px-2 py-0.5 bg-white/25 rounded-full uppercase">Verified</span>
            </div>
          </div>
        </div>

        {/* Top Up Options */}
        <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Quick Coin Top-Up</h3>
          <p className="text-xs text-gray-500">Need more coins to pay helpers or purchase assets? Top up instantly.</p>
          <div className="grid grid-cols-2 gap-3 mt-1.5">
            <button 
              onClick={() => onTopUp(50)}
              className="bg-amber-50 hover:bg-amber-101 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl font-medium transition active:scale-95 text-sm flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Coins size={16} className="text-amber-600" />
              <span>Add 50 Coins</span>
            </button>
            <button 
              onClick={() => onTopUp(100)}
              className="bg-purple-50 hover:bg-purple-101 border border-purple-200 text-purple-800 px-4 py-3 rounded-xl font-medium transition active:scale-95 text-sm flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Coins size={16} className="text-purple-600" />
              <span>Add 100 Coins</span>
            </button>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Transactions History</h3>
            <span className="text-xs text-blue-600 font-medium">{transactions.length} record(s)</span>
          </div>
          
          <div className="space-y-3 pb-8">
            {transactions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-500">
                <Coins className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-sm">No transactions yet.</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3.5 border-0">
                    <div className={`p-2.5 rounded-xl ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {tx.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{tx.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{tx.date}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-black flex items-center ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                    <Coins size={14} className="ml-1 text-amber-500" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}

function ApplicationsOverlay({ onClose, applications, onApprove, onReject }: { onClose: () => void, applications: GigApplication[], onApprove: (app: GigApplication) => void, onReject: (app: GigApplication) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      className="absolute inset-0 bg-white z-50 p-6 flex flex-col pt-16"
    >
      <div className="flex items-center mb-6">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-500 rounded-full hover:bg-gray-100">
           <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-medium ml-2">Job Applications</h2>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4">
        {applications.map(app => (
          <div key={app.id} className="p-4 border rounded-xl space-y-2">
            <p className="font-semibold">{app.seekerName}</p>
            <p className="text-gray-600 text-sm">{app.message}</p>
            <p className="text-xs font-bold uppercase">{app.status}</p>
            {app.status === 'pending' && (
              <div className="flex space-x-2">
                <button onClick={() => onApprove(app)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm">Approve</button>
                <button onClick={() => onReject(app)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ProfileOverlay({ onClose, userProfile, setUserProfile, myApplications, onApproveApplication, onRejectApplication, onLogout }: { onClose: () => void, userProfile: UserProfile, setUserProfile: (p: UserProfile) => void, myApplications: GigApplication[], onApproveApplication: (app: GigApplication) => void, onRejectApplication: (app: GigApplication) => void, onLogout: () => void, key?: string }) {
  const [saved, setSaved] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(userProfile.profilePic);
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [experience, setExperience] = useState(userProfile.experience);
  const [hasCv, setHasCv] = useState(userProfile.hasCv);
  const [cvName, setCvName] = useState(userProfile.cvName || 'Lucci_Resume.pdf');
  const [hasIdDoc, setHasIdDoc] = useState(userProfile.hasIdDoc);
  const [idDocName, setIdDocName] = useState(userProfile.idDocName || 'Lucci_ID_Passport.pdf');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setUserProfile({
      profilePic,
      fullName,
      experience,
      hasCv,
      cvName,
      hasIdDoc,
      idDocName,
      isOwner: userProfile.isOwner
    });
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 2500);
  };
  
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0] as File);
      setProfilePic(url);
    }
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHasCv(true);
      setCvName(e.target.files[0].name);
    }
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHasIdDoc(true);
      setIdDocName(e.target.files[0].name);
    }
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
        <h2 className="text-xl font-medium ml-2">Edit Profile</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {saved ? (
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="h-full flex flex-col items-center justify-center text-center space-y-4"
           >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-gray-900">Congratulations!</h3>
              <p className="text-gray-500 max-w-xs">Your profile information and documents have been saved successfully.</p>
           </motion.div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6 max-w-lg mx-auto pb-8">
            <div className="space-y-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative group mb-3">
                  <div className="w-28 h-28 bg-gray-100 rounded-full overflow-hidden border-4 border-white shadow-md flex items-center justify-center relative">
                    {profilePic ? (
                      <>
                        <img src={profilePic} alt="Profile preview" className="w-full h-full object-cover" />
                        <div className="absolute bottom-1 right-1 bg-black rounded-full p-0.5 border-2 border-white">
                          <CheckCircle size={14} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <User size={48} className="text-gray-300" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-white text-xs font-medium">Upload</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleProfilePicChange} className="absolute inset-0 opacity-0 cursor-pointer" required={!profilePic} />
                  </div>
                </div>
                <div className="text-center bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                  <p className="text-sm font-medium text-blue-900 mb-1">Face Picture Required</p>
                  <p className="text-xs text-blue-700/80 max-w-xs">To build trust and verify identity within our gig community, please use a clear photo of your face.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900" placeholder="Jane Doe" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Experience</label>
                <textarea value={experience} onChange={e => setExperience(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none h-32 resize-none text-gray-900" placeholder="List your professional history and skills..." required></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CV Documents</label>
                <div className={`border-2 border-dashed ${hasCv ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 hover:bg-gray-50'} rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-400 transition cursor-pointer relative group`}>
                  <input type="file" onChange={handleCvChange} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.doc,.docx" />
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform ${hasCv ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-500 group-hover:scale-110'}`}>
                    {hasCv ? <CheckCircle size={24} /> : <Upload size={24} />}
                  </div>
                  <p className="text-sm text-gray-900 font-medium">{hasCv ? `CV Uploaded: ${cvName}` : 'Click to upload documents'}</p>
                  <p className="text-xs text-gray-500 mt-1">PDF or DOCX up to 10MB</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">National ID or Passport (Security Verification)</label>
                <p className="text-xs text-gray-500 mb-2">Upload a secure copy of your ID document to receive instant employer trust marks.</p>
                <div className={`border-2 border-dashed ${hasIdDoc ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 hover:bg-gray-50'} rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-400 transition cursor-pointer relative group`}>
                  <input type="file" onChange={handleIdChange} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,image/*" />
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform ${hasIdDoc ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-500 group-hover:scale-110'}`}>
                    {hasIdDoc ? <CheckCircle size={24} /> : <Shield size={24} />}
                  </div>
                  <p className="text-sm text-gray-900 font-medium">{hasIdDoc ? `ID Verified: ${idDocName}` : 'Click to upload National ID or Passport'}</p>
                  <p className="text-xs text-gray-500 mt-1">Biographic page. SECURED storage and encrypted transmission.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button type="submit" className="w-full bg-blue-600 text-white font-medium py-4 rounded-xl hover:bg-blue-700 transition shadow-md active:scale-[0.98] transform">
                Save Profile
              </button>
              
              <button 
                type="button" 
                onClick={onLogout}
                className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-medium py-4 rounded-xl transition shadow-md active:scale-[0.98] transform flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogOut size={18} />
                <span>Log Out of Account</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}

function CreateSeekerOverlay({ onClose, userProfile, onAddSeeker }: { onClose: () => void, userProfile: UserProfile, onAddSeeker: (seeker: Seeker) => void, key?: string }) {
  const [created, setCreated] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [workDescription, setWorkDescription] = useState('');
  const [isImmediate, setIsImmediate] = useState(true);
  const [customDate, setCustomDate] = useState('');
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file as File));
      setPortfolioImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setPortfolioImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreated(true);
    
    const seeker: Seeker = {
      id: Date.now().toString(),
      profilePic: userProfile.profilePic,
      fullName: userProfile.fullName,
      experience: userProfile.experience,
      hasCv: userProfile.hasCv,
      portfolioImages,
      workDescription,
      availability: isImmediate ? 'Immediately' : customDate
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
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-gray-900">Congratulations!</h3>
              <p className="text-gray-500 max-w-xs">Your seeker profile is now live! Businesses can view your profile and contact you.</p>
           </motion.div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-6 max-w-lg mx-auto pb-8">
            <div className="space-y-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-center bg-purple-50/50 p-4 rounded-xl border border-purple-100 mb-6 relative overflow-hidden">
                 <p className="text-sm text-purple-900 mb-2 font-medium z-10 relative">Your profile info and documents are securely linked.</p>
                 <div className="flex items-center justify-center space-x-3 text-xs font-semibold text-purple-700 z-10 relative">
                   <div className="flex items-center"><CheckCircle size={14} className="mr-1" /> Name</div>
                   <div className="flex items-center"><CheckCircle size={14} className="mr-1" /> Face Photo</div>
                   <div className="flex items-center"><CheckCircle size={14} className="mr-1" /> Resume/CV</div>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">What kind of work can you do?</label>
                <textarea 
                  value={workDescription}
                  onChange={e => setWorkDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none h-24 resize-none text-gray-900 mb-6" 
                  placeholder="Describe your skills and the kind of gig you are looking for..." 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <div className="flex space-x-3 mb-3">
                  <button type="button" onClick={() => setIsImmediate(true)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isImmediate ? 'bg-purple-50 border-purple-600 text-purple-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Immediately</button>
                  <button type="button" onClick={() => setIsImmediate(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${!isImmediate ? 'bg-purple-50 border-purple-600 text-purple-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Set Date</button>
                </div>
                {!isImmediate && (
                  <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} required={!isImmediate} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 mb-6" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Images (Optional)</label>
                <p className="text-xs text-gray-500 mb-3">Upload multiple images of your past work for more exposure.</p>
                <div className="flex space-x-3 overflow-x-auto pb-2">
                   {portfolioImages.map((img, i) => (
                     <div key={i} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200">
                       <img src={img} alt="Portfolio preview" className="w-full h-full object-cover" />
                       <button 
                         type="button" 
                         onClick={() => removeImage(i)}
                         className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                       >
                         <X size={14} />
                       </button>
                     </div>
                   ))}
                   <div className="relative w-24 h-24 flex-shrink-0 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:border-purple-400 transition cursor-pointer">
                     <ImageIcon size={24} className="mb-1" />
                     <span className="text-xs font-medium">Add</span>
                     <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>
                </div>
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

// --- Navigation Components ---

interface NavItemProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}

function NavItem({ id, icon, label, isActive, onClick, count }: NavItemProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 focus:outline-none ${
        isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <div className="relative">
        {icon}
        {count !== undefined && count > 0 && (
            <div className="absolute -top-2 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold z-10">
                {count}
            </div>
        )}
        {isActive && (
          <motion.div
            layoutId="active-indicator"
            className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full -translate-x-1/2"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
      </div>
      <span className="text-[10px] font-medium tracking-wide uppercase">
        {label}
      </span>
    </button>
  );
}
