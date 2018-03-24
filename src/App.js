import React, { Component } from 'react';
// import io from 'socket.io-client';
// import axios from 'axios';
import './App.css';

import StockChart from './components/StockChart.js';
import TickerColumn from './components/TickerColumn.js';
import Statistics from './components/Statistics.js';

const chart = require('./chart/c3-chart.js');
const service = require('./services/dataService.js');
const Materialize = require('materialize-css');

class App extends Component {
   constructor(props) {
      super(props);
      this.state = {
         disabled: false
      }
      this.addStock = this.addStock.bind(this);
   }

   addStock(symbol) {
      const valid = service.validate(symbol, this.props.tickers);

      // prevents double-clicking / spamming
      if (valid) {
         this.props.isLoading(true);
         this.setState({ disabled: true });
         setTimeout(() => {
            this.setState({ disabled: false });
         }, 1500);

         service.add(symbol, this.props.tickers, this.props.dateRange).then(data => {
            chart.draw(data, symbol, this.props.dateRange);

            this.props.isLoading(false);
            this.props.update({ stockPlotData: data, activeSymbol: symbol });
         }).then(() => {
            service.getStockSnapshot(symbol).then(stockSnapshot => {
               this.props.update({
                  'stockSnapshot': stockSnapshot.data.price,
                  'stockSummary': stockSnapshot.data.summaryProfile,
               });
            })
         }).catch(err => {
            console.warn(err.message);
            this.props.isLoading(false);
            Materialize.toast(err.message, 3000);
         })
      }
   }

   render() {
      const state = this.props.appState;
      const tickers = this.props.tickers;
      return (
         <div className="App">
            <div className="flex-container">
               <StockChart
                  appState={state}
                  tickers={tickers}
                  summary={this.props.summary}
                  snapshot={this.props.snapshot}
                  isLoading={this.props.isLoading}
                  dateRange={state.dateRange}
                  addStock={this.addStock}
                  update={this.props.update}
                  active={state.activeSymbol}
               />
               <TickerColumn
                  tickers={tickers}
                  appState={state}
                  addStock={this.addStock}
                  snapshot={this.props.snapshot}
                  isLoading={this.props.isLoading}
                  dateRange={state.dateRange}
                  update={this.props.update}
                  active={state.activeSymbol}
               />
               <Statistics
                  summary={this.props.summary}
                  snapshot={this.props.snapshot}
               />
            </div>
         </div>
      );
   }
}
export default App;