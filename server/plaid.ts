import express from 'express';
import cors from 'cors';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const app = express();
app.use(cors());

const config = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID ?? '',
      'PLAID-SECRET': process.env.PLAID_SECRET ?? ''
    }
  }
});

const client = new PlaidApi(config);

app.get('/api/bank/accounts', async (req, res) => {
  try {
    const accessToken = req.query.accessToken as string;
    const resp = await client.accountsGet({ access_token: accessToken });
    res.json(resp.data.accounts);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/bank/transactions', async (req, res) => {
  try {
    const accessToken = req.query.accessToken as string;
    const start = req.query.start as string || '2024-01-01';
    const end = req.query.end as string || '2024-12-31';
    const resp = await client.transactionsGet({
      access_token: accessToken,
      start_date: start,
      end_date: end
    });
    res.json(resp.data.transactions);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

if (require.main === module) {
  const port = process.env.PORT || 3001;
  app.listen(port, () => console.log('Server running on ' + port));
}

export default app;

