Commands to run:
Backend:
npm install cors
npm install mysql
npm install express


node server.js

Frontend:
npm install axios
npm install
npm start


live link of the demo : https://meetroom-i5gcmnbzi-amrutha5081.vercel.app/

DATABASE STRUCTURE:
 CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_number` int DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_number` (`room_number`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci |



bookings | CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `startTime` time DEFAULT NULL,
  `endTime` time DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `roomId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_bookings_rooms` (`roomId`),
  CONSTRAINT `fk_bookings_rooms` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci |
