import { projectId, publicAnonKey } from './supabase/info';

const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5`;

// Helper function for making API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// Counselor API functions
export const counselorAPI = {
  getAll: async () => {
    return apiCall('/counselors');
  },
  
  // Admin functions
  getAllAdmin: async () => {
    return apiCall('/admin/counselors');
  },
  
  create: async (counselor: any) => {
    return apiCall('/admin/counselors', {
      method: 'POST',
      body: JSON.stringify(counselor),
    });
  },
  
  update: async (id: string, counselor: any) => {
    return apiCall(`/admin/counselors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(counselor),
    });
  },
  
  delete: async (id: string) => {
    return apiCall(`/admin/counselors/${id}`, {
      method: 'DELETE',
    });
  },
};

// Resources API functions
export const resourcesAPI = {
  getAll: async () => {
    return apiCall('/resources');
  },
  
  // Admin functions
  getAllAdmin: async () => {
    return apiCall('/admin/resources');
  },
  
  create: async (resource: any) => {
    return apiCall('/admin/resources', {
      method: 'POST',
      body: JSON.stringify(resource),
    });
  },
  
  update: async (id: string, resource: any) => {
    return apiCall(`/admin/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resource),
    });
  },
  
  delete: async (id: string) => {
    return apiCall(`/admin/resources/${id}`, {
      method: 'DELETE',
    });
  },
};

// Products API functions
export const productsAPI = {
  getAll: async () => {
    return apiCall('/products');
  },
  
  // Admin functions
  getAllAdmin: async () => {
    return apiCall('/admin/products');
  },
  
  create: async (product: any) => {
    return apiCall('/admin/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },
  
  update: async (id: string, product: any) => {
    return apiCall(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },
  
  delete: async (id: string) => {
    return apiCall(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Admin API functions
export const adminAPI = {
  login: async (credentials: { email: string; password: string }) => {
    return apiCall('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};

// Default data for fallback when API is unavailable
export const defaultCounselors = [
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
  }
];

export const defaultResources = [
  {
    id: '1',
    title: 'Understanding Exam Anxiety',
    description: 'Learn practical techniques to manage pre-exam stress and perform better under pressure.',
    category: 'Stress Management',
    duration: '8 min read',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBleGFtfGVufDF8fHx8MTc1OTE2MzQyMHww&ixlib=rb-4.1.0&q=80&w=1080',
    author: 'Dr. Meera Singh',
    tags: ['anxiety', 'exams', 'breathing', 'preparation'],
    content: `Exam anxiety affects millions of students worldwide. Understanding its causes and learning effective management techniques can transform your academic performance.

**What is Exam Anxiety?**

Exam anxiety is a psychological condition characterized by extreme distress before or during examinations. It can manifest as physical symptoms (headaches, nausea, rapid heartbeat) and mental symptoms (racing thoughts, difficulty concentrating, memory blocks).

**Causes of Exam Anxiety**

1. Fear of failure and disappointing parents
2. Lack of preparation or poor time management
3. Past negative experiences with exams
4. Perfectionist tendencies
5. Comparison with peers

**Proven Techniques to Manage Exam Anxiety**

**1. Deep Breathing Exercises**
Practice the 4-7-8 technique: Breathe in for 4 counts, hold for 7, exhale for 8. This activates your parasympathetic nervous system and reduces stress hormones.

**2. Preparation Strategies**
- Start studying well in advance
- Break content into manageable chunks
- Create a realistic study schedule
- Take regular breaks (Pomodoro technique)

**3. Positive Self-Talk**
Replace "I'm going to fail" with "I've prepared well and I'm ready." Your inner dialogue significantly impacts performance.

**4. Physical Exercise**
Regular exercise reduces cortisol levels and improves focus. Even a 20-minute walk can make a difference.

**5. Sleep Hygiene**
Aim for 7-9 hours of quality sleep. Your brain consolidates learning during sleep.

**During the Exam**

- Arrive early to settle in
- Read all instructions carefully
- Start with easier questions to build confidence
- If you feel panic rising, pause and take 3 deep breaths
- Remember: one exam doesn't define your worth

**When to Seek Help**

If exam anxiety severely impacts your daily life or academic performance, consider speaking with a counselor or therapist. Professional support can provide tailored strategies for your specific situation.`
  },
  {
    id: '2',
    title: 'Mindfulness for Students: A Beginner\'s Guide',
    description: 'Discover how mindfulness meditation can improve focus, reduce stress, and enhance overall wellbeing.',
    category: 'Mindfulness',
    duration: '10 min read',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGF0aW9uJTIwbWluZGZ1bG5lc3N8ZW58MXx8fHwxNzU5MTYzNDI2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    author: 'Dr. Ananya Krishnan',
    tags: ['mindfulness', 'meditation', 'focus', 'awareness'],
    content: `Mindfulness is the practice of being fully present and engaged in the current moment. For students juggling academics, social life, and personal challenges, mindfulness offers powerful benefits.

**What is Mindfulness?**

Mindfulness means paying attention to the present moment without judgment. It's about observing your thoughts and feelings without getting caught up in them.

**Benefits for Students**

1. **Improved Concentration**: Regular practice strengthens your ability to focus
2. **Better Memory**: Mindfulness enhances information retention
3. **Reduced Stress**: Lower cortisol levels and better stress management
4. **Enhanced Emotional Regulation**: Better control over reactive emotions
5. **Improved Sleep Quality**: Easier to fall asleep and stay asleep

**Getting Started: Simple Mindfulness Practices**

**1. Mindful Breathing (5 minutes)**
- Sit comfortably with your back straight
- Close your eyes or soften your gaze
- Notice the sensation of breath entering and leaving your body
- When your mind wanders (it will!), gently bring attention back to the breath
- No judgment—wandering is normal and expected

**2. Body Scan Meditation (10 minutes)**
- Lie down or sit comfortably
- Starting from your toes, slowly bring awareness to each body part
- Notice any sensations, tension, or relaxation
- Move gradually up to your head
- This helps release physical tension and increase body awareness

**3. Mindful Walking**
- Walk slowly, paying attention to each step
- Notice the sensation of your feet touching the ground
- Observe your surroundings without labeling or judging
- Perfect for campus walks between classes

**4. Mindful Eating**
- During one meal, eat without distractions
- Notice colors, textures, and flavors
- Chew slowly and appreciate each bite
- This improves digestion and satisfaction

**Integrating Mindfulness into Student Life**

**Before Study Sessions**: 2-minute breathing exercise to clear your mind
**Between Classes**: Mindful walking to reset and recharge
**Before Exams**: 5-minute meditation to calm nerves
**Before Sleep**: Body scan to release the day's tension

**Common Challenges and Solutions**

*"I can't stop my thoughts"*
That's not the goal! Thoughts are natural. Simply notice them and return to your anchor (breath, body, etc.)

*"I don't have time"*
Start with just 2-3 minutes. Even brief practice provides benefits.

*"I feel more anxious when I try to meditate"*
This is common initially. Start with shorter sessions and consider guided meditations.

**Apps and Resources**

- Headspace (student discount available)
- Insight Timer (free)
- UCLA Mindful app
- YouTube guided meditations

**Making It Stick**

1. Practice at the same time daily
2. Start small (2-5 minutes)
3. Be patient with yourself
4. Track your practice in a journal
5. Join a meditation group for accountability

Remember: Mindfulness is a skill that develops over time. Be kind to yourself as you learn.`
  },
  {
    id: '3',
    title: 'Building Healthy Sleep Habits',
    description: 'Quality sleep is essential for academic success and mental health. Learn how to optimize your sleep routine.',
    category: 'Sleep & Wellness',
    duration: '7 min read',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbGVlcCUyMGJlZCUyMHJlc3R8ZW58MXx8fHwxNzU5MTYzNDMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    author: 'Dr. Rahul Khanna',
    tags: ['sleep', 'rest', 'recovery', 'energy'],
    content: `Sleep is not a luxury—it's a biological necessity. For students, quality sleep directly impacts memory consolidation, focus, mood, and academic performance.

**Why Students Struggle with Sleep**

- Academic pressure and late-night studying
- Social media and screen time
- Irregular schedules
- Stress and anxiety
- Caffeine consumption
- Noisy living environments

**The Science of Sleep**

During sleep, your brain:
- Consolidates new information into long-term memory
- Clears out toxins that accumulate during waking hours
- Regulates hormones that affect mood and appetite
- Strengthens neural connections

**Consequences of Poor Sleep**

- Reduced concentration and memory
- Weakened immune system
- Increased anxiety and depression
- Poor decision-making
- Weight gain
- Lower academic performance

**Building a Healthy Sleep Routine**

**1. Consistent Sleep Schedule**
- Go to bed and wake up at the same time every day (yes, even weekends!)
- Your body's circadian rhythm thrives on consistency
- Aim for 7-9 hours per night

**2. Create a Wind-Down Routine (30-60 minutes before bed)**
- Dim the lights
- Avoid screens (blue light disrupts melatonin production)
- Read a book
- Gentle stretching or yoga
- Journaling
- Meditation or deep breathing

**3. Optimize Your Sleep Environment**
- Cool temperature (65-68°F / 18-20°C)
- Complete darkness (use blackout curtains or eye mask)
- Quiet (earplugs or white noise machine)
- Comfortable mattress and pillows
- Reserve bed for sleep only (not studying!)

**4. Mind Your Diet**
- Avoid caffeine after 2 PM
- No heavy meals 3 hours before bed
- Limit alcohol (disrupts REM sleep)
- Small, protein-rich snack if hungry

**5. Exercise Strategically**
- Regular exercise improves sleep quality
- Avoid intense workouts 3 hours before bed
- Morning or afternoon exercise is ideal

**6. Manage Stress and Anxiety**
- Write a worry list before bed
- Practice progressive muscle relaxation
- Try the 4-7-8 breathing technique
- Guided sleep meditations

**What to Do If You Can't Sleep**

- Don't force it—get out of bed after 20 minutes
- Do a quiet, non-stimulating activity
- Return to bed when sleepy
- Avoid checking the time (creates anxiety)
- Don't catastrophize about lost sleep

**Power Naps: Do's and Don'ts**

**DO:**
- Keep naps to 20-30 minutes
- Nap between 1-3 PM
- Find a quiet, dark spot

**DON'T:**
- Nap after 4 PM (disrupts nighttime sleep)
- Nap for over 90 minutes
- Rely on naps to make up for poor nighttime sleep

**Exam Period Sleep Strategy**

Contrary to popular belief, all-nighters significantly harm performance. Instead:
- Stick to your sleep schedule even during exams
- Review material before bed (enhances consolidation)
- Get full 8 hours before exam day
- Wake up 1-2 hours before exam to be fully alert

**When to Seek Help**

Consult a healthcare provider if you experience:
- Chronic insomnia (difficulty sleeping 3+ nights/week for 3+ months)
- Excessive daytime sleepiness despite adequate sleep
- Loud snoring or breathing pauses (sleep apnea signs)
- Persistent nightmares
- Restless legs or unusual movements

Quality sleep is one of the most powerful tools for academic success and mental wellbeing. Prioritize it!`
  },
  {
    id: '4',
    title: 'Managing Social Anxiety in College',
    description: 'Practical strategies to navigate social situations, build confidence, and make meaningful connections.',
    category: 'Social Wellbeing',
    duration: '9 min read',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllbmRzJTIwc29jaWFsJTIwZ3JvdXB8ZW58MXx8fHwxNzU5MTYzNDM4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    author: 'Dr. Priya Malhotra',
    tags: ['social anxiety', 'confidence', 'relationships', 'communication'],
    content: `Social anxiety is one of the most common mental health challenges faced by college students. You're not alone, and there are proven strategies to help you thrive socially.

**Understanding Social Anxiety**

Social anxiety disorder involves intense fear of social situations where you might be judged, embarrassed, or rejected. It's different from shyness—it can significantly impact daily life and academic success.

**Common Triggers for Students**

- Class presentations
- Meeting new people
- Group projects
- Cafeteria or social events
- Speaking up in class
- Dating and romantic situations

**Physical Symptoms**

- Racing heartbeat
- Sweating
- Trembling or shaking
- Nausea or stomach upset
- Difficulty breathing
- Mind going blank

**Mental Symptoms**

- Intense worry about upcoming social events
- Fear of being judged or humiliated
- Analyzing social interactions for days afterward
- Avoiding social situations
- Difficulty making eye contact

**Cognitive Behavioral Strategies**

**1. Challenge Negative Thoughts**

Anxious thought: "Everyone will think I'm stupid if I ask this question"

Reality check:
- What evidence do I have for this thought?
- What evidence contradicts it?
- What would I tell a friend thinking this?
- What's the worst that could realistically happen?

Balanced thought: "Others probably have similar questions. Asking shows I'm engaged and want to learn."

**2. Gradual Exposure**

Create a hierarchy of social situations from least to most anxiety-provoking:

Level 1: Making eye contact with classmates
Level 2: Saying hello to someone in the hallway
Level 3: Asking a question after class
Level 4: Joining a study group
Level 5: Attending a small social gathering
Level 6: Speaking up in class discussion
Level 7: Giving a presentation

Start with Level 1 and gradually work up. Celebrate each success!

**3. Preparation Strategies**

Before social situations:
- Practice deep breathing (5 minutes)
- Prepare conversation topics or questions
- Arrive slightly early to settle in
- Remind yourself: "I don't need to be perfect"
- Set a realistic goal (stay for 20 minutes, talk to one person)

**4. In-the-Moment Techniques**

- **Grounding**: Notice 5 things you can see, 4 you can hear, 3 you can touch, 2 you can smell, 1 you can taste
- **Controlled breathing**: Breathe in for 4, hold for 4, out for 6
- **Self-compassion**: "This is hard, but I'm doing my best"
- **Focus outward**: Pay attention to what others are saying rather than your own anxiety

**Building Social Confidence**

**1. Start Small**
- Join clubs aligned with your interests
- Attend smaller gatherings before large parties
- Connect with classmates through study groups

**2. Practice Active Listening**
- Ask open-ended questions
- Show genuine interest in others
- Remember: people enjoy talking about themselves
- You don't need to be the most interesting person—be interested!

**3. Develop Conversation Skills**
- FORD method: Family, Occupation, Recreation, Dreams
- Share about yourself too (reciprocal conversation)
- It's okay to have silences
- Quality over quantity in friendships

**4. Reframe "Awkward" Moments**
Everyone has awkward moments. They're normal, not catastrophic. Often, others don't notice or remember them as much as you think.

**Online vs. Offline Socializing**

- Use online connections as a starting point, not a replacement
- Join Discord servers or WhatsApp groups for your classes
- Transition online friendships to coffee meetups
- Balance screen time with face-to-face interaction

**Self-Care Practices**

- Regular exercise (reduces anxiety hormones)
- Adequate sleep
- Limit caffeine and alcohol
- Mindfulness meditation
- Journaling about social successes

**When to Seek Professional Help**

Consider therapy if social anxiety:
- Prevents you from attending classes or participating
- Leads to substance use as coping mechanism
- Causes severe distress or depression
- Doesn't improve with self-help strategies

Cognitive Behavioral Therapy (CBT) is highly effective for social anxiety. Many college campuses offer free or low-cost counseling services.

**Remember**

- Your worth is not determined by social performance
- Small steps lead to big changes
- Setbacks are part of the process
- You deserve meaningful connections
- It gets easier with practice

Start today with one small social interaction. You've got this!`
  },
  {
    id: '5',
    title: 'Time Management for Academic Success',
    description: 'Master the art of balancing academics, social life, and self-care with proven time management techniques.',
    category: 'Productivity',
    duration: '8 min read',
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFubmVyJTIwb3JnYW5pemVyJTIwc3R1ZHl8ZW58MXx8fHwxNzU5MTYzNDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    author: 'Dr. Amit Desai',
    tags: ['productivity', 'planning', 'organization', 'efficiency'],
    content: `Effective time management is a skill that can transform your academic performance and reduce stress. Here's how to take control of your schedule.

**Why Time Management Matters**

- Reduces last-minute cramming and all-nighters
- Lowers stress and anxiety
- Improves academic performance
- Creates space for social life and hobbies
- Builds discipline for future career
- Enhances sense of control and confidence

**Common Time Management Pitfalls**

1. Procrastination and perfectionism
2. Underestimating task duration
3. Not prioritizing effectively
4. Getting distracted by social media
5. Saying yes to everything
6. No clear goals or plans

**Proven Time Management Techniques**

**1. The Eisenhower Matrix**

Organize tasks by urgency and importance:

**Quadrant 1** (Urgent + Important): Do immediately
- Exam tomorrow
- Assignment due today
- Health emergency

**Quadrant 2** (Not Urgent + Important): Schedule these!
- Long-term projects
- Exercise and health
- Relationship building
- Skill development

**Quadrant 3** (Urgent + Not Important): Delegate or minimize
- Some emails and messages
- Other people's minor emergencies
- Unnecessary meetings

**Quadrant 4** (Not Urgent + Not Important): Eliminate
- Mindless scrolling
- Excessive Netflix
- Unproductive gossip

Focus most energy on Quadrant 2 to prevent Quadrant 1 crises.

**2. Time Blocking**

Assign specific time blocks for different activities:

**Sample Daily Schedule:**
- 6:30-7:30 AM: Morning routine, exercise
- 8:00-12:00 PM: Deep work (classes, studying)
- 12:00-1:00 PM: Lunch, walk
- 1:00-5:00 PM: Classes, meetings, shallow work
- 5:00-6:30 PM: Personal time, hobbies
- 6:30-7:30 PM: Dinner, social
- 7:30-9:30 PM: Study/assignments
- 9:30-10:30 PM: Wind-down routine
- 11:00 PM: Sleep

Customize based on your energy patterns and class schedule.

**3. The Pomodoro Technique**

Work in focused 25-minute intervals with 5-minute breaks:

1. Choose a task
2. Set timer for 25 minutes
3. Work with full focus
4. Take 5-minute break
5. After 4 pomodoros, take 15-30 minute break

Benefits:
- Maintains focus
- Prevents burnout
- Makes large tasks manageable
- Creates sense of urgency

**4. The 2-Minute Rule**

If something takes less than 2 minutes, do it immediately:
- Reply to simple emails
- Put clothes away
- Jot down quick notes
- Schedule an appointment

Prevents small tasks from piling up.

**5. Weekly Planning Session**

Every Sunday (or your preferred day):
- Review the coming week
- List all assignments, exams, commitments
- Schedule study time for each subject
- Block time for self-care and social activities
- Identify potential conflicts and adjust

**Conquering Procrastination**

**Understand Your "Why"**
- Fear of failure?
- Perfectionism?
- Task feels overwhelming?
- Unclear where to start?

**Strategies by Cause:**

*Overwhelm*: Break into tiny steps. Just start with 5 minutes.

*Perfectionism*: Aim for "good enough" first draft. Edit later.

*Boring task*: Use music, change location, reward yourself after.

*Unclear task*: Ask for clarification. Make a specific plan.

**Managing Distractions**

**Digital Distractions:**
- Use apps like Forest, Freedom, or StayFocusd
- Turn off notifications during study time
- Put phone in another room
- Use website blockers during deep work

**Environmental Distractions:**
- Find your ideal study location
- Use noise-cancelling headphones or earplugs
- Communicate boundaries with roommates
- Keep study space organized and minimal

**Energy Management > Time Management**

Work with your natural rhythms:

**Morning people**: Schedule hardest tasks for AM
**Night owls**: Protect evening hours for deep work

Match tasks to energy levels:
- High energy → Complex problem-solving, writing
- Medium energy → Reading, reviewing notes
- Low energy → Administrative tasks, organizing

**The Power of Routines**

Morning Routine (example):
- Wake at consistent time
- Hydrate
- Exercise or stretch
- Healthy breakfast
- Review daily priorities

Evening Routine:
- Review what you accomplished
- Plan tomorrow's top 3 priorities
- Prepare materials for next day
- Wind-down activities

Routines reduce decision fatigue and create momentum.

**Balancing Academics with Life**

Use the 168-hour framework:
- 56 hours sleep (8/night)
- 40 hours academics (classes + study)
- 14 hours meals and personal care
- 58 hours for everything else!

You have more time than you think. It's about intentionality.

**Tools and Apps**

- **Notion/Todoist**: Task management
- **Google Calendar**: Time blocking
- **Forest**: Focus timer
- **RescueTime**: Track where time goes
- **Habitica**: Gamify your tasks

**Semester Planning**

1. Input all assignment deadlines into calendar
2. Work backwards to create study schedules
3. Build in buffer time for unexpected challenges
4. Schedule breaks and fun activities
5. Review and adjust monthly

**Remember**

- Perfect planning isn't the goal—progress is
- Be flexible and adjust as needed
- Self-compassion when things don't go as planned
- Rest and recreation aren't optional—they're essential
- Time management improves with practice

Start with one technique this week. Master it before adding another. You've got this!`
  },
  {
    id: '6',
    title: 'Building Resilience and Mental Strength',
    description: 'Develop the psychological resilience to bounce back from setbacks and thrive under pressure.',
    category: 'Personal Growth',
    duration: '10 min read',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwc3VjY2VzcyUyMGdyb3d0aHxlbnwxfHx8fDE3NTkxNjM0NTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    author: 'Dr. Kavita Sharma',
    tags: ['resilience', 'growth mindset', 'adversity', 'strength'],
    content: `Resilience isn't something you're born with—it's a skill you can develop. Learn how to bounce back stronger from academic and personal challenges.

**What is Resilience?**

Resilience is the ability to adapt and recover from stress, setbacks, and adversity. It's not about avoiding difficulties, but developing the strength to navigate them successfully.

**Why Resilience Matters for Students**

- Academic setbacks are inevitable
- Exam failures, rejections, and disappointments happen
- Career paths rarely go as planned
- Relationships can be challenging
- Life throws unexpected curveballs

Resilient students don't experience fewer problems—they respond to them more effectively.

**The Components of Resilience**

**1. Emotional Regulation**
Ability to manage intense emotions without being overwhelmed

**2. Cognitive Flexibility**
Seeing situations from multiple perspectives and adapting thinking

**3. Self-Efficacy**
Belief in your ability to handle challenges

**4. Purpose and Meaning**
Connection to values and long-term goals

**5. Social Support**
Strong relationships and willingness to ask for help

**6. Optimism**
Realistic hope that things can improve

**Building Blocks of Resilience**

**1. Develop a Growth Mindset**

**Fixed Mindset**: "I'm bad at math. I'll never improve."
**Growth Mindset**: "I'm struggling with math now, but I can improve with effort and strategy."

Reframe failures as learning opportunities:
- "What can this teach me?"
- "How can I grow from this experience?"
- "What would I do differently next time?"

**2. Practice Self-Compassion**

Treat yourself with the same kindness you'd show a good friend.

Instead of: "I'm such an idiot for failing that exam"
Try: "This is really disappointing, but one exam doesn't define my worth or potential. What support do I need?"

Self-compassion components:
- **Self-kindness** vs. self-judgment
- **Common humanity** vs. isolation ("everyone struggles sometimes")
- **Mindfulness** vs. over-identification with emotions

**3. Cultivate Meaning and Purpose**

Connect daily actions to larger values and goals:
- Why does your education matter to you?
- What impact do you want to have?
- What are you working toward?

Purpose provides motivation during difficult times.

**4. Build a Support Network**

Strong relationships are the #1 predictor of resilience.

- Cultivate 2-3 close, supportive friendships
- Stay connected with family
- Join communities aligned with your interests
- Find mentors in your field
- Participate in study groups
- Don't isolate when struggling

**5. Develop Problem-Solving Skills**

When facing a challenge:

**Step 1**: Define the problem clearly
**Step 2**: Brainstorm possible solutions (without judging)
**Step 3**: Evaluate options (pros/cons)
**Step 4**: Choose and implement a solution
**Step 5**: Review and adjust if needed

**6. Accept What You Can't Control**

Focus energy on what you can influence:

**Can't Control**:
- Other people's opinions
- Past events
- Exam difficulty
- Your roommate's behavior
- Economic conditions

**Can Control**:
- Your effort and preparation
- Your thoughts and self-talk
- How you respond to setbacks
- Who you spend time with
- Your daily habits

Serenity prayer adapted: "Grant me the serenity to accept what I cannot change, courage to change what I can, and wisdom to know the difference."

**7. Maintain Physical Wellbeing**

Physical and mental resilience are interconnected:

- **Exercise**: Reduces stress hormones, improves mood
- **Sleep**: Essential for emotional regulation
- **Nutrition**: Stable blood sugar = stable mood
- **Hydration**: Dehydration affects cognition and mood

**Resilience in Action: Bouncing Back from Failure**

**Scenario**: Failed an important exam

**Step 1: Allow Yourself to Feel**
It's okay to be disappointed. Give yourself time to process.

**Step 2: Avoid Catastrophizing**
Anxious thought: "My life is ruined"
Realistic thought: "This is a setback, not a catastrophe. I have options."

**Step 3: Analyze Objectively**
- What went wrong? (Be honest but not harsh)
- What was within my control?
- What can I learn?

**Step 4: Seek Support**
- Talk to professor about improvement strategies
- Reach out to friends
- Use counseling services if feeling overwhelmed

**Step 5: Create Action Plan**
- Identify specific changes
- Set realistic goals
- Schedule study time
- Find a study partner or tutor

**Step 6: Move Forward**
Don't let one failure define you or derail your entire semester.

**Building Resilience Through Daily Practices**

**Morning:**
- Gratitude journaling (3 things)
- Set daily intention
- Brief meditation

**Throughout Day:**
- Notice negative self-talk and reframe it
- Take breaks to prevent burnout
- Connect with at least one person

**Evening:**
- Reflect on challenges and how you handled them
- Celebrate small wins
- Plan tomorrow with realistic expectations

**Resilience Myths to Avoid**

**Myth 1**: "Resilient people don't ask for help"
**Reality**: Asking for help is a sign of strength and wisdom

**Myth 2**: "Resilience means never feeling negative emotions"
**Reality**: Resilient people feel the full range of emotions but manage them effectively

**Myth 3**: "You're either resilient or you're not"
**Reality**: Resilience is a skill that grows with practice

**Myth 4**: "Resilient people are always positive"
**Reality**: Resilience includes realistic optimism, not toxic positivity

**When Resilience Isn't Enough**

Sometimes challenges require professional support. Seek help if:
- Persistent low mood or anxiety (2+ weeks)
- Thoughts of self-harm
- Substance use as coping mechanism
- Inability to function in daily life
- Trauma that's overwhelming

Therapy, medication, or intensive support may be necessary. This doesn't mean you've failed—it means you're taking care of yourself.

**Long-term Resilience Building**

1. **Embrace Challenges**: Don't avoid all discomfort. Growth happens at the edge of your comfort zone.

2. **Develop Multiple Identities**: Don't define yourself solely as a student. Be an athlete, artist, friend, volunteer, etc.

3. **Learn from Role Models**: Study how others overcame adversity. Read biographies of resilient people.

4. **Journal Regularly**: Track your growth and resilience wins. Review during tough times.

5. **Practice Adversity**: Gradually expose yourself to manageable challenges. Build confidence in your abilities.

**Remember**

- Setbacks are not character flaws
- Struggling doesn't mean you're weak
- Resilience grows through challenges, not despite them
- Your current struggle is building future strength
- It's okay to not be okay sometimes
- Progress isn't linear

You are more resilient than you know. Every challenge you've overcome is proof of your strength. Keep building on that foundation.`
  }
];

export const defaultProducts = [
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
    category: 'Meditation Tools',
    rating: 4.7,
    reviews: 756,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwbWF0JTIwbWVkaXRhdGlvbiUyMGN1c2hpb258ZW58MXx8fHwxNzU5MTYzMzg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    benefits: ['Comfortable meditation posture', 'Supports yoga practice', 'Eco-friendly materials', 'Portable and durable'],
    ingredients: 'Organic Cotton Cover, Buckwheat Hull Filling, TPE Yoga Mat',
    usage: 'Use cushion for seated meditation. Mat suitable for yoga, stretching, and relaxation exercises.',
    inStock: true
  },
  {
    id: '6',
    name: 'Omega-3 Brain Health Capsules',
    description: 'High-potency fish oil supplement supporting cognitive function, mood regulation, and mental clarity.',
    price: 799,
    category: 'Supplements',
    rating: 4.8,
    reviews: 1654,
    image: 'https://images.unsplash.com/photo-1550572017-4659b6021b6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbWVnYSUyMDMlMjBzdXBwbGVtZW50fGVufDF8fHx8MTc1OTE2MzM5MHww&ixlib=rb-4.1.0&q=80&w=1080',
    benefits: ['Supports brain health', 'Improves mood and emotional balance', 'Reduces inflammation', 'Enhances memory and focus'],
    ingredients: '1000mg Fish Oil (EPA 300mg, DHA 200mg), Vitamin E, Gelatin Capsule',
    usage: 'Take 2 capsules daily with meals. Store in cool, dry place. Consult doctor if on blood thinners.',
    inStock: true
  },
  {
    id: '7',
    name: 'Cognitive Behavioral Therapy for Teens',
    description: 'Practical CBT guide designed specifically for Indian students dealing with academic pressure and anxiety.',
    price: 395,
    category: 'Books',
    rating: 4.9,
    reviews: 892,
    image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwdGVlbnMlMjBzdHVkZW50c3xlbnwxfHx8fDE3NTkxNjMzOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    benefits: ['Teen-friendly CBT techniques', 'Exam anxiety management', 'Social confidence building', 'Emotion regulation skills'],
    ingredients: null,
    usage: 'Read one chapter weekly. Practice exercises daily. Suitable for ages 13-19.',
    inStock: true
  },
  {
    id: '8',
    name: 'Gratitude & Positivity Journal',
    description: 'Beautiful hardcover journal with 180 pages of prompts to cultivate gratitude and positive thinking habits.',
    price: 299,
    category: 'Journals',
    rating: 4.7,
    reviews: 1245,
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmF0aXR1ZGUlMjBqb3VybmFsfGVufDF8fHx8MTc1OTE2MzQwMnww&ixlib=rb-4.1.0&q=80&w=1080',
    benefits: ['Build gratitude practice', 'Shift to positive mindset', 'Track mood improvements', 'Develop self-compassion'],
    ingredients: null,
    usage: 'Write 3 gratitudes daily. Reflect on positive moments. Best used in morning or before bed.',
    inStock: true
  },
  {
    id: '9',
    name: 'Chamomile & Peppermint Sleep Tea',
    description: 'Organic herbal tea blend formulated to promote relaxation and improve sleep quality naturally.',
    price: 349,
    category: 'Supplements',
    rating: 4.6,
    reviews: 678,
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiYWwlMjB0ZWElMjBzbGVlcHxlbnwxfHx8fDE3NTkxNjM0MDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    benefits: ['Natural sleep aid', 'Calms nervous system', 'Caffeine-free', 'Supports digestion'],
    ingredients: 'Organic Chamomile Flowers, Peppermint Leaves, Lemon Balm, Passionflower',
    usage: 'Steep 1 tea bag in hot water for 5-7 minutes. Drink 30-60 minutes before bedtime.',
    inStock: true
  },
  {
    id: '10',
    name: 'Singing Bowl Meditation Set',
    description: 'Handcrafted Tibetan singing bowl with mallet and cushion. Creates soothing sounds for meditation and stress relief.',
    price: 1799,
    category: 'Meditation Tools',
    rating: 4.9,
    reviews: 543,
    image: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5naW5nJTIwYm93bCUyMG1lZGl0YXRpb258ZW58MXx8fHwxNzU5MTYzNDE0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    benefits: ['Deep relaxation', 'Enhances meditation practice', 'Sound healing therapy', 'Reduces stress and tension'],
    ingredients: 'Bronze Alloy Bowl, Wooden Mallet, Silk Cushion',
    usage: 'Gently strike or circle rim with mallet. Use for meditation, yoga, or sound healing sessions.',
    inStock: true
  }
];