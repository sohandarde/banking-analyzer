// controller.js
import { isSortedByKey } from './validation.js';

// This function bridges the UI and the Algorithms
export function processSearchRequest(transactions, searchKey, targetValue, binarySearchFunction) {
  // 1. Enforce the Search Precondition
  if (!isSortedByKey(transactions, searchKey)) {
    return { 
      success: false, 
      message: `[ERROR] The dataset must be sorted by '${searchKey}' before performing a Binary Search.` 
    };
  }

  // 2. If valid, execute Sohan's binary search
  const result = binarySearchFunction(transactions, searchKey, targetValue);

  // 3. Handle the "not-found" requirement
  if (!result || result.length === 0) {
    return {
      success: true,
      found: false,
      message: `No transactions found matching ${searchKey}: ${targetValue}`
    };
  }

  return {
    success: true,
    found: true,
    data: result
  };
}