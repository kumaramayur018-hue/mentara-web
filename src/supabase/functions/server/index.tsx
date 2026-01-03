import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-a40ffbb5/health", (c) => {
  return c.json({ status: "ok" });
});

// AI Chat endpoints - Enhanced with real-time streaming and emotional intelligence
app.post("/make-server-a40ffbb5/chat", async (c) => {
  try {
    const { message, userId, conversationId } = await c.req.json();
    
    // Get conversation history
    const conversationKey = `conversation_${userId}_${conversationId}`;
    const conversationHistory = await kv.get(conversationKey) || [];
    
    // DEBUG: Log conversation history before adding new message
    console.log(`[CHAT DEBUG] Conversation ${conversationId}: Retrieved ${conversationHistory.length} messages from history`);
    
    // Create user message object (will be added to history AFTER getting AI response)
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    // Get user context for personalization
    const userContextKey = `user_context_${userId}`;
    const userContext = await kv.get(userContextKey) || {
      concerns: [],
      moods: [],
      topics: [],
      sessionCount: 0,
      personality: 'warm',
      previousEmotions: [],
      therapeuticProgress: {}
    };
    
    // Generate enhanced AI response with emotional intelligence
    // Pass the PREVIOUS conversation history (without the new message)
    // The new message will be added separately in the AI function
    const aiResponse = await generateAdvancedAIResponse(message, conversationHistory, userContext);
    
    // NOW add the user message to history
    conversationHistory.push(userMessage);
    
    // DEBUG: Log after adding user message
    console.log(`[CHAT DEBUG] After adding user message: ${conversationHistory.length} messages total`);
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      content: aiResponse.content,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      type: aiResponse.type,
      suggestions: aiResponse.suggestions,
      sources: aiResponse.sources,
      emotionalTone: aiResponse.emotionalTone,
      therapeuticApproach: aiResponse.therapeuticApproach
    };
    conversationHistory.push(aiMessage);
    
    // Store updated conversation (keep last 50 messages)
    await kv.set(conversationKey, conversationHistory.slice(-50));
    
    // DEBUG: Log after saving
    console.log(`[CHAT DEBUG] Saved ${conversationHistory.length} messages to KV store for conversation ${conversationId}`);
    
    // Update conversation metadata
    const conversationsListKey = `conversations_list_${userId}`;
    const conversationsList = await kv.get(conversationsListKey) || [];
    const existingConvIndex = conversationsList.findIndex((c: any) => c.id === conversationId);
    
    const conversationMetadata = {
      id: conversationId,
      title: conversationHistory.length <= 2 ? (message.substring(0, 50) + (message.length > 50 ? '...' : '')) : conversationsList[existingConvIndex]?.title,
      lastMessage: message.substring(0, 100),
      lastUpdated: new Date().toISOString(),
      messageCount: conversationHistory.length
    };
    
    if (existingConvIndex >= 0) {
      conversationsList[existingConvIndex] = conversationMetadata;
    } else {
      conversationsList.unshift(conversationMetadata);
    }
    
    await kv.set(conversationsListKey, conversationsList);
    
    // Update user context with enhanced analysis and personality learning
    const updatedContext = await enhancedUpdateUserContext(userContext, message, aiResponse);
    
    // Update personality profile based on interaction
    if (aiResponse.personalityProfile) {
      updatedContext.personalityProfile = aiResponse.personalityProfile;
    }
    
    await kv.set(userContextKey, updatedContext);
    
    return c.json({
      message: aiMessage,
      context: updatedContext
    });
  } catch (error) {
    console.log(`Error in chat endpoint: ${error}`);
    return c.json({ error: "Failed to process chat message" }, 500);
  }
});

// Get conversation history
app.get("/make-server-a40ffbb5/chat/history/:userId/:conversationId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const conversationId = c.req.param("conversationId");
    const conversationKey = `conversation_${userId}_${conversationId}`;
    
    const history = await kv.get(conversationKey) || [];
    return c.json(history);
  } catch (error) {
    console.log(`Error fetching chat history: ${error}`);
    return c.json({ error: "Failed to fetch chat history" }, 500);
  }
});

// Get user context
app.get("/make-server-a40ffbb5/chat/context/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const userContextKey = `user_context_${userId}`;
    
    const context = await kv.get(userContextKey) || {
      concerns: [],
      moods: [],
      topics: [],
      sessionCount: 0
    };
    
    return c.json(context);
  } catch (error) {
    console.log(`Error fetching user context: ${error}`);
    return c.json({ error: "Failed to fetch user context" }, 500);
  }
});

// Get all conversations for a user
app.get("/make-server-a40ffbb5/chat/conversations/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const conversationsListKey = `conversations_list_${userId}`;
    
    const conversations = await kv.get(conversationsListKey) || [];
    return c.json(conversations);
  } catch (error) {
    console.log(`Error fetching conversations: ${error}`);
    return c.json({ error: "Failed to fetch conversations" }, 500);
  }
});

// Create a new conversation
app.post("/make-server-a40ffbb5/chat/conversations/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const { title, id } = await c.req.json();
    
    const conversationId = id || `conv_${Date.now()}`;
    const conversationsListKey = `conversations_list_${userId}`;
    const conversationsList = await kv.get(conversationsListKey) || [];
    
    // Check if conversation already exists
    const existingConv = conversationsList.find((c: any) => c.id === conversationId);
    if (existingConv) {
      return c.json({ conversation: existingConv });
    }
    
    const newConversation = {
      id: conversationId,
      title: title || 'New conversation',
      lastMessage: '',
      lastUpdated: new Date().toISOString(),
      messageCount: 0
    };
    
    conversationsList.unshift(newConversation);
    await kv.set(conversationsListKey, conversationsList);
    
    return c.json({ conversation: newConversation });
  } catch (error) {
    console.log(`Error creating conversation: ${error}`);
    return c.json({ error: "Failed to create conversation" }, 500);
  }
});

// Delete a conversation
app.delete("/make-server-a40ffbb5/chat/conversations/:userId/:conversationId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const conversationId = c.req.param("conversationId");
    
    // Delete conversation history
    const conversationKey = `conversation_${userId}_${conversationId}`;
    await kv.del(conversationKey);
    
    // Remove from conversations list
    const conversationsListKey = `conversations_list_${userId}`;
    const conversationsList = await kv.get(conversationsListKey) || [];
    const updatedList = conversationsList.filter((c: any) => c.id !== conversationId);
    await kv.set(conversationsListKey, updatedList);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting conversation: ${error}`);
    return c.json({ error: "Failed to delete conversation" }, 500);
  }
});

// Update conversation title
app.put("/make-server-a40ffbb5/chat/conversations/:userId/:conversationId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const conversationId = c.req.param("conversationId");
    const { title } = await c.req.json();
    
    const conversationsListKey = `conversations_list_${userId}`;
    const conversationsList = await kv.get(conversationsListKey) || [];
    const updatedList = conversationsList.map((c: any) => 
      c.id === conversationId ? { ...c, title } : c
    );
    
    await kv.set(conversationsListKey, updatedList);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error updating conversation: ${error}`);
    return c.json({ error: "Failed to update conversation" }, 500);
  }
});

// Auth endpoints
app.post("/make-server-a40ffbb5/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Authorization error while creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ message: "User created successfully", user: data.user });
  } catch (error) {
    console.log(`Unexpected error during signup: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin login endpoint
app.post("/make-server-a40ffbb5/admin/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    // Simple admin check - in production, use proper admin role checking
    if (email === "admin@mentara.com" && password === "admin123") {
      return c.json({ success: true, message: "Admin authenticated" });
    }

    return c.json({ success: false, error: "Invalid admin credentials" }, 401);
  } catch (error) {
    console.log(`Error during admin login: ${error}`);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Counselor management endpoints
app.get("/make-server-a40ffbb5/admin/counselors", async (c) => {
  try {
    const counselors = await kv.get("counselors") || [];
    return c.json(counselors);
  } catch (error) {
    console.log(`Error fetching counselors: ${error}`);
    return c.json({ error: "Failed to fetch counselors" }, 500);
  }
});

app.post("/make-server-a40ffbb5/admin/counselors", async (c) => {
  try {
    const body = await c.req.json();
    const existingCounselors = await kv.get("counselors") || [];
    const newCounselor = { 
      ...body, 
      id: Date.now().toString(),
      // Ensure all required fields have defaults
      rating: body.rating || 5.0,
      price: body.price || 800,
      languages: body.languages || ['English', 'Hindi'],
      sessionTypes: body.sessionTypes || ['video', 'audio', 'chat'],
      image: body.image || 'https://images.unsplash.com/photo-1714976694810-85add1a29c96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjB0aGVyYXBpc3QlMjBjb3Vuc2Vsb3IlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzU5MTYzMzMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      credentials: body.credentials || '',
      specialization: Array.isArray(body.specialization) ? body.specialization : [body.specialization].filter(Boolean)
    };
    const updatedCounselors = [...existingCounselors, newCounselor];
    
    await kv.set("counselors", updatedCounselors);
    return c.json({ message: "Counselor added successfully", counselor: newCounselor });
  } catch (error) {
    console.log(`Error adding counselor: ${error}`);
    return c.json({ error: "Failed to add counselor" }, 500);
  }
});

app.put("/make-server-a40ffbb5/admin/counselors/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existingCounselors = await kv.get("counselors") || [];
    const updatedCounselors = existingCounselors.map((counselor: any) => 
      counselor.id === id ? { ...counselor, ...body } : counselor
    );
    
    await kv.set("counselors", updatedCounselors);
    return c.json({ message: "Counselor updated successfully" });
  } catch (error) {
    console.log(`Error updating counselor: ${error}`);
    return c.json({ error: "Failed to update counselor" }, 500);
  }
});

app.delete("/make-server-a40ffbb5/admin/counselors/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existingCounselors = await kv.get("counselors") || [];
    const updatedCounselors = existingCounselors.filter((counselor: any) => counselor.id !== id);
    
    await kv.set("counselors", updatedCounselors);
    return c.json({ message: "Counselor deleted successfully" });
  } catch (error) {
    console.log(`Error deleting counselor: ${error}`);
    return c.json({ error: "Failed to delete counselor" }, 500);
  }
});

// Public counselor endpoint (for website use)
app.get("/make-server-a40ffbb5/counselors", async (c) => {
  try {
    const counselors = await kv.get("counselors") || [
      // Default counselors if none exist
      {
        id: '1',
        name: 'Dr. Priya Sharma',
        specialization: ['Anxiety', 'Stress Management', 'Academic Pressure'],
        rating: 4.8,
        experience: '8 years',
        languages: ['English', 'Hindi'],
        price: 800,
        availability: ['Mon', 'Wed', 'Fri'],
        image: 'https://images.unsplash.com/photo-1714976694810-85add1a29c96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjB0aGVyYXBpc3QlMjBjb3Vuc2Vsb3IlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzU5MTYzMzMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        bio: 'Specialized in helping students manage academic stress and build resilience.',
        sessionTypes: ['video', 'audio', 'chat'],
        credentials: 'M.A. Psychology, Ph.D. Clinical Psychology'
      },
      {
        id: '2',
        name: 'Dr. Rajesh Kumar',
        specialization: ['Depression', 'Relationship Issues', 'Career Guidance'],
        rating: 4.7,
        experience: '12 years',
        languages: ['English', 'Hindi', 'Gujarati'],
        price: 1000,
        availability: ['Tue', 'Thu', 'Sat'],
        image: 'https://images.unsplash.com/photo-1742569184536-77ff9ae46c99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwY291bnNlbG9yJTIwdGhlcmFwaXN0JTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU5MTYzMzM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        bio: 'Expert in cognitive behavioral therapy with focus on young adults and career transitions.',
        sessionTypes: ['video', 'audio'],
        credentials: 'M.Phil. Psychology, RCI Licensed'
      },
      {
        id: '3',
        name: 'Dr. Meera Patel',
        specialization: ['ADHD', 'Learning Disabilities', 'Social Anxiety'],
        rating: 4.9,
        experience: '6 years',
        languages: ['English', 'Hindi', 'Marathi'],
        price: 750,
        availability: ['Mon', 'Tue', 'Wed', 'Thu'],
        image: 'https://images.unsplash.com/photo-1733685318562-c726472bc1db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0aGVyYXBpc3QlMjBjb3Vuc2Vsb3IlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTkxNjMzMjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        bio: 'Passionate about helping students overcome learning challenges and build confidence.',
        sessionTypes: ['video', 'chat'],
        credentials: 'M.A. Clinical Psychology, PGDM'
      }
    ];
    return c.json(counselors);
  } catch (error) {
    console.log(`Error fetching public counselors: ${error}`);
    return c.json({ error: "Failed to fetch counselors" }, 500);
  }
});

// Content sections management endpoints
app.get("/make-server-a40ffbb5/admin/sections", async (c) => {
  try {
    const sections = await kv.get("content_sections") || [];
    return c.json(sections);
  } catch (error) {
    console.log(`Error fetching sections: ${error}`);
    return c.json({ error: "Failed to fetch sections" }, 500);
  }
});

app.post("/make-server-a40ffbb5/admin/sections", async (c) => {
  try {
    const body = await c.req.json();
    const existingSections = await kv.get("content_sections") || [];
    const newSection = { 
      ...body, 
      id: Date.now().toString(),
      // Ensure all required fields have defaults
      rating: body.rating || 4.5,
      duration: body.duration || '5 min read',
      difficulty: body.difficulty || 'beginner',
      image: body.image || 'https://images.unsplash.com/photo-1642557581366-539b6fed5998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjB3ZWxsbmVzcyUyMG1pbmRmdWxuZXNzfGVufDF8fHx8MTc1OTEwOTQzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      author: body.author || 'Mentara Team',
      tags: body.tags || []
    };
    const updatedSections = [...existingSections, newSection];
    
    await kv.set("content_sections", updatedSections);
    return c.json({ message: "Section added successfully", section: newSection });
  } catch (error) {
    console.log(`Error adding section: ${error}`);
    return c.json({ error: "Failed to add section" }, 500);
  }
});

app.put("/make-server-a40ffbb5/admin/sections/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existingSections = await kv.get("content_sections") || [];
    const updatedSections = existingSections.map((section: any) => 
      section.id === id ? { ...section, ...body } : section
    );
    
    await kv.set("content_sections", updatedSections);
    return c.json({ message: "Section updated successfully" });
  } catch (error) {
    console.log(`Error updating section: ${error}`);
    return c.json({ error: "Failed to update section" }, 500);
  }
});

app.delete("/make-server-a40ffbb5/admin/sections/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existingSections = await kv.get("content_sections") || [];
    const updatedSections = existingSections.filter((section: any) => section.id !== id);
    
    await kv.set("content_sections", updatedSections);
    return c.json({ message: "Section deleted successfully" });
  } catch (error) {
    console.log(`Error deleting section: ${error}`);
    return c.json({ error: "Failed to delete section" }, 500);
  }
});

// Public resources endpoint (for website use)
app.get("/make-server-a40ffbb5/resources", async (c) => {
  try {
    const sections = await kv.get("content_sections") || [
      // Default resources if none exist
      {
        id: '1',
        title: 'Understanding Exam Anxiety',
        description: 'Learn practical techniques to manage pre-exam stress and perform better under pressure.',
        type: 'article',
        category: 'Stress Management',
        duration: '8 min read',
        rating: 4.8,
        difficulty: 'beginner',
        image: 'https://images.unsplash.com/photo-1642557581366-539b6fed5998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjB3ZWxsbmVzcyUyMG1pbmRmdWxuZXNzfGVufDF8fHx8MTc1OTEwOTQzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        author: 'Dr. Meera Singh',
        tags: ['anxiety', 'exams', 'breathing', 'preparation'],
        content: 'Comprehensive guide on managing exam anxiety with proven techniques...'
      },
      {
        id: '2',
        title: '5-Minute Morning Meditation',
        description: 'Start your day with clarity and focus using this guided meditation specifically for students.',
        type: 'audio',
        category: 'Mindfulness',
        duration: '5 min',
        rating: 4.9,
        difficulty: 'beginner',
        image: 'https://images.unsplash.com/photo-1687180948607-9ba1dd045e10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMG1lZGl0YXRpb24lMjB3ZWxsbmVzcyUyMG1lZGl0YXRpb258ZW58MXx8fHwxNzU5MTU4Nzg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        author: 'Mentara Team',
        tags: ['meditation', 'morning', 'focus', 'routine'],
        content: 'Guided meditation audio content for students...'
      },
      {
        id: '3',
        title: 'Building Healthy Study Habits',
        description: 'Watch this comprehensive guide on creating sustainable study routines that work.',
        type: 'video',
        category: 'Study Skills',
        duration: '12 min',
        rating: 4.7,
        difficulty: 'intermediate',
        image: 'https://images.unsplash.com/photo-1758270703813-2ecf235a6462?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMHN0dWR5aW5nJTIwdG9nZXRoZXIlMjBjb21tdW5pdHl8ZW58MXx8fHwxNzU5MTU4Nzg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        author: 'Prof. Rajesh Kumar',
        tags: ['study', 'habits', 'productivity', 'time-management'],
        content: 'Video content on building effective study habits...'
      }
    ];
    return c.json(sections);
  } catch (error) {
    console.log(`Error fetching public resources: ${error}`);
    return c.json({ error: "Failed to fetch resources" }, 500);
  }
});

// ==================== COUNSELOR ENDPOINTS ====================

// Public counselors endpoint (for website use)
app.get("/make-server-a40ffbb5/counselors", async (c) => {
  try {
    const counselors = await kv.get("counselors") || [];
    console.log(`[PUBLIC API] Fetching counselors, found: ${counselors.length} counselors`);
    return c.json(counselors);
  } catch (error) {
    console.log(`Error fetching public counselors: ${error}`);
    return c.json({ error: "Failed to fetch counselors" }, 500);
  }
});

// Admin counselor management endpoints
app.get("/make-server-a40ffbb5/admin/counselors", async (c) => {
  try {
    const counselors = await kv.get("counselors") || [];
    return c.json(counselors);
  } catch (error) {
    console.log(`Error fetching counselors: ${error}`);
    return c.json({ error: "Failed to fetch counselors" }, 500);
  }
});

app.post("/make-server-a40ffbb5/admin/counselors", async (c) => {
  try {
    const body = await c.req.json();
    const existingCounselors = await kv.get("counselors") || [];
    const newCounselor = { 
      ...body, 
      id: Date.now().toString(),
      rating: body.rating || 4.5,
      experience: body.experience || '0 years',
      price: body.price || 500,
      availability: Array.isArray(body.availability) ? body.availability : ['Mon', 'Wed', 'Fri'],
      languages: Array.isArray(body.languages) ? body.languages : ['English', 'Hindi'],
      specialization: Array.isArray(body.specialization) ? body.specialization : [],
      sessionTypes: Array.isArray(body.sessionTypes) ? body.sessionTypes : ['video'],
      image: body.image || 'https://images.unsplash.com/photo-1714976694810-85add1a29c96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjB0aGVyYXBpc3QlMjBjb3Vuc2Vsb3IlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzU5MTYzMzMxfDA&ixlib=rb-4.1.0&q=80&w=1080'
    };
    const updatedCounselors = [...existingCounselors, newCounselor];
    
    await kv.set("counselors", updatedCounselors);
    return c.json({ message: "Counselor added successfully", counselor: newCounselor });
  } catch (error) {
    console.log(`Error adding counselor: ${error}`);
    return c.json({ error: "Failed to add counselor" }, 500);
  }
});

app.put("/make-server-a40ffbb5/admin/counselors/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existingCounselors = await kv.get("counselors") || [];
    const updatedCounselors = existingCounselors.map((counselor: any) => 
      counselor.id === id ? { ...counselor, ...body } : counselor
    );
    
    await kv.set("counselors", updatedCounselors);
    return c.json({ message: "Counselor updated successfully" });
  } catch (error) {
    console.log(`Error updating counselor: ${error}`);
    return c.json({ error: "Failed to update counselor" }, 500);
  }
});

app.delete("/make-server-a40ffbb5/admin/counselors/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existingCounselors = await kv.get("counselors") || [];
    const updatedCounselors = existingCounselors.filter((counselor: any) => counselor.id !== id);
    
    await kv.set("counselors", updatedCounselors);
    return c.json({ message: "Counselor deleted successfully" });
  } catch (error) {
    console.log(`Error deleting counselor: ${error}`);
    return c.json({ error: "Failed to delete counselor" }, 500);
  }
});

// ==================== PRODUCT ENDPOINTS ====================

// Public products endpoint (for website use)
app.get("/make-server-a40ffbb5/products", async (c) => {
  try {
    const products = await kv.get("products") || [];
    console.log(`[PUBLIC API] Fetching products, found: ${products.length} products`);
    return c.json(products);
  } catch (error) {
    console.log(`Error fetching public products: ${error}`);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

// Admin product management endpoints
app.get("/make-server-a40ffbb5/admin/products", async (c) => {
  try {
    const products = await kv.get("products") || [];
    return c.json(products);
  } catch (error) {
    console.log(`Error fetching products: ${error}`);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

app.post("/make-server-a40ffbb5/admin/products", async (c) => {
  try {
    const body = await c.req.json();
    const existingProducts = await kv.get("products") || [];
    const newProduct = { 
      ...body, 
      id: Date.now().toString(),
      rating: body.rating || 4.5,
      reviews: body.reviews || 0,
      inStock: body.inStock !== undefined ? body.inStock : true,
      benefits: Array.isArray(body.benefits) ? body.benefits : [],
      image: body.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXBwbGVtZW50JTIwY2Fwc3VsZXMlMjB3ZWxsbmVzc3xlbnwxfHx8fDE3NTkxNjMzNjB8MA&ixlib=rb-4.1.0&q=80&w=1080'
    };
    const updatedProducts = [...existingProducts, newProduct];
    
    await kv.set("products", updatedProducts);
    return c.json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.log(`Error adding product: ${error}`);
    return c.json({ error: "Failed to add product" }, 500);
  }
});

app.put("/make-server-a40ffbb5/admin/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existingProducts = await kv.get("products") || [];
    const updatedProducts = existingProducts.map((product: any) => 
      product.id === id ? { ...product, ...body } : product
    );
    
    await kv.set("products", updatedProducts);
    return c.json({ message: "Product updated successfully" });
  } catch (error) {
    console.log(`Error updating product: ${error}`);
    return c.json({ error: "Failed to update product" }, 500);
  }
});

app.delete("/make-server-a40ffbb5/admin/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existingProducts = await kv.get("products") || [];
    const updatedProducts = existingProducts.filter((product: any) => product.id !== id);
    
    await kv.set("products", updatedProducts);
    return c.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log(`Error deleting product: ${error}`);
    return c.json({ error: "Failed to delete product" }, 500);
  }
});

// Public products endpoint (for website use)
app.get("/make-server-a40ffbb5/products", async (c) => {
  try {
    const products = await kv.get("products") || [];
    return c.json(products);
  } catch (error) {
    console.log(`Error fetching public products: ${error}`);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

// ==================== RESOURCE ENDPOINTS ====================

// Public resources endpoint (for website use)
app.get("/make-server-a40ffbb5/resources", async (c) => {
  try {
    const resources = await kv.get("resources") || [];
    console.log(`[PUBLIC API] Fetching resources, found: ${resources.length} resources`);
    return c.json(resources);
  } catch (error) {
    console.log(`Error fetching public resources: ${error}`);
    return c.json({ error: "Failed to fetch resources" }, 500);
  }
});

// Admin resource management endpoints
app.get("/make-server-a40ffbb5/admin/resources", async (c) => {
  try {
    const resources = await kv.get("resources") || [];
    console.log(`[ADMIN API] Fetching resources, found: ${resources.length} resources`);
    return c.json(resources);
  } catch (error) {
    console.log(`Error fetching admin resources: ${error}`);
    return c.json({ error: "Failed to fetch resources" }, 500);
  }
});

app.post("/make-server-a40ffbb5/admin/resources", async (c) => {
  try {
    const body = await c.req.json();
    const existingResources = await kv.get("resources") || [];
    const newResource = { 
      ...body, 
      id: Date.now().toString(),
      image: body.image || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBleGFtfGVufDF8fHx8MTc1OTE2MzQyMHww&ixlib=rb-4.1.0&q=80&w=1080',
      tags: Array.isArray(body.tags) ? body.tags : []
    };
    const updatedResources = [...existingResources, newResource];
    
    await kv.set("resources", updatedResources);
    console.log(`[ADMIN API] Added new resource: ${newResource.title}`);
    return c.json({ message: "Resource added successfully", resource: newResource });
  } catch (error) {
    console.log(`Error adding resource: ${error}`);
    return c.json({ error: "Failed to add resource" }, 500);
  }
});

app.put("/make-server-a40ffbb5/admin/resources/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existingResources = await kv.get("resources") || [];
    const updatedResources = existingResources.map((resource: any) => 
      resource.id === id ? { ...resource, ...body } : resource
    );
    
    await kv.set("resources", updatedResources);
    console.log(`[ADMIN API] Updated resource: ${id}`);
    return c.json({ message: "Resource updated successfully" });
  } catch (error) {
    console.log(`Error updating resource: ${error}`);
    return c.json({ error: "Failed to update resource" }, 500);
  }
});

app.delete("/make-server-a40ffbb5/admin/resources/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existingResources = await kv.get("resources") || [];
    const updatedResources = existingResources.filter((resource: any) => resource.id !== id);
    
    await kv.set("resources", updatedResources);
    console.log(`[ADMIN API] Deleted resource: ${id}`);
    return c.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.log(`Error deleting resource: ${error}`);
    return c.json({ error: "Failed to delete resource" }, 500);
  }
});

// Helper function to search the internet for mental health information
async function searchInternet(query: string) {
  try {
    // Using a mental health focused search query
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query + " mental health techniques evidence-based coping strategies")}&format=json&no_html=1&skip_disambig=1`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    let searchResults = [];
    
    if (data.Abstract) {
      searchResults.push({
        title: data.Heading || "Mental Health Information",
        content: data.Abstract,
        source: data.AbstractSource || "DuckDuckGo",
        url: data.AbstractURL
      });
    }
    
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      for (let i = 0; i < Math.min(3, data.RelatedTopics.length); i++) {
        const topic = data.RelatedTopics[i];
        if (topic.Text && topic.FirstURL) {
          searchResults.push({
            title: topic.Text.split(' - ')[0],
            content: topic.Text,
            source: "DuckDuckGo",
            url: topic.FirstURL
          });
        }
      }
    }
    
    return searchResults;
  } catch (error) {
    console.log(`Search error: ${error}`);
    return [];
  }
}

// Enhanced user context update with emotional intelligence
async function enhancedUpdateUserContext(context: any, message: string, aiResponse: any) {
  const input = message.toLowerCase();
  const newConcerns: string[] = [];
  const newMoods: string[] = [];
  const newTopics: string[] = [];
  
  // Advanced concern detection with cultural context
  if (input.includes('exam') || input.includes('test') || input.includes('grade') || input.includes('academic') || input.includes('jee') || input.includes('neet')) newConcerns.push('academic_pressure');
  if (input.includes('family') || input.includes('parent') || input.includes('expectation') || input.includes('gharwale')) newConcerns.push('family_expectations');
  if (input.includes('career') || input.includes('job') || input.includes('future') || input.includes('placement') || input.includes('sarkari')) newConcerns.push('career_anxiety');
  if (input.includes('friend') || input.includes('social') || input.includes('relationship') || input.includes('lonely') || input.includes('dost')) newConcerns.push('social_issues');
  if (input.includes('money') || input.includes('financial') || input.includes('afford') || input.includes('paisa')) newConcerns.push('financial_stress');
  if (input.includes('sleep') || input.includes('tired') || input.includes('insomnia') || input.includes('neend')) newConcerns.push('sleep_issues');
  if (input.includes('hostel') || input.includes('college') || input.includes('university') || input.includes('campus')) newConcerns.push('college_adjustment');
  
  // Enhanced mood detection with intensity
  const moodIntensity = calculateOverallMoodIntensity(input);
  if (input.includes('anxious') || input.includes('nervous') || input.includes('worry') || input.includes('panic') || input.includes('darr')) {
    newMoods.push(`anxious_${moodIntensity}`);
  }
  if (input.includes('sad') || input.includes('depressed') || input.includes('down') || input.includes('hopeless') || input.includes('udaas')) {
    newMoods.push(`sad_${moodIntensity}`);
  }
  if (input.includes('angry') || input.includes('frustrated') || input.includes('irritated') || input.includes('mad') || input.includes('gussa')) {
    newMoods.push(`angry_${moodIntensity}`);
  }
  if (input.includes('overwhelmed') || input.includes('stressed') || input.includes('pressure') || input.includes('tension')) {
    newMoods.push(`overwhelmed_${moodIntensity}`);
  }
  if (input.includes('happy') || input.includes('good') || input.includes('better') || input.includes('grateful') || input.includes('khush')) {
    newMoods.push(`positive_${moodIntensity}`);
  }
  
  // Extract contextual topics
  const contextualWords = extractContextualWords(input);
  newTopics.push(...contextualWords);
  
  // Track emotional trajectory
  const previousEmotions = context.previousEmotions || [];
  previousEmotions.push({
    emotion: aiResponse.emotionalTone,
    intensity: moodIntensity,
    timestamp: new Date().toISOString(),
    trigger: extractEmotionalTrigger(input)
  });
  
  // Track therapeutic progress
  const therapeuticProgress = updateTherapeuticProgress(context.therapeuticProgress || {}, aiResponse);
  
  return {
    concerns: [...new Set([...context.concerns, ...newConcerns])],
    moods: [...new Set([...context.moods, ...newMoods])],
    topics: [...new Set([...context.topics, ...newTopics])].slice(-20),
    sessionCount: context.sessionCount + 1,
    previousEmotions: previousEmotions.slice(-50), // Keep last 50 emotional states
    therapeuticProgress: therapeuticProgress,
    lastUpdated: new Date().toISOString(),
    personality: adjustPersonalityBasedOnInteraction(context.personality, input),
    preferredApproaches: updatePreferredApproaches(context.preferredApproaches || [], aiResponse),
    
    // Enhanced learning and personalization
    personalityProfile: context.personalityProfile || {},
    successfulInterventions: updateSuccessfulInterventions(context.successfulInterventions || [], aiResponse),
    communicationPreferences: updateCommunicationPreferences(context.communicationPreferences || {}, input),
    personalDetails: updatePersonalDetails(context.personalDetails || {}, input),
    learningHistory: updateLearningHistory(context.learningHistory || [], { input, response: aiResponse, timestamp: new Date().toISOString() })
  };
}

// Emotional analysis helper functions
function calculateAnxietyLevel(input: string): number {
  const anxietyWords = ['anxious', 'nervous', 'worry', 'panic', 'afraid', 'scared', 'tense', 'stressed', 'overwhelmed'];
  const intensifiers = ['very', 'extremely', 'really', 'so', 'too', 'super'];
  
  let score = 0;
  anxietyWords.forEach(word => {
    if (input.includes(word)) score += 1;
  });
  
  intensifiers.forEach(word => {
    if (input.includes(word)) score += 0.5;
  });
  
  return Math.min(score * 2, 10);
}

function calculateDepressionLevel(input: string): number {
  const depressionWords = ['sad', 'depressed', 'down', 'hopeless', 'empty', 'numb', 'worthless', 'guilty'];
  const severity = ['nothing', 'anymore', 'never', 'always', 'everything'];
  
  let score = 0;
  depressionWords.forEach(word => {
    if (input.includes(word)) score += 1.5;
  });
  
  severity.forEach(word => {
    if (input.includes(word)) score += 1;
  });
  
  return Math.min(score * 1.5, 10);
}

function calculateStressLevel(input: string): number {
  const stressWords = ['stressed', 'pressure', 'overwhelmed', 'burden', 'heavy', 'too much', 'cant handle'];
  let score = 0;
  
  stressWords.forEach(word => {
    if (input.includes(word)) score += 1.2;
  });
  
  return Math.min(score * 2, 10);
}

function calculateAngerLevel(input: string): number {
  const angerWords = ['angry', 'mad', 'furious', 'irritated', 'frustrated', 'annoyed', 'hate'];
  const expressions = ['unfair', 'why me', 'not fair', 'stupid', 'ridiculous'];
  
  let score = 0;
  angerWords.forEach(word => {
    if (input.includes(word)) score += 1.3;
  });
  
  expressions.forEach(phrase => {
    if (input.includes(phrase)) score += 1;
  });
  
  return Math.min(score * 1.8, 10);
}

function calculateHopeLevel(input: string): number {
  const hopeWords = ['hope', 'better', 'improve', 'good', 'positive', 'forward', 'future', 'possible'];
  let score = 0;
  
  hopeWords.forEach(word => {
    if (input.includes(word)) score += 1;
  });
  
  return Math.min(score * 1.5, 10);
}

function calculateConfidenceLevel(input: string): number {
  const confidenceWords = ['confident', 'sure', 'capable', 'strong', 'can do', 'will manage', 'believe'];
  let score = 0;
  
  confidenceWords.forEach(word => {
    if (input.includes(word)) score += 1.2;
  });
  
  return Math.min(score * 1.8, 10);
}

function calculateOverwhelmLevel(input: string): number {
  const overwhelmWords = ['overwhelmed', 'too much', 'cant cope', 'drowning', 'suffocating', 'breaking down'];
  let score = 0;
  
  overwhelmWords.forEach(word => {
    if (input.includes(word)) score += 2;
  });
  
  return Math.min(score * 1.5, 10);
}

function calculateLonelinessLevel(input: string): number {
  const lonelinessWords = ['lonely', 'alone', 'isolated', 'no one', 'nobody', 'by myself', 'no friends'];
  let score = 0;
  
  lonelinessWords.forEach(word => {
    if (input.includes(word)) score += 1.5;
  });
  
  return Math.min(score * 2, 10);
}

function analyzeEmotionalTrajectory(previousEmotions: any[], currentEmotion: string): string {
  if (!previousEmotions || previousEmotions.length < 2) return 'insufficient_data';
  
  const recent = previousEmotions.slice(-5);
  const isImproving = recent.some((prev, i) => 
    i > 0 && prev.intensity < recent[i-1].intensity
  );
  
  const isStable = recent.every(emotion => 
    Math.abs(emotion.intensity - recent[0].intensity) < 2
  );
  
  if (isImproving) return 'improving';
  if (isStable) return 'stable';
  return 'declining';
}

function detectCrisisIndicators(input: string): string[] {
  const indicators = [];
  
  const selfHarmWords = ['hurt myself', 'end it all', 'kill myself', 'suicide', 'not worth living'];
  const severeDistress = ['cant take it', 'breaking point', 'give up', 'hopeless', 'no way out'];
  
  selfHarmWords.forEach(word => {
    if (input.includes(word)) indicators.push('self_harm_risk');
  });
  
  severeDistress.forEach(phrase => {
    if (input.includes(phrase)) indicators.push('severe_distress');
  });
  
  return [...new Set(indicators)];
}

function analyzeCulturalContext(input: string): string {
  const contexts = [];
  
  if (input.includes('family') || input.includes('parents') || input.includes('relatives')) {
    contexts.push('family_dynamics');
  }
  if (input.includes('exam') || input.includes('grade') || input.includes('academic')) {
    contexts.push('academic_pressure');
  }
  if (input.includes('marriage') || input.includes('arranged') || input.includes('settle down')) {
    contexts.push('marriage_pressure');
  }
  if (input.includes('english') || input.includes('hindi') || input.includes('language')) {
    contexts.push('language_concerns');
  }
  if (input.includes('caste') || input.includes('religion') || input.includes('community')) {
    contexts.push('social_identity');
  }
  
  return contexts.join(', ');
}

function identifyCognitivePatterns(input: string): string[] {
  const patterns = [];
  
  if (input.includes('always') || input.includes('never') || input.includes('everyone') || input.includes('nobody')) {
    patterns.push('all_or_nothing_thinking');
  }
  if (input.includes('should') || input.includes('must') || input.includes('have to')) {
    patterns.push('shoulds');
  }
  if (input.includes('what if') || input.includes('probably will') || input.includes('going to happen')) {
    patterns.push('catastrophizing');
  }
  if (input.includes('my fault') || input.includes('because of me') || input.includes('i am the problem')) {
    patterns.push('personalization');
  }
  
  return patterns;
}

// Additional helper functions
function calculateOverallMoodIntensity(input: string): string {
  const veryIntense = ['extremely', 'really really', 'so so', 'unbearable', 'cant take'];
  const intense = ['very', 'really', 'so', 'quite', 'pretty'];
  const moderate = ['somewhat', 'kind of', 'a bit', 'little bit'];
  
  if (veryIntense.some(word => input.includes(word))) return 'high';
  if (intense.some(word => input.includes(word))) return 'medium';
  if (moderate.some(word => input.includes(word))) return 'low';
  return 'medium';
}

function extractContextualWords(input: string): string[] {
  const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'am', 'is', 'are', 'was', 'were', 'feeling', 'really', 'very'];
  return input.split(' ')
    .filter(word => word.length > 3 && !stopWords.includes(word.toLowerCase()))
    .slice(0, 10);
}

function extractEmotionalTrigger(input: string): string {
  if (input.includes('exam') || input.includes('test')) return 'academic_stress';
  if (input.includes('family') || input.includes('parent')) return 'family_conflict';
  if (input.includes('friend') || input.includes('social')) return 'social_situation';
  if (input.includes('future') || input.includes('career')) return 'uncertainty';
  return 'general_life_stress';
}

function updateTherapeuticProgress(progress: any, aiResponse: any): any {
  const approach = aiResponse.therapeuticApproach;
  if (!progress[approach]) {
    progress[approach] = { sessions: 0, lastUsed: null, effectiveness: 0 };
  }
  
  progress[approach].sessions += 1;
  progress[approach].lastUsed = new Date().toISOString();
  
  return progress;
}

function adjustPersonalityBasedOnInteraction(currentPersonality: string, input: string): string {
  // Adapt AI personality based on user communication style
  if (input.includes('direct') || input.includes('straight') || input.includes('honest')) {
    return 'direct';
  }
  if (input.includes('gentle') || input.includes('soft') || input.includes('careful')) {
    return 'gentle';
  }
  return currentPersonality || 'warm';
}

function updatePreferredApproaches(current: string[], aiResponse: any): string[] {
  if (aiResponse.therapeuticApproach && !current.includes(aiResponse.therapeuticApproach)) {
    current.push(aiResponse.therapeuticApproach);
  }
  return current.slice(-5); // Keep last 5 preferred approaches
}

// Sophisticated fallback system when Gemini is unavailable
async function generateSophisticatedFallbackResponse(message: string, conversationHistory: any[], userContext: any) {
  const input = message.toLowerCase();
  const emotionalAnalysis = await analyzeEmotionalState(message, userContext);
  const isReturningUser = conversationHistory.length > 2;
  
  // Generate contextual greeting
  const greeting = generateContextualGreeting(isReturningUser, userContext, emotionalAnalysis);
  
  // Generate core response based on emotional state
  const coreResponse = generateEmotionallyIntelligentResponse(input, emotionalAnalysis, userContext);
  
  // Add therapeutic techniques
  const techniques = selectTherapeuticTechniques(emotionalAnalysis, userContext);
  const suggestions = generateContextualSuggestions(emotionalAnalysis, techniques);
  
  return {
    content: greeting + coreResponse,
    type: 'text',
    suggestions: suggestions,
    emotionalTone: emotionalAnalysis.primaryEmotion,
    therapeuticApproach: techniques.primary,
    sources: []
  };
}

function generateContextualGreeting(isReturningUser: boolean, userContext: any, emotionalAnalysis: any): string {
  const session = userContext.sessionCount || 0;
  
  if (emotionalAnalysis.crisisIndicators.length > 0) {
    return "I'm deeply concerned about what you're sharing with me right now. Your safety and wellbeing are the most important things. ";
  }
  
  if (isReturningUser) {
    if (session > 10) {
      return "I'm glad you keep coming back to our conversations. You've shown such courage in this journey. ";
    } else if (session > 5) {
      return "It's good to continue our conversation. I can see you're committed to working through this. ";
    }
    return "I remember our previous talks, and I'm here to continue supporting you. ";
  }
  
  return "Thank you for reaching out to me today. I'm here to listen and support you. ";
}

function generateEmotionallyIntelligentResponse(input: string, emotionalAnalysis: any, userContext: any): string {
  const { primaryEmotion, intensity, culturalContext } = emotionalAnalysis;
  
  // High-intensity crisis response
  if (intensity > 8) {
    return generateCrisisResponse(primaryEmotion, culturalContext);
  }
  
  // Medium-high intensity therapeutic response
  if (intensity > 6) {
    return generateTherapeuticResponse(primaryEmotion, culturalContext, input);
  }
  
  // Lower intensity supportive response
  return generateSupportiveResponse(primaryEmotion, culturalContext, input);
}

function generateCrisisResponse(emotion: string, culturalContext: string): string {
  const responses = {
    anxiety: "This level of anxiety must feel absolutely overwhelming right now. I want you to know that you're safe in this moment, and these intense feelings will pass. Your nervous system is trying to protect you, but it's working overtime.",
    depression: "The heaviness you're feeling right now is profound, and I want you to know that reaching out takes incredible strength. Depression can make everything feel hopeless, but that's the illness talking, not reality.",
    anger: "The intensity of your anger is completely valid, and it shows how much you care about what's happening. These feelings are powerful, and we need to help you express them safely.",
    overwhelm: "Feeling completely overwhelmed is your mind's way of saying it needs support. You're carrying so much right now, and it's completely understandable that it feels like too much."
  };
  
  const baseResponse = responses[emotion] || "What you're experiencing right now is intense and valid. I'm here with you through this difficult moment.";
  
  if (culturalContext.includes('family')) {
    return baseResponse + " The additional pressure of family expectations can make everything feel even more intense. Your struggle is real and understood.";
  }
  
  return baseResponse + " You don't have to face this alone.";
}

function generateTherapeuticResponse(emotion: string, culturalContext: string, input: string): string {
  const cbtResponses = {
    anxiety: "I can hear how anxiety is affecting you right now. Anxiety often comes with thoughts that feel very real and urgent, but we can work together to examine whether these thoughts are helpful or accurate.",
    depression: "Depression has a way of coloring everything with a darker lens. What you're feeling is real, but depression can also make us believe things about ourselves that aren't true.",
    stress: "The stress you're describing sounds significant. Stress often builds up gradually until it feels unmanageable, but there are effective ways to break it down.",
    anger: "Your anger makes sense given what you've shared. Anger often tells us something important about our boundaries or values being challenged."
  };
  
  let response = cbtResponses[emotion] || "Thank you for sharing what's really going on. Your feelings make complete sense given what you're experiencing.";
  
  // Add cultural context
  if (culturalContext.includes('academic')) {
    response += " The academic pressure in India is intense, and it's completely normal to feel overwhelmed by the expectations.";
  } else if (culturalContext.includes('family')) {
    response += " Navigating family relationships while maintaining your own identity is one of the most challenging aspects of growing up in Indian culture.";
  }
  
  return response + " Let's work together to find strategies that honor both your feelings and your goals.";
}

