

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const enrollmentRoutes = require('./src/routes/enrollmentRoutes');

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/enrollments', enrollmentRoutes);


app.get('/', (req, res) => {
    res.send('Backend sunucusu ayakta!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde başlatıldı.`);
});