const axios = require('axios');
const jwt = require('jsonwebtoken');

// Create a valid JWT for the user to bypass auth, or we can just send the request
// Actually, it's easier to disable the JwtAuthGuard for testing or login to get a token.
