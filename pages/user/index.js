// Basic login page

import React, { useEffect, useState } from 'react';
import app from '../../firebase/clientApp';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import Link from 'next/link';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = getAuth(app);
  const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }

    if (error) {
      // Replaces 'Firebase' with an empty string or any other placeholder text you prefer
      const filteredError = error.message.replace(/Firebase:/gi, '');
      setErrorMessage(filteredError);
    }
  }, [user, loading, error]);

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      signInWithEmailAndPassword(email, password);
    }}>

      <div className="grid h-screen place-items-center bg-slate-200">
        <div className="grid w-1/2 p-10 bg-white rounded-lg shadow-xl">
          <img
            className="h-10 w-auto"
            src="/logo.png"
            alt="Long Island Blockchain Client Login"
          />
          <h1 className="text-3xl py-2 font-bold">Login</h1>
          <div className="p-3">
            <input className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal" type="text" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="p-3">
            <input className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="p-3 text-red-500">
            {errorMessage && <p>{errorMessage}</p>}
          </div>
          <div className="p-3">
            <button onClick={() => signInWithEmailAndPassword(email, password)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Login</button>
          </div>
          {/* <div>
                    New Here? <Link href="/user/new"><a className="text-blue-600">Create an account</a></Link>
                </div> */}
        </div>
      </div>
    </form>
  )

}
