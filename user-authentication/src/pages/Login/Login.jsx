import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { assets } from "../../assets/assets";
import Styles from "./Login.module.css";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContext);
  axios.defaults.withCredentials = true;

  const [state, setState] = useState("Sign Up"); // "Sign Up" or "Login"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = state === "Sign Up" ? "register" : "login";
      const payload =
        state === "Sign Up"
          ? { name, email, password }
          : { email, password };

      const { data } = await axios.post(
        `${backendUrl}/api/auth/${endpoint}`,
        payload,
        { withCredentials: true } // important to send cookies
      );

      console.log(`${endpoint} Response:`, data);

      if (data.status) {
        await getUserData(); // fetch user data after login/register
        setIsLoggedin(true);
        toast.success(
          state === "Sign Up"
            ? "Account created successfully!"
            : "Login successful!"
        );
        navigate("/"); // redirect after success
      } else {
        toast.error(data.message || "Something went wrong!");
      }
    } catch (err) {
      console.error("Auth Error:", err.response?.data || err.message);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={Styles.container}>
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="loginlogo"
        className={Styles.logo}
      />
      <div className={Styles.subcontainer}>
        <h2 className={Styles.h2}>
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>
        <p className={Styles.p}>
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account!"}
        </p>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className={Styles.formcontainer}>
              <img src={assets.person_icon} alt="personlogo" />
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className={Styles.input}
                type="text"
                placeholder="Full Name"
                required
              />
            </div>
          )}

          <div className={Styles.formcontainer}>
            <img src={assets.mail_icon} alt="emaillogo" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className={Styles.input}
              type="email"
              placeholder="Enter Email"
              required
            />
          </div>

          <div className={Styles.formcontainer}>
            <img src={assets.lock_icon} alt="locklogo" />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className={Styles.input}
              type="password"
              placeholder="Enter Password"
              required
            />
          </div>

          <p
            onClick={() => navigate("/reset-password")}
            className={Styles.forgot}
          >
            Forgot password?
          </p>

          <button className={Styles.btn} disabled={loading}>
            {loading ? "Please wait..." : state}
          </button>
        </form>

        {state === "Sign Up" ? (
          <p className={Styles.al}>
            Already have an account?{" "}
            <span onClick={() => setState("Login")} className={Styles.sp}>
              Login here
            </span>
          </p>
        ) : (
          <p className={Styles.al}>
            Don't have an account?{" "}
            <span onClick={() => setState("Sign Up")} className={Styles.sp}>
              Sign Up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
