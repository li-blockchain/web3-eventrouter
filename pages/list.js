// Component to list users listeners.

import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import app from '../firebase/clientApp';
import { UserProvider } from '../providers/UserProvider';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import Link from 'next/link';
import AppContainer from '../components/AppContainer';

import {
    BellIcon, PencilSquareIcon, TrashIcon,
  } from '@heroicons/react/24/outline'

const List = () => {
    const [ user ] = useAuthState(getAuth(app));

    // Read all listeners from the database
    const [listeners, setListeners] = useState([]);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        if(user) {
            const db = getFirestore(app);
            const collRef = collection(db, "listeners");
            const q = query(collRef, where("user", "==", user.uid));

            getDocs(q).then((querySnapshot) => {    
                const listeners = [];
                querySnapshot.forEach((doc) => {
                    // spread doc.data with doc.id
                    listeners.push({ ...doc.data(), id: doc.id });
                });
                setListeners(listeners);
                setLoading(false);
            });
        }
    }, [user]);


    // Delete a listener from the database
    const deleteListener = (listener) => {
        console.log("We are going to delete this listener");
        // Delete from listeners collection where doc.id = listener.id

        const db = getFirestore(app);
        const collRef = collection(db, "listeners");
        const docRef = doc(collRef, listener.id);

        deleteDoc(docRef).then(() => {
            console.log("Listener deleted");
            // Remove from listeners array
            const newListeners = listeners.filter(item => item.id !== listener.id);
            setListeners(newListeners);
        }
        ).catch(err => {
            console.log(err);
        }
        );
    }

    // Prevent flast of app. Must be a better way.
    if(!user) {
        return(<UserProvider></UserProvider>);
    }

    if(!isLoading && listeners.length === 0) {
        return(
            <UserProvider>
                <AppContainer>
                <div className="m-10 bg-white rounded-md p-10 shadow-md">
                    <div className="flex flex-row justify-between items-center">
                        <h2 className='text-3xl py-5 flex'>Contract Listeners<BellIcon className='h-6 ml-2 mt-2 text-slate-800'></BellIcon></h2>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <p className="text-xl py-5">You have no listeners, create one!</p>
                        <Link href="/"><a><button className='p-2 border-solid border-2 rounded-md focus:ring hover:bg-slate-200'>Create a new listener</button></a></Link>
                    </div>
                </div>
                </AppContainer>
            </UserProvider>
        )
    }

    return (
        <UserProvider>
            <AppContainer>
                <div className="m-10 bg-white rounded-md p-10 shadow-md">
                <div className="flex flex-row justify-between items-center">
                    <h2 className='text-3xl py-5 flex'>Contract Listeners<BellIcon className='h-6 ml-2 mt-2 text-slate-800'></BellIcon></h2>
                    <Link href="/"><button className='p-2 border-solid border-2 rounded-md focus:ring hover:bg-slate-200'>New Listener</button></Link>
                </div>
                {isLoading ? (
                    <div role="status" className="animate-pulse">
                        <div className="flex flex-row space-x-4 opacity-50">
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-2/4 mb-2.5"></div>
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-3/4 mb-2.5"></div>
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-3/4 mb-2.5"></div>
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-1/4 mb-2.5"></div>
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-1/4 mb-2.5"></div>
                        </div>
                        <div className="flex flex-row space-x-4 opacity-20">
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-2/4 mb-2.5"></div>
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-3/4 mb-2.5"></div>
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-3/4 mb-2.5"></div>
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-1/4 mb-2.5"></div>
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-1/4 mb-2.5"></div>
                        </div>
                        <div className="flex flex-row space-x-4 opacity-10">
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-2/4 mb-2.5"></div>
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-3/4 mb-2.5"></div>
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-3/4 mb-2.5"></div>
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-1/4 mb-2.5"></div>
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-1/4 mb-2.5"></div>
                        </div>
                        <div className="flex flex-row space-x-4 opacity-5">
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-2/4 mb-2.5"></div>
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-3/4 mb-2.5"></div>
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-3/4 mb-2.5"></div>
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-1/4 mb-2.5"></div>
                            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-1/4 mb-2.5"></div>
                        </div>
                        <span className="sr-only">Loading...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 md:pl-0">Event</th>
                                    <th scope="col" className="py-3.5 text-left text-sm font-semibold text-gray-900">Contract Address</th>
                                    <th scope="col" className="py-3.5 text-left text-sm font-semibold text-gray-900">Post URL</th>
                                    <th scope="col" className="relative py-3.5 sm:pr-6 md:pr-0 text-sm"></th>
                                    <th scope="col" className="relative py-3.5 sm:pr-6 md:pr-0 text-sm"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {listeners.map((listener, index) => {
                                return (
                                    <tr key={index} className="">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0">{listener.event.name}</td>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0">{listener.contract}</td>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0">{listener.url}</td>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0"><Link href="/"><a><PencilSquareIcon className="h-4"></PencilSquareIcon></a></Link></td>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0"><div className="cursor-pointer" onClick={(e)=>deleteListener(listener)}><TrashIcon className="h-4"></TrashIcon></div></td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
                </div>
            </AppContainer>
        </UserProvider>
    )
}

export default List;

