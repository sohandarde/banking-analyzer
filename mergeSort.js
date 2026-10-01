const { PerformanceTracker, compareRecords } = require('./utils');

function mergeSort(arr, key, order = 'asc', tracker = new PerformanceTracker()) {
  function sort(records) {
    tracker.trackRecursion();

    try {
      if (records.length <= 1) {
        return records;
      }

      const middle = Math.floor(records.length / 2);
      const left = sort(records.slice(0, middle));
      const right = sort(records.slice(middle));
      const merged = [];
      let leftIndex = 0;
      let rightIndex = 0;

      while (leftIndex < left.length && rightIndex < right.length) {
        tracker.comparisons += 1;
        if (compareRecords(left[leftIndex], right[rightIndex], key, order) <= 0) {
          merged.push(left[leftIndex]);
          leftIndex += 1;
        } else {
          merged.push(right[rightIndex]);
          rightIndex += 1;
        }
        tracker.swaps += 1;
      }

      while (leftIndex < left.length) {
        merged.push(left[leftIndex]);
        leftIndex += 1;
        tracker.swaps += 1;
      }

      while (rightIndex < right.length) {
        merged.push(right[rightIndex]);
        rightIndex += 1;
        tracker.swaps += 1;
      }

      return merged;
    } finally {
      tracker.exitRecursion();
    }
  }

  return sort(arr);
}

module.exports = { mergeSort };