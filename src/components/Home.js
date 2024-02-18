import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useUserAuth } from "../context/UserAuthContext";
import "./Home.css";

const Home = () => {
  const { logOut } = useUserAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleBookingManagement = () => {
    navigate("/booking");
  };

  return (
    <div className="container">
      <div className="welcome-box">
        <h1 className="text-center large-bold-text">HELLO there!</h1>
        <h2 className="mb-3 text-center">Welcome</h2>
      </div>

      <div className="button-container">
        <Button variant="primary" onClick={handleBookingManagement}>
          Booking Management
        </Button>
        <Button variant="danger" onClick={handleLogout} className="ml-auto" style={{ marginLeft: '10px' }}>
          Log out
        </Button>
      </div>
    </div>
  );
};

export default Home;
