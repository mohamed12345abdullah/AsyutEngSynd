// const redis = require('redis');

// // إنشاء عميل Redis باستخدام IPv4 (127.0.0.1)
// const redisClient = redis.createClient({
//   url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
// });

// // الاستماع لأخطاء الاتصال
// redisClient.on('error', (err) => console.error('Redis Client Error', err));

// // الاتصال بـ Redis
// (async () => {
//   try {
//     await redisClient.connect();
//     console.log('✅ Connected to Redis');
//   } catch (err) {
//     console.error('❌ Failed to connect to Redis:', err);
//   }
// })();

// // دالة لحفظ بيانات في الكاش
// const setCache = async (key, value, ttl = 3600) => {
//   try {
//     await redisClient.set(key, value, { EX: ttl });
//   } catch (err) {
//     console.error('❌ Redis setCache error:', err);
//   }
// };

// // دالة لاسترجاع بيانات من الكاش
// const getCache = async (key) => {
//   try {
//     return await redisClient.get(key);
//   } catch (err) {
//     console.error('❌ Redis getCache error:', err);
//     return null;
//   }
// };

// module.exports = { setCache, getCache };
