import React, { FC, useContext } from 'react';
import { Link } from 'react-router-dom';
import { magic, UserContext } from './App';

export const Main: FC = () => {
    const [user, setUser] = useContext(UserContext);
    console.log("🚀 ~ file: Main.tsx:6 ~ user:", user)

  const logout = () => {
    magic.user.logout().then(() => {
      setUser!({ user: null });
    });
  };
  return <div>
    <header>
        {user?.loading ? "Loading..." : user?.email ? 
        <div>
            <span>{user.email}</span>
             <button onClick={() => logout()}>Logout</button>
        </div> :
        <Link to={'/login'}>Login</Link>
        }
    </header>
    todo goes here...
  </div>
};