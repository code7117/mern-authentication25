require('dotenv').config(); // ✅ Load environment variables first
const cors = require('cors');
const express = require('express');

const cookieParser = require('cookie-parser');
const connectDB = require('./config/mongodb');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();
const allowedOrigins = [
  "http://localhost:3000",
  "https://mern-authentication25.vercel.app", // main production domain
  /\.vercel\.app$/ // allow any Vercel preview deployment
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow server-to-server requests
    const isAllowed = allowedOrigins.some(o => 
      o instanceof RegExp ? o.test(origin) : o === origin
    );
    if (isAllowed) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// Middleware

app.use(cookieParser());
app.use(express.json());

app.use(express.static("public"));

// API Endpoints
app.get('/', (req, res) => res.send("API Working"));
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter)


// Start Server
app.listen(port, () => {
  console.log(`Server started on Port: ${port}`);
});