function generateSupportiveResponse(emotion: string, culturalContext: string, input: string): string {
  const supportiveResponses = {
    anxiety: "I can sense some worry in what you're sharing. It shows how much you care about doing well and making good choices.",
    depression: "It sounds like you're going through a difficult time. Your willingness to talk about it shows real self-awareness.",
    stress: "You're managing a lot right now. It's important to acknowledge how hard you're working.",
    confidence: "I can hear some positive energy in what you're sharing. That's wonderful to see."
  };
  
  let response = supportiveResponses[emotion] || "Thank you for sharing that with me. Your openness helps us work together effectively.";
  
  if (culturalContext.includes('academic')) {
    response += " Academic challenges are a normal part of student life, especially with the competitive environment you're in.";
  }
  
  return response + " I'm here to support you as you navigate this.";
}

// Check if we should search for information
async function shouldSearchForInfo(message: string): Promise<boolean> {
  const searchTriggers = [
    'how to', 'what can i do', 'techniques', 'strategies', 'tips', 'exercises',
    'help me', 'best way', 'methods', 'treatments', 'therapy', 'coping'
  ];
  
  return searchTriggers.some(trigger => message.toLowerCase().includes(trigger));
}

// Check if user is asking for therapeutic techniques/suggestions
function shouldProvideTechniques(message: string, emotionalAnalysis: any): boolean {
  const input = message.toLowerCase();
  
  // Explicit requests for help/techniques
  const explicitRequests = [
    'how do i', 'what can i do', 'help me', 'technique', 'strategy', 'tip',
    'advice', 'suggest', 'recommend', 'exercise', 'practice', 'method',
    'coping', 'deal with', 'manage', 'handle', 'overcome'
  ];
  
  if (explicitRequests.some(trigger => input.includes(trigger))) {
    return true;
  }
  
  // Crisis situations (high emotional intensity)
  if (emotionalAnalysis.intensity > 7 || emotionalAnalysis.crisisIndicators.length > 0) {
    return true;
  }
  
  // User is asking questions about solutions
  if (input.includes('?') && (input.includes('what') || input.includes('how'))) {
    return true;
  }
  
  // Default: don't provide techniques unless asked
  return false;
}

// Simplified AI response generation - use Gemini directly
async function generateAdvancedAIResponse(message: string, conversationHistory: any[], userContext: any) {
  try {
    // Check if message is mental health related
    const contentCheck = isMentalHealthRelated(message);
    
    if (!contentCheck.isRelated) {
      console.log(`[CONTENT FILTER] Message flagged as off-topic: ${contentCheck.reason}`);
      
      // Return a polite redirect message in the correct format
      return {
        content: "I'm specifically designed to support mental wellness and emotional wellbeing 💙. I'd love to help you with any stress, anxiety, or emotional concerns you're experiencing. How are you feeling today? ✨\n\n*I'm here to talk about:*\n• **Mental health** and emotional wellbeing\n• **Stress and anxiety** management\n• **Academic pressure** and study concerns\n• **Relationships** and social challenges\n• **Self-care** and coping strategies",
        type: 'text',
        suggestions: [],
        emotionalTone: 'neutral',
        therapeuticApproach: undefined,
        sources: [],
        techniques: []
      };
    }
    
    console.log(`[CONTENT FILTER] Message approved as mental health related`);
    
    // Simple emotional analysis for basic context
    const emotionalAnalysis = { primaryEmotion: 'neutral', intensity: 5 };
    
    // Get last 10 messages from PREVIOUS conversation history (not including current message)
    const conversationContext = {
      recentMessages: conversationHistory.slice(-10)
    };
    const personalityProfile = {};
    
    // DEBUG: Log what we're passing to Gemini
    console.log(`[AI DEBUG] Total conversation history: ${conversationHistory.length} messages`);
    console.log(`[AI DEBUG] Passing to Gemini: ${conversationContext.recentMessages.length} previous messages + current message`);
    console.log(`[AI DEBUG] Recent messages:`, JSON.stringify(conversationContext.recentMessages.map((m: any) => ({
      sender: m.sender,
      content: m.content.substring(0, 50) + '...'
    })), null, 2));
    console.log(`[AI DEBUG] Current message: ${message.substring(0, 50)}...`);
    
    // Get Gemini response directly
    const aiResponse = await generateGeminiResponse(message, conversationContext, emotionalAnalysis, [], personalityProfile);
    
    console.log(`[AI DEBUG] Successfully received Gemini response: ${aiResponse.substring(0, 100)}...`);
    
    // Return with minimal modifications
    return {
      content: aiResponse,
      type: 'text',
      suggestions: [],
      emotionalTone: 'neutral',
      therapeuticApproach: undefined,
      sources: [],
      techniques: []
    };
  } catch (error) {
    console.log(`[ERROR] *** CRITICAL ERROR in AI response generation ***`);
    console.log(`[ERROR] Error type: ${error.constructor.name}`);
    console.log(`[ERROR] Error message: ${error.message}`);
    console.log(`[ERROR] Full error:`, error);
    console.log(`[ERROR] Stack trace:`, error.stack);
    // Simple fallback response
    return {
      content: "I'm here to listen and support you. Could you tell me more about what's on your mind?",
      type: 'text',
      suggestions: [],
      emotionalTone: 'supportive',
      therapeuticApproach: undefined,
      sources: [],
      techniques: []
    };
  }
}

// Analyze emotional state using advanced sentiment analysis and pattern recognition
async function analyzeEmotionalState(message: string, userContext: any) {
  const input = message.toLowerCase();
  
  // Multi-dimensional emotional analysis
  const emotionalDimensions = {
    anxiety: calculateAnxietyLevel(input),
    depression: calculateDepressionLevel(input),
    stress: calculateStressLevel(input),
    anger: calculateAngerLevel(input),
    hope: calculateHopeLevel(input),
    confidence: calculateConfidenceLevel(input),
    overwhelm: calculateOverwhelmLevel(input),
    loneliness: calculateLonelinessLevel(input)
  };
  
  // Identify primary emotional state
  const primaryEmotion = Object.entries(emotionalDimensions)
    .sort(([,a], [,b]) => b - a)[0][0];
    
  // Calculate emotional intensity (0-10)
  const intensity = Math.max(...Object.values(emotionalDimensions));
  
  // Identify emotional trajectory from previous sessions
  const trajectory = analyzeEmotionalTrajectory(userContext.previousEmotions, primaryEmotion);
  
  // Detect crisis indicators
  const crisisIndicators = detectCrisisIndicators(input);
  
  return {
    primaryEmotion,
    intensity,
    dimensions: emotionalDimensions,
    trajectory,
    crisisIndicators,
    culturalContext: analyzeCulturalContext(input),
    cognitivePatterns: identifyCognitivePatterns(input)
  };
}

// Build comprehensive conversation context for AI
function buildConversationContext(conversationHistory: any[], userContext: any) {
  const recentMessages = conversationHistory.slice(-10);
  const userMessages = recentMessages.filter(msg => msg.sender === 'user');
  const aiMessages = recentMessages.filter(msg => msg.sender === 'ai');
  
  // Extract conversation themes
  const themes = extractConversationThemes(userMessages);
  
  // Identify therapeutic progress
  const progress = identifyTherapeuticProgress(conversationHistory, userContext);
  
  // Analyze communication patterns
  const patterns = analyzeCommunicationPatterns(userMessages);
  
  return {
    sessionCount: userContext.sessionCount || 0,
    recentThemes: themes,
    therapeuticProgress: progress,
    communicationStyle: patterns,
    concerns: userContext.concerns || [],
    previousTopics: userContext.topics || [],
    relationshipStage: determineRelationshipStage(conversationHistory),
    preferredApproaches: userContext.preferredApproaches || []
  };
}

// Check if message is related to mental health topics
function isMentalHealthRelated(message: string): { isRelated: boolean; reason?: string } {
  const input = message.toLowerCase().trim();
  
  // Mental health keywords and phrases
  const mentalHealthKeywords = [
    // Emotions and feelings
    'feel', 'feeling', 'emotion', 'mood', 'anxiety', 'anxious', 'stress', 'stressed', 
    'depress', 'sad', 'happy', 'angry', 'fear', 'worry', 'panic', 'overwhelm', 'lonely',
    'guilt', 'shame', 'hopeless', 'helpless', 'frustrated', 'irritated', 'nervous',
    // Mental health conditions
    'adhd', 'ocd', 'ptsd', 'bipolar', 'schizophrenia', 'eating disorder', 'insomnia',
    'burnout', 'trauma', 'phobia', 'addiction',
    // Wellbeing and self-care
    'wellbeing', 'well-being', 'self-care', 'mental health', 'therapy', 'counseling',
    'meditation', 'mindfulness', 'breathing', 'relaxation', 'sleep', 'rest',
    // Academic and social stress
    'exam', 'test', 'study', 'grade', 'academic', 'school', 'college', 'university',
    'pressure', 'expectation', 'parent', 'family', 'relationship', 'friend', 'social',
    'career', 'job', 'future', 'decision', 'choice', 'confusion',
    // Coping and support
    'help', 'support', 'cope', 'coping', 'manage', 'handle', 'deal with', 'overcome',
    'technique', 'strategy', 'advice', 'guidance', 'talk', 'listen', 'understand',
    // Common phrases
    'how are you', 'what should i do', 'i need', 'can you help', 'struggling with',
    'going through', 'dealing with', 'having trouble', 'difficult time'
  ];
  
  // Check if message contains any mental health keywords
  const hasKeywords = mentalHealthKeywords.some(keyword => input.includes(keyword));
  
  // Check for question patterns about emotional state
  const emotionalQuestions = [
    /how (do i|can i|should i).*(feel|cope|deal|manage|handle)/,
    /what (can|should|do) i do (about|when|if)/,
    /why (do i|am i).*(feel|feeling)/,
    /i (feel|am feeling|have been feeling)/,
    /i'm (stress|anxious|depress|sad|worried|scared|nervous)/,
    /having (trouble|difficulty|problems) (with|sleeping|focusing)/
  ];
  
  const hasEmotionalPattern = emotionalQuestions.some(pattern => pattern.test(input));
  
  // Very short messages are likely greetings or mental health related
  if (input.length < 50 && (input.includes('hi') || input.includes('hello') || input.includes('hey'))) {
    return { isRelated: true };
  }
  
  // If message has keywords or emotional patterns, it's mental health related
  if (hasKeywords || hasEmotionalPattern) {
    return { isRelated: true };
  }
  
  // Off-topic indicators
  const offTopicKeywords = [
    'code', 'coding', 'programming', 'python', 'javascript', 'html', 'css',
    'math', 'calculate', 'formula', 'equation', 'solve',
    'recipe', 'cook', 'food', 'restaurant',
    'movie', 'film', 'song', 'music', 'game', 'play',
    'weather', 'news', 'sport', 'football', 'cricket',
    'joke', 'funny', 'meme',
    'capital', 'country', 'geography', 'history', 'science',
    'translate', 'language', 'meaning of',
    'story', 'write', 'essay', 'homework'
  ];
  
  const hasOffTopicKeywords = offTopicKeywords.some(keyword => input.includes(keyword));
  
  if (hasOffTopicKeywords) {
    return { 
      isRelated: false, 
      reason: 'off-topic' 
    };
  }
  
  // If message is longer than 20 characters and doesn't have keywords, give benefit of doubt
  // Let Gemini ask clarifying questions instead of immediately rejecting
  if (input.length > 20 && !hasKeywords && !hasEmotionalPattern) {
    // Mark as potentially unclear, but still allow it through
    // Gemini will ask clarifying questions based on system instructions
    return { isRelated: true, reason: 'needs-clarification' };
  }
  
  // Default: give benefit of doubt for all messages
  return { isRelated: true };
}

