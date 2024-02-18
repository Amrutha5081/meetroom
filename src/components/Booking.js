import React, { useState, useEffect } from "react";
import { Button, Form, Alert, Dropdown } from "react-bootstrap";
import axios from "axios";
import './Home.css';
import { useNavigate } from "react-router";
import { useUserAuth } from "../context/UserAuthContext";

const Booking = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedRoomNumber, setSelectedRoomNumber] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState([]);
  const [disabledDates, setDisabledDates] = useState([]);
  const [disabledTimes, setDisabledTimes] = useState([]);
  

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:3001/get-rooms");
        setRooms(response.data.rooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0];
    const currentTimeString = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setDate(currentDateString);
    setStartTime(currentTimeString);

    setDisabledDates((dates) => [...dates, { before: currentDateString }]);
    setDisabledTimes((times) => [...times, { date: currentDateString, before: currentTimeString }]);

    fetchRooms();
  }, []);

  useEffect(() => {
    // Reset form fields on page refresh
    setSelectedRoom("");
    setSelectedRoomNumber("");
    setStartTime("");
    setEndTime("");
    setDuration("");
    setError("");
    setBookingSuccess(false);
  }, [date]);

  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      const durationInMinutes = Math.abs((end - start) / (1000 * 60));
      const durationInHours = durationInMinutes / 60;
      setDuration(durationInHours.toFixed(1)); // Round to one decimal place
    }
  }, [startTime, endTime]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setError("");
    setBookingSuccess(false);

    try {
      const availabilityCheckResponse = await axios.post("http://localhost:3001/check-availability", {
        roomId: selectedRoom,
        date,
        startTime,
        endTime,
        duration,
      });


      if (availabilityCheckResponse.data.available) {
        const bookedTime= availabilityCheckResponse.data.bookedSlots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime
        }));
        console.log(bookedTime);
        const bookingResponse = await axios.post("http://localhost:3001/book-room", {
          roomId: selectedRoom,
          date,
          startTime,
          endTime,
          duration,
          userId: 1,
        });

        if (bookingResponse.status === 200) {
          setError('Booking successfully done!')
          alert('Booking successful!');
          setBookingSuccess(true);
          setSelectedRoom("");
          setDate("");
          setStartTime("");
          setEndTime("");
          setDuration("");
        }
      } else {
        setError("Room not available for the specified time slot and date");
      }
    } catch (err) {
      console.error("Error during booking:", err);
      setError("Error occurred during the booking. Please refresh, enter all the details & try again.");
    }
  };
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
  const handleCheckAvailability = async () => {
    // Check if all required fields are filled
    if (!selectedRoom || !date || !startTime || !endTime || !duration) {
      setError("Please fill in all the details and try again.");
      return;
    }

    setError("");
    setBookingSuccess(false);

    try {
      const response = await axios.post("http://localhost:3001/check-availability", {
        roomId: selectedRoom,
        date,
        startTime,
        endTime,
        duration,
      });
      const bookedTime= response.data.bookedSlots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime
      }));
      console.log(bookedTime);
      if (response.data.available) {
        alert("Room is available for the specified time slot. You can proceed with booking.");
      } else {
        setError(`Room not available for the specified time slot and date.The following slots are booked: ${bookedTime.map((slot)=>slot.startTime.slice(0, 5) + '-' + slot.endTime.slice(0, 5))}.`);
      }
    } catch (err) {
      console.error("Error checking availability:", err);
      setError("Error occurred while checking availability. Please try again.");
    }
  };

  return (
    <div className="container" style={{marginTop:'12px'}}>
      <div className="welcome-box">
      <h2 className=" text-center">Booking Management</h2>
      {bookingSuccess && (
        <Alert variant="success" onClose={() => setBookingSuccess(false)} dismissible>
          Room booked successfully!
        </Alert>
      )}
      {error && <div style={{maxWidth:'400px'}}><Alert variant="danger">{error}</Alert></div>}

      <Form onSubmit={handleBooking}>
        <Form.Group className="mb-3" controlId="roomNumber">
          <Form.Label>Select Room</Form.Label>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              {selectedRoomNumber ? `Room ${selectedRoomNumber}` : "Select Room"}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {rooms.map((room) => (
                <Dropdown.Item key={room.id} onClick={() => {setSelectedRoom(room.id);setSelectedRoomNumber(room?.room_number)}}>
                  Room {room.room_number}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Form.Group>

        <Form.Group className="mb-3" controlId="date">
          <Form.Label>Date</Form.Label>
          <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
        </Form.Group>

        <Form.Group className="mb-3" controlId="startTime">
          <Form.Label>Start Time</Form.Label>
          <Form.Control type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} min={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} required />
        </Form.Group>

        <Form.Group className="mb-3" controlId="endTime">
          <Form.Label>End Time</Form.Label>
          <Form.Control type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} min={startTime} required />
        </Form.Group>

        {/* New Duration input field */}
        <Form.Group className="mb-3" controlId="duration">
          <Form.Label>Duration (in hours)</Form.Label>
          <Form.Control
            type="number"
            min="1"
            step="0.1" 
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </Form.Group>

        {/* Check Availability button */}
        <Button style={{marginRight:"10px"}} variant="info" onClick={handleCheckAvailability}>
          Check Availability
        </Button>

        {/* Book Room button */}
          <Button variant="primary" type="submit">
            Book Room
          </Button>
          <Button variant="danger" onClick={handleLogout} className="ml-auto" style={{ marginLeft: '10px' }}>
            Log out
          </Button>

      </Form>
    </div>
    </div>

    
  );
};

export default Booking;
