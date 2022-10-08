// Simple component that allows a user to log out.

import { getAuth, signOut } from 'firebase/auth';
import { useContext } from 'react';
import { UserContext } from '../providers/UserProvider';
import app from '../firebase/clientApp';

const UserButton = () => {
    const { user } = useContext(UserContext);
    const auth = getAuth(app);

    // If the user is logged in, display a log out button.
    if(user) {
        return (
            <button className='p-5 m-3 border-solid border-2' onClick={() => signOut(auth)}>Log Out</button>
        )
    }
}

export default UserButton;