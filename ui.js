/**
 * ui.js - Modern FinTech UI Controller for CampusPay
 * 
 * Bridges index.html to Tanmay's controller.js and Sohan's algorithms.
 * Direct synchronization with activeLedger and global transactions array.
 */

import { processSearchRequest } from './controller.js';
import { transactions } from './dataStore.js';
import { isSortedByKey } from './validation.js';

// Local mutable ledger to bypass any ESM caching & guarantee active state management
let activeLedger = [...transactions];
window.activeLedger = activeLedger;
window.transactions = transactions;

// Save initial baseline snapshot for reset operations
const baselineSnapshot = JSON.parse(JSON.stringify(transactions));

/**
 * Dynamically resolves Sohan's Algorithm Suite from window bridge
 */
function getAlgorithmSuite() {
  if (window.AlgorithmSuite && typeof window.AlgorithmSuite.mergeSort === 'function') {
    return window.AlgorithmSuite;
  }
  // Fallback if accessed in headless/test environments
  if (typeof require === 'function') {
    const utils = require('./utils');
    const merge = require('./mergeSort');
    const quick = require('./quickSort');
    const search = require('./binarySearch');
    return {
      PerformanceTracker: utils.PerformanceTracker,
      compareRecords: utils.compareRecords,
      mergeSort: merge.mergeSort,
      quickSort: quick.quickSort,
      binarySearch: search.binarySearch,
      isSorted: search.isSorted
    };
  }
  throw new Error('AlgorithmSuite is not initialized on window. Check script load order.');
}

// -------------------------------------------------------------
// UI FILTER & SEARCH STATE
// -------------------------------------------------------------
let filteredTransactions = null;
let matchedTxnIds = new Set();
let lastSortInfo = {
  key: null,
  algorithm: null,
  order: 'asc'
};

// -------------------------------------------------------------
// DOM CACHE
// -------------------------------------------------------------
const dom = {
  // Top KPI Cards
  kpiComparisons: document.getElementById('kpi-comparisons'),
  kpiRecursionDepth: document.getElementById('kpi-recursion-depth'),
  kpiExecutionTime: document.getElementById('kpi-execution-time'),
  kpiAlgorithmTag: document.getElementById('kpi-algorithm-tag'),
  kpiLedgerRecords: document.getElementById('kpi-ledger-records'),
  kpiNetSummary: document.getElementById('kpi-net-summary'),

  // Add Transaction Form
  form: document.getElementById('add-txn-form'),
  txnIdInput: document.getElementById('txn-id-input'),
  customerIdInput: document.getElementById('customer-id-input'),
  dateInput: document.getElementById('date-input'),
  typeInput: document.getElementById('type-input'),
  amountInput: document.getElementById('amount-input'),
  descInput: document.getElementById('desc-input'),
  btnAddTxn: document.getElementById('btn-add-txn'),
  btnAutofill: document.getElementById('btn-autofill-sample'),
  formFeedback: document.getElementById('form-feedback-text'),

  // Sort Controls
  sortKeySelect: document.getElementById('sort-key-select'),
  sortAlgoSelect: document.getElementById('sort-algo-select'),
  sortOrderSelect: document.getElementById('sort-order-select'),
  btnRunSort: document.getElementById('btn-run-sort'),
  activeSortPill: document.getElementById('active-sort-pill'),

  // Search Controls
  searchKeySelect: document.getElementById('search-key-select'),
  searchTargetInput: document.getElementById('search-target-input'),
  btnRunSearch: document.getElementById('btn-run-search'),
  searchPreconditionPill: document.getElementById('search-precondition-pill'),
  preconditionAlert: document.getElementById('precondition-alert'),
  preconditionAlertText: document.getElementById('precondition-alert-text'),
  btnSortAndSearch: document.getElementById('btn-sort-and-search'),

  // Ledger Table
  ledgerTable: document.getElementById('ledger-table'),
  ledgerTbody: document.getElementById('ledger-tbody'),
  ledgerRecordsBadge: document.getElementById('ledger-records-badge'),
  ledgerEmptyState: document.getElementById('ledger-empty-state'),
  searchStatusBar: document.getElementById('search-status-bar'),
  searchStatusText: document.getElementById('search-status-text'),
  btnClearSearch: document.getElementById('btn-clear-search'),
  btnResetLedger: document.getElementById('btn-reset-ledger'),

  // Bottom Summary
  sumCredits: document.getElementById('sum-credits'),
  sumDebits: document.getElementById('sum-debits'),
  sumNet: document.getElementById('sum-net'),
};

