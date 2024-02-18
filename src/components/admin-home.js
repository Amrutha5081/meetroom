import React, { useState, useEffect } from 'react';
import { Button, Form, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from "react-router";
import { useUserAuth } from "../context/UserAuthContext";

const AdminHome = () => {
  const [roomNumber, setRoomNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // Fetch rooms on component mount
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:3001/get-rooms');
      setRooms(response.data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
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

  const addRoom = async () => {
    try {
      const response = await axios.post('http://localhost:3001/add-room', {
        roomNumber: parseInt(roomNumber),
        capacity: parseInt(capacity),
      });
      console.log(response.data);
      // Update the list of rooms after adding
      fetchRooms();
    } catch (error) {
      console.error('Error adding room:', error);
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      const response = await axios.delete(`http://localhost:3001/delete-room/${roomId}`);
      console.log(response.data);
      // Update the list of rooms after deleting
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  return (
    <div className='welcome-box'>
      <h2>Room Management</h2>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Room Number</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter room number"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Capacity</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" onClick={addRoom}>
          Add Room
        </Button>
      </Form>
      <hr />
      <h3>Meeting Rooms</h3>
      <ListGroup>
        {rooms.map((room) => (
          <ListGroup.Item key={room.id}>
            Room Number: {room.room_number} | Capacity: {room.capacity}
            <Button
              variant="danger"
              className="ms-2"
              onClick={() => deleteRoom(room.id)}
            >
              Delete
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Button variant="danger" onClick={handleLogout} className="ml-auto" style={{ marginTop: '15px' }}>
            Log out
          </Button>
    </div>
  );
};

export default AdminHome;