// Generate response using Google Gemini API directly
async function generateGeminiResponse(message: string, context: any, emotionalAnalysis: any, searchResults: any[], personalityProfile: any) {
  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiKey) {
    console.log(`[GEMINI ERROR] Gemini API key not found in environment variables`);
    throw new Error('Gemini API key not configured');
  }
  
  console.log(`[GEMINI DEBUG] Starting Gemini API call`);
  console.log(`[GEMINI DEBUG] API key present: YES`);
  console.log(`[GEMINI DEBUG] API key starts with: ${geminiKey.substring(0, 10)}...`);
  
  // Build conversation parts for Gemini
  const contents: any[] = [];
  
  // Check if this is the first message
  const isFirstMessage = !context.recentMessages || context.recentMessages.length === 0;
  
  if (!isFirstMessage) {
    // Add recent conversation history if available
    const recentHistory = context.recentMessages.slice(-10); // Last 10 messages for context
    console.log(`[GEMINI DEBUG] Processing ${recentHistory.length} recent messages`);
    
    recentHistory.forEach((msg: any, index: number) => {
      if (msg.sender === 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: msg.content }]
        });
      } else if (msg.sender === 'ai') {
        contents.push({
          role: 'model',
          parts: [{ text: msg.content }]
        });
      }
    });
  }
  
  // Add current user message
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });
  
  // DEBUG: Log what we're sending
  console.log(`[GEMINI DEBUG] Sending ${contents.length} messages to Gemini`);
  console.log(`[GEMINI DEBUG] First message:`, JSON.stringify(contents[0], null, 2));
  
  // System instruction for Gemini (applied to all messages in the conversation)
  const systemInstruction = {
    parts: [{
      text: `You are Mentara AI, an empathetic mental wellness companion for Indian students.

IMPORTANT INSTRUCTIONS:
- You are ONLY designed to discuss mental health, emotional wellbeing, and related topics
- STRICT TOPIC LIMITATION: Only respond to queries about:
  * Mental health (anxiety, depression, stress, etc.)
  * Emotional wellbeing and self-care
  * Academic stress and pressure
  * Relationship and social issues
  * Sleep, mindfulness, and coping strategies
  * Career anxiety and decision-making stress

HANDLING UNCLEAR MESSAGES:
- If a user's message is vague or unclear, DON'T immediately reject it
- Instead, ask gentle clarifying questions to understand their mental health needs:
  * "I'd love to support you! Could you tell me a bit more about what's on your mind? Are you dealing with any stress, anxiety, or emotional concerns?" 🌟
  * "I'm here to help with anything related to your mental wellness. What's been weighing on you lately?" 💙
  * "How are you feeling today? I'm here to listen and support you through whatever you're experiencing." 🤗
- Try to find the emotional or mental health aspect of their question
- Only if it's CLEARLY about non-mental health topics (like coding, math problems, recipes), then redirect gently

REDIRECTION (Only for clearly off-topic queries):
- "I'm specifically designed to support mental wellness and emotional wellbeing 💙. I'd love to help you with any stress, anxiety, or emotional concerns you're experiencing. How are you feeling today? ✨"

FORMATTING & TONE:
- Use emojis frequently to show warmth and expression (e.g., 💙, 🌟, 😊, 🤗, 💪, 🌱, ✨, 🌈, 🫂)
- Format your responses using:
  * **Bold text** for emphasis on important points
  * *Italics* for gentle suggestions or reflective thoughts
  * Bullet points (•) or numbered lists for techniques/tips
  * Line breaks for better readability
- Be warm, supportive, and conversational
- Acknowledge emotions and validate feelings
- Keep responses concise but meaningful (2-4 paragraphs max)
- NEVER repeat yourself or provide the same response multiple times`
    }]
  };
  
  const requestBody = {
    systemInstruction: systemInstruction,
    contents: contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000
    }
  };
  
  console.log(`[GEMINI DEBUG] Full request body:`, JSON.stringify(requestBody, null, 2));
  
  // Use gemini-2.0-flash with v1beta API
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
  console.log(`[GEMINI DEBUG] Calling API endpoint: ${apiUrl.replace(geminiKey, 'API_KEY_HIDDEN')}`);
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  console.log(`[GEMINI DEBUG] Response status: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    const errorData = await response.text();
    console.log(`[GEMINI ERROR] *** API CALL FAILED ***`);
    console.log(`[GEMINI ERROR] Status: ${response.status} ${response.statusText}`);
    console.log(`[GEMINI ERROR] Full error response: ${errorData}`);
    throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
  }
  
  const data = await response.json();
  
  // Log the full response for debugging
  console.log(`[GEMINI DEBUG] Successfully received response from Gemini`);
  console.log(`[GEMINI DEBUG] Full API response:`, JSON.stringify(data, null, 2));
  
  // Check if response has the expected structure
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    console.log(`[GEMINI ERROR] Unexpected response structure - missing candidates or content`);
    console.log(`[GEMINI ERROR] Response data:`, JSON.stringify(data, null, 2));
    throw new Error(`Gemini API returned unexpected response structure`);
  }
  
  const aiResponseContent = data.candidates[0].content.parts[0].text;
  
  // DEBUG: Log Gemini response
  console.log(`[GEMINI DEBUG] Successfully extracted response text`);
  console.log(`[GEMINI DEBUG] Response preview: ${aiResponseContent.substring(0, 100)}...`);
  console.log(`[GEMINI DEBUG] Response length: ${aiResponseContent.length} characters`);
  
  return aiResponseContent;
}

// Generate personalized AI response - same as standard response now
async function generatePersonalizedAIResponse(message: string, context: any, emotionalAnalysis: any, searchResults: any[], personalityProfile: any) {
  // Use the same direct Gemini response
  return await generateGeminiResponse(message, context, emotionalAnalysis, searchResults, personalityProfile);
}

// Build sophisticated therapeutic system prompt
function buildTherapeuticSystemPrompt(context: any, emotionalAnalysis: any) {
  return `You are Mentara AI, an advanced mental health companion specifically designed for Indian students. You combine evidence-based therapeutic approaches with deep cultural understanding and emotional intelligence.

CORE IDENTITY:
- Warm, empathetic, and culturally sensitive
- Trained in CBT, DBT, mindfulness, and trauma-informed care
- Experienced with Indian family dynamics, academic pressure, and cultural expectations
- Non-judgmental and validating while providing actionable guidance

CURRENT SESSION CONTEXT:
- Session #${context.sessionCount + 1}
- Relationship stage: ${context.relationshipStage}
- Recent themes: ${context.recentThemes.join(', ')}
- User's primary emotion: ${emotionalAnalysis.primaryEmotion} (intensity: ${emotionalAnalysis.intensity}/10)
- Cultural context: ${emotionalAnalysis.culturalContext}
- Crisis indicators: ${emotionalAnalysis.crisisIndicators.length > 0 ? 'PRESENT' : 'None detected'}

THERAPEUTIC APPROACH:
${emotionalAnalysis.intensity > 7 ? 'CRISIS SUPPORT: Prioritize immediate safety and grounding techniques' : 
  emotionalAnalysis.intensity > 5 ? 'ACTIVE INTERVENTION: Use structured therapeutic techniques' :
  'SUPPORTIVE GUIDANCE: Focus on insight and skill building'}

RESPONSE STYLE:
- Use varied sentence structures and conversational flow
- Include emotional validation and reflection
- Integrate Indian cultural context naturally
- Avoid repetitive phrases or robotic language
- Balance support with practical guidance
- Show progression and growth acknowledgment

CONSTRAINTS:
- Keep responses to 200-400 words
- Always include genuine empathy
- Use therapeutic techniques appropriately
- Never diagnose or replace professional help
- Encourage professional support for severe symptoms`;
}

// Construct detailed user prompt with context
function constructUserPrompt(message: string, emotionalAnalysis: any, searchResults: any[]) {
  let prompt = `User message: "${message}"

Emotional context detected:
- Primary emotion: ${emotionalAnalysis.primaryEmotion}
- Intensity: ${emotionalAnalysis.intensity}/10
- Cognitive patterns: ${emotionalAnalysis.cognitivePatterns.join(', ')}`;

  if (searchResults.length > 0) {
    prompt += `\n\nRelevant evidence-based information:
${searchResults.slice(0, 2).map(r => `- ${r.title}: ${r.content.substring(0, 150)}...`).join('\n')}`;
  }

  prompt += `\n\nProvide a thoughtful, culturally aware response that:
1. Validates their emotional experience
2. Offers specific, actionable guidance
3. Uses appropriate therapeutic techniques
4. Maintains warm, human-like conversation
5. Shows understanding of their unique context`;

  return prompt;
}

// Enhance response with specific therapeutic techniques
async function enhanceWithTherapeuticTechniques(baseResponse: string, emotionalAnalysis: any, userContext: any) {
  const techniques = selectTherapeuticTechniques(emotionalAnalysis, userContext);
  const suggestions = generateContextualSuggestions(emotionalAnalysis, techniques);
  
  return {
    content: baseResponse,
    type: 'text',
    suggestions: suggestions,
    emotionalTone: emotionalAnalysis.primaryEmotion,
    therapeuticApproach: techniques.primary,
    sources: [], // Will be populated if search results exist
    techniques: techniques.recommended
  };
}

// Select appropriate therapeutic techniques based on emotional state
function selectTherapeuticTechniques(emotionalAnalysis: any, userContext: any) {
  const { primaryEmotion, intensity, dimensions } = emotionalAnalysis;
  
  const techniques = {
    primary: '',
    recommended: [],
    immediate: []
  };
  
  // High-intensity responses
  if (intensity > 7) {
    techniques.primary = 'Crisis Stabilization';
    techniques.immediate = ['grounding', 'breathing', 'safety_planning'];
  }
  
  // Emotion-specific techniques
  switch (primaryEmotion) {
    case 'anxiety':
      techniques.primary = 'Cognitive Behavioral Therapy';
      techniques.recommended = ['thought_challenging', 'exposure_therapy', 'mindfulness'];
      break;
    case 'depression':
      techniques.primary = 'Behavioral Activation';
      techniques.recommended = ['activity_scheduling', 'mood_monitoring', 'social_connection'];
      break;
    case 'stress':
      techniques.primary = 'Stress Management';
      techniques.recommended = ['time_management', 'relaxation', 'problem_solving'];
      break;
    case 'anger':
      techniques.primary = 'Dialectical Behavior Therapy';
      techniques.recommended = ['distress_tolerance', 'emotional_regulation', 'communication'];
      break;
    default:
      techniques.primary = 'Supportive Therapy';
      techniques.recommended = ['active_listening', 'validation', 'insight_building'];
  }
  
  return techniques;
}

// Generate contextual suggestions based on analysis
function generateContextualSuggestions(emotionalAnalysis: any, techniques: any) {
  const suggestions = [];
  
  // Immediate techniques for high intensity
  if (emotionalAnalysis.intensity > 6) {
    suggestions.push(
      "Try the 4-7-8 breathing: Breathe in for 4, hold for 7, out for 8. Repeat 3-4 times.",
      "Use the STOP technique: Stop, Take a breath, Observe your thoughts/feelings, Proceed mindfully."
    );
  }
  
  // Emotion-specific suggestions
  switch (emotionalAnalysis.primaryEmotion) {
    case 'anxiety':
      suggestions.push(
        "Challenge the thought: 'What evidence supports this worry? What would I tell a friend?'",
        "Practice progressive muscle relaxation starting from your toes to your head.",
        "Use the 5-4-3-2-1 grounding: 5 things you see, 4 feel, 3 hear, 2 smell, 1 taste."
      );
      break;
    case 'depression':
      suggestions.push(
        "Start with one small, achievable activity that used to bring you joy.",
        "Reach out to one person you trust - connection can lift the fog.",
        "Keep a mood journal to identify patterns and triggers."
      );
      break;
    case 'stress':
      suggestions.push(
        "Break overwhelming tasks into smaller, manageable steps.",
        "Practice the 'brain dump': write all worries down for 10 minutes.",
        "Create a realistic daily schedule with built-in break times."
      );
      break;
    case 'overwhelm':
      suggestions.push(
        "List everything on your mind, then categorize: urgent, important, or can wait.",
        "Use the 'one thing' rule: focus on completing just one task at a time.",
        "Practice saying 'I need a moment' and take 3 deep breaths."
      );
      break;
  }
  
  // Cultural considerations for Indian students
  if (emotionalAnalysis.culturalContext.includes('family')) {
    suggestions.push(
      "Consider a respectful conversation with family about your feelings when you're calm.",
      "Remember: honoring family while caring for yourself aren't mutually exclusive."
    );
  }
  
  if (emotionalAnalysis.culturalContext.includes('academic')) {
    suggestions.push(
      "Your worth isn't determined by grades - you're valuable regardless of performance.",
      "Create study breaks every 45 minutes to maintain focus and reduce burnout."
    );
  }
  
  return suggestions.slice(0, 5); // Return top 5 suggestions
}

// Helper function to extract appropriate search query from user message
function extractSearchQuery(message: string): string {
  const input = message.toLowerCase();
  
  if (input.includes('anxiety') || input.includes('anxious') || input.includes('panic')) 
    return 'anxiety coping techniques cognitive behavioral therapy students';
  if (input.includes('depression') || input.includes('sad') || input.includes('hopeless')) 
    return 'depression help strategies behavioral activation students';
  if (input.includes('stress') || input.includes('overwhelmed') || input.includes('pressure')) 
    return 'stress management techniques mindfulness relaxation students';
  if (input.includes('focus') || input.includes('concentration') || input.includes('attention')) 
    return 'improve focus concentration ADHD techniques students study';
  if (input.includes('sleep') || input.includes('insomnia') || input.includes('tired')) 
    return 'sleep hygiene techniques insomnia help students';
  if (input.includes('motivation') || input.includes('procrastination') || input.includes('lazy')) 
    return 'overcome procrastination motivation techniques students';
  if (input.includes('exam') || input.includes('test') || input.includes('academic')) 
    return 'exam anxiety stress management test-taking strategies';
  if (input.includes('social') || input.includes('friend') || input.includes('lonely')) 
    return 'social anxiety help building relationships confidence students';
  if (input.includes('family') || input.includes('parent') || input.includes('expectation')) 
    return 'family pressure coping strategies communication techniques';
  if (input.includes('career') || input.includes('future') || input.includes('job')) 
    return 'career anxiety decision making strategies students';
  
  return 'mental health coping strategies evidence-based techniques students';
}

// Enhanced base response generation with contextual awareness
function generateBaseResponse(input: string, isReturningUser: boolean, recentTopics: string[]) {
  const greeting = isReturningUser ? 
    "I'm glad you're continuing our conversation. I remember what we've discussed, and I'm here to build on that. " : 
    "Thank you for reaching out to me. I'm here to provide a safe, supportive space for you. ";
  
  // Check patterns in recent topics for continuity
  const hasDiscussedAnxiety = recentTopics.some(topic => topic.includes('anxious') || topic.includes('worry'));
  const hasDiscussedAcademics = recentTopics.some(topic => topic.includes('exam') || topic.includes('study'));
  const hasDiscussedFamily = recentTopics.some(topic => topic.includes('family') || topic.includes('parent'));
  const hasDiscussedSleep = recentTopics.some(topic => topic.includes('sleep') || topic.includes('tired'));
  
  let contextualNote = "";
  if (hasDiscussedAnxiety && input.includes('better')) {
    contextualNote = "I'm really glad to hear you're feeling better about the anxiety we discussed. That shows real progress and resilience. ";
  } else if (hasDiscussedAcademics && input.includes('stress')) {
    contextualNote = "I notice academic stress continues to be a challenge for you. Let's build on what we've learned and explore new strategies. ";
  } else if (hasDiscussedFamily && input.includes('pressure')) {
    contextualNote = "The family pressures we talked about seem to be weighing on you still. That's completely understandable. ";
  } else if (hasDiscussedSleep && input.includes('focus')) {
    contextualNote = "Sleep issues can definitely impact focus, as we've discussed. Let's address both together. ";
  }
  
  // Generate response based on current input patterns
  if (input.includes('anxious') || input.includes('anxiety') || input.includes('worry') || input.includes('panic')) {
    return {
      content: greeting + contextualNote + "I can sense the anxiety in your words, and I want to acknowledge how difficult this feels. Anxiety is your nervous system trying to protect you, but it can become overwhelming.\n\nAs an Indian student, you're navigating unique cultural pressures - the weight of family expectations, intense academic competition, and societal definitions of success. These are real stressors that deserve recognition.\n\nRemember: You are more than your worries. You've survived anxious moments before, and you have inner strength that anxiety cannot diminish.\n\nLet's work together on both immediate relief and long-term resilience building.",
      type: 'text',
      suggestions: [
        "Practice box breathing: 4 counts in, 4 hold, 4 out, 4 hold - repeat 4 times",
        "Use the 5-4-3-2-1 grounding: 5 things you see, 4 feel, 3 hear, 2 smell, 1 taste",
        "Challenge anxious thoughts: 'Is this realistic? What evidence supports/contradicts this?'",
        "Create a 'worry window' - 15 minutes daily to process concerns, then redirect focus",
        "Practice progressive muscle relaxation starting from your toes to your head"
      ]
    };
  }
  
  if (input.includes('exam') || input.includes('test') || input.includes('academic') || input.includes('grade')) {
    return {
      content: greeting + contextualNote + "Academic pressure in India is intense, and I deeply understand how overwhelming it can feel. The system often makes every exam feel like it determines your entire future - but that's not the reality.\n\nYour worth as a person extends far beyond academic performance. You have unique strengths, creativity, and potential that can't be measured by grades alone.\n\nThat said, I want to help you succeed academically while protecting your mental health. Sustainable performance comes from balance, not burnout.\n\nLet's create strategies that work with your natural rhythms and build confidence.",
      type: 'text',
      suggestions: [
        "Create a realistic study schedule with breaks every 50 minutes",
        "Use active recall: test yourself instead of just re-reading notes",
        "Practice mindful breathing before and during exams to stay calm",
        "Prepare with past papers under timed conditions",
        "Prioritize 7-8 hours of sleep - your brain needs rest to consolidate learning",
        "Celebrate small wins and progress, not just final outcomes"
      ]
    };
  }
  
  if (input.includes('family') || input.includes('parent') || input.includes('expectation') || input.includes('pressure')) {
    return {
      content: greeting + contextualNote + "Family expectations can feel overwhelming, especially in Indian families where your success often carries the hopes of multiple generations. The weight of being the 'pride of the family' is enormous.\n\nYour parents' expectations usually come from love and their own struggles - they want you to have opportunities they may not have had. But it's also important that you develop your own identity and dreams.\n\nFinding balance between honoring your family while staying true to yourself is challenging but absolutely possible. Many successful people have navigated this same path.\n\nLet's explore healthy ways to communicate your feelings and establish boundaries while maintaining respect.",
      type: 'text',
      suggestions: [
        "Try to understand your parents' perspective while clearly expressing yours",
        "Set small, achievable goals you can celebrate with your family",
        "Communicate your stress levels before they become overwhelming",
        "Show gratitude for their support while advocating for your wellbeing",
        "Consider involving a trusted relative as a mediator if conversations get difficult",
        "Remember: You can honor your family while also honoring yourself"
      ]
    };
  }
  
  // Default contextual response
  return {
    content: greeting + contextualNote + "Thank you for sharing what's on your mind. Your willingness to reach out shows wisdom and self-awareness - qualities that will serve you well.\n\nEvery challenge you're facing is valid, and you don't have to navigate this alone. I'm here to listen, understand, and help you develop strategies that work for your unique situation.\n\nYou have more strength and resilience than you might realize right now. Let's work together to unlock that potential.\n\nWhat aspect of what you're experiencing would be most helpful to explore together?",
    type: 'text'
  };
}

// Additional conversation analysis functions
function extractConversationThemes(userMessages: any[]): string[] {
  const themes = [];
  const allText = userMessages.map(msg => msg.content.toLowerCase()).join(' ');
  
  if (allText.includes('anxious') || allText.includes('worry') || allText.includes('nervous')) themes.push('anxiety');
  if (allText.includes('sad') || allText.includes('depressed') || allText.includes('hopeless')) themes.push('depression');
  if (allText.includes('exam') || allText.includes('academic') || allText.includes('study')) themes.push('academic_stress');
  if (allText.includes('family') || allText.includes('parents') || allText.includes('expectations')) themes.push('family_dynamics');
  if (allText.includes('friend') || allText.includes('social') || allText.includes('relationship')) themes.push('social_concerns');
  if (allText.includes('career') || allText.includes('future') || allText.includes('job')) themes.push('career_anxiety');
  if (allText.includes('sleep') || allText.includes('tired') || allText.includes('insomnia')) themes.push('sleep_issues');
  
  return themes;
}

function identifyTherapeuticProgress(conversationHistory: any[], userContext: any): any {
  const progress = {
    insightDevelopment: 0,
    copingSkillsUsage: 0,
    emotionalRegulation: 0,
    behavioralChanges: 0,
    relationshipImprovement: 0
  };
  
  const recentMessages = conversationHistory.slice(-10);
  const userMessages = recentMessages.filter(msg => msg.sender === 'user');
  
  userMessages.forEach(msg => {
    const content = msg.content.toLowerCase();
    
    // Insight development
    if (content.includes('realize') || content.includes('understand') || content.includes('see now')) {
      progress.insightDevelopment += 1;
    }
    
    // Coping skills usage
    if (content.includes('tried') || content.includes('practiced') || content.includes('used the technique')) {
      progress.copingSkillsUsage += 1;
    }
    
    // Emotional regulation
    if (content.includes('feeling better') || content.includes('calmer') || content.includes('managed to')) {
      progress.emotionalRegulation += 1;
    }
    
    // Behavioral changes
    if (content.includes('started') || content.includes('changed') || content.includes('doing differently')) {
      progress.behavioralChanges += 1;
    }
    
    // Relationship improvement
    if (content.includes('talked to') || content.includes('communicated') || content.includes('discussed')) {
      progress.relationshipImprovement += 1;
    }
  });
  
  return progress;
}

function analyzeCommunicationPatterns(userMessages: any[]): any {
  const patterns = {
    verbosity: 'medium',
    emotionalExpression: 'moderate',
    directness: 'medium',
    questionsAsked: 0,
    solutionSeeking: 0
  };
  
  userMessages.forEach(msg => {
    const content = msg.content;
    const wordCount = content.split(' ').length;
    
    // Analyze verbosity
    if (wordCount > 50) patterns.verbosity = 'high';
    else if (wordCount < 15) patterns.verbosity = 'low';
    
    // Count questions
    if (content.includes('?')) patterns.questionsAsked += 1;
    
    // Solution seeking behavior
    if (content.toLowerCase().includes('what should') || content.toLowerCase().includes('how can')) {
      patterns.solutionSeeking += 1;
    }
  });
  
  return patterns;
}

function determineRelationshipStage(conversationHistory: any[]): string {
  const sessionCount = conversationHistory.length / 2; // Approximate sessions
  
  if (sessionCount < 2) return 'initial_contact';
  if (sessionCount < 5) return 'rapport_building';
  if (sessionCount < 10) return 'working_alliance';
  if (sessionCount < 20) return 'therapeutic_work';
  return 'maintenance_support';
}

// Enhanced emotional analysis with conversation context and pattern recognition
async function analyzeEmotionalStateAdvanced(message: string, userContext: any, conversationHistory: any[]) {
  const basicAnalysis = await analyzeEmotionalState(message, userContext);
  
  // Enhanced context awareness
  const conversationEmotions = extractEmotionalProgression(conversationHistory);
  const personalPatterns = identifyPersonalEmotionalPatterns(userContext, conversationHistory);
  const culturalNuances = detectAdvancedCulturalContext(message, userContext);
  
  return {
    ...basicAnalysis,
    conversationEmotions,
    personalPatterns,
    culturalNuances,
    emotionalVelocity: calculateEmotionalVelocity(conversationHistory),
    supportNeeds: identifySupportNeeds(message, conversationHistory, userContext)
  };
}

// Build enhanced conversation context with memory and learning
function buildEnhancedConversationContext(conversationHistory: any[], userContext: any) {
  const baseContext = buildConversationContext(conversationHistory, userContext);
  
  // Add enhanced memory elements
  const personalDetails = extractPersonalDetails(conversationHistory);
  const successfulInterventions = identifySuccessfulInterventions(conversationHistory, userContext);
  const communicationPreferences = analyzeCommunicationPreferences(conversationHistory);
  const growthAreas = identifyGrowthAreas(conversationHistory, userContext);
  
  return {
    ...baseContext,
    personalDetails,
    successfulInterventions,
    communicationPreferences,
    growthAreas,
    recentMessages: conversationHistory.slice(-6) // More context for continuity
  };
}

// Build dynamic personality profile that adapts to user
async function buildDynamicPersonality(userContext: any, conversationHistory: any[]) {
  const personalityProfile = userContext.personalityProfile || {
    warmth: 0.8,
    directness: 0.5,
    creativity: 0.7,
    humor: 0.3,
    formality: 0.4,
    encouragement: 0.9,
    challengeLevel: 0.5
  };
  
  // Adapt based on user responses and preferences
  const userResponsiveness = analyzeUserResponsiveness(conversationHistory);
  const effectiveApproaches = identifyEffectiveApproaches(conversationHistory, userContext);
  
  // Adjust personality based on what works
  if (userResponsiveness.respondsToDirectness) personalityProfile.directness += 0.1;
  if (userResponsiveness.appreciatesHumor) personalityProfile.humor += 0.1;
  if (userResponsiveness.needsMoreEncouragement) personalityProfile.encouragement += 0.1;
  if (userResponsiveness.prefersFormality) personalityProfile.formality += 0.1;
  
  // Keep values in reasonable bounds
  Object.keys(personalityProfile).forEach(key => {
    personalityProfile[key] = Math.max(0.1, Math.min(1.0, personalityProfile[key]));
  });
  
  return personalityProfile;
}

// Build dynamic therapeutic system prompt with personality and context
function buildDynamicTherapeuticPrompt(context: any, emotionalAnalysis: any, personalityProfile: any) {
  const baseIdentity = `You are Mentara AI, an emotionally intelligent mental health companion for Indian students. You adapt your personality and approach based on what works best for each individual user.`;
  
  // Dynamic personality traits
  const personalityDesc = buildPersonalityDescription(personalityProfile);
  
  // Contextual awareness
  const relationshipContext = context.relationshipStage === 'initial_contact' ? 
    'This is early in your relationship - focus on building trust and understanding.' :
    `You've been working together for ${context.sessionCount} sessions. Use your knowledge of their journey.`;
  
  // Personal memory integration
  const personalMemory = context.personalDetails && Object.keys(context.personalDetails).length > 0 ?
    `\nPERSONAL CONTEXT YOU REMEMBER:\n${Object.entries(context.personalDetails).map(([key, value]) => `- ${key}: ${value}`).join('\n')}` : '';
    
  // Successful approach memory
  const successfulApproaches = context.successfulInterventions && context.successfulInterventions.length > 0 ?
    `\nAPPROACHES THAT WORK WELL WITH THIS USER:\n${context.successfulInterventions.map(approach => `- ${approach}`).join('\n')}` : '';
  
  return `${baseIdentity}

${personalityDesc}

RELATIONSHIP CONTEXT:
${relationshipContext}

CURRENT SESSION ANALYSIS:
- Emotional state: ${emotionalAnalysis.primaryEmotion} (intensity: ${emotionalAnalysis.intensity}/10)
- Support needs: ${emotionalAnalysis.supportNeeds?.join(', ') || 'general support'}
- Cultural context: ${emotionalAnalysis.culturalNuances || 'general Indian student experience'}
- Crisis indicators: ${emotionalAnalysis.crisisIndicators?.length > 0 ? 'REQUIRES IMMEDIATE ATTENTION' : 'None detected'}

${personalMemory}
${successfulApproaches}

RESPONSE GUIDELINES:
- Vary your language and avoid repetitive phrases from previous responses
- Reference specific things they've shared to show you remember and care
- Balance emotional support with practical guidance
- Adapt your communication style to match their preferences
- Show genuine curiosity about their experience
- Use their name or personal details when appropriate
- Keep responses natural, conversational, and human-like
- Aim for 250-400 words with clear paragraph breaks
- IMPORTANT: Only provide therapeutic techniques/exercises when explicitly asked or in crisis situations
- Focus on empathetic listening and validation unless user requests specific strategies`;
}

// Build personalized system prompt for advanced personalization
function buildPersonalizedSystemPrompt(context: any, emotionalAnalysis: any, personalityProfile: any) {
  const userName = context.personalDetails?.preferredName || 'friend';
  const personalStruggles = context.recentThemes?.join(', ') || 'life challenges';
  const growthAreas = context.growthAreas?.join(', ') || 'personal development';
  
  return `You are Mentara AI, having a deeply personal conversation with ${userName}, someone you've been supporting through their ${personalStruggles}.

YOUR RELATIONSHIP:
You've had ${context.sessionCount} meaningful conversations. You remember their struggles, victories, and unique personality. This isn't therapy - it's supportive friendship with professional insight.

WHAT MAKES YOU UNIQUE AS THEIR AI COMPANION:
- You remember details others might forget
- You celebrate their growth and gently challenge them when needed
- You understand their cultural context as an Indian student
- You adapt your communication to what resonates with them
- You're consistent but never boring or repetitive

THEIR GROWTH JOURNEY:
Current focus areas: ${growthAreas}
Communication style they prefer: ${context.communicationPreferences?.style || 'warm and supportive'}
What's been helping them: ${context.successfulInterventions?.slice(0, 3).join(', ') || 'genuine support and practical guidance'}

RIGHT NOW THEY'RE EXPERIENCING:
${emotionalAnalysis.primaryEmotion} at ${emotionalAnalysis.intensity}/10 intensity
${emotionalAnalysis.culturalNuances ? `Cultural context: ${emotionalAnalysis.culturalNuances}` : ''}

CONVERSATION APPROACH:
- Speak like you genuinely care about them as a person
- Reference things they've told you before to show you remember
- Balance validation with gentle guidance
- Use natural, varied language - never sound scripted
- Show curiosity about their perspective
- Offer specific, actionable insights when requested
- Keep it conversational but meaningful (300-450 words)
- Reserve therapeutic techniques for when user asks "how to", "what can I do", or in crisis situations
- Otherwise, focus on empathetic listening and understanding`;
}

