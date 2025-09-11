
// Guard for server-side rendering
const isBrowser = typeof window !== 'undefined';

export type Event = {
  id: string;
  title: string;
  description: string;
  category: 'Workshop' | 'Seminar' | 'Social' | 'Sports';
  date: string;
  deadline: string;
  limit: number;
  poster: string;
  teacherEmail: string;
  participants: string[]; // array of student emails
};

export interface Notification {
  id: string;
  from: string; // student or teacher email
  message: string;
  date: string;
  read: boolean;
}

export type User = {
    id: string; 
    name: string;
    email: string;
    password?: string; 
    role: "student" | "teacher";
    photo: string; // data URI
    bio: string;
    notifications: Notification[];
}

export type FAQ = {
  id: string;
  question: string;
  answer: string;
};

// =================================================================
// Data Seeding and Initialization
// =================================================================

const defaultUsers: User[] = [
    {
        id: 'user1',
        name: "Test Student",
        email: "student@test.com",
        password: "password",
        role: "student",
        photo: "",
        bio: "Eager to learn and participate in campus events!",
        notifications: []
    },
    {
        id: 'user2',
        name: "Test Teacher",
        email: "teacher@test.com",
        password: "password",
        role: "teacher",
        photo: "",
        bio: "Dedicated to fostering a vibrant learning community.",
        notifications: [
            { id: "notif1", from: "student@test.com", message: "Can I get an extension on the assignment?", date: new Date(Date.now() - 86400000).toISOString(), read: false },
            { id: "notif2", from: "student@test.com", message: "What are the topics for the next seminar?", date: new Date(Date.now() - 172800000).toISOString(), read: true },
        ]
    }
];

const defaultFaqs: FAQ[] = [
    {
        id: 'faq1',
        question: 'What is the deadline for project submission?',
        answer: 'The final project deadline is May 15th at 11:59 PM. No late submissions will be accepted.',
    },
    {
        id: 'faq2',
        question: 'Where can I find the course materials?',
        answer: 'All course materials, including lecture slides and recordings, are available on the "Materials" tab of the course portal.',
    },
];

const defaultEvents: Event[] = [
    {
        id: 'event1',
        title: "Intro to AI Workshop",
        description: "A beginner-friendly workshop on the fundamentals of Artificial Intelligence.",
        category: "Workshop",
        date: new Date(Date.now() + 604800000).toISOString(), // 1 week from now
        deadline: new Date(Date.now() + 432000000).toISOString(), // 5 days from now
        limit: 50,
        poster: "https://picsum.photos/seed/event1/600/400",
        teacherEmail: "teacher@test.com",
        participants: ["student@test.com"]
    },
    {
        id: 'event2',
        title: "Campus Movie Night",
        description: "Join us for an outdoor screening of a classic film. Popcorn provided!",
        category: "Social",
        date: new Date(Date.now() + 1209600000).toISOString(), // 2 weeks from now
        deadline: new Date(Date.now() + 1036800000).toISOString(), // 12 days from now
        limit: 0, // unlimited
        poster: "https://picsum.photos/seed/event2/600/400",
        teacherEmail: "teacher@test.com",
        participants: []
    }
];


