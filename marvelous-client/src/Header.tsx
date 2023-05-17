import { Link } from 'react-router-dom';
import { UserState } from './App';

export const Header = ({user, logout}: {user: UserState | undefined, logout: () => void}) => {

  return <div className='Header'>
        {user?.loading ? "Loading..." : user?.email ? 
        <div>
            Todos for: <span>{user.email}</span>
             <button onClick={() => logout()}>Logout</button>
        </div> :
        <Link to={'/login'}>Login</Link>
        }
        <style>{`
        .Header {
          display: block;
          width: auto;
          background-color: lightgrey;
          text-align: right;
          padding: .5rem;
          border-radius: .5rem;
        }
        .Header button {
            margin-left: 1rem;
        }
      `}</style>
    </div>
};