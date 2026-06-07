
export const mockChats = [
  {
    id: "chat_1",
    listing_id: "prop_1",
    seller_id: "seller_1",
    buyer_id: "me",
    seller_name: "Rahul Sharma",
    seller_avatar: "R",
    property_title: "Modern 3BHK Apartment in Rajpur Road",
    property_image: "https://images.unsplash.com/photo-1684835609054-dd3d681cf012?auto=format&fit=crop&w=150&q=80",
    last_message: "Yes, the parking space is included in the price.",
    last_message_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    unread_count: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "chat_2",
    listing_id: "prop_2",
    seller_id: "seller_2",
    buyer_id: "me",
    seller_name: "Anita Desai",
    seller_avatar: "A",
    property_title: "Luxury Villa with Mountain View",
    property_image: "https://images.unsplash.com/photo-1689004624325-6edf074228dd?auto=format&fit=crop&w=150&q=80",
    last_message: "When would you like to schedule a viewing?",
    last_message_time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    unread_count: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "chat_3",
    listing_id: "prop_3",
    seller_id: "seller_3",
    buyer_id: "me",
    seller_name: "Vikram Singh",
    seller_avatar: "V",
    property_title: "Cozy 2BHK Near IT Park",
    property_image: "https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?auto=format&fit=crop&w=150&q=80",
    last_message: "Thanks for the information. I will discuss it with my family and let you know.",
    last_message_time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    unread_count: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  }
];

export const mockMessages = {
  "chat_1": [
    {
      id: "msg_1_1",
      chat_id: "chat_1",
      sender_id: "me",
      sender_name: "Me",
      text: "Hi Rahul, is this apartment still available?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      read_status: true
    },
    {
      id: "msg_1_2",
      chat_id: "chat_1",
      sender_id: "seller_1",
      sender_name: "Rahul Sharma",
      text: "Hello! Yes, it is still available.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
      read_status: true
    },
    {
      id: "msg_1_3",
      chat_id: "chat_1",
      sender_id: "me",
      sender_name: "Me",
      text: "Great. Does the price include the parking space?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      read_status: true
    },
    {
      id: "msg_1_4",
      chat_id: "chat_1",
      sender_id: "seller_1",
      sender_name: "Rahul Sharma",
      text: "Yes, the parking space is included in the price.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read_status: false
    }
  ],
  "chat_2": [
    {
      id: "msg_2_1",
      chat_id: "chat_2",
      sender_id: "me",
      sender_name: "Me",
      text: "Beautiful villa! Are the furnishings included?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      read_status: true
    },
    {
      id: "msg_2_2",
      chat_id: "chat_2",
      sender_id: "seller_2",
      sender_name: "Anita Desai",
      text: "Thank you! The built-in wardrobes and kitchen appliances are included. Movable furniture is not.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
      read_status: true
    },
    {
      id: "msg_2_3",
      chat_id: "chat_2",
      sender_id: "me",
      sender_name: "Me",
      text: "That makes sense. Can I come see it this weekend?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      read_status: true
    },
    {
      id: "msg_2_4",
      chat_id: "chat_2",
      sender_id: "seller_2",
      sender_name: "Anita Desai",
      text: "When would you like to schedule a viewing?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read_status: true
    }
  ],
  "chat_3": [
    {
      id: "msg_3_1",
      chat_id: "chat_3",
      sender_id: "me",
      sender_name: "Me",
      text: "Hi, I'm interested in the 2BHK near IT Park. Is the maintenance fee extra?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      read_status: true
    },
    {
      id: "msg_3_2",
      chat_id: "chat_3",
      sender_id: "seller_3",
      sender_name: "Vikram Singh",
      text: "Hello! The maintenance fee is ₹2000 per month, which is extra.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
      read_status: true
    },
    {
      id: "msg_3_3",
      chat_id: "chat_3",
      sender_id: "me",
      sender_name: "Me",
      text: "Thanks for the information. I will discuss it with my family and let you know.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      read_status: true
    }
  ]
};
