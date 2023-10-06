const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const port = process.env.PORT || "3000";
const ALPHA_VANTAGE_API_KEY = "FIJ0GUV2HZG5UGDF";

app.use(express.json())
app.use(express.static("public"));
app.use(cors());

app.get("/stock-price", async (req, res) => {
  const stockSymbol = req.query.symbol;
  try {
    const latestPrice = await fetchStockPrice(stockSymbol);
    res.json({ price: latestPrice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch stock price" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

async function fetchStockPrice(stockSymbol) {
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stockSymbol}&interval=5min&apikey=${ALPHA_VANTAGE_API_KEY}`,
    );
    const stockData = response.data["Time Series (5min)"];
    const latestPrice = stockData[Object.keys(stockData)[0]]["1. open"];

    return latestPrice;
  } catch (error) {
    throw new Error("Failed to fetch stock price");
  }
}
