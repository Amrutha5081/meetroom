const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Amrutha@17',
  database: 'meeting_rooms',
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from('Amrutha@17')
  }
});

db.connect((err) => {
  if (err) {
    console.error('Unable to connect to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});


// Create foreign key relationship in the bookings table
const createForeignKey = () => {
  const createForeignKeyQuery = 'ALTER TABLE bookings ADD CONSTRAINT fk_bookings_rooms FOREIGN KEY (roomId) REFERENCES rooms(id)';
  db.query(createForeignKeyQuery, (err) => {
    if (err) {
      console.error('Error creating foreign key:', err);
    } else {
      console.log('Foreign key created successfully');
    }
  });
};


// createForeignKey();

// Endpoint to check if a room exists
app.get('/check-room/:roomNumber', (req, res) => {
  const { roomNumber } = req.params;

  const selectQuery = 'SELECT EXISTS (SELECT 1 FROM rooms WHERE room_number = ?) AS roomExists';
  db.query(selectQuery, [roomNumber], (err, results) => {
    if (err) {
      console.error('Error checking room:', err);
      res.status(500).json({ roomExists: false });
    } else {
      res.json({ roomExists: results[0].roomExists === 1 });
    }
  });
});


app.post('/check-availability', async (req, res) => {
  try {
    const { roomId, date, startTime, endTime } = req.body;

    // Convert start and end times to JavaScript Date objects
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    // Check for overlapping bookings
    const overlappingBookings =await db.promise().query(
      'SELECT * FROM bookings WHERE roomId = ? AND date = ? AND ((startTime < ? AND endTime > ?) OR (startTime < ? AND endTime > ?) OR (startTime >= ? AND endTime <= ?))',
      [roomId, date, end, start, start, end, start, end]
    );

    if (overlappingBookings[0].length > 0) {
      // There are overlapping bookings, the room is not available
      res.json({ available: false, message: 'Room not available for the specified time slot and date',bookedSlots: overlappingBookings[0] });
    } else {
      res.json({ available: true,bookedSlots: overlappingBookings[0]  });
    }
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Internal Server Error' , error});
  }
});


app.get('/get-booked-dates', (req, res) => {
    const selectQuery = 'SELECT DISTINCT date FROM bookings';
    db.query(selectQuery, (err, results) => {
      if (err) {
        console.error('Error fetching booked dates:', err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      } else {
        const bookedDates = results.map(result => result.date);
        res.json({ success: true, bookedDates });
      }
    });
  });
  app.post('/book-room', async (req, res) => {
    const { date, startTime, endTime, roomId, userId } = req.body;
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    
    const availabilityCheckQuery = `
      SELECT roomId
      FROM bookings
      WHERE roomId = ? AND date = ? AND (
        (startTime < ? AND endTime > ?) OR
        (startTime < ? AND endTime > ?) OR
        (startTime >= ? AND endTime <= ?)
      )
    `;

    try {
        const availabilityResults = await db.promise().query(availabilityCheckQuery, [roomId, date, end, start, start, end, start, end]);

        if (availabilityResults[0].length > 0) {
            // Room is not available
            res.status(400).json({ success: false, error: 'Room already booked for the specified time slot. Please choose a different date and time.' });
        } else {
            
            const insertQuery = 'INSERT INTO bookings (date, startTime, endTime, roomId, userId) VALUES (?, ?, ?, ?, ?)';
            const bookingResult = await db.promise().query(insertQuery, [date, start, end, roomId, userId]);
            res.json({ success: true, bookingId: bookingResult[0].insertId });
        }
    } catch (err) {
        console.error('Error booking room:', err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

  
app.post('/add-room', (req, res) => {
  const { roomNumber, capacity } = req.body;

  const insertQuery = 'INSERT INTO rooms (room_number, capacity) VALUES (?, ?)';
  db.query(insertQuery, [roomNumber, capacity], (err, result) => {
    if (err) {
      console.error('Error adding room:', err);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    } else {
      res.json({ success: true, roomId: result.insertId });
    }
  });
});

app.get('/get-rooms', (req, res) => {
  const selectQuery = 'SELECT * FROM rooms';
  db.query(selectQuery, (err, results) => {
    if (err) {
      console.error('Error fetching rooms:', err);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    } else {
      res.json({ success: true, rooms: results });
    }
  });
});

app.delete('/delete-room/:id', (req, res) => {
  const roomId = req.params.id;
  const deleteQuery = 'DELETE FROM rooms WHERE id = ?';
  db.query(deleteQuery, [roomId], (err) => {
    if (err) {
      console.error('Error deleting room:', err);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    } else {
      res.json({ success: true });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
