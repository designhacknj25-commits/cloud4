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
    name: string;
    email: string;
    password: string;
    role: "student" | "teacher";
    photo: string; // Will store as a data URI
    bio: string;
    notifications: Notification[];
}

export type FAQ = {
  id: string;
  question: string;
  answer: string;
};

// =================================================================
// Universal Data Access Functions using localStorage
// =================================================================

const isServer = typeof window === 'undefined';

// --- Users ---
const USERS_KEY = 'cc_users_v3';

export const getUsers = (): User[] => {
  if (isServer) return [];
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: User[]) => {
  if (isServer) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const initializeUsers = () => {
    if (localStorage.getItem(USERS_KEY) === null) {
        const defaultUsers: User[] = [
            {
                name: "Test Student",
                email: "student@test.com",
                password: "password",
                role: "student",
                photo: "",
                bio: "Eager to learn and participate in campus events!",
                notifications: []
            },
            {
                name: "Test Teacher",
                email: "teacher@test.com",
                password: "password",
                role: "teacher",
                photo: "",
                bio: "Dedicated to fostering a vibrant learning community.",
                notifications: []
            }
        ];
        saveUsers(defaultUsers);
    }
};

// --- Events ---
const EVENTS_KEY = 'cc_events_v1';

export const getEvents = (): Event[] => {
  if (isServer) return [];
  const events = localStorage.getItem(EVENTS_KEY);
  return events ? JSON.parse(events) : [];
}

export const saveEvents = (events: Event[]) => {
  if (isServer) return;
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export const initializeEvents = () => {
    if (localStorage.getItem(EVENTS_KEY) === null) {
        saveEvents([]);
    }
}

// --- FAQs ---
const FAQS_KEY = 'cc_faqs_v1';

export const getFaqs = (): FAQ[] => {
  if (isServer) return [];
  const faqs = localStorage.getItem(FAQS_KEY);
  
  if (localStorage.getItem(FAQS_KEY) === null) {
    const defaultFaqs = [
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
    saveFaqs(defaultFaqs);
    return defaultFaqs;
  }
  return faqs ? JSON.parse(faqs) : [];
};

export const saveFaqs = (faqs: FAQ[]) => {
  if (isServer) return;
  localStorage.setItem(FAQS_KEY, JSON.stringify(faqs));
};


// Run initializers
if (!isServer) {
    initializeUsers();
    initializeEvents();
    getFaqs(); // This will trigger the initialization with default FAQs if none exist
}