// -------------------------------------------------------------
// UTILITY HELPERS
// -------------------------------------------------------------
function formatINR(val) {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return String(dateStr);
  }
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// -------------------------------------------------------------
// RENDER FUNCTION (LEDGER & METRICS)
// -------------------------------------------------------------
export function renderDashboard(isSortAction = false, isSearchAction = false) {
  const dataset = filteredTransactions !== null ? filteredTransactions : activeLedger;

  // 1. Update KPI Card 4: Record Count & Net Volume from activeLedger
  dom.kpiLedgerRecords.textContent = activeLedger.length;
  let totalCredit = 0;
  let totalDebit = 0;
  activeLedger.forEach(t => {
    const isCr = String(t.type).toLowerCase() === 'credit';
    const amt = Number(t.amount) || 0;
    if (isCr) totalCredit += amt;
    else totalDebit += amt;
  });
  const net = totalCredit - totalDebit;

  dom.sumCredits.textContent = formatINR(totalCredit);
  dom.sumDebits.textContent = formatINR(totalDebit);
  dom.sumNet.textContent = (net >= 0 ? '+' : '-') + ' ' + formatINR(Math.abs(net));
  dom.sumNet.className = net >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold';
  dom.kpiNetSummary.textContent = `${formatINR(net)} Net Position`;

  // 2. Update Ledger Count Badge
  dom.ledgerRecordsBadge.textContent = filteredTransactions !== null
    ? `${filteredTransactions.length} of ${activeLedger.length} records`
    : `${activeLedger.length} records`;

  // 3. Force DOM Re-render: Clear innerHTML completely before repopulating
  dom.ledgerTbody.innerHTML = '';

  if (dataset.length === 0) {
    dom.ledgerEmptyState.classList.remove('hidden');
  } else {
    dom.ledgerEmptyState.classList.add('hidden');

    let firstMatchedRow = null;

    dataset.forEach((txn, index) => {
      const tr = document.createElement('tr');
      const isCredit = String(txn.type).toLowerCase() === 'credit';
      const isMatched = matchedTxnIds.has(txn.transactionId);

      tr.className = 'hover:bg-slate-50/80 transition-colors border-b border-slate-100';

      // Visual Binary Search Highlight: Pulse and glow border on matches
      if (isMatched) {
        tr.classList.add('row-matched');
        if (!firstMatchedRow) firstMatchedRow = tr;
      }

      const typeBadge = isCredit
        ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">&uarr; Credit</span>'
        : '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-100">&darr; Debit</span>';

      const amountColor = isCredit ? 'text-emerald-600' : 'text-slate-900';
      const amountPrefix = isCredit ? '+' : '-';

      tr.innerHTML = `
        <td class="py-3 px-4 text-center font-mono text-[11px] text-slate-400">${index + 1}</td>
        <td class="py-3 px-4 font-mono font-medium text-slate-900">
          <div class="flex items-center space-x-1.5">
            <span>${escapeHtml(txn.transactionId)}</span>
            ${isMatched ? '<span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-600 text-white font-mono tracking-wider">FOUND</span>' : ''}
          </div>
        </td>
        <td class="py-3 px-4 font-mono text-slate-600">
          <span class="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">${escapeHtml(txn.customerId)}</span>
        </td>
        <td class="py-3 px-4 text-slate-700 truncate max-w-xs" title="${escapeHtml(txn.description || '')}">
          ${escapeHtml(txn.description || 'Campus Transaction')}
        </td>
        <td class="py-3 px-4 text-slate-500 font-mono text-[11px]">
          ${formatDate(txn.date)}
        </td>
        <td class="py-3 px-4 text-center">
          ${typeBadge}
        </td>
        <td class="py-3 px-4 text-right font-mono font-bold text-xs ${amountColor}">
          ${amountPrefix}${formatINR(txn.amount)}
        </td>
        <td class="py-3 px-4 text-center">
          <button type="button" data-del-id="${escapeHtml(txn.transactionId)}" class="btn-del text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 transition" title="Delete record">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </td>
      `;

      dom.ledgerTbody.appendChild(tr);
    });

    // Visual Sorting Feedback: Fade-in / slide transition on table body
    if (isSortAction) {
      dom.ledgerTbody.classList.remove('table-reordered');
      void dom.ledgerTbody.offsetWidth; // Force reflow
      dom.ledgerTbody.classList.add('table-reordered');
    }

    // Scroll matching search row into view smoothly
    if (isSearchAction && firstMatchedRow) {
      firstMatchedRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // 4. Update Precondition Status Badge
  updatePreconditionStatus();
}

/**
 * Checks whether activeLedger satisfies Binary Search precondition
 */
function updatePreconditionStatus() {
  const searchKey = dom.searchKeySelect.value;
  const isSorted = isSortedByKey(activeLedger, searchKey, 'asc');

  if (isSorted) {
    dom.searchPreconditionPill.className = 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center space-x-1';
    dom.searchPreconditionPill.innerHTML = `
      <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
      <span>Sorted by '${searchKey}' &bull; Ready</span>
    `;
    dom.preconditionAlert.classList.add('hidden');
  } else {
    dom.searchPreconditionPill.className = 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center space-x-1';
    dom.searchPreconditionPill.innerHTML = `
      <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
      <span>Unsorted by '${searchKey}' &bull; Sort Required</span>
    `;
  }

  // Update Sort Pill
  if (lastSortInfo.key) {
    const algoName = lastSortInfo.algorithm === 'mergeSort' ? 'Merge Sort' : 'Quick Sort';
    dom.activeSortPill.innerHTML = `
      Sorted by <strong class="text-slate-900">${lastSortInfo.key}</strong> (${lastSortInfo.order.toUpperCase()}) via ${algoName}
    `;
  } else {
    dom.activeSortPill.textContent = 'Default Order';
  }
}

// -------------------------------------------------------------
// EVENT HANDLERS: SORTING ENGINE (ROBUST ERROR HANDLING)
// -------------------------------------------------------------
function handleRunSort() {
  try {
    const key = dom.sortKeySelect.value;
    const algo = dom.sortAlgoSelect.value;
    const order = dom.sortOrderSelect.value;

    const Suite = getAlgorithmSuite();
    const sortFn = Suite[algo];
    if (typeof sortFn !== 'function') {
      throw new Error(`Algorithm '${algo}' not found on AlgorithmSuite.`);
    }

    const tracker = new Suite.PerformanceTracker();
    const startTime = performance.now();

    // Execute sorting algorithm on a fresh copy of activeLedger
    const sortedData = sortFn([...activeLedger], key, order, tracker);

    const duration = performance.now() - startTime;

    // 1. Update local activeLedger directly
    activeLedger = [...sortedData];

    // 2. Also sync global transactions array in-place so backend references match
    try {
      transactions.splice(0, transactions.length, ...sortedData);
    } catch (spliceErr) {
      console.warn('Could not splice imported transactions array:', spliceErr);
    }

    // 3. Automatically sync Search Key if sorted ascending so Precondition is met
    if (order === 'asc') {
      dom.searchKeySelect.value = key;
    }

    lastSortInfo = { key, algorithm: algo, order };
    filteredTransactions = null;
    matchedTxnIds.clear();
    dom.searchStatusBar.classList.add('hidden');
    dom.preconditionAlert.classList.add('hidden');

    // 4. Update Sleek KPI Metrics at the Top
    dom.kpiComparisons.textContent = tracker.comparisons;
    dom.kpiRecursionDepth.textContent = tracker.maxDepth;
    dom.kpiExecutionTime.textContent = `${duration.toFixed(2)} ms`;
    dom.kpiAlgorithmTag.textContent = `${algo === 'mergeSort' ? 'Merge Sort' : 'Quick Sort'} on '${key}'`;

    // 5. Force immediate DOM re-render
    renderDashboard(true, false);

  } catch (error) {
    console.error('[CampusPay Sort Error]:', error);
    alert(`[Sort Error]: ${error.message}`);
  }
}

// -------------------------------------------------------------
// EVENT HANDLERS: BINARY SEARCH (via controller.js)
// -------------------------------------------------------------
function handleRunSearch() {
  try {
    const searchKey = dom.searchKeySelect.value;
    const rawInput = dom.searchTargetInput.value.trim();

    if (!rawInput) {
      dom.preconditionAlertText.textContent = `Please enter a value to search for in '${searchKey}'.`;
      dom.preconditionAlert.classList.remove('hidden');
      dom.searchTargetInput.focus();
      return;
    }

    // Coerce amount to Number so compareRecords in utils.js does not throw TypeError
    let targetValue = rawInput;
    if (searchKey === 'amount') {
      const cleanVal = rawInput.replace(/[₹$,\s]/g, '');
      targetValue = Number(cleanVal);
      if (isNaN(targetValue)) {
        dom.preconditionAlertText.textContent = `Amount query must be a valid number. Got '${rawInput}'.`;
        dom.preconditionAlert.classList.remove('hidden');
        return;
      }
    }

    const Suite = getAlgorithmSuite();
    const searchTracker = new Suite.PerformanceTracker();
    const startTime = performance.now();

    const boundSearchFn = (arr, key, val) => {
      return Suite.binarySearch(arr, key, val, 'asc', searchTracker);
    };

    // Direct invocation to Tanmay's controller.js passing activeLedger!
    const controllerResponse = processSearchRequest(
      activeLedger,
      searchKey,
      targetValue,
      boundSearchFn
    );

    const duration = performance.now() - startTime;

    // Case 1: Precondition Fail-Safe Triggered!
    if (!controllerResponse.success) {
      dom.preconditionAlertText.textContent = controllerResponse.message;
      dom.preconditionAlert.classList.remove('hidden');

      dom.kpiComparisons.textContent = 0;
      dom.kpiRecursionDepth.textContent = 0;
      dom.kpiExecutionTime.textContent = `${duration.toFixed(2)} ms`;
      dom.kpiAlgorithmTag.textContent = 'Blocked by Precondition';
      return;
    }

    // Precondition Passed
    dom.preconditionAlert.classList.add('hidden');

    // Update Top KPI Cards
    dom.kpiComparisons.textContent = searchTracker.comparisons;
    dom.kpiRecursionDepth.textContent = 0;
    dom.kpiExecutionTime.textContent = `${duration.toFixed(2)} ms`;
    dom.kpiAlgorithmTag.textContent = `Binary Search on '${searchKey}'`;

    if (!controllerResponse.found) {
      // Case 2: Not Found
      matchedTxnIds.clear();
      filteredTransactions = [];

      dom.searchStatusBar.classList.remove('hidden');
      dom.searchStatusText.textContent = `No records matching ${searchKey}: "${rawInput}" (${searchTracker.comparisons} comparisons)`;
      dom.searchStatusText.className = 'text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200';

      renderDashboard(false, false);
    } else {
      // Case 3: Match Found!
      const matches = controllerResponse.data;
      matchedTxnIds = new Set(matches.map(m => m.transactionId));
      filteredTransactions = matches;

      dom.searchStatusBar.classList.remove('hidden');
      dom.searchStatusText.textContent = `Found ${matches.length} matching record${matches.length === 1 ? '' : 's'} in ${searchTracker.comparisons} comparisons (${duration.toFixed(2)} ms)`;
      dom.searchStatusText.className = 'text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100';

      renderDashboard(false, true);
    }
  } catch (error) {
    console.error('[CampusPay Search Error]:', error);
    alert(`[Search Error]: ${error.message}`);
  }
}

/**
 * One-click helper when Precondition fails: Sorts dataset and retries search immediately
 */
function handleSortAndSearch() {
  const searchKey = dom.searchKeySelect.value;
  dom.sortKeySelect.value = searchKey;
  dom.sortOrderSelect.value = 'asc';
  
  handleRunSort();
  handleRunSearch();
}

// -------------------------------------------------------------
// EVENT HANDLERS: ADD TRANSACTION (STRICT TYPE CASTING)
// -------------------------------------------------------------
function handleAddTransaction(e) {
  e.preventDefault();

  try {
    const txnId = dom.txnIdInput.value.trim();
    const customerId = dom.customerIdInput.value.trim().toUpperCase();
    const date = dom.dateInput.value.trim();
    const type = dom.typeInput.value;
    let rawAmt = dom.amountInput.value.trim();
    const desc = dom.descInput.value.trim() || 'Campus Transaction';

    if (!txnId || !customerId || !date || !rawAmt) {
      showFormFeedback('Please fill out all required fields.', 'error');
      return;
    }

    // Strip currency symbols (₹, $, commas, whitespace) to prevent compareRecords crash
    rawAmt = rawAmt.replace(/[₹$,\s]/g, '');
    const amount = Number(parseFloat(rawAmt).toFixed(2));
    if (isNaN(amount) || amount <= 0) {
      showFormFeedback('Amount must be a positive number greater than zero.', 'error');
      return;
    }

    // Duplicate check in activeLedger
    if (activeLedger.some(t => t.transactionId === txnId)) {
      showFormFeedback(`Reference ${txnId} already exists in ledger.`, 'error');
      return;
    }

    const newRecord = {
      transactionId: txnId,
      customerId: customerId,
      date: date,
      type: type,
      amount: Number(amount), // Strictly cast to Number primitive
      description: desc
    };

    activeLedger.push(newRecord);
    try {
      transactions.push(newRecord);
    } catch (_) {}

    // Clear inputs
    dom.txnIdInput.value = '';
    dom.customerIdInput.value = '';
    dom.amountInput.value = '';
    dom.descInput.value = '';

    showFormFeedback(`Added Ref ${txnId} successfully.`, 'success');

    // Reset filter & sort state
    filteredTransactions = null;
    matchedTxnIds.clear();
    lastSortInfo.key = null;
    dom.searchStatusBar.classList.add('hidden');

    renderDashboard();
  } catch (err) {
    console.error('[Add Transaction Error]:', err);
    alert(`[Add Transaction Error]: ${err.message}`);
  }
}

function showFormFeedback(msg, type) {
  dom.formFeedback.textContent = msg;
  dom.formFeedback.className = type === 'success' 
    ? 'text-xs text-emerald-600 font-medium truncate max-w-[200px]' 
    : 'text-xs text-rose-600 font-medium truncate max-w-[200px]';

  setTimeout(() => {
    dom.formFeedback.textContent = '';
  }, 4000);
}

// -------------------------------------------------------------
// AUTO-FILL SAMPLE & RESET
// -------------------------------------------------------------
const samplePool = [
  { desc: "Canteen UPI - Masala Dosa & Chai", type: "Debit", amt: 90.00, cust: "CUST502" },
  { desc: "VEGA Hackathon Swag & Kit", type: "Debit", amt: 600.00, cust: "CUST114" },
  { desc: "Campus Bookstore - Cormen AOA Textbook", type: "Debit", amt: 850.00, cust: "CUST201" },
  { desc: "IEEE Paper Publication Grant", type: "Credit", amt: 8000.00, cust: "CUST502" },
  { desc: "Seminar Hall Booking Deposit", type: "Debit", amt: 2500.00, cust: "CUST888" },
  { desc: "Sports Council Volleyball Kit", type: "Debit", amt: 450.00, cust: "CUST305" }
];

function handleAutoFill() {
  const sample = samplePool[Math.floor(Math.random() * samplePool.length)];
  const ref = '409' + Math.floor(100000000 + Math.random() * 900000000);

  dom.txnIdInput.value = ref;
  dom.customerIdInput.value = sample.cust;
  dom.dateInput.value = new Date().toISOString().split('T')[0];
  dom.typeInput.value = sample.type;
  dom.amountInput.value = sample.amt.toFixed(2);
  dom.descInput.value = sample.desc;

  showFormFeedback('Sample data populated', 'success');
}

function handleResetLedger() {
  activeLedger = JSON.parse(JSON.stringify(baselineSnapshot));
  try {
    transactions.splice(0, transactions.length, ...JSON.parse(JSON.stringify(baselineSnapshot)));
  } catch (_) {}

  filteredTransactions = null;
  matchedTxnIds.clear();
  lastSortInfo = { key: null, algorithm: null, order: 'asc' };
  dom.searchStatusBar.classList.add('hidden');

  dom.kpiComparisons.textContent = 0;
  dom.kpiRecursionDepth.textContent = 0;
  dom.kpiExecutionTime.textContent = '0.00 ms';
  dom.kpiAlgorithmTag.textContent = 'Baseline Reset';

  renderDashboard(true, false);
}

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------
function init() {
  // Set default date
  if (!dom.dateInput.value) {
    dom.dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Add Form Listeners
  dom.form.addEventListener('submit', handleAddTransaction);
  dom.btnAutofill.addEventListener('click', handleAutoFill);

  // Sort Listeners
  dom.btnRunSort.addEventListener('click', handleRunSort);

  // Search Listeners
  dom.btnRunSearch.addEventListener('click', handleRunSearch);
  dom.searchTargetInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRunSearch();
    }
  });

  dom.searchKeySelect.addEventListener('change', () => {
    const key = dom.searchKeySelect.value;
    if (key === 'amount') {
      dom.searchTargetInput.placeholder = 'e.g. 12000.00';
    } else if (key === 'transactionId') {
      dom.searchTargetInput.placeholder = 'e.g. 408192837401';
    } else if (key === 'customerId') {
      dom.searchTargetInput.placeholder = 'e.g. CUST502';
    } else if (key === 'date') {
      dom.searchTargetInput.placeholder = 'e.g. 2024-03-01';
    }
    updatePreconditionStatus();
  });

  dom.btnSortAndSearch.addEventListener('click', handleSortAndSearch);

  // Filter Clear & Reset
  dom.btnClearSearch.addEventListener('click', () => {
    filteredTransactions = null;
    matchedTxnIds.clear();
    dom.searchStatusBar.classList.add('hidden');
    renderDashboard();
  });

  dom.btnResetLedger.addEventListener('click', handleResetLedger);

  // Table Row Deletion Event Delegation
  dom.ledgerTbody.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.btn-del');
    if (delBtn) {
      const id = delBtn.getAttribute('data-del-id');
      if (id) {
        activeLedger = activeLedger.filter(t => t.transactionId !== id);
        try {
          const idx = transactions.findIndex(t => t.transactionId === id);
          if (idx !== -1) transactions.splice(idx, 1);
        } catch (_) {}

        if (filteredTransactions) {
          filteredTransactions = filteredTransactions.filter(t => t.transactionId !== id);
        }
        matchedTxnIds.delete(id);
        renderDashboard();
      }
    }
  });

  // Initial render
  renderDashboard();
  console.log('CampusPay FinTech UI successfully initialized with activeLedger architecture.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
