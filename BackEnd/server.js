import express from "express";
import data from './data.js';
import mongoose from 'mongoose'
import userRouter from "./routers/userRouter.js";
import productRouter from "./routers/productRouter.js";
import dotenv from 'dotenv';
import orderRouter from "./routers/orderRouter.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/amazona',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex : true,
});

app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.get('/', (req, res) =>{
    res.send('server is ready')
});
app.listen(8000, () =>{
    console.log('Server at http://localhost:8000');
});
