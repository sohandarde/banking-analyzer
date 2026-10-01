const { PerformanceTracker } = require('./utils');
const { mergeSort } = require('./mergeSort');
const { binarySearch } = require('./binarySearch');

const transactions = [
  { transactionId: 'TXN-1001', customerId: 'C-201', date: new Date('2026-09-02'), type: 'deposit', amount: 1250 },
  { transactionId: 'TXN-1002', customerId: 'C-202', date: new Date('2026-09-03'), type: 'withdrawal', amount: 5000 },
  { transactionId: 'TXN-1003', customerId: 'C-203', date: new Date('2026-09-04'), type: 'transfer', amount: 275 },
  { transactionId: 'TXN-1004', customerId: 'C-204', date: new Date('2026-09-05'), type: 'deposit', amount: 8420 },
  { transactionId: 'TXN-1005', customerId: 'C-205', date: new Date('2026-09-06'), type: 'payment', amount: 5000 },
  { transactionId: 'TXN-1006', customerId: 'C-206', date: new Date('2026-09-07'), type: 'withdrawal', amount: 990 },
  { transactionId: 'TXN-1007', customerId: 'C-207', date: new Date('2026-09-08'), type: 'transfer', amount: 15600 },
  { transactionId: 'TXN-1008', customerId: 'C-208', date: new Date('2026-09-09'), type: 'deposit', amount: 3200 },
  { transactionId: 'TXN-1009', customerId: 'C-209', date: new Date('2026-09-10'), type: 'payment', amount: 75 },
  { transactionId: 'TXN-1010', customerId: 'C-210', date: new Date('2026-09-11'), type: 'withdrawal', amount: 6400 },
];

const tracker = new PerformanceTracker();
const sortedTransactions = mergeSort(transactions, 'amount', 'asc', tracker);

console.log('Transactions sorted by amount:');
console.table(sortedTransactions);

const matchingTransactions = binarySearch(sortedTransactions, 'amount', 5000, 'asc', tracker);
console.log('Transactions with amount 5000:');
console.table(matchingTransactions);

console.log('Performance metrics:');
console.table({
  comparisons: tracker.comparisons,
  swaps: tracker.swaps,
  currentDepth: tracker.currentDepth,
  maxDepth: tracker.maxDepth,
});