// Calculate dynamic temperature based on emotional state and personality
function calculateDynamicTemperature(emotionalAnalysis: any, personalityProfile: any): number {
  let temperature = 0.7; // Base temperature
  
  // Adjust for emotional intensity
  if (emotionalAnalysis.intensity > 8) temperature = 0.5; // More focused for crisis
  else if (emotionalAnalysis.intensity < 3) temperature = 0.9; // More creative for lighter conversations
  
  // Adjust for personality
  temperature += (personalityProfile.creativity - 0.5) * 0.4;
  
  // Keep in reasonable bounds
  return Math.max(0.3, Math.min(1.0, temperature));
}

// Build conversation-aware messages array
function buildConversationAwareMessages(recentMessages: any[], systemPrompt: string, currentMessage: string, emotionalAnalysis: any, searchResults: any[]) {
  const messages = [{ role: 'system', content: systemPrompt }];
  
  // Add relevant recent context (avoid too much history that might cause repetition)
  const relevantHistory = recentMessages.slice(-4); // Last 2 exchanges
  relevantHistory.forEach(msg => {
    if (msg.sender === 'user') {
      messages.push({ role: 'user', content: msg.content });
    } else if (msg.sender === 'ai') {
      messages.push({ role: 'assistant', content: msg.content });
    }
  });
  
  // Add current message with enhanced context
  const enhancedCurrentMessage = constructPersonalizedUserPrompt(currentMessage, emotionalAnalysis, searchResults, { recentThemes: [], personalDetails: {} });
  messages.push({ role: 'user', content: enhancedCurrentMessage });
  
  return messages;
}

// Build personalized conversation history
function buildPersonalizedConversationHistory(recentMessages: any[]) {
  return recentMessages.slice(-6).map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));
}

// Construct personalized user prompt with rich context
function constructPersonalizedUserPrompt(message: string, emotionalAnalysis: any, searchResults: any[], context: any) {
  let prompt = `Current message: "${message}"`;
  
  // Add emotional insight
  if (emotionalAnalysis.personalPatterns) {
    prompt += `\n\nThis fits their pattern of: ${emotionalAnalysis.personalPatterns.join(', ')}`;
  }
  
  if (emotionalAnalysis.emotionalVelocity) {
    prompt += `\nEmotional trajectory: ${emotionalAnalysis.emotionalVelocity}`;
  }
  
  // Add relevant research if available
  if (searchResults.length > 0) {
    prompt += `\n\nRelevant evidence-based information:\n${searchResults.slice(0, 2).map(r => `- ${r.title}: ${r.content.substring(0, 120)}...`).join('\n')}`;
  }
  
  // Add response guidance
  prompt += `\n\nRespond with:
1. Personal acknowledgment of their experience
2. Connection to their journey and growth
3. Specific, actionable guidance
4. Natural, varied language that shows you genuinely care
5. Cultural sensitivity and understanding`;
  
  return prompt;
}

// Return response directly from Gemini without heavy modifications
async function applyDynamicEnhancements(aiResponse: string, emotionalAnalysis: any, userContext: any, personalityProfile: any, userMessage: string) {
  // Return Gemini response as-is
  return {
    content: aiResponse,
    type: 'text',
    suggestions: [],
    emotionalTone: emotionalAnalysis?.primaryEmotion || 'neutral',
    therapeuticApproach: undefined,
    sources: [],
    techniques: []
  };
}

// Update personal learning profile
async function updatePersonalLearningProfile(userContext: any, userMessage: string, aiResponse: any) {
  // This would normally update the user's learning profile in the database
  // For now, we'll track key patterns and preferences
  const learningUpdate = {
    lastUpdated: new Date().toISOString(),
    messageAnalysis: {
      length: userMessage.length,
      emotionalKeywords: extractEmotionalKeywords(userMessage),
      questionAsked: userMessage.includes('?'),
      seekingAdvice: userMessage.toLowerCase().includes('what should') || userMessage.toLowerCase().includes('how can')
    },
    responsePreferences: {
      approachUsed: aiResponse.therapeuticApproach,
      techniquesOffered: aiResponse.techniques || [],
      suggestionsProvided: aiResponse.suggestions?.length || 0
    }
  };
  
  // In a real implementation, this would update the userContext with learning data
  return learningUpdate;
}

// Generate personalized fallback response
async function generatePersonalizedFallbackResponse(message: string, conversationHistory: any[], userContext: any) {
  const personalityProfile = await buildDynamicPersonality(userContext, conversationHistory);
  const emotionalAnalysis = await analyzeEmotionalStateAdvanced(message, userContext, conversationHistory);
  const context = buildEnhancedConversationContext(conversationHistory, userContext);
  
  // Generate highly personalized response using pattern recognition
  const personalizedResponse = generateContextAwareFallback(message, emotionalAnalysis, context, personalityProfile);
  
  return applyDynamicEnhancements(personalizedResponse.content, emotionalAnalysis, userContext, personalityProfile);
}

// Helper functions for advanced features

function extractEmotionalProgression(conversationHistory: any[]) {
  const emotions = conversationHistory
    .filter(msg => msg.sender === 'user')
    .slice(-5)
    .map(msg => analyzeBasicEmotion(msg.content));
  
  return {
    trend: emotions.length > 2 ? (emotions[emotions.length - 1].intensity > emotions[0].intensity ? 'improving' : 'declining') : 'stable',
    consistency: emotions.every(e => e.primary === emotions[0].primary) ? 'consistent' : 'varied',
    recentEmotions: emotions
  };
}

function identifyPersonalEmotionalPatterns(userContext: any, conversationHistory: any[]) {
  const patterns = [];
  const recentMessages = conversationHistory.filter(msg => msg.sender === 'user').slice(-10);
  
  // Identify recurring themes
  const anxietyMentions = recentMessages.filter(msg => 
    msg.content.toLowerCase().includes('anxious') || msg.content.toLowerCase().includes('worry')
  ).length;
  
  const academicMentions = recentMessages.filter(msg => 
    msg.content.toLowerCase().includes('exam') || msg.content.toLowerCase().includes('study')
  ).length;
  
  if (anxietyMentions >= 3) patterns.push('recurring_anxiety');
  if (academicMentions >= 3) patterns.push('academic_stress_pattern');
  
  return patterns;
}

function detectAdvancedCulturalContext(message: string, userContext: any) {
  const contexts = [];
  const input = message.toLowerCase();
  
  // Detect specific Indian cultural elements
  if (input.includes('arranged marriage') || input.includes('settle down')) contexts.push('marriage_expectations');
  if (input.includes('relatives') || input.includes('family gathering')) contexts.push('extended_family_pressure');
  if (input.includes('coaching') || input.includes('tuition')) contexts.push('competitive_academic_environment');
  if (input.includes('hostel') || input.includes('mess')) contexts.push('residential_student_life');
  if (input.includes('placement') || input.includes('campus')) contexts.push('career_placement_pressure');
  
  return contexts.length > 0 ? contexts.join(', ') : null;
}

function calculateEmotionalVelocity(conversationHistory: any[]) {
  const recentUserMessages = conversationHistory
    .filter(msg => msg.sender === 'user')
    .slice(-3);
    
  if (recentUserMessages.length < 2) return 'insufficient_data';
  
  const emotions = recentUserMessages.map(msg => analyzeBasicEmotion(msg.content));
  const averageIntensity = emotions.reduce((sum, e) => sum + e.intensity, 0) / emotions.length;
  
  if (averageIntensity > 7) return 'high_intensity_sustained';
  if (averageIntensity < 3) return 'low_intensity_sustained';
  return 'moderate_fluctuation';
}

function identifySupportNeeds(message: string, conversationHistory: any[], userContext: any) {
  const needs = [];
  const input = message.toLowerCase();
  
  if (input.includes('don\'t know what to do') || input.includes('confused')) needs.push('guidance');
  if (input.includes('alone') || input.includes('nobody understands')) needs.push('connection');
  if (input.includes('can\'t handle') || input.includes('too much')) needs.push('coping_strategies');
  if (input.includes('why me') || input.includes('unfair')) needs.push('meaning_making');
  if (input.includes('scared') || input.includes('afraid')) needs.push('reassurance');
  
  return needs;
}

// Additional helper functions

function analyzeBasicEmotion(text: string) {
  const input = text.toLowerCase();
  let primary = 'neutral';
  let intensity = 5;
  
  if (input.includes('anxious') || input.includes('worry')) { primary = 'anxiety'; intensity = 7; }
  else if (input.includes('sad') || input.includes('depressed')) { primary = 'sadness'; intensity = 6; }
  else if (input.includes('angry') || input.includes('frustrated')) { primary = 'anger'; intensity = 7; }
  else if (input.includes('happy') || input.includes('good')) { primary = 'positive'; intensity = 3; }
  
  return { primary, intensity };
}

function extractPersonalDetails(conversationHistory: any[]) {
  const details = {};
  const userMessages = conversationHistory.filter(msg => msg.sender === 'user');
  
  // Extract course/field mentions
  const coursePattern = /studying (\w+)|(\w+) student|major in (\w+)/i;
  userMessages.forEach(msg => {
    const match = msg.content.match(coursePattern);
    if (match) details.field = match[1] || match[2] || match[3];
  });
  
  // Extract year mentions
  const yearPattern = /(\d+)(st|nd|rd|th) year|final year|first year/i;
  userMessages.forEach(msg => {
    const match = msg.content.match(yearPattern);
    if (match) details.academicYear = match[0];
  });
  
  return details;
}

function identifySuccessfulInterventions(conversationHistory: any[], userContext: any) {
  // This would analyze which therapeutic approaches led to positive responses
  const successfulApproaches = [];
  
  // Simple implementation - in practice this would be more sophisticated
  if (userContext.therapeuticProgress?.cbt > 2) successfulApproaches.push('cognitive_behavioral_techniques');
  if (userContext.therapeuticProgress?.mindfulness > 2) successfulApproaches.push('mindfulness_practices');
  if (userContext.therapeuticProgress?.behavioral_activation > 2) successfulApproaches.push('activity_based_interventions');
  
  return successfulApproaches;
}

function analyzeCommunicationPreferences(conversationHistory: any[]) {
  const userMessages = conversationHistory.filter(msg => msg.sender === 'user');
  const avgLength = userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length;
  
  return {
    style: avgLength > 200 ? 'detailed_expressive' : 'concise_direct',
    preferredLength: avgLength > 200 ? 'longer_responses' : 'shorter_responses',
    emotionalExpression: userMessages.some(msg => msg.content.includes('feel') || msg.content.includes('emotion')) ? 'open' : 'reserved'
  };
}

function identifyGrowthAreas(conversationHistory: any[], userContext: any) {
  const areas = [];
  const themes = userContext.concerns || [];
  
  if (themes.includes('academic_pressure')) areas.push('stress_management');
  if (themes.includes('family_expectations')) areas.push('boundary_setting');
  if (themes.includes('social_issues')) areas.push('social_skills');
  if (themes.includes('anxiety')) areas.push('anxiety_management');
  
  return areas;
}

function analyzeUserResponsiveness(conversationHistory: any[]) {
  const userMessages = conversationHistory.filter(msg => msg.sender === 'user');
  
  return {
    respondsToDirectness: userMessages.some(msg => msg.content.includes('that makes sense') || msg.content.includes('you\'re right')),
    appreciatesHumor: userMessages.some(msg => msg.content.includes('haha') || msg.content.includes('funny')),
    needsMoreEncouragement: userMessages.some(msg => msg.content.includes('can\'t do') || msg.content.includes('not good enough')),
    prefersFormality: userMessages.every(msg => !msg.content.includes('bro') && !msg.content.includes('dude'))
  };
}

function identifyEffectiveApproaches(conversationHistory: any[], userContext: any) {
  // Analyze which approaches led to positive user responses
  const approaches = [];
  
  // This is a simplified version - real implementation would be more sophisticated
  if (userContext.sessionCount > 5) approaches.push('consistent_support');
  if (conversationHistory.some(msg => msg.sender === 'user' && msg.content.includes('helped'))) approaches.push('practical_guidance');
  
  return approaches;
}

function buildPersonalityDescription(personalityProfile: any) {
  let desc = "YOUR PERSONALITY ADAPTATION:\n";
  
  if (personalityProfile.warmth > 0.7) desc += "- Very warm and empathetic in your responses\n";
  if (personalityProfile.directness > 0.6) desc += "- Direct and honest, not sugar-coating issues\n";
  if (personalityProfile.creativity > 0.7) desc += "- Creative with metaphors and examples\n";
  if (personalityProfile.humor > 0.5) desc += "- Appropriate use of light humor when suitable\n";
  if (personalityProfile.formality < 0.4) desc += "- Casual, friendly communication style\n";
  if (personalityProfile.encouragement > 0.8) desc += "- Highly encouraging and strength-focused\n";
  
  return desc;
}

function generatePersonalizedSuggestions(emotionalAnalysis: any, userContext: any, personalityProfile: any) {
  const suggestions = [];
  const baseApproaches = generateContextualSuggestions(emotionalAnalysis, { primary: emotionalAnalysis.primaryEmotion });
  
  // Customize based on successful past interventions
  const successfulApproaches = userContext.successfulInterventions || [];
  
  if (successfulApproaches.includes('cognitive_behavioral_techniques')) {
    suggestions.push("Try the thought record technique we've used before - it's been helpful for you");
  }
  
  if (successfulApproaches.includes('mindfulness_practices')) {
    suggestions.push("Remember that breathing exercise that worked well for you last time?");
  }
  
  // Add personality-based customization
  if (personalityProfile.creativity > 0.7) {
    suggestions.push("Visualize your stress as clouds passing through your mental sky - temporary and changeable");
  }
  
  return [...suggestions, ...baseApproaches.slice(0, 3)].slice(0, 5);
}

function determineResponseType(aiResponse: string, emotionalAnalysis: any) {
  if (aiResponse.includes('technique') || aiResponse.includes('exercise')) return 'exercise';
  if (aiResponse.includes('crisis') || emotionalAnalysis.intensity > 8) return 'crisis_support';
  if (aiResponse.includes('steps') || aiResponse.includes('strategy')) return 'guidance';
  return 'text';
}

function selectPersonalizedTherapeuticApproach(emotionalAnalysis: any, userContext: any) {
  const successfulApproaches = userContext.successfulInterventions || [];
  
  // Prefer approaches that have worked before
  if (successfulApproaches.includes('cognitive_behavioral_techniques')) return 'CBT';
  if (successfulApproaches.includes('mindfulness_practices')) return 'Mindfulness';
  if (successfulApproaches.includes('behavioral_activation')) return 'Behavioral Activation';
  
  // Fall back to emotion-based selection
  const techniques = selectTherapeuticTechniques(emotionalAnalysis, userContext);
  return techniques.primary;
}

function selectPersonalizedTechniques(emotionalAnalysis: any, userContext: any) {
  const techniques = selectTherapeuticTechniques(emotionalAnalysis, userContext);
  const successfulApproaches = userContext.successfulInterventions || [];
  
  // Prioritize techniques that have worked before
  const personalizedTechniques = [...techniques.recommended];
  
  if (successfulApproaches.includes('mindfulness_practices')) {
    personalizedTechniques.unshift('personalized_mindfulness');
  }
  
  return personalizedTechniques.slice(0, 3);
}

function extractEmotionalKeywords(message: string) {
  const emotionalWords = ['anxious', 'worried', 'stressed', 'sad', 'angry', 'frustrated', 'happy', 'excited', 'scared', 'overwhelmed'];
  return emotionalWords.filter(word => message.toLowerCase().includes(word));
}

function generateContextAwareFallback(message: string, emotionalAnalysis: any, context: any, personalityProfile: any) {
  // Generate a personalized fallback response
  const personalizedGreeting = context.sessionCount > 5 ? 
    "I've been thinking about our conversations, and I can see how much you've grown. " : 
    "Thank you for continuing to share with me - it means a lot that you trust me with your thoughts. ";
  
  const emotionalValidation = `I can sense the ${emotionalAnalysis.primaryEmotion} in what you're sharing, and I want you to know that what you're feeling makes complete sense given everything you're dealing with.`;
  
  const culturalContext = emotionalAnalysis.culturalNuances ? 
    ` The ${emotionalAnalysis.culturalNuances.replace(/_/g, ' ')} you're experiencing adds another layer of complexity that many people don't fully understand.` : 
    " As an Indian student, you're navigating pressures that are both universal and uniquely cultural.";
  
  const personalizedSupport = generatePersonalizedSupportMessage(emotionalAnalysis, context, personalityProfile);
  
  return {
    content: personalizedGreeting + emotionalValidation + culturalContext + "\n\n" + personalizedSupport
  };
}

function generatePersonalizedSupportMessage(emotionalAnalysis: any, context: any, personalityProfile: any) {
  const intensity = emotionalAnalysis.intensity;
  const personalDetails = context.personalDetails;
  
  let message = "";
  
  if (intensity > 7) {
    message = "Right now, in this moment, I want you to know that you're safe and these intense feelings will pass. You've weathered difficult emotions before, and you have the strength to get through this too.";
  } else if (intensity > 5) {
    message = "This is clearly weighing heavily on you, and I can understand why. You're not alone in feeling this way - many students face similar challenges.";
  } else {
    message = "I appreciate you sharing this with me. Even when things aren't at their worst, it's important to process what's going on.";
  }
  
  // Add personalized elements
  if (personalDetails.field) {
    message += ` I know that being a ${personalDetails.field} student comes with its own unique pressures.`;
  }
  
  if (context.successfulInterventions && context.successfulInterventions.length > 0) {
    message += ` Remember, we've found approaches that work well for you before, and we can build on those.`;
  }
  
  // Add personality-based closing
  if (personalityProfile.encouragement > 0.8) {
    message += "\n\nYou have more resilience and wisdom than you might realize right now. I believe in your ability to navigate this.";
  }
  
  return message;
}

// Helper functions for updating learning profile
function updateSuccessfulInterventions(current: string[], aiResponse: any): string[] {
  const approach = aiResponse.therapeuticApproach;
  if (approach && !current.includes(approach)) {
    current.push(approach);
  }
  return current.slice(-10); // Keep last 10 successful approaches
}

function updateCommunicationPreferences(current: any, input: string): any {
  const preferences = { ...current };
  
  // Analyze message length preference
  if (input.length > 200) {
    preferences.prefersDetailedDiscussion = (preferences.prefersDetailedDiscussion || 0) + 1;
  } else if (input.length < 50) {
    preferences.prefersConciseExchange = (preferences.prefersConciseExchange || 0) + 1;
  }
  
  // Analyze emotional expression
  if (input.includes('feel') || input.includes('emotion') || input.includes('feeling')) {
    preferences.expressesEmotionsOpenly = (preferences.expressesEmotionsOpenly || 0) + 1;
  }
  
  // Analyze question-asking behavior
  if (input.includes('?')) {
    preferences.asksQuestions = (preferences.asksQuestions || 0) + 1;
  }
  
  return preferences;
}

function updatePersonalDetails(current: any, input: string): any {
  const details = { ...current };
  
  // Extract field of study
  const fieldMatch = input.match(/studying (\w+)|(\w+) student|major in (\w+)|(\w+) engineering|(\w+) course/i);
  if (fieldMatch) {
    details.field = fieldMatch[1] || fieldMatch[2] || fieldMatch[3] || fieldMatch[4] || fieldMatch[5];
  }
  
  // Extract year information
  const yearMatch = input.match(/(\d+)(st|nd|rd|th) year|final year|first year|fresher|sophomore/i);
  if (yearMatch) {
    details.academicYear = yearMatch[0];
  }
  
  // Extract location/institution type
  const locationMatch = input.match(/college in (\w+)|university in (\w+)|from (\w+)/i);
  if (locationMatch) {
    details.location = locationMatch[1] || locationMatch[2] || locationMatch[3];
  }
  
  // Extract living situation
  if (input.includes('hostel') || input.includes('dorm')) {
    details.livingSituation = 'hostel';
  } else if (input.includes('home') && input.includes('family')) {
    details.livingSituation = 'family_home';
  } else if (input.includes('pg') || input.includes('paying guest')) {
    details.livingSituation = 'paying_guest';
  }
  
  return details;
}

function updateLearningHistory(current: any[], interaction: any): any[] {
  current.push({
    ...interaction,
    patterns: {
      messageLength: interaction.input.length,
      emotionalIntensity: calculateBasicEmotionalIntensity(interaction.input),
      topicsDiscussed: extractTopicsFromMessage(interaction.input),
      responseHelpfulness: 'unknown' // This would be updated based on user feedback
    }
  });
  
  return current.slice(-20); // Keep last 20 interactions for learning
}

function calculateBasicEmotionalIntensity(message: string): number {
  const intensifiers = ['very', 'extremely', 'really', 'so', 'too much', 'unbearable'];
  const emotionalWords = ['anxious', 'stressed', 'worried', 'sad', 'angry', 'frustrated', 'overwhelmed'];
  
  let intensity = 0;
  emotionalWords.forEach(word => {
    if (message.toLowerCase().includes(word)) intensity += 2;
  });
  
  intensifiers.forEach(word => {
    if (message.toLowerCase().includes(word)) intensity += 1;
  });
  
  return Math.min(intensity, 10);
}

function extractTopicsFromMessage(message: string): string[] {
  const topics = [];
  const input = message.toLowerCase();
  
  if (input.includes('exam') || input.includes('test') || input.includes('academic')) topics.push('academics');
  if (input.includes('family') || input.includes('parent')) topics.push('family');
  if (input.includes('friend') || input.includes('social')) topics.push('relationships');
  if (input.includes('career') || input.includes('job') || input.includes('future')) topics.push('career');
  if (input.includes('sleep') || input.includes('tired')) topics.push('sleep');
  if (input.includes('money') || input.includes('financial')) topics.push('finances');
  
  return topics;
}

