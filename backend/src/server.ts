import 'dotenv/config'
import express, { type Request, type Response, type NextFunction } from "express";
import { Redis } from 'ioredis'
import cors from 'cors'
import helmet from 'helmet';
import identityRoutes from './routes/identityRoutes.ts'



const app = express();

const redis = new Redis(process.env.redis_url as string)

redis.on('error', (err) => {
    console.error('Redis error:', err)

})

redis.on('ready', () => {
    console.log('Redis is ready')

})

redis.on('connect', () => {
    console.log('Redis connected')

})


app.use(express.json())
app.use(cors())
app.use(helmet())
app.use((req: Request, res: Response, next: NextFunction) => {
    req.redisClient = redis
    next()
})

app.use('/auth', identityRoutes)

const PORT =  process.env.port as string;

app.listen(PORT, () => {
    console.log(`Server is running on port ${ PORT}`);
});
