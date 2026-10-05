// analytics.js
import { transactions } from './dataStore.js';

export function getExtremes(dataArray) {
  if (!dataArray || dataArray.length === 0) return null;

  let highest = dataArray[0];
  let lowest = dataArray[0];

  dataArray.forEach(txn => {
    if (Number(txn.amount) > Number(highest.amount)) highest = txn;
    if (Number(txn.amount) < Number(lowest.amount)) lowest = txn;
  });

  return { highest, lowest };
}

export function getCustomerReport(dataArray, targetCustomerId) {
  const customerTxns = dataArray.filter(txn => txn.customerId === targetCustomerId);
  
  const totalCredit = customerTxns
    .filter(t => t.type === 'Credit')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const totalDebit = customerTxns
    .filter(t => t.type === 'Debit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    customer: targetCustomerId,
    transactionCount: customerTxns.length,
    totalCredit,
    totalDebit,
    netBalance: totalCredit - totalDebit
  };
}

// Test the logic directly
console.log("=== Analytics Test ===");
console.log("Extremes:", getExtremes(transactions));
console.log("Report for CUST502:", getCustomerReport(transactions, "CUST502"));