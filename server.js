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

app.get("/store", (req, res) => {
  fs.readFile("items.json", (err, data) => {
    if (err) res.status(500).end();
    res.render("store.ejs", {
      stripePublicKey,
      items: JSON.parse(data),
    });
  });
});

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
