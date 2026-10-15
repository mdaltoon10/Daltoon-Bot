import { Transaction } from "../types";

/**
 * Determines whether a transaction is an actual incoming card-to-card receipt or direct payment deposit,
 * explicitly excluding internal wallet deductions/renewals/purchases to prevent double counting.
 */
export function isCardOrDepositTransaction(tx: Partial<Transaction> | null | undefined): boolean {
  if (!tx) return false;
  
  // Must be approved
  const rawStatus = String(tx.status || "").toLowerCase().trim();
  if (rawStatus !== "approved") return false;

  // Must have a positive amount
  const amount = Number(tx.amount || 0);
  if (isNaN(amount) || amount <= 0) return false;

  const id = String(tx.id || "").trim();
  const type = String(tx.type || "").toLowerCase().trim();
  const paymentMethod = String((tx as any).paymentMethod || (tx as any).method || "").toLowerCase().trim();
  const desc = String(tx.description || "").toLowerCase();

  // 1. Explicitly exclude wallet deductions, wallet balance purchases, wallet renewals, and admin free allocations
  if (
    paymentMethod === "wallet" ||
    paymentMethod === "balance" ||
    paymentMethod === "credit" ||
    paymentMethod === "wallet_balance"
  ) {
    return false;
  }

  if (
    type === "wallet_deduct" ||
    type === "wallet_purchase" ||
    type === "wallet_renew" ||
    type === "admin_free" ||
    type === "admin_colleague_free" ||
    type === "referral_bonus" ||
    type === "freetest" ||
    type === "free_test"
  ) {
    return false;
  }

  if (id.startsWith("TX-ADM-")) {
    return false;
  }

  // If description explicitly denotes paying from wallet without being a deposit/charge
  if (
    (desc.includes("پرداخت از کیف پول") || desc.includes("کسر از کیف پول") || desc.includes("کیف پول")) &&
    !type.includes("charge") &&
    !type.includes("deposit") &&
    !id.startsWith("TX-DEP-") &&
    !id.startsWith("TX-AUTO-") &&
    !desc.includes("شارژ") &&
    !desc.includes("واریز")
  ) {
    return false;
  }

  // 2. Identify Direct Card-to-Card Receipts & Verified External Deposits:
  // - TX-CARD-... (Direct Config Purchase via Card-to-Card Receipt)
  // - TX-DEP-... (Wallet Charge via Card-to-Card Receipt)
  // - TX-AUTO-... (Automated Payment Gateway / Direct Payment)
  // - TX-COL-RENEW-CARD-... / TX-CARD-COL-... (Colleague Card-to-Card Purchase/Renewal)
  // - Has non-empty receiptImage
  // - paymentMethod === "card_to_card" / "card" / "gateway"
  // - type === "charge" / "deposit" / "card_to_card" / "payment"
  const hasReceiptImage = Boolean(tx.receiptImage && String(tx.receiptImage).trim().length > 0);
  const isCardMethod =
    paymentMethod === "card" ||
    paymentMethod === "card_to_card" ||
    paymentMethod === "c2c" ||
    paymentMethod === "gateway" ||
    paymentMethod === "stars" ||
    paymentMethod === "crypto" ||
    paymentMethod === "nowpayments" ||
    paymentMethod === "cryptomus" ||
    paymentMethod === "plisio" ||
    paymentMethod === "heleket";

  const isDepositType =
    type === "charge" ||
    type === "deposit" ||
    type === "card_to_card" ||
    type === "card" ||
    type === "payment" ||
    type === "gateway";

  const isCardOrDepositId =
    id.startsWith("TX-CARD-") ||
    id.startsWith("TX-DEP-") ||
    id.startsWith("TX-AUTO-") ||
    id.includes("CARD");

  if (isCardOrDepositId || isDepositType || isCardMethod || hasReceiptImage) {
    return true;
  }

  // Fallback: If it starts with TX-PUR- or TX-COL- without receipt/card method, it's an internal wallet purchase
  if (id.startsWith("TX-PUR-") || id.startsWith("TX-COL-")) {
    return false;
  }

  // If approved and has receipt image or is deposit
  return hasReceiptImage || isDepositType;
}
