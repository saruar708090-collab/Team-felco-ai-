// Netlify Serverless Function for Automatic bKash / Nagad / Rocket SMS Verification
// Endpoint: https://teamfelco.netlify.app/.netlify/functions/sms-webhook?key=FELCO2026

const PROJECT_ID = 'bdtf-fd89d';
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function parseSmsText(rawText) {
  const text = String(rawText || '').trim();
  if (!text) return null;

  let method = 'bKash';
  if (/bkash|trxid/i.test(text)) method = 'bKash';
  else if (/nagad|txnid/i.test(text)) method = 'Nagad';
  else if (/rocket|dbbl/i.test(text)) method = 'Rocket';

  const trxMatch = text.match(/(?:TrxID|TxnID|TxnId|Trans\.?\s*ID|Transaction\s*ID)\s*[:\-]?\s*([A-Z0-9]{6,20})/i);
  const trxId = trxMatch ? trxMatch[1].toUpperCase().trim() : '';

  const amountMatch = text.match(/(?:received\s+Tk\.?|Amount\s*[:\-]?\s*Tk\.?|Tk\.?)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

  const senderMatch = text.match(/(?:from|Sender\s*[:\-]?)\s*(01[3-9][0-9]{8,9})/i);
  const sender = senderMatch ? senderMatch[1] : '';

  if (!trxId) return null;
  return { trxId, amount: isNaN(amount) ? 0 : amount, method, sender, rawSms: text };
}

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event?.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  try {
    const queryParams = event?.queryStringParameters || {};
    let bodyData = {};
    if (event?.body) {
      try {
        bodyData = JSON.parse(event.body);
      } catch {
        // Fallback for URL-encoded or plain text body
        bodyData = { text: event.body };
      }
    }

    const key = queryParams.key || bodyData.key || 'FELCO2026';
    if (key !== 'FELCO2026') {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Invalid webhook key' }) };
    }

    const smsText =
      bodyData.text ||
      bodyData.message ||
      bodyData.sms ||
      bodyData.body ||
      queryParams.text ||
      queryParams.message ||
      queryParams.sms ||
      '';

    const parsed = parseSmsText(smsText);
    if (!parsed) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ skipped: true, reason: 'No TrxID found in SMS text' })
      };
    }

    const { trxId, amount, method, sender, rawSms } = parsed;

    // 1. Save to Firestore payment_sms/{trxId}
    const smsDocUrl = `${FIRESTORE_BASE_URL}/payment_sms/${encodeURIComponent(trxId)}`;
    await fetch(smsDocUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          trxId: { stringValue: trxId },
          amount: { doubleValue: Number(amount || 0) },
          method: { stringValue: method },
          sender: { stringValue: sender },
          rawSms: { stringValue: rawSms.slice(0, 900) },
          used: { booleanValue: false },
          usedByOrderId: { stringValue: '' },
          webhookKey: { stringValue: 'FELCO2026' },
          createdAt: { stringValue: new Date().toISOString() }
        }
      })
    });

    // 2. Query orders collection for any PENDING order with this paymentTrxId
    const queryUrl = `${FIRESTORE_BASE_URL}:runQuery`;
    const queryRes = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'orders' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'paymentTrxId' },
              op: 'EQUAL',
              value: { stringValue: trxId }
            }
          }
        }
      })
    });

    const queryData = await queryRes.json();
    let matchedOrderId = null;

    if (Array.isArray(queryData)) {
      for (const item of queryData) {
        if (item.document && item.document.fields) {
          const fields = item.document.fields;
          const status = fields.orderStatus?.stringValue;
          const orderId = fields.orderId?.stringValue;
          const finalAmount = Number(
            fields.finalAmount?.integerValue || fields.finalAmount?.doubleValue || 0
          );

          if (status === 'PENDING' && orderId && (amount === 0 || amount >= finalAmount)) {
            matchedOrderId = orderId;
            // Update order status to COMPLETED
            const orderUpdateUrl = `${FIRESTORE_BASE_URL}/orders/${encodeURIComponent(orderId)}?updateMask.fieldPaths=orderStatus&updateMask.fieldPaths=updatedAt`;
            await fetch(orderUpdateUrl, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fields: {
                  orderStatus: { stringValue: 'COMPLETED' },
                  updatedAt: { stringValue: new Date().toISOString() }
                }
              })
            });

            // Mark payment_sms as used
            const markUsedUrl = `${FIRESTORE_BASE_URL}/payment_sms/${encodeURIComponent(trxId)}?updateMask.fieldPaths=used&updateMask.fieldPaths=usedByOrderId`;
            await fetch(markUsedUrl, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fields: {
                  used: { booleanValue: true },
                  usedByOrderId: { stringValue: orderId }
                }
              })
            });
            break;
          }
        }
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        trxId,
        amount,
        method,
        autoVerifiedOrder: matchedOrderId
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: String(err.message || err) })
    };
  }
};

export default handler;
