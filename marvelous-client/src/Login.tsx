import React, {
  useState,
  useEffect,
  useContext,
  FC,
  SyntheticEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { magic, UserContext } from "./App";

export const Login: FC = () => {
  const [disabled, setDisabled] = useState(false);
  const [email, setEmail] = useState("");
  const [user, setUser] = useContext(UserContext);
  const navigate = useNavigate();

  async function handleLoginWithEmail(email: string) {
    try {
      setDisabled(true); // disable login button to prevent multiple emails from being triggered

      // Trigger Magic link to be sent to user
      let didToken = await magic.auth.loginWithMagicLink({
        email,
        redirectURI: new URL("/callback", window.location.origin).href, // optional redirect back to your app after magic link is clicked
      });

      // Validate didToken with server
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + didToken,
        },
      });

      if (res.status === 200) {
        let userMetadata = await magic.user.getMetadata();
        setUser!(userMetadata);
        navigate("/");
      }
    } catch (error) {
      setDisabled(false);
      console.log(error);
    }
  }
  useEffect(() => {
    user && user.issuer && navigate("/");
  }, [user, navigate]);
  
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    handleLoginWithEmail(email);
  };
  return (
    <div>
      <>
        <form onSubmit={handleSubmit}>
          <h3 className="form-header">Login</h3>
          <div className="input-wrapper">
            <input
              placeholder="Enter your email"
              value={email}
              type="email"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <button disabled={disabled} onClick={handleSubmit}>
              Send Magic Link
            </button>
          </div>
        </form>
        <style>{`
        form,
        label {
          display: flex;
          flex-flow: column;
          text-align: center;
        }
        .form-header {
          font-size: 22px;
          margin: 25px 0;
        }
        .input-wrapper {
          margin: 0 auto 20px;
        }
      `}</style>
      </>
    </div>
  );
};
