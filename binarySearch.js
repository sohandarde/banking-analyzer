const { PerformanceTracker, compareRecords } = require('./utils');

function isSorted(arr, key, order = 'asc') {
  for (let index = 1; index < arr.length; index += 1) {
    if (compareRecords(arr[index - 1], arr[index], key, order) > 0) {
      return false;
    }
  }
  return true;
}

function binarySearch(arr, key, targetValue, order = 'asc', tracker = new PerformanceTracker()) {
  if (!isSorted(arr, key, order)) {
    throw new Error(`Array must be sorted by '${key}' in ${order} order`);
  }

  const target = { [key]: targetValue };
  let low = 0;
  let high = arr.length - 1;
  let matchIndex = -1;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    tracker.comparisons += 1;
    const comparison = compareRecords(arr[middle], target, key, order);

    if (comparison === 0) {
      matchIndex = middle;
      break;
    }
    if (comparison < 0) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  if (matchIndex === -1) {
    return [];
  }

  let firstMatch = matchIndex;
  let lastMatch = matchIndex;

  while (firstMatch > 0) {
    tracker.comparisons += 1;
    if (compareRecords(arr[firstMatch - 1], target, key, order) !== 0) {
      break;
    }
    firstMatch -= 1;
  }

  while (lastMatch < arr.length - 1) {
    tracker.comparisons += 1;
    if (compareRecords(arr[lastMatch + 1], target, key, order) !== 0) {
      break;
    }
    lastMatch += 1;
  }

  return arr.slice(firstMatch, lastMatch + 1);
}

module.exports = { isSorted, binarySearch };