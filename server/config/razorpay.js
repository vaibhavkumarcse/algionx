import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_sample_key';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'sample_secret_key';

export const isConfigured = Boolean(
  keyId &&
  keySecret &&
  keyId !== 'rzp_test_sample_key' &&
  !keyId.includes('sample')
);

let razorpayInstance = null;

try {
  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
} catch (err) {
  console.warn('Razorpay initialization fallback:', err.message);
}

export const getRazorpayInstance = () => razorpayInstance;
export const getRazorpayKey = () => keyId;

