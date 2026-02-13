document.addEventListener("DOMContentLoaded", () => {
  // Read users list from localStorage
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Flatten all orders across users
  const allOrders = users.flatMap(user => user.orders.map(order => ({
    ...order,
    customerName: user.name // assume each user has a "name" property
  })));

  renderOrders(allOrders);
});

function renderOrders(orders) {
  const main = document.querySelector(".main-content");

  // Create table
  const table = document.createElement("table");
  table.className = "orders-table";

  // Header
  table.innerHTML = `
    <thead>
      <tr>
        <th>Order ID</th>
        <th>Date</th>
        <th>Payment Method</th>
        <th>Customer Name</th>
        <th>Status</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  // Rows
  orders.forEach(order => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.productName}</td>
      <td>#${order.id}</td>
      <td>${order.createdDate}</td>
      <td>${order.paymentMethod}</td>
      <td>${order.customerName}</td>
      <td><span class="status ${order.status.toLowerCase()}">${order.status}</span></td>
      <td>$${order.amount.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });

  main.innerHTML = ""; // clear placeholder
  main.appendChild(table);
}