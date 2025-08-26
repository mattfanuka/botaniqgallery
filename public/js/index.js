const PROJECT_ID = 'glr4p8e1';
const DATASET = 'production';
const API_VERSION = '2025-08-19';

const BASE_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`

async function getPaintingData() {
const query = `{
  "watercolors": *[_type == "watercolorPainting"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    dimensions,
    price,
    description,
    "image": {
      "url": image.asset->url,
      "alt": image.alt,
      "hotspot": image.hotspot
    },
    available,
    featured,
    "type": "watercolor"
  },
  "prints": *[_type == "digitalPrint"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    sizes[] {
      width,
      height,
      price
    },
    description,
    "image": {
      "url": image.asset->url,
      "alt": image.alt,
      "hotspot": image.hotspot
    },
    available,
    featured,
    "type": "print"
  }
}`;
    const URL = `${BASE_URL}?query=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(URL);
        const data = await response.json();
        console.log(data.result);
        return(data.result);
    } catch(err) {
        console.error('Error fetching paintings:', err);
    }
}

async function renderProducts() {
    const watercolorContainer = document.querySelector('.watercolor-container');
    const digitalPrintContainer = document.querySelector('.digital-print-container');
    const products = await getPaintingData();

    products.watercolors.forEach(product => {
        const div = document.createElement('div');
        div.classList.add('product');
        div.innerHTML = `
        <div class='image-holder'>
            <img src=${product.image.url}>
        </div>
        <span class='top-row'>
            <h2>${product.name}</h2>

        </span>
        <span class='bottom-row'>
            <h2 class=price-span>$${product.price}.00</h2><button class="cart-add">Add to Cart</button>
        </span>
        `;
        watercolorContainer.appendChild(div);

        const topRow = div.querySelector('.top-row');

        const sizeSpan = document.createElement('span');
            sizeSpan.innerHTML = `<p class='dimensions'>${product.dimensions.width}x${product.dimensions.height}</p>`;
            topRow.appendChild(sizeSpan);
            div.querySelector('.price-span').innerText = `$${product.price}.00`

        const cartBtn = div.querySelector('.cart-add');

        cartBtn.addEventListener('click', () => {
            const cartItem = {
                ...product,
                quantity: 1
            };
            console.log(cartItem)
            addToCart(cartItem);
        })
            
    });

    products.prints.forEach(product => {
        const div = document.createElement('div');
        div.classList.add('product');
        div.innerHTML = `
        <div class='image-holder'>
            <img src=${product.image.url}>
        </div>
        <span class='top-row'>
            <h2>${product.name}</h2>

        </span>
        <span class='bottom-row'>
            <h2 class=price-span>$${product.price}.00</h2><button class="cart-add">Add to Cart</button>
        </span>
        `;
        digitalPrintContainer.appendChild(div);

        //Add to cart handler
        div.querySelector('.cart-add').addEventListener('click', () => {

            let selectedSize;

            if (product.sizes.length > 1) {
                const activeBtn = quantityDiv.querySelector('.option.active');
                selectedSize = {
                    height: activeBtn.dataset.height,
                    width: activeBtn.dataset.width,
                    price: activeBtn.dataset.price
                }
            }
            else {
                selectedSize = product.sizes[0];
            }

            const cartItem = {
                ...product,
                selectedSize,
                quantity: 1,
            }

            addToCart(cartItem);
            alert(`${product.name} added to cart!`);
        });

        const topRow = div.querySelector('.top-row');
        let quantityDiv = null;
        
        //Multiple size case handler
        if(product.sizes.length > 1){
            quantityDiv = document.createElement('div');
            quantityDiv.classList.add('segmented-control');
            
            product.sizes.forEach((size, index) => {
                const btn = document.createElement('button');
                btn.classList.add('option');
                if (index === 0) btn.classList.add('active');
                btn.textContent = `${size.width}x${size.height}`;
                btn.dataset.price = size.price;
                btn.dataset.width = size.width;
                btn.dataset.height = size.height;

                //Handling clicks
                btn.addEventListener('click', () => {
                    quantityDiv.querySelectorAll('.option').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    const priceSpan = div.querySelector('.price-span');
                    priceSpan.innerText = `$${btn.dataset.price}.00`
                });
                quantityDiv.appendChild(btn);
                
                //Set price to active on load
                div.querySelector('.price-span').innerHTML = `$${quantityDiv.querySelector('.active').dataset.price}.00`;
            });

            topRow.appendChild(quantityDiv);

        }
        else if (product.sizes.length === 1) {
            const sizeSpan = document.createElement('span');
            sizeSpan.innerHTML = `<p class='dimensions'>${product.sizes[0].width}x${product.sizes[0].height}</p>`;
            topRow.appendChild(sizeSpan);
            div.querySelector('.price-span').innerText = `$${product.sizes[0].price}.00`
        }

        
    });
    
    updateQuantity(getCart());
}


//Cart Functions
function getCart(){
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart){
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(cartItem) {
    let cart = getCart();
    //Check if it's a watercolor
    let isWaterColor = false;
    console.log(isWaterColor)
    if (cartItem.type === 'watercolor') isWaterColor = true;

    //If its a watercolor, see if there's one in the cart. If not, add it
    if (isWaterColor) {
        const isWaterColorInCart = cart.find(item => item.type === cartItem.type);
        if (isWaterColorInCart) {
            alert('Only one of each - every item is unique!');
            return;
        }
        else {
            cart.push(cartItem);
            alert(`${cartItem.name} added to cart!`)
            saveCart(cart);
            updateQuantity(cart);
            return;
        }
    }

    const existing = cart.find(item =>
    item._id === cartItem._id &&
    item.selectedSize.height === cartItem.selectedSize.height &&
    item.selectedSize.width === cartItem.selectedSize.width
    );

    if(existing) {
        existing.quantity += 1;
    } else {
        cart.push(cartItem);
    }

    saveCart(cart);
    updateQuantity(cart);
}

function updateQuantity(cart) {
    let quantity = 0;
    console.log(cart);

    for (let i = 0; i < cart.length; i++){
        quantity += cart[i].quantity;
    }

    const quantityElement = document.querySelector('.cart-quantity');
    quantityElement.innerText = quantity;
}