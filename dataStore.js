// dataStore.js - Academic Ledger Baseline Dataset
// Context: Vidyalankar Institute of Technology (VIT) Campus Transactions
// Amounts in INR (₹) with realistic 12-digit UPI/NEFT reference numbers

export const transactions = [
  { transactionId: "408192837401", customerId: "CUST502", date: "2024-03-01", type: "Debit", amount: 68500.00, description: "Vidyalankar Institute Semester Fee" },
  { transactionId: "408291029384", customerId: "CUST114", date: "2024-03-02", type: "Debit", amount: 450.00, description: "VEGA Hackathon Registration Fee" },
  { transactionId: "408381920192", customerId: "CUST502", date: "2024-03-03", type: "Debit", amount: 120.00, description: "Canteen UPI - Samosa & Cutting Chai" },
  { transactionId: "408472819203", customerId: "CUST888", date: "2024-03-04", type: "Credit", amount: 25000.00, description: "TechFest Title Sponsorship Inward" },
  { transactionId: "408563728194", customerId: "CUST114", date: "2024-03-05", type: "Debit", amount: 50.00, description: "Campus Xerox & Printing Centre" },
  { transactionId: "408654839201", customerId: "CUST201", date: "2024-03-06", type: "Debit", amount: 2400.00, description: "IEEE Student Branch Annual Dues" },
  { transactionId: "408745948392", customerId: "CUST502", date: "2024-03-07", type: "Credit", amount: 12000.00, description: "State Merit Scholarship Credit" },
  { transactionId: "408836059483", customerId: "CUST305", date: "2024-03-08", type: "Debit", amount: 180.00, description: "Canteen UPI - Mini Thali Lunch" },
  { transactionId: "408927160574", customerId: "CUST201", date: "2024-03-09", type: "Debit", amount: 1500.00, description: "University Re-eval Exam Fee" },
  { transactionId: "409018271665", customerId: "CUST888", date: "2024-03-10", type: "Debit", amount: 350.00, description: "Central Library Overdue Fine" },
  { transactionId: "409109382756", customerId: "CUST114", date: "2024-03-11", type: "Debit", amount: 8500.00, description: "Hostel Mess Advance Deposit" },
  { transactionId: "409200493847", customerId: "CUST305", date: "2024-03-12", type: "Credit", amount: 500.00, description: "Caution Money Refund NEFT" },
  { transactionId: "409291504938", customerId: "CUST900", date: "2024-03-13", type: "Debit", amount: 210.00, description: "Stationery Store UPI - Lab Manuals" },
  { transactionId: "409382615029", customerId: "CUST502", date: "2024-03-14", type: "Credit", amount: 5000.00, description: "AOA Lab Assistant Stipend" },
  { transactionId: "409473726110", customerId: "CUST201", date: "2024-03-15", type: "Debit", amount: 650.00, description: "Inter-College Sports Meet Kit" },
  { transactionId: "409564837201", customerId: "CUST900", date: "2024-03-16", type: "Debit", amount: 75.00, description: "Nescafe Kiosk Coffee UPI" },
  { transactionId: "409655948392", customerId: "CUST114", date: "2024-03-17", type: "Credit", amount: 15000.00, description: "Parent Account NEFT Transfer" },
  { transactionId: "409746059483", customerId: "CUST888", date: "2024-03-18", type: "Debit", amount: 1200.75, description: "ACM Workshop Registration UPI" }
];

console.log("Data Store Loaded:", transactions.length, "academic records found.");