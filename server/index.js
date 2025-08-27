import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const users = new Map(); // email -> {passwordHash}
const dataStore = new Map(); // email -> { budgets:[], debts:[], goals:[], obligations:[], bnpl:[] }

function initUserData(email){
  if(!dataStore.has(email)){
    dataStore.set(email, { budgets: [], debts: [], goals: [], obligations: [], bnpl: [] });
  }
  return dataStore.get(email);
}

function authMiddleware(req, res, next){
  const auth = req.headers['authorization'];
  if(!auth) return res.status(401).json({ message: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err){
    res.status(401).json({ message: 'Invalid token' });
  }
}

app.post('/api/auth/register', async (req,res)=>{
  const { email, password } = req.body;
  if(users.has(email)) return res.status(400).json({ message: 'User exists' });
  const hash = bcrypt.hashSync(password, 8);
  users.set(email, { password: hash });
  initUserData(email);
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.post('/api/auth/login', (req,res)=>{
  const { email, password } = req.body;
  const user = users.get(email);
  if(!user) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.password);
  if(!ok) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

function crudRoutes(path, key){
  app.get(`/api/${path}`, authMiddleware, (req,res)=>{
    const store = initUserData(req.user.email);
    res.json(store[key]);
  });
  app.post(`/api/${path}`, authMiddleware, (req,res)=>{
    const store = initUserData(req.user.email);
    const item = req.body;
    store[key].push(item);
    res.json(item);
  });
  app.put(`/api/${path}/:id`, authMiddleware, (req,res)=>{
    const store = initUserData(req.user.email);
    const idx = store[key].findIndex(x=>x.id===req.params.id);
    if(idx===-1) return res.status(404).json({ message: 'Not found' });
    store[key][idx] = req.body;
    res.json(store[key][idx]);
  });
  app.delete(`/api/${path}/:id`, authMiddleware, (req,res)=>{
    const store = initUserData(req.user.email);
    const idx = store[key].findIndex(x=>x.id===req.params.id);
    if(idx===-1) return res.status(404).json({ message: 'Not found' });
    const [removed] = store[key].splice(idx,1);
    res.json(removed);
  });
}

crudRoutes('budgets','budgets');
crudRoutes('debts','debts');
crudRoutes('goals','goals');
crudRoutes('obligations','obligations');
crudRoutes('bnpl','bnpl');

app.listen(PORT, ()=>{
  console.log(`Server running on http://localhost:${PORT}`);
});
