import { error } from "console";
import { useContext, useEffect, FC } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { magic, UserContext } from "./App";

export const Callback: FC = (props: any) => {
  const [_, setUser] = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    finishEmailRedirectLogin();
  }, []);
  const finishEmailRedirectLogin = () => {
    let magicCredential = searchParams.get("magic_credential");
    if (magicCredential)
      magic.auth
        .loginWithCredential()
        .then((didToken) => authenticateWithServer(didToken))
        .catch((error) => console.error(error));
  };
  const authenticateWithServer = async (didToken: string | null) => {
    let res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + didToken,
      },
    }).catch(error => {
      console.log("error", error);
      navigate('/')
    });


    if (res?.status === 200) {
      // Set the UserContext to the now logged in user
      let userMetadata = await magic.user.getMetadata();
      setUser!(userMetadata);
      navigate("/");
    }
  };
  return <p>Loading...</p>;
};
