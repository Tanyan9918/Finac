import express from 'express';
import { authRouter } from './auth';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

app.listen(3000, () => console.log('Listening on http://localhost:4000'));