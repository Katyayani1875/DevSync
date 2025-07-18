// backend/server.js  -- SIMPLIFIED AND WORKING VERSION --
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const initializeSocket = require('./sockets/socketManager');

// Connect to Database
connectDB();

const app = express();

// CORS Middleware - Very Important!
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get('/api', (req, res) => res.send('DevSync API is running...'));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Custom Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.IO Server
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ['GET', 'POST'],
    },
});

// Attach all our real-time logic
initializeSocket(io);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`✅ Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
// // backend/server.js
// require('dotenv').config();
// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// const cluster = require('cluster');
// const os = require('os');
// const { setupMaster, setupWorker } = require('@socket.io/sticky');
// const { createAdapter } = require('@socket.io/cluster-adapter');

// const connectDB = require('./config/db');
// const authRoutes = require('./routes/authRoutes');
// const roomRoutes = require('./routes/roomRoutes');
// const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
// const initializeSocket = require('./sockets/socketManager');

// const numCPUs = os.cpus().length;
// const PORT = process.env.PORT || 5000;

// // CHANGED: Using the modern `isPrimary` property instead of the deprecated `isMaster`
// if (cluster.isPrimary) { 
//     console.log(`Primary ${process.pid} is running`);
//     connectDB(); 

//     const httpServer = http.createServer();

//     // Setup sticky sessions for load balancing WebSocket connections
//     setupMaster(httpServer, {
//         loadBalancing: 'least-connection',
//     });

//     // NOTE: setupWorker() was incorrectly here. It has been moved to the worker process block.

//     httpServer.listen(PORT, () => {
//         console.log(`API Gateway (Primary) listening on port ${PORT}`);
//     });

//     for (let i = 0; i < numCPUs; i++) {
//         cluster.fork();
//     }

//     cluster.on('exit', (worker) => {
//         console.error(`Worker ${worker.process.pid} died. Forking a new one.`);
//         cluster.fork();
//     });
// } else {
//     // This is the worker process
//     console.log(`Worker ${process.pid} started`);

//     const app = express();
//     const httpServer = http.createServer(app);

//     // MOVED HERE: This is the correct place for setupWorker()
//     // It configures the worker to communicate with the master process.
//     setupWorker(httpServer);

//     // CORS Middleware
//     app.use(cors({
//         origin: process.env.CORS_ORIGIN,
//         credentials: true,
//     }));

//     // Body Parsing Middleware
//     app.use(express.json());
//     app.use(express.urlencoded({ extended: true }));

//     // API Routes
//     app.get('/api', (req, res) => res.send('DevSync API is running...'));
//     app.use('/api/auth', authRoutes);
//     app.use('/api/rooms', roomRoutes);

//     // Custom Error Handling Middleware
//     app.use(notFound);
//     app.use(errorHandler);

//     // Initialize Socket.IO Server
//     const io = new Server(httpServer, {
//         cors: {
//             origin: process.env.CORS_ORIGIN,
//             methods: ['GET', 'POST'],
//         },
//         adapter: createAdapter(),
//     });

//     // Attach all our real-time logic
//     initializeSocket(io);
// }