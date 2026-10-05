// test.js
const { PerformanceTracker } = require('./utils');
const { mergeSort } = require('./mergeSort');
const { binarySearch } = require('./binarySearch');

// If your controller and validation files are using 'import', 
// we will just recreate your fail-safe logic right here for the test to avoid module errors.
function isSortedByKey(dataArray, key, order = 'asc') {
  if (dataArray.length <= 1) return true;
  for (let i = 0; i < dataArray.length - 1; i++) {
    let current = dataArray[i][key];
    let next = dataArray[i + 1][key];
    if (key === 'amount') {
      current = Number(current);
      next = Number(next);
    }
    if (order === 'asc' && current > next) return false;
    if (order === 'desc' && current < next) return false;
  }
  return true;
}

const transactions = [
  { transactionId: 'TXN-1001', customerId: 'C-201', date: new Date('2026-09-02'), type: 'deposit', amount: 1250 },
  { transactionId: 'TXN-1002', customerId: 'C-202', date: new Date('2026-09-03'), type: 'withdrawal', amount: 5000 },
  { transactionId: 'TXN-1003', customerId: 'C-203', date: new Date('2026-09-04'), type: 'transfer', amount: 275 },
  { transactionId: 'TXN-1004', customerId: 'C-204', date: new Date('2026-09-05'), type: 'deposit', amount: 8420 },
  { transactionId: 'TXN-1005', customerId: 'C-205', date: new Date('2026-09-06'), type: 'payment', amount: 5000 },
];

const tracker = new PerformanceTracker();

console.log('--- PHASE 1: Testing Tanmay\'s Precondition Fail-Safe ---');
if (!isSortedByKey(transactions, 'amount')) {
    console.log('[BLOCKED] Dataset is not sorted by amount. Binary Search aborted.\n');
}

console.log('--- PHASE 2: Running Sohan\'s Merge Sort ---');
const sortedTransactions = mergeSort(transactions, 'amount', 'asc', tracker);
console.log('Transactions sorted by amount:');
console.table(sortedTransactions);

console.log('\n--- PHASE 3: Running Sohan\'s Binary Search ---');
if (isSortedByKey(sortedTransactions, 'amount')) {
    const matchingTransactions = binarySearch(sortedTransactions, 'amount', 5000, 'asc', tracker);
    console.log('Transactions with amount 5000:');
    console.table(matchingTransactions);
}

console.log('\n--- PHASE 4: Performance Analytics ---');
console.table({
  comparisons: tracker.comparisons,
  swaps: tracker.swaps,
  currentDepth: tracker.currentDepth,
  maxDepth: tracker.maxDepth,
});