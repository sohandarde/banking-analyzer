export const transactions = [
  { transactionId: "TXN1001", customerId: "CUST502", date: "2024-03-15", type: "Credit", amount: 14500.50 },
  { transactionId: "TXN1002", customerId: "CUST114", date: "2024-03-16", type: "Debit", amount: 250.00 },
  { transactionId: "TXN1003", customerId: "CUST502", date: "2024-03-12", type: "Debit", amount: 1200.75 },
  { transactionId: "TXN1004", customerId: "CUST888", date: "2024-03-10", type: "Credit", amount: 50000.00 },
  { transactionId: "TXN1005", customerId: "CUST114", date: "2024-03-18", type: "Credit", amount: 300.00 }
];

console.log("Data Store Loaded:", transactions.length, "records found.");