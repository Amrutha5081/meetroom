import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Form, Alert } from "react-bootstrap";
import { Button, InputGroup, FormControl } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import GoogleButton from "react-google-button";
import { useUserAuth } from "../context/UserAuthContext";
/* import axios from 'axios'; */

const Login = () => {
  const { logIn, googleSignIn, userProfileImage } = useUserAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const locationState = location.state;

    if (locationState) {
      const { email: signupEmail, password: signupPassword } = locationState;

      setEmail(signupEmail || "");
      setPassword(signupPassword || "");
    }
  }, [location.state]);

   const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await logIn(email, password);

      navigate("/home", {
        state: {
          userProfileImage,
        },
      });
    } catch (err) {
      setError("Invalid credentials");
    }
  };
 
  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      await googleSignIn();
      navigate("/home");
    } catch (error) {
      setError("Google Sign-In failed");
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Check if the username and password match the admin credentials
      if (email.toLowerCase() === "admin" && password === "admin@123") {
        // Perform admin login logic, e.g., redirect to admin page
        navigate("/admin-home");
      } else {
        setError("Invalid admin credentials");
      }
    } catch (err) {
      setError("Error during admin login");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <>
      <h1 className='text-center medium-bold-text'>Please fill the details! :)</h1><br></br>
      <div className="p-4 box" sx={{ backgroundColor: "dark", border: "1px solid white", borderRadius: "10px" }}>

        <h2 className="mb-3">Login Page</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control
              type="email"
              placeholder="Email address/Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <InputGroup>
              <FormControl
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputGroup.Text
                id="password-toggle"
                onClick={togglePasswordVisibility}
                style={{ cursor: "pointer" }}
              >
                {showPassword ? <Eye /> : <EyeSlash />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <div className="d-grid gap-2">
            <Button variant="primary" type="submit">
              Log In
            </Button>
            <Button variant="info" onClick={handleAdminLogin}>
              Login as Admin
            </Button>
          </div>
        </Form>

        <hr />

        {userProfileImage && (
          <div className="text-center mb-3">
            <img
              src={userProfileImage}
              alt="Profile Preview"
              style={{
                borderRadius: "50%",
                width: "100px",
                height: "100px",
                cursor: "pointer",
              }}
              onClick={() => alert("You clicked on the profile picture")}
            />
          </div>
        )}

        <div>
          <GoogleButton
            className="g-btn"
            type="dark"
            onClick={handleGoogleSignIn}
          />
        </div>
      </div>

      <div className="p-4 box mt-3 text-center">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </div>
    </>
  );
};

export default Login;
