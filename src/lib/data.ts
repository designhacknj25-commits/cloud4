import { db } from './firebase';
import { collection, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, writeBatch } from "firebase/firestore";

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
    id?: string; // Firestore ID
    name: string;
    email: string;
    password?: string; // Should not be stored in plaintext in a real app
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
// Universal Data Access Functions using Firestore
// =================================================================

// --- Users ---
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  const userDoc = querySnapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() } as User;
};

export const getAllUsers = async (): Promise<User[]> => {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return userList;
}


export const addUser = async (user: Omit<User, 'id'>): Promise<string> => {
    const usersRef = collection(db, "users");
    const docRef = await addDoc(usersRef, user);
    return docRef.id;
}

export const updateUser = async (userId: string, userData: Partial<User>): Promise<void> => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, userData);
}

export const addNotification = async (email: string, notification: Notification) => {
    const user = await getUserByEmail(email);
    if (user && user.id) {
        const updatedNotifications = [notification, ...user.notifications];
        await updateUser(user.id, { notifications: updatedNotifications });
        return true;
    }
    return false;
};

export const updateNotifications = async (userId: string, notifications: Notification[]) => {
    await updateUser(userId, { notifications });
};


// --- Events ---
export const getEvents = async (): Promise<Event[]> => {
  const eventsCol = collection(db, 'events');
  const eventSnapshot = await getDocs(eventsCol);
  const eventList = eventSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Event));
  // Sort by date in descending order (newest first)
  eventList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return eventList;
};

export const getEventById = async (id: string): Promise<Event | null> => {
    const eventRef = doc(db, "events", id);
    const eventSnap = await getDoc(eventRef);
    if(eventSnap.exists()) {
        return { id: eventSnap.id, ...eventSnap.data() } as Event;
    }
    return null;
}

export const addEvent = async (event: Omit<Event, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, 'events'), event);
    return docRef.id;
}

export const updateEvent = async (eventId: string, eventData: Partial<Event>): Promise<void> => {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, eventData);
}

export const deleteEvent = async (eventId: string): Promise<void> => {
    await deleteDoc(doc(db, "events", eventId));
}

// --- FAQs ---
export const getFaqs = async (): Promise<FAQ[]> => {
  const faqsCol = collection(db, 'faqs');
  const faqSnapshot = await getDocs(faqsCol);
  return faqSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FAQ));
};

export const addFaq = async (faq: Omit<FAQ, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, "faqs"), faq);
    return docRef.id;
};

export const updateFaq = async (faqId: string, faqData: Partial<FAQ>): Promise<void> => {
    const faqRef = doc(db, "faqs", faqId);
    await updateDoc(faqRef, faqData);
};

export const deleteFaq = async (faqId: string): Promise<void> => {
    await deleteDoc(doc(db, "faqs", faqId));
};


// --- Initialization for first time use ---
const initializeData = async () => {
    const metaRef = doc(db, 'meta', 'initialized');
    const metaSnap = await getDoc(metaRef);

    if (!metaSnap.exists()) {
        console.log("First time setup: Initializing default data...");
        const batch = writeBatch(db);

        // Add default users
        const defaultUsers: Omit<User, 'id'>[] = [
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
        defaultUsers.forEach(user => {
            const userRef = doc(collection(db, 'users'));
            batch.set(userRef, user);
        });

        // Add default FAQs
        const defaultFaqs: Omit<FAQ, 'id'>[] = [
            {
                question: 'What is the deadline for project submission?',
                answer: 'The final project deadline is May 15th at 11:59 PM. No late submissions will be accepted.',
            },
            {
                question: 'Where can I find the course materials?',
                answer: 'All course materials, including lecture slides and recordings, are available on the "Materials" tab of the course portal.',
            },
        ];
        defaultFaqs.forEach(faq => {
            const faqRef = doc(collection(db, 'faqs'));
            batch.set(faqRef, faq);
        });

        // Set the initialized flag
        batch.set(metaRef, { status: true, initializedAt: new Date().toISOString() });

        await batch.commit();
        console.log("Default data initialization complete.");
    }
};

// Check for initialization - this needs to run on the server or in a client-side context.
// Avoid running it in a way that blocks server-side rendering if possible.
// A simple check like this is fine for now.
(async () => {
    if (typeof window !== 'undefined') {
        await initializeData().catch(console.error);
    }
})();
