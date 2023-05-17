import { createContext, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { Login } from "./Login";
import { Main } from "./Main";
import { Magic, MagicUserMetadata } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";
import { Callback } from "./Callback";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/callback",
    element: <Callback />,
  }
]);
export const UserContext = createContext<[UserState | undefined, React.Dispatch<React.SetStateAction<UserState | undefined>>] | []>([]);
export const magic = new Magic("pk_live_7331486CE62E7A3E", {
  extensions: [new OAuthExtension()],
});

interface UserState extends Partial<MagicUserMetadata> {
  loading?: boolean;
  user?: unknown;
}

function App() {
  const [user, setUser] = useState<UserState>();
  useEffect(() => {
    setUser({ loading: true });
    magic.user.isLoggedIn().then((isLoggedIn): void | unknown => {
      return isLoggedIn
        ? magic.user.getMetadata().then((userData) => setUser(userData)).catch((err) => console.log("The user data is not set"))
        : setUser({ user: null });
    }).catch((err) => console.log("We couldn't login..."));
  }, []);

  return (
    <div className="App">
      <UserContext.Provider value={[user, setUser]}>
        <RouterProvider router={router} />
      </UserContext.Provider>
    </div>
  );
}

export default App;
