require('dotenv').config();
const connectDB = require('./config/database');
const app = require('./app');

console.log('--- TaskFlow Backend Starting ---');
console.log(`  NODE_ENV   : ${process.env.NODE_ENV || 'not set'}`);
console.log(`  PORT       : ${process.env.PORT || 5000}`);
console.log(`  MONGODB_URI: ${process.env.MONGODB_URI ? '✅ set' : '❌ MISSING'}`);
console.log(`  JWT_SECRET : ${process.env.JWT_SECRET ? '✅ set' : '❌ MISSING'}`);
console.log(`  CLIENT_URL : ${process.env.CLIENT_URL || 'not set'}`);
console.log('--------------------------------');

connectDB();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => console.log(`🚀 Server running on http://${HOST}:${PORT}`));
