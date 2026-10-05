// validation.js

// This checks if the array is sorted by the chosen key before allowing Binary Search
export function isSortedByKey(dataArray, key, order = 'asc') {
  if (dataArray.length <= 1) return true;

  for (let i = 0; i < dataArray.length - 1; i++) {
    let current = dataArray[i][key];
    let next = dataArray[i + 1][key];

    // Convert to numbers if checking the amount
    if (key === 'amount') {
      current = Number(current);
      next = Number(next);
    }

    if (order === 'asc' && current > next) return false;
    if (order === 'desc' && current < next) return false;
  }
  return true;
}