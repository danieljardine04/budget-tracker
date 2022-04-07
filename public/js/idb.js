//create variable to hold db connection
let db;

const request = indexedDB.open('budget_hunt', 1);

request.onupgradeneeded = function(event){
  const db = event.target.result;
  db.createObjectStore('new_transactions', { autoIncrement: true});
}

request.onsuccess = function(event){
  db = event.target.result;

  if(navigator.onLine){
    updateTransactions()
    console.log("You made it online");
  }
}

request.onerror = function(event){
  console.log(event.target.errorCode);
}

function saveRecord(record) {
  const transaction = db.transaction(['new_transactions'], 'readwrite');

  const budgetObjectStore = transaction.objectStore('new_transactions');

  budgetObjectStore.add(record);
}

function updateTransactions(){
  const transaction = db.transaction(['new_transactions'], 'readwrite');

  const budgetObjectStore = transaction.objectStore('new_transactions');
  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function(){
    if(getAll.result.length > 0){
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(serverResponse => {
        if(serverResponse.message){
          throw new Error(serverResponse);
        }
        const transaction = db.transaction(['new_budget'], 'readwrite');
        const budgetObjectStore = transaction.objectStore('new_budget');
        budgetObjectStore.clear();

        alert('All transactions have been added');
      })
      .catch(err => {
        console.log(err);
      })
    }
  }
}

window.addEventListener('online', updateTransactions);