const initializeData = () => {
    if (!isBrowser) return;
    if (!localStorage.getItem('mycampus_users')) {
        localStorage.setItem('mycampus_users', JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem('mycampus_events')) {
        localStorage.setItem('mycampus_events', JSON.stringify(defaultEvents));
    }
     if (!localStorage.getItem('mycampus_faqs')) {
        localStorage.setItem('mycampus_faqs', JSON.stringify(defaultFaqs));
    }
};

// Initialize data on load
initializeData();

// =================================================================
// Universal Data Access Functions using localStorage
// =================================================================

// --- Users ---

export const getAllUsers = (): User[] => {
    if (!isBrowser) return [];
    const usersJson = localStorage.getItem('mycampus_users');
    return usersJson ? JSON.parse(usersJson) : [];
}

export const getUserByEmail = (email: string): User | null => {
  if (!isBrowser) return null;
  const users = getAllUsers();
  return users.find(u => u.email === email) || null;
};

export const addUser = (user: Omit<User, 'id'>): string => {
    if (!isBrowser) return '';
    const users = getAllUsers();
    const newUser = { ...user, id: `user${Date.now()}`};
    const updatedUsers = [...users, newUser];
    localStorage.setItem('mycampus_users', JSON.stringify(updatedUsers));
    return newUser.id;
}

export const updateUser = (userId: string, userData: Partial<User>): void => {
    if (!isBrowser) return;
    let users = getAllUsers();
    users = users.map(u => u.id === userId ? { ...u, ...userData } : u);
    localStorage.setItem('mycampus_users', JSON.stringify(users));
}

export const addNotification = (email: string, notification: Notification): boolean => {
    if (!isBrowser) return false;
    const user = getUserByEmail(email);
    if (user && user.id) {
        const updatedNotifications = [notification, ...user.notifications];
        updateUser(user.id, { notifications: updatedNotifications });
        return true;
    }
    return false;
};

export const updateNotifications = (userId: string, notifications: Notification[]) => {
    if (!isBrowser) return;
    updateUser(userId, { notifications });
};


// --- Events ---
export const getEvents = (): Event[] => {
    if (!isBrowser) return [];
    const eventsJson = localStorage.getItem('mycampus_events');
    const eventList = eventsJson ? JSON.parse(eventsJson) : [];
    // Ensure sorting returns a consistent order
    return eventList.sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getEventById = (id: string): Event | null => {
    if (!isBrowser) return null;
    const events = getEvents();
    return events.find(e => e.id === id) || null;
}

export const addEvent = (event: Omit<Event, 'id'>): string => {
    if (!isBrowser) return '';
    const events = getEvents();
    const newEvent = { ...event, id: `event${Date.now()}` };
    const updatedEvents = [newEvent, ...events];
    localStorage.setItem('mycampus_events', JSON.stringify(updatedEvents));
    return newEvent.id;
}

export const updateEvent = (eventId: string, eventData: Partial<Event>): void => {
    if (!isBrowser) return;
    let events = getEvents();
    events = events.map(e => e.id === eventId ? { ...e, ...eventData } : e);
    localStorage.setItem('mycampus_events', JSON.stringify(events));
}

export const deleteEvent = (eventId: string): void => {
    if (!isBrowser) return;
    let events = getEvents();
    events = events.filter(e => e.id !== eventId);
    localStorage.setItem('mycampus_events', JSON.stringify(events));
}

// --- FAQs ---
export const getFaqs = (): FAQ[] => {
  if (!isBrowser) return [];
  const faqsJson = localStorage.getItem('mycampus_faqs');
  return faqsJson ? JSON.parse(faqsJson) : [];
};

export const addFaq = (faq: Omit<FAQ, 'id'>): string => {
    if (!isBrowser) return '';
    const faqs = getFaqs();
    const newFaq = { ...faq, id: `faq${Date.now()}` };
    const updatedFaqs = [...faqs, newFaq];
    localStorage.setItem('mycampus_faqs', JSON.stringify(updatedFaqs));
    return newFaq.id;
};

export const updateFaq = (faqId: string, faqData: Partial<FAQ>): void => {
    if (!isBrowser) return;
    let faqs = getFaqs();
    faqs = faqs.map(f => f.id === faqId ? { ...f, ...faqData } : f);
    localStorage.setItem('mycampus_faqs', JSON.stringify(faqs));
};

export const deleteFaq = (faqId: string): void => {
    if (!isBrowser) return;
    let faqs = getFaqs();
    faqs = faqs.filter(f => f.id !== faqId);
    localStorage.setItem('mycampus_faqs', JSON.stringify(faqs));
};
