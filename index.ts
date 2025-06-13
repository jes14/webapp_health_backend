import express from 'express';
import cors from 'cors';
import { sendToFHIR } from './src/fhir';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/report', async (req, res) => {
  try {
    await sendToFHIR(req.body);
    res.status(200).send('FHIR 전송 완료');
  } catch (err) {
    console.error(err);
    res.status(500).send('오류 발생');
  }
});

app.listen(4000, () => {
  console.log('http://localhost:4000');
});
