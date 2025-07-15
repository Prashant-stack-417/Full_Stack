document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is admin
    checkAdminAuth();
    
    // Load products and orders
    loadProducts();
    loadOrders();
    
    // Event listeners
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('add-product-btn').addEventListener('click', showProductForm);
    document.getElementById('cancel-product-btn').addEventListener('click', hideProductForm);
    document.getElementById('product-details-form').addEventListener('submit', saveProduct);
});

// Authentication functions
async function checkAdminAuth() {
    try {
        const response = await fetch('/api/auth/check', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.user || !data.user.isAdmin) {
            // If not admin, redirect to login
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Authentication error:', error);
        window.location.href = 'login.html';
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Product management functions
async function loadProducts() {
    try {
        const response = await fetch('/api/products', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('admin-product-list').innerHTML = '<p>Error loading products. Please try again.</p>';
    }
}

function displayProducts(products) {
    const productListElement = document.getElementById('admin-product-list');
    
    if (products.length === 0) {
        productListElement.innerHTML = '<p>No products found.</p>';
        return;
    }
    
    let html = '<table class="admin-table">';
    html += '<thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Category</th><th>Stock</th><th>Actions</th></tr></thead>';
    html += '<tbody>';
    
    products.forEach(product => {
        html += `
            <tr>
                <td><img src="${product.image}" alt="${product.name}" class="admin-product-image"></td>
                <td>${product.name}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>${product.category}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="btn btn-small" onclick="editProduct('${product._id}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    productListElement.innerHTML = html;
}

function showProductForm() {
    document.getElementById('product-form').classList.remove('hidden');
    document.getElementById('add-product-btn').classList.add('hidden');
    // Clear form for new product
    document.getElementById('product-id').value = '';
    document.getElementById('product-details-form').reset();
}

function hideProductForm() {
    document.getElementById('product-form').classList.add('hidden');
    document.getElementById('add-product-btn').classList.remove('hidden');
}

async function saveProduct(event) {
    event.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const isNewProduct = !productId;
    
    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        image: document.getElementById('product-image').value,
        category: document.getElementById('product-category').value,
        stock: parseInt(document.getElementById('product-stock').value)
    };
    
    try {
        const url = isNewProduct ? '/api/products' : `/api/products/${productId}`;
        const method = isNewProduct ? 'POST' : 'PUT';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save product');
        }
        
        // Reload products and hide form
        loadProducts();
        hideProductForm();
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Failed to save product. Please try again.');
    }
}

async function editProduct(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch product details');
        }
        
        const product = await response.json();
        
        // Fill form with product details
        document.getElementById('product-id').value = product._id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-image').value = product.image;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-stock').value = product.stock;
        
        // Show form
        showProductForm();
    } catch (error) {
        console.error('Error fetching product details:', error);
        alert('Failed to load product details. Please try again.');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
        
        // Reload products
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
    }
}

// Order management functions
async function loadOrders() {
    try {
        const response = await fetch('/api/orders/all', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('admin-order-list').innerHTML = '<p>Error loading orders. Please try again.</p>';
    }
}

function displayOrders(orders) {
    const orderListElement = document.getElementById('admin-order-list');
    
    if (orders.length === 0) {
        orderListElement.innerHTML = '<p>No orders found.</p>';
        return;
    }
    
    let html = '<table class="admin-table">';
    html += '<thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>';
    html += '<tbody>';
    
    orders.forEach(order => {
        const date = new Date(order.createdAt).toLocaleDateString();
        const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
        
        html += `
            <tr>
                <td>${order._id}</td>
                <td>${order.user ? order.user.name : 'Unknown'}</td>
                <td>${date}</td>
                <td>${total}</td>
                <td>
                    <select class="status-select" data-order-id="${order._id}">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-small" onclick="viewOrderDetails('${order._id}')">View Details</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    orderListElement.innerHTML = html;
    
    // Add event listeners to status selects
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', function() {
            updateOrderStatus(this.dataset.orderId, this.value);
        });
    });
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update order status');
        }
        
        alert('Order status updated successfully');
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Failed to update order status. Please try again.');
        // Reload orders to reset the select
        loadOrders();
    }
}

function viewOrderDetails(orderId) {
    // Fetch the order details
    fetchOrderDetails(orderId);
}

async function fetchOrderDetails(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }
        
        const order = await response.json();
        showOrderDetailsModal(order);
    } catch (error) {
        console.error('Error fetching order details:', error);
        alert('Failed to load order details. Please try again.');
    }
}

function showOrderDetailsModal(order) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('order-details-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'order-details-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    // Format date
    const orderDate = new Date(order.createdAt).toLocaleString();
    
    // Calculate total
    const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    
    // Generate items HTML
    let itemsHtml = '';
    order.items.forEach(item => {
        itemsHtml += `
            <tr>
                <td>
                    <img src="${item.image}" alt="${item.name}" class="admin-product-image">
                </td>
                <td>${item.name}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `;
    });
    
    // Generate shipping address HTML
    const shippingAddress = order.shippingAddress || {};
    const addressHtml = `
        <p><strong>Name:</strong> ${shippingAddress.name || 'N/A'}</p>
        <p><strong>Address:</strong> ${shippingAddress.address || 'N/A'}</p>
        <p><strong>City:</strong> ${shippingAddress.city || 'N/A'}</p>
        <p><strong>State:</strong> ${shippingAddress.state || 'N/A'}</p>
        <p><strong>Zip Code:</strong> ${shippingAddress.zipCode || 'N/A'}</p>
        <p><strong>Country:</strong> ${shippingAddress.country || 'N/A'}</p>
    `;
    
    // Set modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Order Details</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="order-info">
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p><strong>Date:</strong> ${orderDate}</p>
                    <p><strong>Customer:</strong> ${order.user ? order.user.name : 'Unknown'}</p>
                    <p><strong>Email:</strong> ${order.user ? order.user.email : 'Unknown'}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${order.status}">${order.status}</span></p>
                </div>
                
                <h3>Items</h3>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="4" class="text-right"><strong>Total:</strong></td>
                            <td>${total}</td>
                        </tr>
                    </tfoot>
                </table>
                
                <div class="order-sections">
                    <div class="order-section">
                        <h3>Shipping Address</h3>
                        <div class="address-info">
                            ${addressHtml}
                        </div>
                    </div>
                    
                    <div class="order-section">
                        <h3>Payment Information</h3>
                        <p><strong>Payment Method:</strong> ${order.paymentMethod || 'N/A'}</p>
                        <p><strong>Payment Status:</strong> ${order.paymentStatus || 'N/A'}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary close-modal-btn">Close</button>
            </div>
        </div>
    `;
    
    // Show modal
    modal.style.display = 'block';
    
    // Add event listeners to close modal
    const closeButtons = modal.querySelectorAll('.close-modal, .close-modal-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}