function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart){
    localStorage.setItem('cart', JSON.stringify(cart));
}

function renderCartItems() {
    const cart = getCart();
    const container = document.querySelector('.cart-items');
    container.innerHTML = '';
    
    const checkoutContainer = document.querySelector('.checkout-container');
    checkoutContainer.innerHTML = '';
    
    if(cart.length === 0) {
        const div = document.createElement('div');
        div.classList.add('no-items');

        div.innerHTML = `
            <div class='message'>
                <h4>You have nothing in your shopping cart!</h4>
                <a href='./index.html' class="continue-shopping">Continue Shopping</a>
            </div>
        `
        container.appendChild(div);
        return;
    }

    let subtotal = 0;

    cart.forEach (item => {
        const div = document.createElement('div');

        let width;
        let height;
        let price;

        if(item.type === 'watercolor'){
            width = item.dimensions.width;
            height = item.dimensions.height;
            price = item.price;
        } else {
            width = item.selectedSize.width;
            height = item.selectedSize.height;
            price = item.selectedSize.price;
        }

        div.classList.add('item');
        div.innerHTML = `
        <div class='item-container'>
            <div class='item-title'>
                <span class='image-holder'><img src=${item.image.url}></span>
                <div class='item-info'>
                    <h2>${item.name}</h2>
                    <h4>${width}x${height}</h4>
                </div>
            </div>
            <div class='quantity-container'>
                <div class="quantity">
                    <span class='remove-button'><button class='remove'>&minus;</button></span>
                    <span class='quantity-number'>${item.quantity}</span>
                    <span class='add-button'><button class='plus'>&plus;</button></span>
                </div>
                
                <div class='price'>
                    <h2>$${price * item.quantity}.00</h2>
                    <span class='delete'><button class='delete-btn'>&times;</button></span> 
                </div>
            </div>
            </div>
        </div>    
        <div class='divider'>
        
        </div>
        `
        
        subtotal += price * item.quantity;
        container.appendChild(div);
        
        const minusButton = div.querySelector('.remove');
        const addButton = div.querySelector('.plus');
        
        addButton.addEventListener('click', function(){
            const product = item;
            updateCart(product, 1);
            renderCartItems();
        });

        if (item.type === 'watercolor'){
            addButton.classList.add('inactive');
        }

        if (item.quantity === 1){
            minusButton.classList.add('inactive');
        }

        minusButton.addEventListener('click', function(){
            const product = item;
            updateCart(product, -1);
            renderCartItems();
        });
        
        const deleteButton = div.querySelector('.delete-btn');

        deleteButton.addEventListener('click', function() {
            const product = item._id;
            removeFromCart(product);
            renderCartItems();
        })

    })

    const checkoutDiv = document.createElement('div');
    checkoutDiv.classList.add('checkout');

    checkoutDiv.innerHTML = `
    <div class='subtotal-container'>
        <span class='subtotal'><h2>Subtotal: </h2></span>
        <span class='subtotal-amount'><h2> $${subtotal.toFixed(2)}</h2></span>
    </div>
    <span class='checkout-button'><button class='checkout-btn'>Checkout</button></span>
    `

    checkoutContainer.appendChild(checkoutDiv);

    document.querySelector('.checkout-btn').addEventListener('click', async () => {
        const checkoutBtn = document.querySelector('.checkout-btn');
        const cart = getCart();

        if(!cart || cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Loading...'

        try{
            const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ cart }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Error starting checkout. Please try again');
            }
        } catch(err) {
            console.error('Checkout error:', err);
            alert('Network error. Please check your connection and try again.');
        }

        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Checkout';
    });
}


function updateCart(product, step) {
    const cart = getCart();
    
    const selectedProduct = cart.find(item =>
    item._id === product._id &&
    item.selectedSize.height === product.selectedSize.height &&
    item.selectedSize.width === product.selectedSize.width
    );
    selectedProduct.quantity += step;

    if (selectedProduct.quantity <= 0) {
        const index = cart.findIndex(item => item._id === product._id);
        cart.splice(index, 1);
    }

    saveCart(cart)
}

function removeFromCart(product) {
    const cart = getCart();

    const selectedProduct = cart.findIndex(item => item._id === product);
    cart.splice(selectedProduct, 1);

    saveCart(cart);
}


