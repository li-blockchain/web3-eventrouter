// Basic user creation page

import React, { useEffect, useState } from 'react';
import app from '../../firebase/clientApp';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';


export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const auth = getAuth(app);
    const [createUserWithEmailAndPassword, user, loading, error] = useCreateUserWithEmailAndPassword(auth);
    const router = useRouter();

    useEffect(() => {
        if(user && !loading) {
            router.push('/');
        }
    }, [user, loading]);

    useEffect(() => {
        if(error) {
            // If the message contains "invalid-email"
            if(error.message.includes('invalid-email')) {
                toast.error('Please enter a valid email address');
            }
        }
    }, [error]);

    if(loading) {
        console.log('loading');
    }


    return (
        <div className="grid h-screen place-items-center bg-slate-200">
            <div className="grid w-1/2 p-10 bg-white rounded-lg shadow-xl">
            <img
                      className="h-10 w-auto"
                      src="/logo.png"
                      alt="Crypto Creator Kit"
                    />
                <h1 className="text-3xl py-2 font-bold">Create User</h1>
                <div className="p-3">
                    <input className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal" type="text" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="p-3">
                    <input className="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="p-3">
                    <button onClick={() => createUserWithEmailAndPassword(email, password)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Create User</button>
                </div>
                <div className="p-3">
                 Already have an account? Log in <Link href="/user"><a className="text-blue-500 hover:text-blue-800">here</a></Link>
                </div>
            </div>
            <ToastContainer />       
        </div>
    )

}