import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { mockChats, mockMessages } from '@/data/chats.js';
import { useAuth } from './AuthContext.jsx';
import { chatsApi } from '@/lib/api.js';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeChatId, setActiveChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useBackend, setUseBackend] = useState(false);

  // Initialize data - try backend first, fall back to local storage
  useEffect(() => {
    const initializeChats = async () => {
      if (!isLoggedIn) {
        // Use mock data for non-logged-in users
        setChats(mockChats);
        setMessages(mockMessages);
        return;
      }

      try {
        setIsLoading(true);
        const response = await chatsApi.getAll();
        
        if (response.success && response.data.length > 0) {
          setChats(response.data);
          setUseBackend(true);
          
          // Load messages for each chat
          const allMessages = {};
          for (const chat of response.data) {
            try {
              const msgResponse = await chatsApi.getMessages(chat.id);
              if (msgResponse.success) {
                allMessages[chat.id] = msgResponse.data;
              }
            } catch (err) {
              allMessages[chat.id] = [];
            }
          }
          setMessages(allMessages);
        } else {
          // Fall back to local storage
          const storedChats = localStorage.getItem('app_chats');
          const storedMessages = localStorage.getItem('app_messages');

          if (storedChats && storedMessages) {
            setChats(JSON.parse(storedChats));
            setMessages(JSON.parse(storedMessages));
          } else {
            setChats(mockChats);
            setMessages(mockMessages);
          }
          setUseBackend(false);
        }
      } catch (error) {
        console.log('Backend not available for chats, using local data');
        setUseBackend(false);
        
        const storedChats = localStorage.getItem('app_chats');
        const storedMessages = localStorage.getItem('app_messages');

        if (storedChats && storedMessages) {
          setChats(JSON.parse(storedChats));
          setMessages(JSON.parse(storedMessages));
        } else {
          setChats(mockChats);
          setMessages(mockMessages);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeChats();
  }, [isLoggedIn]);

  // Save to local storage when not using backend
  const saveToStorage = (newChats, newMessages) => {
    if (!useBackend) {
      localStorage.setItem('app_chats', JSON.stringify(newChats));
      localStorage.setItem('app_messages', JSON.stringify(newMessages));
    }
  };

  const addMessage = async (chatId, text, senderId = 'me') => {
    const timestamp = new Date().toISOString();
    
    const newMessage = {
      id: `msg_${Date.now()}`,
      chat_id: chatId,
      sender_id: senderId,
      sender_name: senderId === 'me' ? (user?.name || 'Me') : 'Seller',
      text,
      timestamp,
      read_status: true
    };

    if (useBackend) {
      try {
        const response = await chatsApi.sendMessage(chatId, text);
        if (response.success) {
          // Use server response for accurate data
          const serverMessage = response.data;
          
          const updatedMessages = {
            ...messages,
            [chatId]: [...(messages[chatId] || []), serverMessage]
          };

          const updatedChats = chats.map(c => 
            c.id === chatId 
              ? { 
                  ...c, 
                  last_message: text, 
                  last_message_time: serverMessage.timestamp,
                  updated_at: serverMessage.timestamp,
                  unread_count: senderId === 'me' ? c.unread_count : c.unread_count + 1
                } 
              : c
          );

          setMessages(updatedMessages);
          setChats(updatedChats);
          return;
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }

    // Local fallback
    const updatedMessages = {
      ...messages,
      [chatId]: [...(messages[chatId] || []), newMessage]
    };

    const updatedChats = chats.map(c => 
      c.id === chatId 
        ? { 
            ...c, 
            last_message: text, 
            last_message_time: timestamp,
            updated_at: timestamp,
            unread_count: senderId === 'me' ? c.unread_count : c.unread_count + 1
          } 
        : c
    );

    setMessages(updatedMessages);
    setChats(updatedChats);
    saveToStorage(updatedChats, updatedMessages);
  };

  const markMessagesAsRead = async (chatId) => {
    let updated = false;
    const updatedChats = chats.map(c => {
      if (c.id === chatId && c.unread_count > 0) {
        updated = true;
        return { ...c, unread_count: 0 };
      }
      return c;
    });

    if (updated) {
      setChats(updatedChats);
      saveToStorage(updatedChats, messages);
    }
  };

  const createOrGetChat = async (property, seller) => {
    if (useBackend && seller?.userId) {
      try {
        // Check if chat exists via API
        const response = await chatsApi.create({
          listingId: property.id,
          sellerId: seller.userId,
          propertyTitle: property.title,
          propertyImage: property.image || property.images?.[0]
        });

        if (response.success) {
          const chatId = response.data.id;
          
          // Add to local state
          const newChat = {
            id: chatId,
            listing_id: property.id,
            seller_id: seller.userId,
            buyer_id: user?.id,
            seller_name: seller.name,
            seller_avatar: seller.avatarInitial || seller.name?.charAt(0).toUpperCase(),
            property_title: property.title,
            property_image: property.image || property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=150&q=80',
            last_message: '',
            last_message_time: new Date().toISOString(),
            unread_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          setChats(prev => [newChat, ...prev]);
          setMessages(prev => ({ ...prev, [chatId]: [] }));
          
          return chatId;
        }
      } catch (error) {
        console.error('Failed to create chat:', error);
      }
    }

    // Local fallback
    const existingChat = chats.find(c => c.listing_id === property.id);
    if (existingChat) {
      return existingChat.id;
    }

    const newChatId = `chat_${Date.now()}`;
    const newChat = {
      id: newChatId,
      listing_id: property.id,
      seller_id: seller?.email || 'seller',
      buyer_id: 'me',
      seller_name: seller?.name || 'Property Owner',
      seller_avatar: seller?.name ? seller.name.charAt(0).toUpperCase() : 'S',
      property_title: property.title,
      property_image: property.image || property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=150&q=80',
      last_message: '',
      last_message_time: new Date().toISOString(),
      unread_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedChats = [newChat, ...chats];
    const updatedMessages = { ...messages, [newChatId]: [] };

    setChats(updatedChats);
    setMessages(updatedMessages);
    saveToStorage(updatedChats, updatedMessages);

    return newChatId;
  };

  // Refresh chats from backend
  const refreshChats = async () => {
    if (!isLoggedIn || !useBackend) return;
    
    try {
      setIsLoading(true);
      const response = await chatsApi.getAll();
      if (response.success) {
        setChats(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedChats = useMemo(() => {
    let result = chats;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.seller_name?.toLowerCase().includes(q) || 
        c.property_title?.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.updated_at || b.last_message_time || 0) - new Date(a.updated_at || a.last_message_time || 0));
  }, [chats, searchQuery]);

  return (
    <ChatContext.Provider value={{
      chats: filteredAndSortedChats,
      messages,
      activeChatId,
      setActiveChatId,
      addMessage,
      markMessagesAsRead,
      searchQuery,
      setSearchQuery,
      createOrGetChat,
      refreshChats,
      isLoading,
      useBackend
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};