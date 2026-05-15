import React, { useState } from 'react';
import {
  Home,
  Utensils,
  MapPin,
  Plus,
  Save,
  Image as ImageIcon,
  ChevronRight,
  Star,
  Settings,
  LogOut,
  Sparkles,
  Loader2,
  X,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
interface MenuItem {
  id: string;
  name: string;
  price: string;
  description: string;
}

interface Spot {
  id: string;
  name: string;
  category: string;
  distance: string;
  image: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'homestay' | 'menu' | 'spots'>('homestay');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [isSpotModalOpen, setIsSpotModalOpen] = useState(false);

  // New Item State
  const [newDish, setNewDish] = useState({ name: '', price: '', description: '' });
  const [newSpot, setNewSpot] = useState({ name: '', category: '', distance: '', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=80' });

  // Mock State
  const [homestayName, setHomestayName] = useState('Malnad Green Stay');
  const [description, setDescription] = useState('A cozy traditional home nestled in the heart of coffee plantations.');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: '1', name: 'Akki Kadubu', price: '₹120', description: 'Steamed rice dumplings with coconut chutney' },
    { id: '2', name: 'Pandi Curry', price: '₹250', description: 'Traditional spicy pork curry (local specialty)' }
  ]);
  const [spots, setSpots] = useState<Spot[]>([
    { id: '1', name: 'Hidden Waterfall', category: 'Nature', distance: '2km', image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=500&q=80' },
    { id: '2', name: 'Ancient Banyan Tree', category: 'Landmark', distance: '500m', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=500&q=80' }
  ]);

  const tabs = [
    { id: 'homestay', label: 'My HomeStay', icon: Home },
    { id: 'menu', label: 'Food Menu', icon: Utensils },
    { id: 'spots', label: 'Local Guide', icon: MapPin },
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const generateAIDescription = async () => {
    // Trim to remove hidden \r from CRLF line endings in .env.local
    const apiKey = ((process.env.GEMINI_API_KEY as string) || "").trim();
    if (!apiKey || apiKey.includes("YOUR_GEMINI_API_KEY")) {
      alert("Please set your Gemini API key in .env.local first!");
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are a helpful assistant for a rural homestay host in India.
      Create a warm, inviting, and short (max 3 sentences) description for a homestay named "${homestayName}".
      Focus on local hospitality and nature.`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });

      if (result.text) {
        setDescription(result.text);
        showToast("Description generated successfully!");
      }
    } catch (error: any) {
      console.error("AI Generation failed:", error);
      alert(`Failed to generate description: ${error?.message || error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddDish = () => {
    if (newDish.name && newDish.price) {
      setMenuItems([...menuItems, { id: Date.now().toString(), ...newDish }]);
      setNewDish({ name: '', price: '', description: '' });
      setIsDishModalOpen(false);
      showToast("Dish added successfully!");
    }
  };

  const handleDeleteDish = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
    showToast("Dish removed!");
  };

  const handleAddSpot = () => {
    if (newSpot.name && newSpot.category) {
      setSpots([...spots, { id: Date.now().toString(), ...newSpot }]);
      setNewSpot({ name: '', category: '', distance: '', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=80' });
      setIsSpotModalOpen(false);
      showToast("Spot added successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 md:bottom-10 right-10 bg-emerald-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"
          >
            <Sparkles size={18} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar / Nav */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-stone-200 px-6 py-3 flex justify-between items-center md:top-0 md:bottom-auto md:flex-col md:w-64 md:h-full md:border-r md:border-t-0 md:py-8 z-40">
        <div className="hidden md:block mb-12">
          <h1 className="text-2xl font-bold text-emerald-800">Namma</h1>
          <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold">HomeStay Portal</p>
        </div>

        <div className="flex md:flex-col gap-1 w-full justify-around md:justify-start">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col md:flex-row items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-100 text-emerald-800 md:w-full'
                  : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className="text-[10px] md:text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="hidden md:flex flex-col gap-4 w-full mt-auto pt-8 border-t border-stone-100">
          <button className="flex items-center gap-3 px-4 py-2 text-stone-500 hover:text-stone-800 transition-colors">
            <Settings size={20} />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-2 text-rose-600 hover:text-rose-700 transition-colors">
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-24 pt-8 px-6 md:pl-72 md:pr-12 md:pt-12 max-w-6xl mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <p className="text-emerald-600 font-semibold text-sm mb-1 uppercase tracking-wider">Welcome Back, Host</p>
            <h2 className="text-3xl font-bold text-stone-800">
              {activeTab === 'homestay' && "Manage Your Home"}
              {activeTab === 'menu' && "Traditional Flavors"}
              {activeTab === 'spots' && "Guide Your Guests"}
            </h2>
          </div>
          <button 
            onClick={() => setActiveTab('menu')}
            className="hidden md:flex items-center gap-2 bg-emerald-700 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-emerald-800 transition-shadow shadow-lg shadow-emerald-900/10"
          >
            <Utensils size={18} />
            <span>Manage Menu</span>
          </button>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'homestay' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        General Information
                      </h3>
                      <button
                        onClick={generateAIDescription}
                        disabled={isGenerating}
                        className="flex items-center gap-2 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1.5 rounded-full hover:shadow-md transition-all disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        {isGenerating ? 'Magic working...' : 'AI Generate'}
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Property Name</label>
                        <input
                          type="text"
                          value={homestayName}
                          onChange={(e) => setHomestayName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-1.5">Description</label>
                        <textarea
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold">Gallery</h3>
                      <button 
                        onClick={() => showToast("Gallery upload coming soon!")}
                        className="text-emerald-700 text-sm font-bold flex items-center gap-1 hover:underline"
                      >
                        <Plus size={16} /> Add Photo
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div 
                        onClick={() => showToast("Gallery upload coming soon!")}
                        className="aspect-square bg-stone-100 rounded-xl flex items-center justify-center border-2 border-dashed border-stone-200 group cursor-pointer hover:bg-stone-50 transition-colors"
                      >
                        <ImageIcon className="text-stone-300 group-hover:text-stone-400 transition-colors" size={32} />
                      </div>
                      <div className="aspect-square bg-emerald-900/5 rounded-xl border border-stone-100 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=500&q=80" alt="Homestay" className="w-full h-full object-cover" />
                      </div>
                      <div className="aspect-square bg-emerald-900/5 rounded-xl border border-stone-100 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?w=500&q=80" alt="Homestay interior" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-xl shadow-emerald-900/20">
                    <h3 className="text-lg font-bold mb-2">Host Dashboard</h3>
                    <div className="space-y-4 mt-6">
                      <div className="flex justify-between items-center border-b border-emerald-800 pb-3">
                        <span className="text-emerald-200 text-sm font-medium">Rating</span>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">4.9</span>
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-b border-emerald-800 pb-3">
                        <span className="text-emerald-200 text-sm font-medium">Pending Bookings</span>
                        <span className="font-bold">3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-200 text-sm font-medium">Monthly Earnings</span>
                        <span className="font-bold">₹12,400</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => showToast("Changes saved successfully!")}
                      className="w-full mt-8 bg-white text-emerald-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors"
                    >
                      <Save size={18} />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'menu' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-stone-700">Today's Specialties</h3>
                  <button 
                    onClick={() => setIsDishModalOpen(true)}
                    className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-stone-700 transition-colors"
                  >
                    <Plus size={16} /> Add Dish
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-2xl border border-stone-200 flex justify-between items-start group hover:border-emerald-200 hover:shadow-md transition-all">
                      <div>
                        <h4 className="font-bold text-stone-800 text-lg">{item.name}</h4>
                        <p className="text-stone-500 text-sm mt-1">{item.description}</p>
                        <p className="text-emerald-700 font-bold mt-3">{item.price}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteDish(item.id)}
                        className="text-stone-300 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-rose-50"
                        title="Delete Dish"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                  {menuItems.length === 0 && (
                     <div className="col-span-full py-10 text-center text-stone-500 bg-white rounded-2xl border border-stone-200 border-dashed">
                       No dishes added yet. Click "Add Dish" to get started!
                     </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'spots' && (
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-stone-700">Hidden Local Gems</h3>
                  <button 
                    onClick={() => setIsSpotModalOpen(true)}
                    className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-stone-700 transition-colors"
                  >
                    <Plus size={16} /> New Spot
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {spots.map((spot) => (
                    <div key={spot.id} className="bg-white overflow-hidden rounded-2xl border border-stone-200 shadow-sm group">
                      <div className="h-40 bg-stone-100 overflow-hidden relative">
                        <img src={spot.image} alt={spot.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <button 
                          onClick={() => {
                            setSpots(spots.filter(s => s.id !== spot.id));
                            showToast("Spot removed!");
                          }}
                          className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-rose-600 hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{spot.category}</span>
                          <span className="text-stone-400 text-xs flex items-center gap-1">
                            <MapPin size={10} /> {spot.distance}
                          </span>
                        </div>
                        <h4 className="font-bold text-stone-800">{spot.name}</h4>
                      </div>
                    </div>
                  ))}
                  {spots.length === 0 && (
                     <div className="col-span-full py-10 text-center text-stone-500 bg-white rounded-2xl border border-stone-200 border-dashed">
                       No spots added yet. Click "New Spot" to add one!
                     </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Add Dish Modal */}
        {isDishModalOpen && (
          <div className="fixed inset-0 bg-stone-900/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-stone-800">Add New Dish</h3>
                <button onClick={() => setIsDishModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Dish Name</label>
                  <input type="text" value={newDish.name} onChange={e => setNewDish({...newDish, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Neer Dosa" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Price</label>
                  <input type="text" value={newDish.price} onChange={e => setNewDish({...newDish, price: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. ₹150" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Description</label>
                  <textarea value={newDish.description} onChange={e => setNewDish({...newDish, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" rows={3} placeholder="Brief description..." />
                </div>
                <button onClick={handleAddDish} className="w-full bg-emerald-700 text-white py-3 rounded-xl font-bold hover:bg-emerald-800 transition-colors mt-2">
                  Save Dish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Spot Modal */}
        {isSpotModalOpen && (
          <div className="fixed inset-0 bg-stone-900/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-stone-800">Add New Local Spot</h3>
                <button onClick={() => setIsSpotModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Spot Name</label>
                  <input type="text" value={newSpot.name} onChange={e => setNewSpot({...newSpot, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Sunset Point" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1">Category</label>
                    <input type="text" value={newSpot.category} onChange={e => setNewSpot({...newSpot, category: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Viewpoint" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1">Distance</label>
                    <input type="text" value={newSpot.distance} onChange={e => setNewSpot({...newSpot, distance: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. 1.5km" />
                  </div>
                </div>
                <button onClick={handleAddSpot} className="w-full bg-emerald-700 text-white py-3 rounded-xl font-bold hover:bg-emerald-800 transition-colors mt-2">
                  Save Spot
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
