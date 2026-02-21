import { auth } from './firebaseConfig';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';


export const signup = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const logout = async () => {
    await signOut(auth);
}

export const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
};

export const onUserStateChanged = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
}

