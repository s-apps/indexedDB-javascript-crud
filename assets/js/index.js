    const formProduct = document.getElementById('form-product');
    const formSearch = document.getElementById('search');
    const query = document.getElementById('query');
    const checkboxAll = document.getElementById('checkboxAll');
    const checkboxProducts = document.getElementsByName('products[]');
    const mensagens = new bootstrap.Toast('#mensagens');
    let totalOfSelectedProducts = 0;
    let action = document.getElementById('action');

    const fields = {
        amount: document.querySelector('#amount'),
        description: document.querySelector('#description'),
        price: document.querySelector('#price'),
        product_id: document.querySelector('#product_id')
    }; 
    
    const buttons = {
        create: document.querySelector('#create'),
        update: document.querySelector('#update'),
        delete: document.querySelector('#delete'),
        save: document.querySelector('#save'),
        cancel: document.querySelector('#cancel')
    };
    
    buttons.create.onclick = () => {
        action.value = 'create';
        clearFields();
        clearAndDisableCheckboxes();
        changeButtonsState();
    };

    buttons.update.onclick = () => {
        action.value = 'update';
        fields.amount.focus();
        fillFormProduct();
        clearAndDisableCheckboxes();
        changeButtonsState();
    };
    
    buttons.delete.onclick = () => {
        action.value = 'delete';
        deleteProducts();
        enableCheckboxes();
        clearTable();
        readProducts();
        changeButtonsDefaultState();
    };

    buttons.cancel.onclick = () => {
        action.value = 'read';
        clearFields();
        enableCheckboxes();
        changeButtonsDefaultState();
    };

    formProduct.onsubmit = (e) => {
        e.preventDefault();
        const product_id = fields.product_id.value;
        const product = {
            amount: fields.amount.value,
            description: fields.description.value,
            price: fields.price.value
        }
        if (isValid(product)) {
            action.value === 'create' ? createProduct(product) : updateProduct(product_id, product);
            clearFields();
            clearTable();
            readProducts();
            enableCheckboxes();
            changeButtonsDefaultState();
            action.value = 'read';
        }
    }

    formSearch.onsubmit = (e) => {
        e.preventDefault();
        searchProduct(this.query.value);
    }

    query.onkeyup = (e) => {
        if (e.target.value === '') {
            clearFields();
            clearTable();
            readProducts();
            enableCheckboxes();
            changeButtonsDefaultState();
        }
    }

    checkboxAll.onchange = (e) => {
        for (let checkboxProduct of checkboxProducts){
            checkboxProduct.checked = e.target.checked;
        } 
        changeButtonsState();
    };
    
    fields.amount.onkeyup = () => {
        checkIsNaN(this.amount);
    };

    fields.price.onkeyup = () => {
        checkIsNaN(this.price);
    }

    function checkIsNaN(field) {
        if (isNaN(field.value)) {
            let replacedValue = field.value.replace(/[^0-9\.]/g, '');
            field.value = replacedValue;
        }
    }

    function isValid(product) {
        let result = [];
        for (const [property] of Object.entries(product)) {
            if (product[property] === '') {
                const element = document.getElementById(property);
                element.classList.add('is-invalid');
                result.push(null);
            } else {
                result.push(product[property]);
            }
        }
        return result.every(value => value != null);
    }

    function clearFields() {
        const productsInputs = document.querySelectorAll('#amount, #description, #price');
        for (let productInput of productsInputs) {
            if (productInput.classList.contains('is-invalid'))
                productInput.classList.remove('is-invalid');
        }
        formProduct.reset();
        fields.amount.value = '';
        fields.description.value = '';
        fields.price.value = '';
        fields.product_id.value = 0;
        fields.amount.focus();
    }

    function clearTable(){
        document.querySelectorAll('table tbody tr').forEach(e => e.remove());
    }

    function clearAndDisableCheckboxes(){
        document.querySelectorAll('input[type=checkbox').forEach(e => { e.checked = false; e.disabled = true; });
    }

    function enableCheckboxes(){
        document.querySelectorAll('input[type=checkbox').forEach(e => { e.checked = false; e.disabled = false; });
    }

    function addToTable() {
        const tbody = document.querySelector('table tbody');
        for (i = 0; i < productsList.length; i++) {
            const tr = document.createElement('tr');
            for (j = 0; j < 5; j++) {
                const td = document.createElement('td');
                switch(j) {
                    case 0:
                        td.classList.add('text-center');
                        td.classList.add('align-middle');
                        td.innerHTML = `<input class="form-check-input" type="checkbox" name="products[]" value="${productsList[i].product_id}" id="checkbox_${productsList[i].product_id}" onchange="checkboxProductOnChange()">`;
                    break;
                    case 1:
                        td.classList.add('align-middle');
                        td.textContent = productsList[i].product_id;
                    break;
                    case 2:
                        td.classList.add('align-middle');
                        td.textContent = productsList[i].amount;
                    break;
                    case 3:
                        td.classList.add('align-middle');
                        td.textContent = productsList[i].description;
                    break;
                    case 4:
                        td.classList.add('align-middle');
                        td.classList.add('text-end');
                        td.textContent = productsList[i].price;
                    break;                        
                }
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
    }

    function checkboxProductOnChange(){
        const totalOfCheckedProducts = getTotalOfCheckedProducts();
        if (totalOfCheckedProducts !== productsList.length) {
            checkboxAll.checked = false;
        } else {
            checkboxAll.checked = true;
        }
        changeButtonsState();
    }

    function getTotalOfCheckedProducts(){
        total = 0;
        for (let checkboxProduct of checkboxProducts){
            if (checkboxProduct.checked) {
                total++;
            }
        } 
        return total;
    }

    function changeButtonsState(){
        if (action.value === 'read') {
            const totalOfCheckedProducts = getTotalOfCheckedProducts();
            if (totalOfCheckedProducts === 0) {
                buttons.update.disabled = true;
                buttons.delete.disabled = true;
            } else if (totalOfCheckedProducts === 1) {
                buttons.update.disabled = false;
                buttons.delete.disabled = false;
            } else {
                buttons.update.disabled = true;
                buttons.delete.disabled = false;
            }
        } else {
            buttons.create.disabled = true;
            buttons.update.disabled = true;
            buttons.delete.disabled = true;
            buttons.save.disabled = false;
            buttons.cancel.disabled = false;
        }
    }

    function changeButtonsDefaultState(){
        buttons.create.disabled = false;
        buttons.update.disabled = true;
        buttons.delete.disabled = true;
        buttons.save.disabled = true;
        buttons.cancel.disabled = true;
    }

    function fillFormProduct(){
        const index = checkboxAll.checked ? 1 : 0;
        const product_id = +document.querySelectorAll('input[type=checkbox]:checked')[index].value;
        const product = productsList.filter((product) => product.product_id === product_id);
        fields.amount.value = product[0].amount;
        fields.description.value = product[0].description;
        fields.price.value = product[0].price;
        fields.product_id.value = product[0].product_id;
    }

