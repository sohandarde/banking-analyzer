const { PerformanceTracker, compareRecords } = require('./utils');

function quickSort(arr, key, order = 'asc', tracker = new PerformanceTracker()) {
  function partition(low, high) {
    const pivot = arr[high];
    let boundary = low;

    for (let index = low; index < high; index += 1) {
      tracker.comparisons += 1;
      if (compareRecords(arr[index], pivot, key, order) <= 0) {
        if (boundary !== index) {
          [arr[boundary], arr[index]] = [arr[index], arr[boundary]];
          tracker.swaps += 1;
        }
        boundary += 1;
      }
    }

    if (boundary !== high) {
      [arr[boundary], arr[high]] = [arr[high], arr[boundary]];
      tracker.swaps += 1;
    }

    return boundary;
  }

  function sort(low, high) {
    if (low < high) {
      const pivotIndex = partition(low, high);
      sort(low, pivotIndex - 1);
      sort(pivotIndex + 1, high);
    }
  }

  sort(0, arr.length - 1);
  return arr;
}

module.exports = { quickSort };