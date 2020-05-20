# Node-JS-Stripe-Payment-Gateway-EJS
A shopping cart is available. User can click the product and is added to cart. Stripe payment gateway is used with Node's view template engine
i.e. EJS and Node JS as the backend. All the payment transaction is available in Stripe dashboard.

## Project Overview

https://www.loom.com/share/c7713900e173487eb990de715cc2f11c

## Installation
1. Clone the repository 
2. npm install
3. Create .env file and your app credentials

```
STRIPE_SECRET_KEY=<your_stripe_secret_key>
STRIPE_PUBLIC_KEY=<your_stripe_publishable_key>
```
4. Open the project in terminal run ``` nodemon server.js ``` or ``` node server.js ```. 
3. Server starts in https://localhost:3000 port. In browser hit https://localhost:3000/ url

## Screenshots
<img src="https://user-images.githubusercontent.com/15896579/82437222-b1713a80-9ab4-11ea-889f-49af87609aa7.png" alt="Screenshot of Application" >
<img src="" alt="Screenshot of Application" >
<img src="https://user-images.githubusercontent.com/15896579/82437228-b33afe00-9ab4-11ea-8251-cef893f340a8.png" alt="Screenshot of Application" >
<img src="https://user-images.githubusercontent.com/15896579/82437230-b3d39480-9ab4-11ea-8484-bbf86b5107c1.png" alt="Screenshot of Application" >
<img src="https://user-images.githubusercontent.com/15896579/82437232-b3d39480-9ab4-11ea-818c-4c7faecb7574.png" alt="Screenshot of Application" >
<img src="https://user-images.githubusercontent.com/15896579/82437236-b46c2b00-9ab4-11ea-9819-eb8c84bc2ac4.png" alt="Screenshot of Application" >
<img src="https://user-images.githubusercontent.com/15896579/82437276-bcc46600-9ab4-11ea-8d08-6efbda408898.png" alt="Screenshot of Application" >


## Snippets

1. server.js (SERVER - Node JS)

```
const express = require("express");
const app = express();

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

const fs = require("fs");
const stripe = require("stripe")(stripeSecretKey);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

////////////////////
// VIEW EJS Files
////////////////////

app.get("/store", (req, res) => {
  fs.readFile("items.json", (err, data) => {
    if (err) res.status(500).end();
    res.render("store.ejs", {     // Passing data from server to store.ejs file
      stripePublicKey,
      items: JSON.parse(data),
    });
  });
});

/////////////////////////
// STRIPE PAYMENT ROUTE
/////////////////////////

app.post("/purchase", (req, res) => {
  fs.readFile("items.json", (err, data) => {
    if (err) res.status(500).end();
    const itemsJson = JSON.parse(data);
    const itemsArray = itemsJson.music.concat(itemsJson.merch);

    let total = 0;
    req.body.items.forEach((item) => {
      const itemJson = itemsArray.find((i) => {
        return i.id == item.id;
      });

      total = total + itemJson.price * item.quantity;
    });

    // Stripe Server side Payment handeling
    stripe.charges
      .create({
        amount: total,
        source: req.body.stripeTokenId,
        currency: "inr",
      })
      .then(() => {
        console.log("Charge successful");
        res.json({ message: "Successfully purchased items" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).end();
      });
  });
});

app.listen(3000);
console.log(`Listening in port 3000`);

```

2. views/store.ejs  (CLIENT - EJS) - Note when ever you want to pass some data from server to client that file move from public to view rest all are in sync

```
<script src="https://checkout.stripe.com/checkout.js" defer></script>
    <script>
      var stripePublicKey = "<%= stripePublicKey %>";
    </script>
    ...
    ...
    <% items.music.forEach(function(item){ %>
        <div class="shop-item" data-item-id="<%= item.id %>">
          <span class="shop-item-title"><%= item.name %></span>
          <img class="shop-item-image" src="Images/<%= item.imgName %>" />
          <div class="shop-item-details">
            <span class="shop-item-price"><%= item.price / 100 %> INR</span>
            <button class="btn btn-primary shop-item-button" type="button">
              ADD TO CART
            </button>
          </div>
        </div>
        <% }) %>
```

3. public/store.js  (CLIENT - JS file of EJS)

```
// Stripe Configuration Client Side - fired on payment click
var stripeHandler = StripeCheckout.configure({
  key: stripePublicKey,
  locale: "en",
  token: function (token) {
    var items = [];
    var cartItemContainer = document.getElementsByClassName("cart-items")[0];
    var cartRows = cartItemContainer.getElementsByClassName("cart-row");
    for (var i = 0; i < cartRows.length; i++) {
      var cartRow = cartRows[i];
      var quantityElement = cartRow.getElementsByClassName(
        "cart-quantity-input"
      )[0];
      var quantity = quantityElement.value;
      var id = cartRow.dataset.itemId;
      items.push({
        id: id,
        quantity: quantity,
      });
    }

    fetch("/purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        stripeTokenId: token.id,
        items: items,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        alert(res.message);
        var cartItems = document.getElementsByClassName("cart-items")[0];
        while (cartItems.hasChildNodes()) {
          cartItems.removeChild(cartItems.firstChild);
        }
        updateCartTotal();
      })
      .catch((err) => {
        console.error(err);
        alert("Some error in transaction. Please try again after some time");
      });
  },
});

function purchaseClicked() {
  var priceElement = document.getElementsByClassName("cart-total-price")[0];
  var price = parseFloat(priceElement.innerText.replace("$", "")) * 100;
  stripeHandler.open({
    amount: price,
  });
}
...
...
```
