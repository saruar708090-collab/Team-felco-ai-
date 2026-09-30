import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

export interface ParsedSmsResult {
  trxId: string;
  amount: number;
  method: string;
  sender: string;
  rawSms: string;
}

/**
 * Parses bKash, Nagad, or Rocket incoming SMS text to extract TrxID and Amount.
 * Example bKash: "You have received Tk 450.00 from 01712345678. Ref ... Fee Tk 0.00. Balance Tk ... TrxID BJM89K2L1P at 29/09/2026 14:22"
 * Example Nagad: "Money Received. Amount: Tk 450.00 Sender: 01812345678 Ref: ... TxnID: 72N89ABC Balance: ..."
 * Example Rocket: "Tk450.00 received from 019123456781 ... TxnId: 5489213690 ..."
 */
export function parsePaymentSms(rawText: string, fallbackMethod = 'bKash'): ParsedSmsResult | null {
  const text = rawText.trim();
  if (!text) return null;

  // Detect method from SMS content
  let method = fallbackMethod;
  if (/bkash|trxid/i.test(text)) method = 'bKash';
  else if (/nagad|txnid/i.test(text)) method = 'Nagad';
  else if (/rocket|dbbl/i.test(text)) method = 'Rocket';

  // Extract TrxID / TxnID / Trans ID
  const trxRegex = /(?:TrxID|TxnID|TxnId|Trans\.?\s*ID|Transaction\s*ID)\s*[:\-]?\s*([A-Z0-9]{6,20})/i;
  const trxMatch = text.match(trxRegex);
  const trxId = trxMatch ? trxMatch[1].toUpperCase().trim() : '';

  // Extract Amount (e.g. "received Tk 450.00" or "Amount: Tk 450.00" or "Tk 450")
  const amountRegex = /(?:received\s+Tk\.?|Amount\s*[:\-]?\s*Tk\.?|Tk\.?)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i;
  const amountMatch = text.match(amountRegex);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

  // Extract Sender phone number if present
  const senderRegex = /(?:from|Sender\s*[:\-]?)\s*(01[3-9][0-9]{8,9})/i;
  const senderMatch = text.match(senderRegex);
  const sender = senderMatch ? senderMatch[1] : '';

  if (!trxId) return null;

  return {
    trxId,
    amount: isNaN(amount) ? 0 : amount,
    method,
    sender,
    rawSms: text
  };
}

/**
 * Saves a verified payment SMS / TrxID record to Firestore and automatically
 * marks any matching PENDING order as COMPLETED.
 */
export async function registerPaymentAndAutoVerify(params: {
  trxId: string;
  amount: number;
  method?: string;
  sender?: string;
  rawSms?: string;
}): Promise<{ matchedOrderId: string | null }> {
  const cleanTrxId = params.trxId.trim().toUpperCase();
  if (!cleanTrxId) throw new Error('Invalid TrxID');

  // Check if there is already a PENDING order with this TrxID
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('paymentTrxId', '==', cleanTrxId));
  const snap = await getDocs(q);

  let matchedOrderId: string | null = null;

  for (const orderDoc of snap.docs) {
    const orderData = orderDoc.data();
    const requiredAmount = Number(orderData.finalAmount || 0);
    // Verify if order is PENDING and amount covers requiredAmount (or if amount wasn't specified i.e. 0)
    if (orderData.orderStatus === 'PENDING' && (params.amount === 0 || params.amount >= requiredAmount)) {
      matchedOrderId = orderDoc.id;
      break;
    }
  }

  // Save to payment_sms/{cleanTrxId}
  await setDoc(doc(db, 'payment_sms', cleanTrxId), {
    trxId: cleanTrxId,
    amount: Number(params.amount || 0),
    method: params.method || 'bKash',
    sender: params.sender || '',
    rawSms: params.rawSms || '',
    used: Boolean(matchedOrderId),
    usedByOrderId: matchedOrderId || '',
    webhookKey: 'FELCO2026',
    createdAt: new Date().toISOString()
  });

  // If a matching PENDING order was found, mark it COMPLETED immediately
  if (matchedOrderId) {
    await updateDoc(doc(db, 'orders', matchedOrderId), {
      orderStatus: 'COMPLETED',
      updatedAt: new Date().toISOString()
    });
  }

  return { matchedOrderId };
}

/**
 * Checks if a TrxID has already arrived in payment_sms and is unused with sufficient amount.
 */
export async function checkAndConsumePaymentSms(
  trxId: string,
  requiredAmount: number,
  orderId: string
): Promise<boolean> {
  try {
    const cleanTrxId = trxId.trim().toUpperCase();
    if (!cleanTrxId) return false;

    const smsRef = doc(db, 'payment_sms', cleanTrxId);
    const smsSnap = await getDoc(smsRef);
    if (!smsSnap.exists()) return false;

    const smsData = smsSnap.data();
    if (smsData.used === true && smsData.usedByOrderId !== orderId) {
      return false; // Already used by another order
    }

    const paidAmount = Number(smsData.amount || 0);
    if (paidAmount > 0 && paidAmount < requiredAmount) {
      return false; // Sent less money than required
    }

    // Consume this SMS record so it cannot be reused
    await updateDoc(smsRef, {
      used: true,
      usedByOrderId: orderId
    });

    return true;
  } catch (err) {
    console.error('Auto-verify check error:', err);
    return false;
  }
}
