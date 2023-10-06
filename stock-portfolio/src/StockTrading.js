import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StockTrading.css';


function StockTrading() {
  const [stock, setStock] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [cashBalance, setCashBalance] = useState(
    JSON.parse(localStorage.getItem('cashBalance')) || 10000
  );
  const [cashInput, setCashInput] = useState(0);
  const [stocks, setStocks] = useState(
    JSON.parse(localStorage.getItem('stocks')) || []
  );
  const [totalNetAssetValue, setTotalNetAssetValue] = useState(0); 


  useEffect(() => {
    localStorage.setItem('cashBalance', JSON.stringify(cashBalance));
    localStorage.setItem('stocks', JSON.stringify(stocks));
    const totalValue = calculateTotalValue();
    setTotalNetAssetValue(totalValue)
  }, [cashBalance, stocks]);

  const fetchStockPrice = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/stock-price?symbol=${stock}`);
      const latestPrice = response.data.price;
      return latestPrice;
    } catch (error) {
      console.error(error);
      alert("API limit reached. Please try again later.")
    }
  };

  const handleBuy = async () => {
    const stockPrice = await fetchStockPrice(stock);
    const cost = stockPrice * quantity;
    if (stockPrice === undefined) {
        return;
    }

    const existingStockIndex = stocks.findIndex((s) => s.stock === stock);

    if (cashBalance >= cost) {
        if (existingStockIndex !== -1) {
            const updatedStocks = [...stocks];
            updatedStocks[existingStockIndex].quantity = Number(updatedStocks[existingStockIndex].quantity) + Number(quantity);
            updatedStocks[existingStockIndex].cost = Number(stockPrice) * Number(updatedStocks[existingStockIndex].quantity);
            setStocks(updatedStocks);
        } else {
            setStocks([...stocks, { stock, quantity, cost }]);
        }

      setCashBalance(cashBalance - cost);
    } else {
      alert('Insufficient funds');
    }
  };

  const handleSell = async (index) => {
    const soldStock = stocks[index];
    console.log(soldStock.stock);
    const stockPrice = await fetchStockPrice(soldStock.stock);

    if (stockPrice === undefined) {
        return;
    }
    const revenue = stockPrice * soldStock.quantity;

    setCashBalance(cashBalance + revenue);
    const updatedStocks = [...stocks];
    updatedStocks.splice(index, 1);
    setStocks(updatedStocks);
  };

  const handleDeposit = async () => {
    if (cashInput > 0) {
        setCashBalance(cashBalance + Number(cashInput));
    } else {
        alert('Please enter a positive amount. If you want to withdraw money, please use the "withdraw" button.');
    }
  };

  const handleWithdraw = async () => {
    if (cashInput > 0) {
        setCashBalance(cashBalance - Number(cashInput));
    } else {
        alert('Please enter a positive amount. If you want to deposit money, please use the "deposit" button.');
    }
  }

  const calculateTotalValue = () => {
    return stocks.reduce((total, stock) => total + stock.cost, 0);
  };

  return (
<div>
  <h2 className="h2">Cash Balance: ${cashBalance}</h2>
  <div>
    <input
      className="input-field"
      type="text"
      placeholder="Enter amount of money"
      onChange={(e) => setCashInput(e.target.value)}
    />
    <button className="button" onClick={handleDeposit}>
      Deposit
    </button>
    <button className="button" onClick={handleWithdraw}>
      Withdraw
    </button>
  </div>
  <div>
    <input
      className="input-field"
      type="text"
      placeholder="Enter stock symbol"
      onChange={(e) => setStock(e.target.value)}
    />
    <input
      className="input-field"
      type="number"
      placeholder="Enter quantity"
      onChange={(e) => setQuantity(e.target.value)}
    />
    <button className="button" onClick={handleBuy}>
      Buy
    </button>
  </div>
  <div>
    <h3>Portfolio</h3>
    <ul>
      {stocks.map((s, index) => (
        <li key={index}>
          {s.stock} - Quantity: {s.quantity} - Cost: ${s.cost}{' '}
          <button className="button" onClick={() => handleSell(index)}>
            Sell
          </button>
        </li>
      ))}
    </ul>
  </div>
  <div>
  <h3>Total Net Asset Value</h3>
  <p>${totalNetAssetValue}</p>
</div>
</div>
  );
}

export default StockTrading;