import React from 'react';
import { observer } from "mobx-react";
import store from "../store";

interface StateType {
  preloaders: boolean,
  statistic: any
}

type ObjInd = {
  id: number,
  value: number
}

type ModaType = {
  value: number,
  n: number
}

class Data extends React.Component<{}, StateType>{

  state = {
    preloaders: false,
    statistic: []
  }

  onStart = () => () => {
    if(store.data.length !== 0) return false;
    this.setState({ preloaders: true }, () => {
      let ws = new WebSocket('wss://trade.trademux.net:8800/?password=1234');
      ws.onmessage = (event: any) => {
        const message = JSON.parse(event.data);
        store.actionData(message);
        this.setState({preloaders: false});
      };
    })
  }

  moda(result: any): ModaType {
    let modaRd: any = [];
    result.forEach((item: any, i: number) => {
      modaRd[item.value] = modaRd[item.value] ? modaRd[item.value] + 1 : 1;
    })
    let moda: any = {
      value: 0,
      n: 0
    };
    modaRd.forEach((item: any, n: number) => {
      if (item > moda.n) {
        moda = {
          value: n,
          n: item
        }
      }
    })
    return moda;
  }

  averageDeviation(result:any):number{
    let summa: number = 0;
    result.forEach((item: ObjInd, i: number) => {
      summa += item.value
    })
    return Math.floor(summa / result.length);
  }

  standardDeviation(result:any, averageDeviation:number){
    let resultAr:any = [];
    let summa = 0;
    result.forEach((item:ObjInd, i:number) => {
      let s = item.value - averageDeviation
      let k = Math.pow(s, 2);
      summa += k;
      resultAr[i] = k;
    })
    let summaDl = summa / result.length;
    return Math.sqrt(summaDl);
  }

  time():string{
    let end = new Date();
    let elapsed = end.getTime() - store.timeStart;
    let time = new Date(+elapsed);
    let timeRes = String(time).split(' ');
    let day = Number(timeRes[2]) - 1;
    return timeRes[4] + (day !== 0 ? ', '+day+' д' : '')
  }
  
  median(result:any){
    result = result.map((item:ObjInd) => item.value);
    result.sort((a:number, b:number) => {
      if(a < b){
        return -1;
      }
      return 1;
    })
    let len = result.length;
    let centerLen = len / 2;
    let center:any = {};
    if(Number.isInteger(centerLen)){
      center = {
        a: result[centerLen + 1],
        b: result[centerLen + 2]
      }
    } else {
      center = {
        a: result[Math.floor(centerLen) + 1],
        b: result[Math.ceil(centerLen) + 2]
      }
    }
    return (center.a + center.b) / 2;
  }

  onStatistic = () => () => {
    const result:any = store.data;
    let params: any = {};
    const t0 = performance.now();
    params.x = result.pop().value;
    params.averageDeviation = this.averageDeviation(result);
    params.moda = this.moda(result);
    params.time = this.time();
    params.median = this.median(result);
    params.standardDeviation = this.standardDeviation(result, params.averageDeviation)
    const t1 = performance.now();
    params.timeScript = (t1 - t0).toFixed(0) + ' миллисекунд';
    this.setState({ statistic: [params].concat(this.state.statistic) })
  }

  componentDidUpdate(prevProps:any, prevState:StateType){
    if(store.data.length === 0){
      store.actionTimeStart();
    }
  }

  shouldComponentUpdate(nextProps:any, nextState:StateType) {
    if(nextState.statistic !== this.state.statistic){
      return true; 
    }
    if(nextState.preloaders !== this.state.preloaders){
      return true; 
    }
    return false;        
  }

  render() {
    let startActiveClass = 'btn mb10';
    let startActiveName = 'Старт';
    if (store.data.length !== 0) {
      startActiveClass = 'btn btn_green mb10';
      startActiveName = 'Соединение установлено...'
    }
    return (
      <div>
        <h2>Данные с Trademux</h2>
        {this.state.preloaders &&
          <div className="preloaders"></div>
        }
        <div className="mb10">
          {store.data.length === 0 &&
            <div className="btn mb10" onClick={this.onStart()}>Старт</div>
          }
          {store.data.length !== 0 &&
            <>
              <div className="mb15">Соединение установлено...</div>
              <div className="btn `mr10" onClick={this.onStatistic()}>Статистика</div>
            </>
          }
        </div>
        <div className="statistic">
          {this.state.statistic.map((item: any, i) => (
            <div className="statistic__item" key={i}>
              <div><b>Время:</b> {item.time}</div>
              <div><b>х:</b> {item.x}</div>
              <div><b>Среднее значения:</b> {item.averageDeviation}</div>
              <div><b>Стандартное отклонения:</b> {item.standardDeviation}</div>
              <div><b>Мода:</b> {item.moda.value}, {item.moda.n+' раз'}</div>
              <div><b>Медиана:</b> {item.median}</div>
              <div><b>Время расчетов:</b> {item.timeScript}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default Data;