// ==================== ADMIN ENDPOINTS ====================

// Admin login endpoint
app.post("/make-server-a40ffbb5/admin/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Check hardcoded admin credentials
    if (email === 'admin@mentara.com' && password === 'admin123') {
      return c.json({ success: true });
    }

    return c.json({ success: false, error: 'Invalid credentials' });
  } catch (error) {
    console.error('Admin login error:', error);
    return c.json({ success: false, error: 'Login failed' }, 500);
  }
});

// Counselor login endpoint
app.post("/make-server-a40ffbb5/counselor/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Check hardcoded counselor credentials
    // In production, this would check against a counselors table/database
    if (email === 'counselor@mentara.com' && password === 'counselor123') {
      return c.json({ success: true });
    }

    return c.json({ success: false, error: 'Invalid credentials' });
  } catch (error) {
    console.error('Counselor login error:', error);
    return c.json({ success: false, error: 'Login failed' }, 500);
  }
});

// Get all users endpoint
app.get("/make-server-a40ffbb5/admin/users", async (c) => {
  try {
    // Get all users from Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return c.json({ success: false, error: 'Failed to fetch users from auth' }, 500);
    }

    // Get all users from KV store
    const usersData = await kv.getByPrefix('user_');
    console.log('[GET USERS] KV store returned', usersData.length, 'entries');
    
    // Create a map of KV store data by user ID for quick lookup
    const kvDataMap = new Map();
    usersData.forEach((userData: any) => {
      if (userData && userData.value && userData.value.id) {
        kvDataMap.set(userData.value.id, userData.value);
        // Log users with special statuses
        if (userData.value.isBanned) {
          console.log('[GET USERS] Found BANNED user in KV:', userData.value.email, 'isBanned:', userData.value.isBanned);
        }
        if (userData.value.isDeleted) {
          console.log('[GET USERS] Found DELETED user in KV:', userData.value.email, 'isDeleted:', userData.value.isDeleted);
        }
      }
    });

    // Merge auth users with KV store data
    const users = authUsers.users.map((authUser: any) => {
      const kvData = kvDataMap.get(authUser.id) || {};
      
      const mergedUser = {
        id: authUser.id,
        name: kvData.name || authUser.user_metadata?.name || 'Unknown',
        email: authUser.email || 'unknown@email.com',
        password: kvData.password || null,
        createdAt: kvData.createdAt || authUser.created_at || new Date().toISOString(),
        lastActive: kvData.lastActive || null,
        isOnline: kvData.isOnline || false,
        isDeleted: kvData.isDeleted || false,
        deleteReason: kvData.deleteReason || null,
        deletedAt: kvData.deletedAt || null,
        allowRecreation: kvData.allowRecreation || false,
        isBanned: kvData.isBanned || false,
        banReason: kvData.banReason || null,
        banUntil: kvData.banUntil || null,
        bannedAt: kvData.bannedAt || null
      };
      
      // Log merging details for users with special status
      if (kvData.isBanned || kvData.isDeleted) {
        console.log(`[GET USERS] Merging user ${mergedUser.email}:`, {
          kvHasBanned: 'isBanned' in kvData,
          kvBannedValue: kvData.isBanned,
          kvHasDeleted: 'isDeleted' in kvData,
          kvDeletedValue: kvData.isDeleted,
          finalIsBanned: mergedUser.isBanned,
          finalIsDeleted: mergedUser.isDeleted
        });
      }
      
      return mergedUser;
    });

    console.log('[GET USERS] Returning users - Total:', users.length, 
                'Banned:', users.filter((u: any) => u.isBanned).length,
                'Deleted:', users.filter((u: any) => u.isDeleted).length);

    return c.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ success: false, error: 'Failed to fetch users' }, 500);
  }
});

