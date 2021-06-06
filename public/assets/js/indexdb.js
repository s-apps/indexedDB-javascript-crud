let db;
let productsList = [];

(() => {

   if (!('indexedDB') in window) {
       alert('Seu navegador não suporta indexedDB');
       return;
   } 

   const openRequest = window.indexedDB.open('silverioDB', 1);

   openRequest.onsuccess = e => {
        db = e.target.result;
        readProducts();
        addToTable();
   };

   openRequest.onerror = e => {
       alert('Ocorreu um erro: ' + e.target.errorCode);
   };

   openRequest.onupgradeneeded = e => {
       db = e.target.result;
       switch(db.version){
           case 1:
                const objectStore = db.createObjectStore('products', { keyPath: 'product_id', autoIncrement: true }); 
                objectStore.createIndex('amount', 'amount', { unique: false });
                objectStore.createIndex('description', 'description', { unique: true });
                objectStore.createIndex('price', 'price', { unique: false });
           break;    
       }
   };

})();

function createProduct(product){
    const objectStore = initTransaction();
    const createRequest = objectStore.add(product);

    createRequest.onsuccess = e => {
        alert('Produto adicionado com sucesso!');
    };

    createRequest.onerror = e => {
        if(e.target.error.name === 'ConstraintError') {
            alert('Produto já existe!');
        } else {
            alert('Erro: ' + e.target.error.name);
        }
    };
}

function readProducts(){
    productsList = [];
    const objectStore = initTransaction();
    const readRequest = objectStore.openCursor();

    readRequest.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
            productsList.push(cursor.value);
            cursor.continue();
        } else {
            addToTable();
        }
    };

    readRequest.onerror = e => {
        alert('Erro: ' + e.target.error);
    };
}

function updateProduct(product_id, product){
    const objectStore = initTransaction();
    const productRequest = objectStore.get(+product_id);

    productRequest.onsuccess = e => {
        const data = e.target.result;
        data.amount = product.amount;
        data.description = product.description;
        data.price = product.price;

        const updateRequest = objectStore.put(data);
        
        updateRequest.onsuccess = e => {
            alert('Produto atualizado com sucesso');
        };

        updateRequest.onerror = e => {
            alert('Erro: ' + e.target.error);
        };
    };

    productRequest.onerror = e => {
        alert('Erro: ' + e.target.error);
    };
}

function deleteProducts(){
    const transaction = db.transaction(['products'], 'readwrite');
    const objectStore = transaction.objectStore('products');

    let deleteRequest = null;

    for (let checkboxProduct of checkboxProducts) {
        if (checkboxProduct.checked) {
            deleteRequest = objectStore.delete(+checkboxProduct.value);
        }
    }

    transaction.oncomplete = e => {
        alert('Produto(s) excluído(s) com sucesso!');
    }
}

function searchProduct(product_id) {
    const objectStore = initTransaction();
    //const index = objectStore.index('description');
    //const searchRequest = index.get(query);
    const searchRequest = objectStore.get(+product_id)
    
    searchRequest.onsuccess = e => {
        if (e.target.result) {
            clearTable();
            productsList = productsList.filter((product) => product.product_id == product_id);
            addToTable();
        } else {
            alert('Nenhum produto encontrado!');
        }
    }

    searchRequest.onerror = e => {
        alert('Erro: ' + e.target.error);
    }
}

function initTransaction(){
    const transaction = db.transaction(['products'], 'readwrite');
    const objectStore = transaction.objectStore('products');
    return objectStore;
}

