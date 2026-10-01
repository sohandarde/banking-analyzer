class PerformanceTracker {
  constructor() {
    this.comparisons = 0;
    this.swaps = 0;
    this.currentDepth = 0;
    this.maxDepth = 0;
  }

  trackRecursion() {
    this.currentDepth += 1;
    this.maxDepth = Math.max(this.maxDepth, this.currentDepth);
  }

  exitRecursion() {
    this.currentDepth = Math.max(0, this.currentDepth - 1);
  }
}

function compareRecords(a, b, key, order = 'asc') {
  const direction = String(order).toLowerCase();
  if (!['asc', 'ascending', 'desc', 'descending'].includes(direction)) {
    throw new RangeError("order must be 'asc' or 'desc'");
  }

  const left = a[key];
  const right = b[key];
  let result;

  if (typeof left === 'number' && typeof right === 'number') {
    result = left < right ? -1 : left > right ? 1 : 0;
  } else if (left instanceof Date && right instanceof Date) {
    const leftTime = left.getTime();
    const rightTime = right.getTime();
    result = leftTime < rightTime ? -1 : leftTime > rightTime ? 1 : 0;
  } else if (typeof left === 'string' && typeof right === 'string') {
    result = left.localeCompare(right);
  } else {
    throw new TypeError(`Values for '${key}' must both be Numbers, Dates, or Strings of the same type`);
  }

  return direction === 'desc' || direction === 'descending' ? -result : result;
}

module.exports = { PerformanceTracker, compareRecords };