import 'dotenv/config'
import express, { type Request, type Response, type NextFunction } from "express";


const app = express();


app.use(express.json())


const PORT =  process.env.port as string;

app.listen(PORT, () => {
    console.log(`Server is running on port ${ PORT}`);
});