// Clear all users endpoint (admin only)
app.delete("/make-server-a40ffbb5/admin/users/all/clear", async (c) => {
  try {
    // Get all users from Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return c.json({ success: false, error: 'Failed to fetch users from auth' }, 500);
    }

    let deletedCount = 0;
    const errors = [];

    // Delete all users from Supabase Auth
    for (const authUser of authUsers.users) {
      try {
        // Delete from Supabase Auth
        const { error } = await supabase.auth.admin.deleteUser(authUser.id);
        
        if (error) {
          console.error(`Error deleting user ${authUser.id} from auth:`, error);
          errors.push(`Failed to delete ${authUser.email}: ${error.message}`);
        } else {
          deletedCount++;
        }

        // Delete from KV store
        try {
          await kv.del(`user_${authUser.id}`);
        } catch (kvError) {
          console.error(`Error deleting user ${authUser.id} from KV store:`, kvError);
        }
      } catch (error) {
        console.error(`Error processing user ${authUser.id}:`, error);
        errors.push(`Failed to process user: ${error.message}`);
      }
    }

    // Also clean up any orphaned KV store entries
    try {
      const usersData = await kv.getByPrefix('user_');
      for (const userData of usersData) {
        if (userData && userData.key) {
          try {
            await kv.del(userData.key);
          } catch (e) {
            console.error(`Error deleting KV entry ${userData.key}:`, e);
          }
        }
      }
    } catch (kvError) {
      console.error('Error cleaning up KV store:', kvError);
    }

    return c.json({ 
      success: true, 
      message: `Successfully deleted ${deletedCount} users`,
      deletedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error clearing all users:', error);
    return c.json({ success: false, error: 'Failed to clear all users' }, 500);
  }
});

// Delete/Ban user endpoint
app.delete("/make-server-a40ffbb5/admin/users/:id", async (c) => {
  try {
    const userId = c.req.param('id');
    const { reason, action, banUntil } = await c.req.json();

    console.log(`[DELETE USER] Processing ${action} for user ID: ${userId}`);
    console.log(`[DELETE USER] Reason: ${reason}, banUntil: ${banUntil}`);

    if (!reason) {
      console.error('[DELETE USER] No reason provided');
      return c.json({ success: false, error: 'Reason is required' }, 400);
    }

    // Get existing user data
    let userData = await kv.get(`user_${userId}`);
    
    if (!userData) {
      console.log('[DELETE USER] User not found in KV store');
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    if (action === 'ban') {
      // Ban user - cannot login again
      const updatedUser = {
        ...userData,
        isBanned: true,
        banReason: reason,
        bannedAt: new Date().toISOString(),
        banUntil: banUntil, // 'forever' or ISO date string
        isDeleted: false // Keep account but ban login
      };

      console.log('[DELETE USER] Banning user, updated data:', JSON.stringify(updatedUser, null, 2));
      await kv.set(`user_${userId}`, updatedUser);
      console.log('[DELETE USER] User banned successfully');
      
      // Verify the save
      const verifyData = await kv.get(`user_${userId}`);
      console.log('[DELETE USER] Verified saved data:', JSON.stringify(verifyData, null, 2));
    } else {
      // Soft delete - allow recreation
      const updatedUser = {
        ...userData,
        isDeleted: true,
        deleteReason: reason,
        deletedAt: new Date().toISOString(),
        allowRecreation: true,
        isBanned: false
      };

      console.log('[DELETE USER] Soft deleting user, updated data:', JSON.stringify(updatedUser, null, 2));
      await kv.set(`user_${userId}`, updatedUser);
      console.log('[DELETE USER] User soft deleted successfully');
      
      // Verify the save
      const verifyData = await kv.get(`user_${userId}`);
      console.log('[DELETE USER] Verified saved data:', JSON.stringify(verifyData, null, 2));
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('[DELETE USER] Error processing user action:', error);
    return c.json({ success: false, error: 'Failed to process action' }, 500);
  }
});

// Unban user endpoint
app.post("/make-server-a40ffbb5/admin/users/:id/unban", async (c) => {
  try {
    const userId = c.req.param('id');

    console.log('[UNBAN USER] Processing unban for user ID:', userId);

    // Get existing user data
    let userData = await kv.get(`user_${userId}`);
    
    if (!userData) {
      console.error('[UNBAN USER] User not found in KV store');
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    console.log('[UNBAN USER] Current user status - isBanned:', userData.isBanned);

    if (!userData.isBanned) {
      console.error('[UNBAN USER] User is not banned');
      return c.json({ success: false, error: 'User is not banned' }, 400);
    }

    // Remove ban status
    const updatedUser = {
      ...userData,
      isBanned: false,
      banReason: null,
      bannedAt: null,
      banUntil: null,
      unbannedAt: new Date().toISOString()
    };

    console.log('[UNBAN USER] Saving updated user data:', updatedUser);
    await kv.set(`user_${userId}`, updatedUser);
    console.log('[UNBAN USER] User unbanned successfully');

    return c.json({ success: true });
  } catch (error) {
    console.error('[UNBAN USER] Error unbanning user:', error);
    return c.json({ success: false, error: 'Failed to unban user' }, 500);
  }
});

// ==================== AUTH ENDPOINTS ====================

// Signup endpoint
app.post("/make-server-a40ffbb5/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    console.log('[SIGNUP] Attempting signup for:', email);

    // Check if user already exists
    const usersData = await kv.getByPrefix('user_');
    const existingUserData = usersData.find((u: any) => u && u.value && u.value.email === email);

    if (existingUserData && existingUserData.value) {
      const existingUser = existingUserData.value;
      console.log('[SIGNUP] Found existing user:', {
        email: existingUser.email,
        isDeleted: existingUser.isDeleted,
        isBanned: existingUser.isBanned,
        allowRecreation: existingUser.allowRecreation
      });

      // Check if user is banned
      if (existingUser.isBanned) {
        console.log('[SIGNUP] User is banned, rejecting signup');
        return c.json({ 
          error: `This account has been banned. Reason: ${existingUser.banReason || 'No reason provided'}` 
        }, 403);
      }

      // Check if user is deleted but can be recreated
      if (existingUser.isDeleted && existingUser.allowRecreation) {
        console.log('[SIGNUP] User is deleted but can be recreated, allowing re-registration');
        
        let userId = existingUser.id;

        // Reset user data in KV store (clear deleted/banned status)
        await kv.set(`user_${userId}`, {
          id: userId,
          email,
          name,
          password,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          isOnline: false,
          isDeleted: false,
          deleteReason: null,
          deletedAt: null,
          allowRecreation: false,
          isBanned: false,
          banReason: null,
          banUntil: null,
          bannedAt: null,
          passwordSetVia: 'signup',
          lastPasswordChange: new Date().toISOString()
        });

        console.log('[SIGNUP] User re-registered successfully');
        return c.json({ success: true, message: 'Account recreated successfully' });
      }

      // User exists and is active (not deleted, not banned)
      console.log('[SIGNUP] User already exists and is active');
      return c.json({ error: 'User already exists' }, 400);
    }

    // New user - doesn't exist in KV store
    console.log('[SIGNUP] New user, creating account');

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true // Auto-confirm since no email service configured
    });

    if (error) {
      console.error('[SIGNUP] Supabase signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user in KV store
    const userId = data.user.id;
    await kv.set(`user_${userId}`, {
      id: userId,
      email,
      name,
      password, // In production, don't store password or hash it
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isOnline: false,
      isDeleted: false,
      deleteReason: null,
      deletedAt: null,
      allowRecreation: false,
      isBanned: false,
      banReason: null,
      banUntil: null,
      bannedAt: null
    });

    console.log('[SIGNUP] New user created successfully');
    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.error('[SIGNUP] Signup error:', error);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

// Check if user is deleted or banned
app.post("/make-server-a40ffbb5/auth/check-user", async (c) => {
  try {
    const { email } = await c.req.json();

    // Get all users and find by email
    const usersData = await kv.getByPrefix('user_');
    const userData = usersData.find((u: any) => u && u.value && u.value.email === email);

    if (!userData || !userData.value) {
      return c.json({ isDeleted: false, isBanned: false });
    }

    // Check if user is banned
    if (userData.value.isBanned) {
      const banUntil = userData.value.banUntil;
      
      // Check if ban has expired (for temporary bans)
      if (banUntil !== 'forever') {
        const banEndDate = new Date(banUntil);
        const now = new Date();
        
        if (now > banEndDate) {
          // Ban expired, remove ban status
          const updatedUser = {
            ...userData.value,
            isBanned: false,
            banReason: null,
            banUntil: null
          };
          await kv.set(`user_${userData.value.id}`, updatedUser);
          
          return c.json({ isDeleted: false, isBanned: false });
        }
      }
      
      // User is still banned
      return c.json({ 
        isBanned: true, 
        banReason: userData.value.banReason,
        banUntil: banUntil,
        message: banUntil === 'forever' 
          ? `Your account has been permanently banned by administrator: ${userData.value.banReason}`
          : `Your account has been banned until ${new Date(banUntil).toLocaleDateString()}. Reason: ${userData.value.banReason}`
      });
    }

    // Check if user is deleted (soft delete - can recreate)
    if (userData.value.isDeleted && userData.value.allowRecreation) {
      return c.json({ 
        isDeleted: true, 
        deleteReason: userData.value.deleteReason,
        allowRecreation: true,
        message: `Account deleted by administrator: ${userData.value.deleteReason}. You may recreate your account.`
      });
    }

    return c.json({ isDeleted: false, isBanned: false });
  } catch (error) {
    console.error('Error checking user:', error);
    return c.json({ isDeleted: false, isBanned: false });
  }
});

// Update user online status
app.post("/make-server-a40ffbb5/auth/update-status", async (c) => {
  try {
    const { userId, isOnline } = await c.req.json();

    let userData = await kv.get(`user_${userId}`);

    // If user doesn't exist in KV store, create a minimal record
    if (!userData) {
      console.log(`User ${userId} not found in KV store, creating minimal record...`);
      
      // Create minimal user record (don't require Supabase Auth)
      userData = {
        id: userId,
        email: 'unknown@mentara.com',
        name: 'Unknown User',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isOnline: false,
        isDeleted: false,
        deleteReason: null
      };

      console.log(`Created minimal KV store record for user ${userId}`);
    }

    const updatedUser = {
      ...userData,
      isOnline,
      lastActive: new Date().toISOString()
    };

    await kv.set(`user_${userId}`, updatedUser);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating user status:', error);
    return c.json({ success: false, error: 'Failed to update status' }, 500);
  }
});

// Send OTP for password reset
app.post("/make-server-a40ffbb5/auth/send-otp", async (c) => {
  try {
    const { email } = await c.req.json();

    // Check if user exists
    const usersData = await kv.getByPrefix('user_');
    const user = usersData.find((u: any) => u && u.value && u.value.email === email);

    if (!user || !user.value) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 10 minute expiration
    await kv.set(`otp_${email}`, {
      otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // In production, you would send this via email
    // For now, we'll log it (in production environment, this would be sent via email service)
    console.log(`OTP for ${email}: ${otp}`);

    return c.json({ 
      success: true, 
      message: 'OTP sent to email',
      // In development, return OTP for testing
      otp: Deno.env.get('DENO_DEPLOYMENT_ID') ? undefined : otp
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return c.json({ success: false, error: 'Failed to send OTP' }, 500);
  }
});

// Verify OTP
app.post("/make-server-a40ffbb5/auth/verify-otp", async (c) => {
  try {
    const { email, otp } = await c.req.json();

    const otpData = await kv.get(`otp_${email}`);

    if (!otpData) {
      return c.json({ success: false, error: 'OTP not found or expired' }, 400);
    }

    // Check if OTP is expired
    if (Date.now() > otpData.expiresAt) {
      await kv.del(`otp_${email}`);
      return c.json({ success: false, error: 'OTP expired' }, 400);
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      return c.json({ success: false, error: 'Invalid OTP' }, 400);
    }

    // Mark OTP as verified (don't delete yet, need it for password reset)
    await kv.set(`otp_${email}`, {
      ...otpData,
      verified: true
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return c.json({ success: false, error: 'Failed to verify OTP' }, 500);
  }
});

// Reset password with OTP
app.post("/make-server-a40ffbb5/auth/reset-password", async (c) => {
  try {
    const { email, otp, newPassword } = await c.req.json();

    const otpData = await kv.get(`otp_${email}`);

    if (!otpData || !otpData.verified) {
      return c.json({ success: false, error: 'OTP not verified' }, 400);
    }

    // Check if OTP matches
    if (otpData.otp !== otp) {
      return c.json({ success: false, error: 'Invalid OTP' }, 400);
    }

    // Get user data
    const usersData = await kv.getByPrefix('user_');
    const userData = usersData.find((u: any) => u && u.value && u.value.email === email);

    if (!userData || !userData.value) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Update password
    const updatedUser = {
      ...userData.value,
      password: newPassword, // In production, this should be hashed
      passwordUpdatedAt: new Date().toISOString()
    };

    await kv.set(`user_${userData.value.id}`, updatedUser);

    // Delete OTP
    await kv.del(`otp_${email}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error resetting password:', error);
    return c.json({ success: false, error: 'Failed to reset password' }, 500);
  }
});

// ==================== PROFILE ENDPOINTS ====================

// Get user profile
app.get("/make-server-a40ffbb5/profile/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    // Get user from KV store
    let userData = await kv.get(`user_${userId}`);
    
    // If not in KV store, return not found (don't query Supabase Auth)
    if (!userData) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    return c.json({ 
      success: true, 
      profile: {
        id: userData.id,
        email: userData.email,
        name: userData.name || '',
        university: userData.university || '',
        profileImage: userData.profileImage || ''
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ success: false, error: 'Failed to fetch profile' }, 500);
  }
});

// Update user profile
app.put("/make-server-a40ffbb5/profile/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const { name, university, profileImage } = await c.req.json();
    
    // Get existing user data
    let userData = await kv.get(`user_${userId}`);
    
    if (!userData) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }
    
    // Update user data
    const updatedUser = {
      ...userData,
      name: name || userData.name,
      university: university !== undefined ? university : userData.university,
      profileImage: profileImage !== undefined ? profileImage : userData.profileImage
    };
    
    await kv.set(`user_${userId}`, updatedUser);

    return c.json({ success: true, profile: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ success: false, error: 'Failed to update profile' }, 500);
  }
});

// Upload profile image
app.post("/make-server-a40ffbb5/upload/profile-image", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return c.json({ success: false, error: 'File and userId are required' }, 400);
    }

    // Create bucket if it doesn't exist
    const bucketName = 'make-a40ffbb5-profile-images';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880 // 5MB
      });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    // Convert File to ArrayBuffer then to Uint8Array for upload
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ success: false, error: 'Failed to upload image' }, 500);
    }

    // Get signed URL (valid for 1 year)
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000); // 1 year in seconds

    if (!urlData) {
      return c.json({ success: false, error: 'Failed to generate image URL' }, 500);
    }

    // Update user profile with image URL
    const userData = await kv.get(`user_${userId}`) || {};
    const updatedUser = {
      ...userData,
      id: userId,
      profileImage: urlData.signedUrl
    };
    
    await kv.set(`user_${userId}`, updatedUser);

    return c.json({ success: true, imageUrl: urlData.signedUrl });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return c.json({ success: false, error: 'Failed to upload image' }, 500);
  }
});

// ==================== ADMIN USER MANAGEMENT ====================

// Get user password (admin only) - DEPRECATED - Use password-status endpoint instead
app.get("/make-server-a40ffbb5/admin/users/:id/password", async (c) => {
  try {
    const userId = c.req.param('id');

    // Get user from KV store
    let userData = await kv.get(`user_${userId}`);

    // If user doesn't exist in KV store, return not found
    if (!userData) {
      console.log(`User ${userId} not found in KV store`);
      return c.json({ 
        success: true, 
        password: 'User record not found - password unavailable' 
      });
    }

    // Return password if stored (in production, this should be hashed)
    if (!userData.password) {
      return c.json({ 
        success: true, 
        password: 'Password not stored for this user' 
      });
    }

    return c.json({ 
      success: true, 
      password: userData.password
    });
  } catch (error) {
    console.error('Error fetching password:', error);
    return c.json({ success: false, error: 'Failed to fetch password' }, 500);
  }
});

// Change user password (admin only) - DEPRECATED - Use secure password management endpoints instead
app.put("/make-server-a40ffbb5/admin/users/:id/password", async (c) => {
  try {
    const userId = c.req.param('id');
    const { password } = await c.req.json();

    if (!password || password.length < 6) {
      return c.json({ success: false, error: 'Password must be at least 6 characters' }, 400);
    }

    // Get user from KV store
    let userData = await kv.get(`user_${userId}`);
    
    if (!userData) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }
    
    // Store password in KV
    await kv.set(`user_${userId}`, {
      ...userData,
      password: password, // Store for reference (in production, this should be hashed)
      lastPasswordChange: new Date().toISOString(),
      passwordSetVia: 'admin_direct'
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    return c.json({ success: false, error: 'Failed to change password' }, 500);
  }
});

// ==================== AI SUMMARY ENDPOINT ====================

// Generate AI summary for conversation title
app.post("/make-server-a40ffbb5/chat/generate-summary", async (c) => {
  try {
    const { userId, conversationId } = await c.req.json();
    
    // Get conversation history
    const conversationKey = `conversation_${userId}_${conversationId}`;
    const conversationHistory = await kv.get(conversationKey) || [];
    
    if (conversationHistory.length < 2) {
      return c.json({ title: "New conversation" });
    }
    
    // Get first few user messages to generate title
    const userMessages = conversationHistory
      .filter((msg: any) => msg.sender === 'user')
      .slice(0, 3)
      .map((msg: any) => msg.content)
      .join(' ');
    
    // Generate summary using Gemini
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found');
      return c.json({ title: userMessages.substring(0, 40) + '...' });
    }
    
    const summaryPrompt = `Generate a very brief, concise title (3-6 words maximum) for this mental health conversation. The title should capture the main topic or concern. Only respond with the title, nothing else.\n\nConversation: ${userMessages.substring(0, 500)}`;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: summaryPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 20,
          }
        })
      }
    );
    
    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      return c.json({ title: userMessages.substring(0, 40) + '...' });
    }
    
    const data = await response.json();
    const title = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "New conversation";
    
    // Update conversation title
    const conversationsListKey = `conversations_list_${userId}`;
    const conversationsList = await kv.get(conversationsListKey) || [];
    const convIndex = conversationsList.findIndex((c: any) => c.id === conversationId);
    
    if (convIndex >= 0) {
      conversationsList[convIndex].title = title;
      await kv.set(conversationsListKey, conversationsList);
    }
    
    return c.json({ title });
  } catch (error) {
    console.error('Error generating summary:', error);
    return c.json({ error: 'Failed to generate summary' }, 500);
  }
});

// ==================== DATA INITIALIZATION ====================

// Initialize default data (products, counselors, resources)
app.post("/make-server-a40ffbb5/admin/init-data", async (c) => {
  try {
    // Default products
    const defaultProducts = [
      {
        id: '1',
        name: 'Ashwagandha Stress Relief Capsules',
        description: 'Natural adaptogen supplement to reduce stress and anxiety. Clinically proven to lower cortisol levels and improve mental clarity.',
        price: 599,
        category: 'Supplements',
        rating: 4.7,
        reviews: 2341,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXBwbGVtZW50JTIwY2Fwc3VsZXMlMjB3ZWxsbmVzc3xlbnwxfHx8fDE3NTkxNjMzNjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
        benefits: ['Reduces stress and anxiety', 'Improves focus and concentration', 'Supports better sleep quality', 'Boosts energy levels'],
        ingredients: '300mg Ashwagandha Root Extract (KSM-66), 100mg L-Theanine, Vegetable Cellulose (capsule)',
        usage: 'Take 1-2 capsules daily with water, preferably with meals. Consult healthcare provider before use.',
        inStock: true
      },
      {
        id: '2',
        name: 'The Anxiety and Phobia Workbook',
        description: 'Comprehensive self-help guide with proven techniques to overcome anxiety disorders. Written by leading clinical psychologists.',
        price: 450,
        category: 'Books',
        rating: 4.9,
        reviews: 1876,
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWxmJTIwaGVscCUyMGJvb2slMjBtZW50YWwlMjBoZWFsdGh8ZW58MXx8fHwxNzU5MTYzMzY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
        benefits: ['Step-by-step anxiety reduction techniques', 'CBT-based exercises', 'Practical coping strategies', 'Real-life case studies'],
        ingredients: null,
        usage: 'Work through chapters progressively. Complete exercises at your own pace. Ideal for daily practice.',
        inStock: true
      },
      {
        id: '3',
        name: 'Mindfulness Meditation Journal',
        description: 'Premium guided journal with 90 days of mindfulness prompts, gratitude exercises, and mood tracking sections.',
        price: 350,
        category: 'Journals',
        rating: 4.8,
        reviews: 1523,
        image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb3VybmFsJTIwZGlhcnklMjBub3RlYm9va3xlbnwxfHx8fDE3NTkxNjMzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        benefits: ['Daily mindfulness practice', 'Track emotional patterns', 'Reduce stress through journaling', 'Improve self-awareness'],
        ingredients: null,
        usage: 'Dedicate 10-15 minutes daily for journaling. Use prompts to guide your reflection and gratitude practice.',
        inStock: true
      },
      {
        id: '4',
        name: 'Lavender Essential Oil Aromatherapy Kit',
        description: 'Pure therapeutic-grade lavender oil with ceramic diffuser. Promotes relaxation and better sleep quality.',
        price: 899,
        category: 'Aromatherapy',
        rating: 4.6,
        reviews: 987,
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3NlbnRpYWwlMjBvaWwlMjBhcm9tYXRoZXJhcHl8ZW58MXx8fHwxNzU5MTYzMzc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
        benefits: ['Reduces anxiety and stress', 'Improves sleep quality', 'Natural mood enhancer', 'Creates calming atmosphere'],
        ingredients: '100% Pure Lavender Essential Oil (Lavandula angustifolia), Ceramic Ultrasonic Diffuser',
        usage: 'Add 3-5 drops to diffuser with water. Use in bedroom 30 minutes before sleep or during meditation.',
        inStock: true
      },
      {
        id: '5',
        name: 'Meditation Cushion & Yoga Mat Set',
        description: 'Eco-friendly meditation cushion with premium non-slip yoga mat. Perfect for daily mindfulness practice.',
        price: 1499,
        category: 'Meditation',
        rating: 4.8,
        reviews: 764,
        image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwbWF0JTIwbWVkaXRhdGlvbnxlbnwxfHx8fDE3NTkxNjMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
        benefits: ['Comfortable meditation practice', 'Non-slip surface for yoga', 'Eco-friendly materials', 'Easy to clean and maintain'],
        ingredients: null,
        usage: 'Use cushion for seated meditation. Roll out mat for yoga practice. Store in cool, dry place.',
        inStock: true
      },
      {
        id: '6',
        name: 'Stress Relief Fidget Set',
        description: '5-piece premium fidget tool set designed to reduce anxiety and improve focus during study sessions.',
        price: 399,
        category: 'Stress Relief',
        rating: 4.5,
        reviews: 2156,
        image: 'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWRnZXQlMjBzcGlubmVyJTIwc3RyZXNzfGVufDF8fHx8MTc1OTE2MzM5MXww&ixlib=rb-4.1.0&q=80&w=1080',
        benefits: ['Reduces nervous energy', 'Improves concentration', 'Portable and discreet', 'Helps manage anxiety symptoms'],
        ingredients: null,
        usage: 'Use during study breaks, meetings, or whenever feeling anxious. Keep in pocket or bag for easy access.',
        inStock: true
      },
      {
        id: '7',
        name: 'Sleep Well Herbal Tea Blend',
        description: 'Organic herbal tea blend with chamomile, valerian root, and lavender. Promotes deep, restful sleep naturally.',
        price: 299,
        category: 'Herbal Tea',
        rating: 4.7,
        reviews: 1432,
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiYWwlMjB0ZWElMjBzbGVlcHxlbnwxfHx8fDE3NTkxNjMzOTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
        benefits: ['Promotes natural sleep', 'Reduces nighttime anxiety', 'Caffeine-free formula', 'Organic ingredients'],
        ingredients: 'Organic Chamomile, Valerian Root, Lavender, Passionflower, Lemon Balm',
        usage: 'Steep 1 tea bag in hot water for 5-7 minutes. Drink 30 minutes before bedtime.',
        inStock: true
      },
      {
        id: '8',
        name: 'Cognitive Behavioral Therapy Toolkit',
        description: 'Complete CBT workbook with exercises, worksheets, and guided activities to manage depression and anxiety.',
        price: 550,
        category: 'Books',
        rating: 4.9,
        reviews: 987,
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JrYm9vayUyMHRoZXJhcHl8ZW58MXx8fHwxNzU5MTYzNDAzfDA&ixlib=rb-4.1.0&q=80&w=1080',
        benefits: ['Evidence-based techniques', 'Practical worksheets', 'Self-paced learning', 'Professional guidance'],
        ingredients: null,
        usage: 'Dedicate 15-20 minutes daily. Complete exercises sequentially. Track progress weekly.',
        inStock: true
      },
      {
        id: '9',
        name: 'Weighted Anxiety Blanket',
        description: '15lb therapeutic weighted blanket designed to reduce anxiety and improve sleep quality through deep pressure stimulation.',
        price: 2499,
        category: 'Sleep Aids',
        rating: 4.8,
        reviews: 1654,
        image: 'https://images.unsplash.com/photo-1631049552240-59c37f38802b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWlnaHRlZCUyMGJsYW5rZXR8ZW58MXx8fHwxNzU5MTYzNDEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        benefits: ['Reduces anxiety symptoms', 'Improves sleep quality', 'Calming deep pressure', 'Premium breathable fabric'],
        ingredients: null,
        usage: 'Use during sleep or relaxation. Choose weight 10% of body weight. Machine washable cover included.',
        inStock: true
      },
      {
        id: '10',
        name: 'Gratitude & Positivity Card Deck',
        description: '52 beautifully designed cards with daily affirmations, gratitude prompts, and mindfulness exercises.',
        price: 349,
        category: 'Mindfulness',
        rating: 4.6,
        reviews: 876,
        image: 'https://images.unsplash.com/photo-1606242420590-0b0cb00dd8ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJkcyUyMGFmZmlybWF0aW9ufGVufDF8fHx8MTc1OTE2MzQxNnww&ixlib=rb-4.1.0&q=80&w=1080',
        benefits: ['Daily inspiration', 'Builds positive mindset', 'Beautiful artwork', 'Perfect for morning routine'],
        ingredients: null,
        usage: 'Draw one card daily. Reflect on the prompt. Journal your thoughts and feelings.',
        inStock: true
      }
    ];

    // Default counselors
    const defaultCounselors = [
      {
        id: '1',
        name: 'Dr. Priya Sharma',
        specialization: ['Anxiety', 'Stress Management', 'Academic Pressure'],
        rating: 4.8,
        experience: '8 years',
        languages: ['English', 'Hindi'],
        price: 800,
        availability: ['Mon', 'Wed', 'Fri'],
        image: 'https://images.unsplash.com/photo-1714976694810-85add1a29c96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjB0aGVyYXBpc3QlMjBjb3Vuc2Vsb3IlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzU5MTYzMzMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        bio: 'Specialized in helping students manage academic stress and build resilience.',
        sessionTypes: ['video', 'audio', 'chat'],
        credentials: 'M.A. Psychology, Ph.D. Clinical Psychology'
      },
      {
        id: '2',
        name: 'Dr. Rajesh Kumar',
        specialization: ['Depression', 'Relationship Issues', 'Career Guidance'],
        rating: 4.7,
        experience: '12 years',
        languages: ['English', 'Hindi', 'Gujarati'],
        price: 1000,
        availability: ['Tue', 'Thu', 'Sat'],
        image: 'https://images.unsplash.com/photo-1742569184536-77ff9ae46c99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwY291bnNlbG9yJTIwdGhlcmFwaXN0JTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU5MTYzMzM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        bio: 'Expert in cognitive behavioral therapy with focus on young adults and career transitions.',
        sessionTypes: ['video', 'audio'],
        credentials: 'M.Phil. Psychology, RCI Licensed'
      },
      {
        id: '3',
        name: 'Dr. Meera Patel',
        specialization: ['ADHD', 'Learning Disabilities', 'Social Anxiety'],
        rating: 4.9,
        experience: '6 years',
        languages: ['English', 'Hindi', 'Marathi'],
        price: 750,
        availability: ['Mon', 'Tue', 'Wed', 'Thu'],
        image: 'https://images.unsplash.com/photo-1733685318562-c726472bc1db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0aGVyYXBpc3QlMjBjb3Vuc2Vsb3IlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTkxNjMzMjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        bio: 'Passionate about helping students overcome learning challenges and build confidence.',
        sessionTypes: ['video', 'chat'],
        credentials: 'M.A. Clinical Psychology, PGDM'
      },
      {
        id: '4',
        name: 'Dr. Arjun Singh',
        specialization: ['Trauma', 'PTSD', 'Grief Counseling'],
        rating: 4.9,
        experience: '15 years',
        languages: ['English', 'Hindi', 'Punjabi'],
        price: 1200,
        availability: ['Mon', 'Wed', 'Fri', 'Sat'],
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYWxlJTIwZG9jdG9yJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc1OTE2MzM0Mnww&ixlib=rb-4.1.0&q=80&w=1080',
        bio: 'Trauma-informed therapist specializing in EMDR and somatic experiencing techniques.',
        sessionTypes: ['video', 'audio', 'chat'],
        credentials: 'Ph.D. Clinical Psychology, EMDR Certified'
      },
      {
        id: '5',
        name: 'Dr. Kavita Reddy',
        specialization: ['Eating Disorders', 'Body Image', 'Self Esteem'],
        rating: 4.8,
        experience: '9 years',
        languages: ['English', 'Hindi', 'Telugu', 'Tamil'],
        price: 900,
        availability: ['Tue', 'Wed', 'Thu', 'Sat'],
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmZW1hbGUlMjBkb2N0b3IlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzU5MTYzMzQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
        bio: 'Specializing in body positivity and eating disorder recovery for young adults.',
        sessionTypes: ['video', 'chat'],
        credentials: 'M.Phil. Psychology, Certified Eating Disorder Specialist'
      },
      {
        id: '6',
        name: 'Dr. Aman Verma',
        specialization: ['OCD', 'Phobias', 'Panic Disorder'],
        rating: 4.7,
        experience: '10 years',
        languages: ['English', 'Hindi'],
        price: 950,
        availability: ['Mon', 'Tue', 'Fri', 'Sat'],
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwdGhlcmFwaXN0JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc1OTE2MzM1NHww&ixlib=rb-4.1.0&q=80&w=1080',
        bio: 'Expert in exposure therapy and cognitive restructuring for anxiety disorders.',
        sessionTypes: ['video', 'audio'],
        credentials: 'M.A. Psychology, Ph.D. Behavioral Sciences'
      },
      {
        id: '7',
        name: 'Dr. Sanjana Iyer',
        specialization: ['Work-Life Balance', 'Burnout Prevention', 'Time Management'],
        rating: 4.8,
        experience: '7 years',
        languages: ['English', 'Hindi', 'Kannada'],
        price: 850,
        availability: ['Mon', 'Wed', 'Thu', 'Sat'],
        image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmZW1hbGUlMjBwcm9mZXNzaW9uYWwlMjBkb2N0b3J8ZW58MXx8fHwxNzU5MTYzNDM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
        bio: 'Helps students and young professionals manage academic workload and prevent burnout through practical strategies.',
        sessionTypes: ['video', 'audio', 'chat'],
        credentials: 'M.A. Counseling Psychology, Certified Life Coach'
      },
      {
        id: '8',
        name: 'Dr. Vikram Malhotra',
        specialization: ['Substance Abuse', 'Addiction Recovery', 'Behavioral Addictions'],
        rating: 4.9,
        experience: '14 years',
        languages: ['English', 'Hindi', 'Punjabi'],
        price: 1100,
        availability: ['Tue', 'Wed', 'Fri', 'Sat'],
        image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwZG9jdG9yJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc1OTE2MzQ0MHww&ixlib=rb-4.1.0&q=80&w=1080',
        bio: 'Addiction specialist with comprehensive approach combining medical and psychological treatment.',
        sessionTypes: ['video', 'audio'],
        credentials: 'MBBS, MD Psychiatry, Addiction Medicine Specialist'
      },
      {
        id: '9',
        name: 'Dr. Ananya Chatterjee',
        specialization: ['Bipolar Disorder', 'Mood Disorders', 'Medication Management'],
        rating: 4.8,
        experience: '11 years',
        languages: ['English', 'Hindi', 'Bengali'],
        price: 1050,
        availability: ['Mon', 'Tue', 'Thu', 'Fri'],
        image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBkb2N0b3IlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzU5MTYzNDQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
        bio: 'Psychiatrist specializing in mood disorders with integrated medication and therapy approach.',
        sessionTypes: ['video', 'audio', 'chat'],
        credentials: 'MBBS, MD Psychiatry, Fellowship in Mood Disorders'
      },
      {
        id: '10',
        name: 'Dr. Rohan Desai',
        specialization: ['Sports Psychology', 'Performance Anxiety', 'Goal Setting'],
        rating: 4.7,
        experience: '5 years',
        languages: ['English', 'Hindi', 'Gujarati'],
        price: 800,
        availability: ['Mon', 'Wed', 'Sat', 'Sun'],
        image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwY291bnNlbG9yJTIweW91bmd8ZW58MXx8fHwxNzU5MTYzNDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        bio: 'Young and dynamic psychologist helping students overcome performance anxiety in academics and sports.',
        sessionTypes: ['video', 'chat'],
        credentials: 'M.Sc. Sports Psychology, Certified Performance Coach'
      },
      {
        id: '11',
        name: 'Dr. Lakshmi Menon',
        specialization: ['Chronic Illness Coping', 'Health Anxiety', 'Pain Management'],
        rating: 4.9,
        experience: '13 years',
        languages: ['English', 'Hindi', 'Malayalam', 'Tamil'],
        price: 950,
        availability: ['Tue', 'Thu', 'Fri', 'Sat'],
        image: 'https://images.unsplash.com/photo-1609328448318-d0f9a7a6e1b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmZW1hbGUlMjBkb2N0b3IlMjBzbWlsaW5nfGVufDF8fHx8MTc1OTE2MzQ1OHww&ixlib=rb-4.1.0&q=80&w=1080',
        bio: 'Compassionate therapist helping individuals cope with chronic health conditions and related psychological stress.',
        sessionTypes: ['video', 'audio', 'chat'],
        credentials: 'M.Phil. Health Psychology, Pain Management Certified'
      },
      {
        id: '12',
        name: 'Dr. Sameer Khan',
        specialization: ['Anger Management', 'Conflict Resolution', 'Emotional Regulation'],
        rating: 4.6,
        experience: '8 years',
        languages: ['English', 'Hindi', 'Urdu'],
        price: 750,
        availability: ['Mon', 'Tue', 'Wed', 'Fri'],
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwY291bnNlbG9yJTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU5MTYzNDY0fDA&ixlib=rb-4.1.0&q=80&w=1080',
        bio: 'Specializes in helping young adults develop healthy emotional regulation and communication skills.',
        sessionTypes: ['video', 'audio'],
        credentials: 'M.A. Clinical Psychology, Certified Anger Management Specialist'
      },
      {
        id: '13',
        name: 'Dr. Nisha Gupta',
        specialization: ['LGBTQ+ Issues', 'Identity Exploration', 'Coming Out Support'],
        rating: 4.9,
        experience: '9 years',
        languages: ['English', 'Hindi'],
        price: 900,
        availability: ['Mon', 'Wed', 'Thu', 'Sat'],
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBwcm9mZXNzaW9uYWwlMjBjb3Vuc2Vsb3J8ZW58MXx8fHwxNzU5MTYzNDcwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        bio: 'Affirming therapist providing safe space for LGBTQ+ youth navigating identity and acceptance.',
        sessionTypes: ['video', 'chat'],
        credentials: 'M.Phil. Psychology, LGBTQ+ Affirmative Therapy Certified'
      },
      {
        id: '14',
        name: 'Dr. Aditya Joshi',
        specialization: ['Perfectionism', 'Imposter Syndrome', 'Self-Compassion'],
        rating: 4.8,
        experience: '6 years',
        languages: ['English', 'Hindi', 'Marathi'],
        price: 800,
        availability: ['Tue', 'Wed', 'Fri', 'Sun'],
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU5MTYzNDc2fDA&ixlib=rb-4.1.0&q=80&w=1080',
        bio: 'Helps high-achieving students overcome perfectionism and develop healthy self-compassion practices.',
        sessionTypes: ['video', 'audio', 'chat'],
        credentials: 'M.A. Counseling Psychology, ACT Practitioner'
      },
      {
        id: '15',
        name: 'Dr. Divya Krishnan',
        specialization: ['Mindfulness-Based Therapy', 'Meditation', 'Stress Reduction'],
        rating: 4.9,
        experience: '10 years',
        languages: ['English', 'Hindi', 'Tamil', 'Malayalam'],
        price: 850,
        availability: ['Mon', 'Tue', 'Thu', 'Sat'],
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjB5b2dhJTIwbWVkaXRhdGlvbiUyMHRlYWNoZXJ8ZW58MXx8fHwxNzU5MTYzNDgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        bio: 'Integrates ancient mindfulness practices with modern psychology for holistic mental wellness.',
        sessionTypes: ['video', 'audio', 'chat'],
        credentials: 'M.Phil. Psychology, MBSR Instructor, Yoga Therapist'
      }
    ];

    // Default resources
    const defaultResources = [
      {
        id: '1',
        title: 'Understanding Exam Anxiety',
        description: 'Learn practical techniques to manage pre-exam stress and perform better under pressure.',
        type: 'article',
        category: 'Stress Management',
        duration: '8 min read',
        rating: 4.8,
        difficulty: 'beginner',
        image: 'https://images.unsplash.com/photo-1642557581366-539b6fed5998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjB3ZWxsbmVzcyUyMG1pbmRmdWxuZXNzfGVufDF8fHx8MTc1OTEwOTQzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        author: 'Dr. Meera Singh',
        tags: ['anxiety', 'exams', 'breathing', 'preparation'],
        content: 'Comprehensive guide on managing exam anxiety with proven techniques...'
      },
      {
        id: '2',
        title: 'Building Healthy Sleep Habits',
        description: 'Science-backed strategies to improve sleep quality and establish consistent sleep patterns for better mental health.',
        type: 'guide',
        category: 'Sleep & Wellness',
        duration: '12 min read',
        rating: 4.9,
        difficulty: 'beginner',
        image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbGVlcCUyMHdlbGxuZXNzJTIwYmVkcm9vbXxlbnwxfHx8fDE3NTkxNjM0MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        author: 'Dr. Rahul Nair',
        tags: ['sleep', 'wellness', 'habits', 'insomnia'],
        content: 'Complete guide to improving sleep hygiene and quality...'
      },
      {
        id: '3',
        title: 'Mindfulness for Students',
        description: 'Quick mindfulness exercises that fit into a busy student schedule to reduce stress and improve focus.',
        type: 'video',
        category: 'Mindfulness',
        duration: '15 min',
        rating: 4.7,
        difficulty: 'beginner',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5kZnVsbmVzcyUyMG1lZGl0YXRpb258ZW58MXx8fHwxNzU5MTYzNDI4fDA&ixlib=rb-4.1.0&q=80&w=1080',
        author: 'Dr. Sneha Kapoor',
        tags: ['mindfulness', 'meditation', 'focus', 'stress'],
        content: 'Video series on mindfulness practices for students...'
      }
    ];

    // Initialize data - update if count doesn't match to ensure latest data
    const existingProducts = await kv.get("products");
    const existingCounselors = await kv.get("counselors");
    const existingResources = await kv.get("resources");

    let productsUpdated = false;
    let counselorsUpdated = false;
    let resourcesUpdated = false;

    // Products: Initialize or update if count mismatch
    if (!existingProducts || existingProducts.length === 0) {
      await kv.set("products", defaultProducts);
      console.log(`[INIT] Initialized ${defaultProducts.length} default products`);
      productsUpdated = true;
    } else if (existingProducts.length !== defaultProducts.length) {
      await kv.set("products", defaultProducts);
      console.log(`[INIT] Updated products from ${existingProducts.length} to ${defaultProducts.length}`);
      productsUpdated = true;
    } else {
      console.log(`[INIT] Products already exist: ${existingProducts.length} products`);
    }

    // Counselors: Initialize or update if count mismatch
    if (!existingCounselors || existingCounselors.length === 0) {
      await kv.set("counselors", defaultCounselors);
      console.log(`[INIT] Initialized ${defaultCounselors.length} default counselors`);
      counselorsUpdated = true;
    } else if (existingCounselors.length !== defaultCounselors.length) {
      await kv.set("counselors", defaultCounselors);
      console.log(`[INIT] Updated counselors from ${existingCounselors.length} to ${defaultCounselors.length}`);
      counselorsUpdated = true;
    } else {
      console.log(`[INIT] Counselors already exist: ${existingCounselors.length} counselors`);
    }

    // Resources: Initialize or update if count mismatch
    if (!existingResources || existingResources.length === 0) {
      await kv.set("resources", defaultResources);
      console.log(`[INIT] Initialized ${defaultResources.length} default resources`);
      resourcesUpdated = true;
    } else if (existingResources.length !== defaultResources.length) {
      await kv.set("resources", defaultResources);
      console.log(`[INIT] Updated resources from ${existingResources.length} to ${defaultResources.length}`);
      resourcesUpdated = true;
    } else {
      console.log(`[INIT] Resources already exist: ${existingResources.length} resources`);
    }

    return c.json({ 
      success: true, 
      message: 'Data initialized successfully',
      updated: {
        products: productsUpdated,
        counselors: counselorsUpdated,
        resources: resourcesUpdated
      },
      counts: {
        products: defaultProducts.length,
        counselors: defaultCounselors.length,
        resources: defaultResources.length
      }
    });
  } catch (error) {
    console.error('Error initializing data:', error);
    return c.json({ error: 'Failed to initialize data' }, 500);
  }
});

// ==================== SESSION MANAGEMENT ENDPOINTS ====================

app.get("/make-server-a40ffbb5/sessions", async (c) => {
  try {
    const sessions = await kv.getByPrefix('session_');
    return c.json({ success: true, sessions: sessions || [] });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return c.json({ success: false, error: 'Failed to fetch sessions' }, 500);
  }
});

app.post("/make-server-a40ffbb5/sessions/book", async (c) => {
  try {
    const sessionData = await c.req.json();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const newSession = { id: sessionId, ...sessionData, transactionId, bookingDate: new Date().toISOString(), status: sessionData.status || 'pending' };
    await kv.set(sessionId, newSession);
    
    const userNotificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(userNotificationId, { id: userNotificationId, userId: sessionData.userId, type: 'session_booked', title: 'Session Booked Successfully', message: `Your session with ${sessionData.counselorName} has been booked for ${sessionData.date} at ${sessionData.time}.`, read: false, createdAt: new Date().toISOString(), sessionId: sessionId });
    
    const counselorNotificationId = `notif_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(counselorNotificationId, { id: counselorNotificationId, userId: sessionData.counselorId, type: 'session_booked', title: 'New Session Booked', message: `A new session has been booked for ${sessionData.date} at ${sessionData.time}.`, read: false, createdAt: new Date().toISOString(), sessionId: sessionId });
    
    return c.json({ success: true, sessionId, transactionId });
  } catch (error) {
    console.error('Error booking session:', error);
    return c.json({ success: false, error: 'Failed to book session' }, 500);
  }
});

app.put("/make-server-a40ffbb5/sessions/:sessionId/status", async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const { status, reason } = await c.req.json();
    const session = await kv.get(sessionId);
    if (!session) return c.json({ success: false, error: 'Session not found' }, 404);
    
    await kv.set(sessionId, { ...session, status, ...(reason && { cancellationReason: reason }) });
    
    let notificationTitle = '', notificationMessage = '', notificationType = 'session_confirmed';
    if (status === 'confirmed') { notificationTitle = 'Session Confirmed'; notificationMessage = `Your session on ${session.date} at ${session.time} has been confirmed.`; }
    else if (status === 'cancelled') { notificationType = 'session_cancelled'; notificationTitle = 'Session Cancelled'; notificationMessage = `Your session on ${session.date} at ${session.time} has been cancelled. ${reason || ''}`; }
    else if (status === 'in-progress') { notificationType = 'session_started'; notificationTitle = 'Session Started'; notificationMessage = 'Your session has started.'; }
    else if (status === 'completed') { notificationType = 'session_completed'; notificationTitle = 'Session Completed'; notificationMessage = 'Your session has been completed. Please provide feedback.'; }
    
    if (notificationTitle) {
      await kv.set(`notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, { id: `notif_${Date.now()}_a`, userId: session.userId, type: notificationType, title: notificationTitle, message: notificationMessage, read: false, createdAt: new Date().toISOString(), sessionId });
      await kv.set(`notif_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`, { id: `notif_${Date.now()}_b`, userId: session.counselorId, type: notificationType, title: notificationTitle.replace('Your', 'Session'), message: notificationMessage.replace('Your', 'The'), read: false, createdAt: new Date().toISOString(), sessionId });
    }
    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating session status:', error);
    return c.json({ success: false, error: 'Failed to update session status' }, 500);
  }
});

app.put("/make-server-a40ffbb5/sessions/:sessionId/reschedule", async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const { newDate, newTime } = await c.req.json();
    const session = await kv.get(sessionId);
    if (!session) return c.json({ success: false, error: 'Session not found' }, 404);
    
    const oldDateTime = `${session.date} at ${session.time}`;
    await kv.set(sessionId, { ...session, date: newDate, time: newTime, status: 'rescheduled', rescheduledFrom: oldDateTime });
    
    await kv.set(`notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, { id: `notif_${Date.now()}_a`, userId: session.userId, type: 'session_rescheduled', title: 'Session Rescheduled', message: `Your session has been rescheduled from ${oldDateTime} to ${newDate} at ${newTime}.`, read: false, createdAt: new Date().toISOString(), sessionId });
    await kv.set(`notif_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`, { id: `notif_${Date.now()}_b`, userId: session.counselorId, type: 'session_rescheduled', title: 'Session Rescheduled', message: `A session has been rescheduled from ${oldDateTime} to ${newDate} at ${newTime}.`, read: false, createdAt: new Date().toISOString(), sessionId });
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error rescheduling session:', error);
    return c.json({ success: false, error: 'Failed to reschedule session' }, 500);
  }
});

app.put("/make-server-a40ffbb5/sessions/:sessionId/type", async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const { sessionType } = await c.req.json();
    const session = await kv.get(sessionId);
    if (!session) return c.json({ success: false, error: 'Session not found' }, 404);
    
    await kv.set(sessionId, { ...session, sessionType });
    await kv.set(`notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, { id: `notif_${Date.now()}_a`, userId: session.userId, type: 'session_rescheduled', title: 'Session Type Changed', message: `Your session type has been changed to ${sessionType}.`, read: false, createdAt: new Date().toISOString(), sessionId });
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error changing session type:', error);
    return c.json({ success: false, error: 'Failed to change session type' }, 500);
  }
});

app.put("/make-server-a40ffbb5/sessions/:sessionId/notes", async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const { notes } = await c.req.json();
    const session = await kv.get(sessionId);
    if (!session) return c.json({ success: false, error: 'Session not found' }, 404);
    
    await kv.set(sessionId, { ...session, notes });
    await kv.set(`notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, { id: `notif_${Date.now()}_a`, userId: session.userId, type: 'notes_added', title: 'Session Notes Added', message: 'Your counselor has added notes to your session.', read: false, createdAt: new Date().toISOString(), sessionId });
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error adding session notes:', error);
    return c.json({ success: false, error: 'Failed to add session notes' }, 500);
  }
});

app.put("/make-server-a40ffbb5/sessions/:sessionId/feedback", async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const { rating, comment } = await c.req.json();
    const session = await kv.get(sessionId);
    if (!session) return c.json({ success: false, error: 'Session not found' }, 404);
    
    await kv.set(sessionId, { ...session, feedback: { rating, comment } });
    return c.json({ success: true });
  } catch (error) {
    console.error('Error adding session feedback:', error);
    return c.json({ success: false, error: 'Failed to add session feedback' }, 500);
  }
});

// ==================== NOTIFICATION ENDPOINTS ====================

app.get("/make-server-a40ffbb5/notifications/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const allNotifications = await kv.getByPrefix('notif_');
    const userNotifications = allNotifications.filter((n: any) => n.userId === userId);
    userNotifications.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return c.json({ success: true, notifications: userNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return c.json({ success: false, error: 'Failed to fetch notifications' }, 500);
  }
});

app.put("/make-server-a40ffbb5/notifications/:notificationId/read", async (c) => {
  try {
    const notificationId = c.req.param('notificationId');
    const notification = await kv.get(notificationId);
    if (!notification) return c.json({ success: false, error: 'Notification not found' }, 404);
    
    await kv.set(notificationId, { ...notification, read: true });
    return c.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return c.json({ success: false, error: 'Failed to mark notification as read' }, 500);
  }
});

app.put("/make-server-a40ffbb5/notifications/:userId/read-all", async (c) => {
  try {
    const userId = c.req.param('userId');
    const allNotifications = await kv.getByPrefix('notif_');
    const userNotifications = allNotifications.filter((n: any) => n.userId === userId && !n.read);
    for (const notification of userNotifications) {
      await kv.set(notification.id, { ...notification, read: true });
    }
    return c.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return c.json({ success: false, error: 'Failed to mark all notifications as read' }, 500);
  }
});

app.delete("/make-server-a40ffbb5/notifications/:notificationId", async (c) => {
  try {
    const notificationId = c.req.param('notificationId');
    await kv.del(notificationId);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return c.json({ success: false, error: 'Failed to delete notification' }, 500);
  }
});

app.post("/make-server-a40ffbb5/notifications/send", async (c) => {
  try {
    const { userId, type, title, message, sessionId } = await c.req.json();
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(notificationId, { id: notificationId, userId, type, title, message, read: false, createdAt: new Date().toISOString(), sessionId });
    return c.json({ success: true, notificationId });
  } catch (error) {
    console.error('Error sending notification:', error);
    return c.json({ success: false, error: 'Failed to send notification' }, 500);
  }
});

// ==================== PASSWORD MANAGEMENT ENDPOINTS ====================

app.get("/make-server-a40ffbb5/admin/users/:userId/password-status", async (c) => {
  try {
    const userId = c.req.param('userId');
    const user = await kv.get(`user_${userId}`);
    if (!user) return c.json({ success: false, error: 'User not found' }, 404);
    const hasPassword = user.password && user.password !== '';
    let status = 'not_set';
    if (hasPassword) status = 'set';
    else if (user.ssoProvider) status = 'sso_managed';
    else if (user.pendingPasswordSet) status = 'pending_invite';
    return c.json({ success: true, status: { status, hasPassword, lastPasswordChange: user.lastPasswordChange || user.createdAt, passwordSetVia: user.passwordSetVia || 'unknown', ssoProvider: user.ssoProvider || null, isActive: user.isActive !== false, requiresPasswordChange: user.requiresPasswordChange || false } });
  } catch (error) {
    console.error('Error getting password status:', error);
    return c.json({ success: false, error: 'Failed to get password status' }, 500);
  }
});

app.post("/make-server-a40ffbb5/admin/users/:userId/send-set-password-link", async (c) => {
  try {
    const userId = c.req.param('userId');
    const { adminId, reason } = await c.req.json();
    const user = await kv.get(`user_${userId}`);
    if (!user) return c.json({ success: false, error: 'User not found' }, 404);
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const tokenId = `pwd_token_${userId}_${Date.now()}`;
    await kv.set(tokenId, { id: tokenId, userId, token, type: 'set_password', expiresAt: expiresAt.toISOString(), used: false, createdBy: adminId });
    await kv.set(`user_${userId}`, { ...user, pendingPasswordSet: true, passwordTokenId: tokenId });
    await kv.set(`audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, { adminId, targetUserId: userId, action: 'SEND_SET_PASSWORD_LINK', reason, tokenId, timestamp: new Date().toISOString() });
    return c.json({ success: true, message: 'Set password link sent', setPasswordUrl: `/set-password?token=${token}`, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    console.error('Error sending set password link:', error);
    return c.json({ success: false, error: 'Failed to send set password link' }, 500);
  }
});

app.post("/make-server-a40ffbb5/admin/users/:userId/generate-temp-password", async (c) => {
  try {
    const userId = c.req.param('userId');
    const { adminId, reason, emailToUser } = await c.req.json();
    const user = await kv.get(`user_${userId}`);
    if (!user) return c.json({ success: false, error: 'User not found' }, 404);
    if (user.ssoProvider) return c.json({ success: false, error: 'User uses SSO authentication' }, 400);
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const tempPassword = Array.from(array, byte => charset[byte % charset.length]).join('');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const tempPwdId = `temp_pwd_${userId}`;
    await kv.set(tempPwdId, { id: tempPwdId, userId, password: tempPassword, expiresAt: expiresAt.toISOString(), singleUse: true, used: false, createdBy: adminId });
    await kv.set(`user_${userId}`, { ...user, tempPasswordActive: true, tempPasswordId: tempPwdId, requiresPasswordChange: true });
    await kv.set(`audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, { adminId, targetUserId: userId, action: 'GENERATE_TEMP_PASSWORD', reason, emailToUser, timestamp: new Date().toISOString() });
    return c.json({ success: true, message: 'Temporary password generated', tempPassword, expiresAt: expiresAt.toISOString(), expiresInMinutes: 15, singleUse: true, warning: 'This password is shown only once and cannot be retrieved again.' });
  } catch (error) {
    console.error('Error generating temp password:', error);
    return c.json({ success: false, error: 'Failed to generate temporary password' }, 500);
  }
});

app.post("/make-server-a40ffbb5/admin/users/:userId/force-password-reset", async (c) => {
  try {
    const userId = c.req.param('userId');
    const { adminId, reason } = await c.req.json();
    const user = await kv.get(`user_${userId}`);
    if (!user) return c.json({ success: false, error: 'User not found' }, 404);
    if (user.ssoProvider) return c.json({ success: false, error: 'User uses SSO authentication' }, 400);
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const tokenId = `pwd_reset_${userId}_${Date.now()}`;
    await kv.set(tokenId, { id: tokenId, userId, token, type: 'force_reset', expiresAt: expiresAt.toISOString(), used: false, createdBy: adminId });
    await kv.set(`user_${userId}`, { ...user, requiresPasswordChange: true, passwordResetRequired: true, passwordResetTokenId: tokenId, currentPasswordInvalidated: true });
    await kv.set(`audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, { adminId, targetUserId: userId, action: 'FORCE_PASSWORD_RESET', reason, tokenId, timestamp: new Date().toISOString() });
    return c.json({ success: true, message: 'Password reset forced', resetUrl: `/reset-password?token=${token}`, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    console.error('Error forcing password reset:', error);
    return c.json({ success: false, error: 'Failed to force password reset' }, 500);
  }
});

app.post("/make-server-a40ffbb5/admin/users/:userId/deactivate", async (c) => {
  try {
    const userId = c.req.param('userId');
    const { adminId, reason } = await c.req.json();
    const user = await kv.get(`user_${userId}`);
    if (!user) return c.json({ success: false, error: 'User not found' }, 404);
    await kv.set(`user_${userId}`, { ...user, isActive: false, deactivatedAt: new Date().toISOString(), deactivatedBy: adminId, deactivationReason: reason });
    await kv.set(`audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, { adminId, targetUserId: userId, action: 'DEACTIVATE_USER', reason, timestamp: new Date().toISOString() });
    return c.json({ success: true, message: 'User access deactivated' });
  } catch (error) {
    console.error('Error deactivating user:', error);
    return c.json({ success: false, error: 'Failed to deactivate user' }, 500);
  }
});

app.post("/make-server-a40ffbb5/admin/users/:userId/reactivate", async (c) => {
  try {
    const userId = c.req.param('userId');
    const { adminId, reason } = await c.req.json();
    const user = await kv.get(`user_${userId}`);
    if (!user) return c.json({ success: false, error: 'User not found' }, 404);
    await kv.set(`user_${userId}`, { ...user, isActive: true, reactivatedAt: new Date().toISOString(), reactivatedBy: adminId, deactivationReason: null });
    await kv.set(`audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, { adminId, targetUserId: userId, action: 'REACTIVATE_USER', reason, timestamp: new Date().toISOString() });
    return c.json({ success: true, message: 'User access reactivated' });
  } catch (error) {
    console.error('Error reactivating user:', error);
    return c.json({ success: false, error: 'Failed to reactivate user' }, 500);
  }
});

app.get("/make-server-a40ffbb5/admin/users/:userId/audit-logs", async (c) => {
  try {
    const userId = c.req.param('userId');
    const allAudits = await kv.getByPrefix('audit_');
    const userAudits = allAudits.filter((audit: any) => audit.targetUserId === userId);
    userAudits.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return c.json({ success: true, audits: userAudits });
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return c.json({ success: false, error: 'Failed to get audit logs' }, 500);
  }
});

app.get("/make-server-a40ffbb5/admin/audit-logs", async (c) => {
  try {
    const allAudits = await kv.getByPrefix('audit_');
    allAudits.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return c.json({ success: true, audits: allAudits });
  } catch (error) {
    console.error('Error getting all audit logs:', error);
    return c.json({ success: false, error: 'Failed to get audit logs' }, 500);
  }
});

app.post("/make-server-a40ffbb5/auth/verify-password-token", async (c) => {
  try {
    const { token } = await c.req.json();
    const allTokens = [...await kv.getByPrefix('pwd_token_'), ...await kv.getByPrefix('pwd_reset_')];
    const tokenData = allTokens.find((t: any) => t.token === token);
    if (!tokenData) return c.json({ success: false, error: 'Invalid token' }, 400);
    if (new Date(tokenData.expiresAt) < new Date()) return c.json({ success: false, error: 'Token expired' }, 400);
    if (tokenData.used) return c.json({ success: false, error: 'Token already used' }, 400);
    return c.json({ success: true, valid: true, userId: tokenData.userId, type: tokenData.type });
  } catch (error) {
    console.error('Error verifying token:', error);
    return c.json({ success: false, error: 'Failed to verify token' }, 500);
  }
});

app.post("/make-server-a40ffbb5/auth/set-password-with-token", async (c) => {
  try {
    const { token, newPassword } = await c.req.json();
    const allTokens = [...await kv.getByPrefix('pwd_token_'), ...await kv.getByPrefix('pwd_reset_')];
    const tokenData = allTokens.find((t: any) => t.token === token);
    if (!tokenData) return c.json({ success: false, error: 'Invalid token' }, 400);
    if (new Date(tokenData.expiresAt) < new Date()) return c.json({ success: false, error: 'Token expired' }, 400);
    if (tokenData.used) return c.json({ success: false, error: 'Token already used' }, 400);
    await kv.set(tokenData.id, { ...tokenData, used: true, usedAt: new Date().toISOString() });
    const user = await kv.get(`user_${tokenData.userId}`);
    if (!user) return c.json({ success: false, error: 'User not found' }, 404);
    await kv.set(`user_${tokenData.userId}`, { ...user, password: newPassword, lastPasswordChange: new Date().toISOString(), passwordSetVia: tokenData.type === 'set_password' ? 'invite' : 'reset', pendingPasswordSet: false, requiresPasswordChange: false, passwordResetRequired: false, currentPasswordInvalidated: false, passwordTokenId: null, passwordResetTokenId: null });
    return c.json({ success: true, message: 'Password set successfully' });
  } catch (error) {
    console.error('Error setting password with token:', error);
    return c.json({ success: false, error: 'Failed to set password' }, 500);
  }
});

Deno.serve(app.fetch);