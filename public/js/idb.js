// create variable to hold db connection
let db;

const request = indexedDB.open('budget_tracker', 1);

// upgrade db if version changes 
request.onupgradeneeded = function(e) {
    const db = e.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// upon success
request.onsuccess = function(e) {
    db = e.target.result;

    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function(e) {
    console.log(e.target.errorCode);
};

// offline functionality
function saveRecord(record) {
    
    const transaction = db.transaction(['transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('transaction');

    transactionObjectStore.add(record);
}

function uploadTransaction() {
    const transaction = db.transaction(['transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('transaction');

    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['transaction'], 'readwrite');
                const transactionObjectStore = transaction.objectStore('transaction');
                transactionObjectStore.clear();

                alert('Transactions submitted');
            })
            .catch(err => console.log(err));
        }
    };
}

// upload data when back online
window.addEventListener('Online', uploadTransaction);