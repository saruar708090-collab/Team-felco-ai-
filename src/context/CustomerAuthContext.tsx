import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerUser } from '../types';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface CustomerAuthContextType {
  customerUser: CustomerUser | null;
  loading: boolean;
  register: (name: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (name: string, telegramUsername?: string) => Promise<{ success: boolean; error?: string }>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const cleanPhoneNumber = (raw: string): string => {
  let cleaned = raw.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('880')) {
    cleaned = cleaned.slice(2);
  }
  return cleaned;
};

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('felco_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Synchronize latest profile from Firestore if user is stored locally
    if (customerUser?.phone) {
      getDoc(doc(db, 'users', customerUser.phone)).then((snap) => {
        if (snap.exists()) {
          const data = snap.data() as CustomerUser;
          if (data.isBlocked) {
            setCustomerUser(null);
            localStorage.removeItem('felco_customer_user');
          } else {
            setCustomerUser(data);
            localStorage.setItem('felco_customer_user', JSON.stringify(data));
          }
        }
      }).catch(() => {});
    }
  }, []);

  const register = async (name: string, phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanPhone = cleanPhoneNumber(phone);
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
      return { success: false, error: 'অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নাম্বার দিন (যেমন: 017XXXXXXXX)।' };
    }
    if (!name.trim()) {
      return { success: false, error: 'অনুগ্রহ করে আপনার পুরো নাম লিখুন।' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' };
    }

    try {
      setLoading(true);
      
      // 1. Strict Phone Validation (must start with 01 and be exactly 11 digits)
      if (cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
        return { success: false, error: 'অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নাম্বার দিন যা ০১ (01) দিয়ে শুরু হয়।' };
      }

      // 2. Unique Name Check
      // Since we don't have a specific collection index for unique names, we'll fetch users and check.
      // Optimization: For larger scales, you'd use a Cloud Function or a specific 'names' collection.
      // For this applet, we'll check if the name already exists.
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const q = query(collection(db, 'users'), where('name', '==', name.trim()));
      const nameSnap = await getDocs(q);
      if (!nameSnap.empty) {
        return { success: false, error: 'এই নাম দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে। অন্য একটি নাম ব্যবহার করুন।' };
      }

      const userDocRef = doc(db, 'users', cleanPhone);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const existingData = userSnap.data() as CustomerUser;
        if (existingData.isBlocked) {
          return { success: false, error: '⚠️ এই নাম্বারটির অ্যাকাউন্ট অ্যাডমিন কর্তৃক ব্লক করা হয়েছে। দয়া করে সাপোর্টে যোগাযোগ করুন।' };
        }
        return { success: false, error: 'এই নাম্বার দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে। দয়া করে লগইন করুন।' };
      }

      const newUser: CustomerUser = {
        id: cleanPhone,
        name: name.trim(),
        phone: cleanPhone,
        password: password,
        isBlocked: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      await setDoc(userDocRef, newUser);
      setCustomerUser(newUser);
      localStorage.setItem('felco_customer_user', JSON.stringify(newUser));
      return { success: true };
    } catch (err: any) {
      console.error('Registration error:', err);
      return { success: false, error: err.message || 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' };
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanPhone = cleanPhoneNumber(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, error: 'অনুগ্রহ করে আপনার সঠিক মোবাইল নাম্বার লিখুন।' };
    }
    if (!password) {
      return { success: false, error: 'অনুগ্রহ করে পাসওয়ার্ড লিখুন।' };
    }

    try {
      setLoading(true);
      const userDocRef = doc(db, 'users', cleanPhone);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        return { success: false, error: 'এই নাম্বার দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে রেজিস্ট্রেশন করুন।' };
      }

      const userData = userSnap.data() as CustomerUser;
      if (userData.isBlocked) {
        return { success: false, error: '⚠️ আপনার অ্যাকাউন্টটি অ্যাডমিন কর্তৃক ব্লক করা হয়েছে। অনুগ্রহ করে টেলিগ্রাম সাপোর্টে যোগাযোগ করুন।' };
      }

      if (userData.password !== password) {
        return { success: false, error: 'ভুল পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিন।' };
      }

      const updatedUser: CustomerUser = {
        ...userData,
        lastLoginAt: new Date().toISOString()
      };

      await updateDoc(userDocRef, { lastLoginAt: updatedUser.lastLoginAt });
      setCustomerUser(updatedUser);
      localStorage.setItem('felco_customer_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, error: err.message || 'লগইন করতে সমস্যা হয়েছে।' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCustomerUser(null);
    localStorage.removeItem('felco_customer_user');
  };

  const updateProfile = async (name: string, telegramUsername?: string): Promise<{ success: boolean; error?: string }> => {
    if (!customerUser) return { success: false, error: 'User not logged in' };
    try {
      setLoading(true);
      const userDocRef = doc(db, 'users', customerUser.phone);
      const payload: Partial<CustomerUser> = {
        name: name.trim(),
        telegramUsername: telegramUsername?.trim() || ''
      };
      await updateDoc(userDocRef, payload);
      const updated = { ...customerUser, ...payload };
      setCustomerUser(updated);
      localStorage.setItem('felco_customer_user', JSON.stringify(updated));
      return { success: true };
    } catch (err: any) {
      console.error('Update profile error', err);
      return { success: false, error: err.message || 'প্রোফাইল আপডেট ব্যর্থ হয়েছে।' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerAuthContext.Provider value={{ customerUser, loading, register, login, logout, updateProfile }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = (): CustomerAuthContextType => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
