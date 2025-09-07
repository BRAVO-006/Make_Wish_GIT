import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Plus, Trash2, Copy, ArrowLeft, ExternalLink, Image as ImageIcon, AlertTriangle, Lock, XCircle, PartyPopper } from 'lucide-react';

// ... (Helper functions and Delete Modal remain the same)

export function WishlistPage() {
    // ... (State and fetch logic remain the same)
    const [items, setItems] = useState([]);
    const navigate = useNavigate();

    const handleMarkFulfilled = async (itemToFulfill) => {
        // Step 1: Update the item in the database
        const { data, error } = await supabase.from('items')
            .update({ is_fulfilled: true })
            .eq('id', itemToFulfill.id)
            .select()
            .single();

        if (error) {
            console.error('Error marking as fulfilled:', error);
            alert("Could not mark the item as fulfilled.");
            return;
        }
        
        // Update UI immediately
        setItems(items.map(item => item.id === itemToFulfill.id ? data : item));

        // Step 2: Trigger the thank you email Edge Function
        if (itemToFulfill.held_by_email) {
            try {
                const { error: invokeError } = await supabase.functions.invoke('send-thank-you-email', {
                    body: {
                        recipientEmail: itemToFulfill.held_by_email,
                        recipientName: itemToFulfill.held_by,
                        itemName: itemToFulfill.product_name,
                        wishlistTitle: wishlist.title,
                    },
                });
                if (invokeError) throw invokeError;
            } catch (e) {
                console.error("Error invoking email function:", e);
                // This is a background task, so we don't need to show a UI error
            }
        }
    };
    
    // ... (Rest of the component logic)

    return (
        <div>
            {/* ... (Modals, header, and add item form) ... */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => {
                    const isHeld = isHoldActive(item.held_until);
                    const isFulfilled = item.is_fulfilled;

                    return (
                        <div key={item.id} className={`bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg flex flex-col border border-white/20 ${isFulfilled ? 'border-green-400' : ''}`}>
                            <div className="w-full h-48 bg-black/20 flex items-center justify-center relative">
                                {/* ... Item Image ... */}
                                {isFulfilled && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <div className="text-center text-white">
                                            <PartyPopper size={48} className="text-green-400 mx-auto" />
                                            <p className="font-bold mt-2">Fulfilled!</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="font-semibold text-lg text-white flex-grow">{item.product_name}</h3>
                                <p className="text-blue-400 font-bold text-xl my-2">{item.price}</p>
                                
                                <div className="mt-auto pt-4 border-t border-white/10 text-center">
                                    {isFulfilled ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-sm text-gray-300">Gifted by: <span className="font-semibold text-white">{item.held_by}</span></p>
                                            <button onClick={() => handleDeleteItem(item.id)} className="w-full mt-2 text-sm p-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg flex items-center justify-center gap-2">
                                                <Trash2 size={16} /> Remove Item
                                            </button>
                                        </div>
                                    ) : isHeld ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-sm text-gray-300">Held by: <span className="font-semibold text-white">{item.held_by}</span></p>
                                            <p className="text-xs text-gray-400">Until {formatDate(item.held_until)}</p>
                                            <button onClick={() => handleMarkFulfilled(item)} className="w-full mt-2 text-sm p-2 bg-green-500/20 hover:bg-green-500/40 text-green-300 rounded-lg flex items-center justify-center gap-2">
                                                <Check size={16} /> Mark as Fulfilled
                                            </button>
                                            <button onClick={() => handleRemoveHold(item.id)} className="w-full mt-2 text-xs p-1 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 rounded-lg">Remove Hold</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <a href={item.product_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:underline"><ExternalLink size={16}/> View Product</a>
                                            <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full"><Trash2 size={18} /></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

