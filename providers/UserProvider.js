import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

import app from '../firebase/clientApp';

export const UserContext = React.createContext(null);

export const UserProvider = ({ children }) => {
  const [user, loading, error] = useAuthState(getAuth(app));
  const router = useRouter();

  useEffect(() => {
    if (error) {
      console.log(error);
    }
  }, [error]);

  useEffect(() => {
    if (loading) {
      console.log('loading');
    }
  }, [loading]);

  useEffect(() => {
    if (!user) {
      router.push('/user');
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}