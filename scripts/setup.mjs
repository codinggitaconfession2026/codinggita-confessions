import fs from 'node:fs';
import crypto from 'node:crypto';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });
const ask = async (q, fallback = '') => {
  const v = (await rl.question(`${q}${fallback ? ` [${fallback}]` : ''}: `)).trim();
  return v || fallback;
};
console.log('\nCodingGita Community setup\n');
const url = await ask('Supabase Project URL');
const publishable = await ask('Supabase Publishable key');
const secret = await ask('Supabase Secret key');
const adminEmail = await ask('Admin email', 'admin@gmail.com');
const adminPassword = await ask('Admin password');
const session = crypto.randomBytes(32).toString('hex');
const env = `NEXT_PUBLIC_SUPABASE_URL=${url}\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${publishable}\nSUPABASE_SECRET_KEY=${secret}\nADMIN_EMAIL=${adminEmail}\nADMIN_PASSWORD=${adminPassword}\nADMIN_SESSION_SECRET=${session}\nAI_API_KEY=\nAI_BASE_URL=https://api.openai.com/v1\nAI_MODEL=gpt-4o-mini\nINSTAGRAM_ENABLED=false\nINSTAGRAM_BUSINESS_ACCOUNT_ID=\nINSTAGRAM_ACCESS_TOKEN=\n`;
fs.writeFileSync('.env.local', env, { mode: 0o600 });
rl.close();
console.log('\n.env.local created. Next: run the complete supabase/schema.sql in Supabase SQL Editor, then run npm run dev.\n');
