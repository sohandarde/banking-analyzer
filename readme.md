# Banking Transaction Analysis System

[![Live Demo](https://img.shields.io/badge/Live-Deployment-success?style=for-the-badge&logo=vercel)](https://campuspay-gamma.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/sohandarde/banking-analyzer)

## 📌 Project Overview
The **Banking Transaction Analysis System** is a client-side web application developed as an Analysis of Algorithms (AOA) mini-project focusing on the **Divide and Conquer** paradigm. Instead of relying on built-in array methods or databases, this project utilizes custom-built algorithms to process, sort, and search financial records efficiently. 

It acts as a dynamic financial ledger that not only organizes data but also provides real-time performance analytics (comparisons, swaps, and recursion depth) to demonstrate algorithmic scalability.

## 🚀 Key Features
* **Custom Sorting Engine:** Implements pure **Merge Sort** to organize records dynamically by Amount, Date, or Transaction ID.
* **Optimized Retrieval:** Uses **Binary Search** for efficient data retrieval, achieving $O(\log n)$ time complexity.
* **Precondition Enforcement (Fail-Safes):** Prevents binary search failures by strictly verifying that the dataset is sorted by the targeted key before execution.
* **Performance Analytics Dashboard:** Tracks and displays the exact number of algorithmic comparisons, array swaps, and maximum recursion depth in real-time.
* **Financial Reporting:** Automatically generates analytics, including highest/lowest transactions and customer-specific net balances.
* **Modern Web Interface:** A responsive financial dashboard UI ensuring clear data visualization.

## 🛠️ Tech Stack
* **Frontend UI:** HTML, JavaScript, Tailwind CSS 
* **Core Logic:** Vanilla JavaScript (ES6+ Modules)
* **Deployment:** Vercel

## 🧠 Algorithms & Methodology
This project heavily emphasizes mathematical algorithm analysis over standard web development frameworks:
1. **Merge Sort:** Divides the transaction array recursively into halves and merges them in sorted order. Time complexity is $O(n \log n)$.
2. **Binary Search:** Cuts the search space in half per iteration to locate specific records quickly. Incorporates range expansion to find duplicate values (e.g., multiple transactions of the same amount).
3. **Performance Tracker Class:** An internal metrics accumulator passed through recursive algorithm calls to capture execution statistics.

## 👥 Team & Roles
This project was built collaboratively by a team of three:
* **Sohan (Algorithm Engineer):** Authored the core Divide and Conquer algorithms (`mergeSort.js`, `binarySearch.js`) and the ADA tracking logic.
* **Tanmay (Systems Integrator & Logic):** Designed the data structures, state management (`dataStore.js`), analytics engine, and the `controller.js` fail-safe routing layer.
* **Rohan (Frontend & UI/UX Lead):** Developed the web interface, linked the DOM to the controller, and implemented the Tailwind CSS dashboard styling.

## 💻 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sohandarde/banking-analyzer.git
   ```
2. **Navigate into the directory:**
   ```bash
   cd banking-analyzer
   ```
3. **Launch the application:**
   * Since this is a client-side application, you can simply open the `index.html` file in any modern web browser. 
   * Alternatively, if using VS Code, use the **Live Server** extension to run it on a local port.

## 📊 Usage Guide
1. **Add Transactions:** Use the input form to populate the ledger with new records (Transaction ID, Customer ID, Date, Type, Amount).
2. **Sort Data:** Select a key (e.g., Amount) from the dropdown and click Sort. View the metrics modal to see how many recursive calls the Merge Sort took.
3. **Search Data:** Select a key and enter a value. *Note: The system will intentionally block your search if you haven't sorted by that specific key first.*
4. **View Reports:** Check the analytics section to see computed extremes and customer balances.