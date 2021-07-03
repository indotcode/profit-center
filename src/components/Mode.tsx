import React from 'react';

interface StateType {
  startActive: boolean,
  preloaders: boolean,
  statistic: any,
  timeStart:number
}

type ObjInd = {
  id: number,
  value: number
}

type ModaType = {
  value: number,
  n: number
}

let data: any = [];

class Mode extends React.Component<{}, StateType, any>{

  state = {
    startActive: false,
    preloaders: false,
    statistic: [],
    timeStart: 0
  }

  onStart = () => () => {
    this.setState({ preloaders: true }, () => {
      let ws = new WebSocket('wss://trade.trademux.net:8800/?password=1234');
      ws.onmessage = (event: any) => {
        const message = JSON.parse(event.data);
        data = data.concat(message);
        this.setState({ startActive: true, preloaders: false,  timeStart: new Date().getTime()});
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

  averageDeviation(result:any){
    let summa: number = 0;
    result.forEach((item: any, i: number) => {
      summa += item.value
    })
    return Math.floor(summa / result.length);
  }

  time(){
    let end = new Date();
    // let elapsed = Number(end.getTime()) - this.state.timeStart;
    // let time = new Date(elapsed * 1000);
    return end.getTime();
    // let start = result[0].id;
    // let end = result.pop().id;
    // let time = end - start;
    // let date = new Date(+time);
    // return date.getMonth() + '.' + date.getMinutes() + ':' + date.getSeconds();
  }
  


  onStatistic = () => () => {
    const result = data;
    let params: any = {};
    let summa: number = 0;
    result.forEach((item: any, i: number) => {
      summa += item.value
    })
    params.averageDeviation = this.averageDeviation(result);
    params.moda = this.moda(result);
    params.time = this.time();
    this.setState({ statistic: this.state.statistic.concat(params) })
  }

  shouldComponentUpdate(nextProps:any, nextState:any) {
    if(nextState.statistic !== this.state.statistic){
      return true; 
    }
    if(nextState.preloaders !== this.state.preloaders){
      return true; 
    }
    if(nextState.startActive !== this.state.startActive){
      return true; 
    }
    return false;        
  }

  render() {
    let startActiveClass = 'btn mb10';
    let startActiveName = 'Старт';
    if (this.state.startActive) {
      startActiveClass = 'btn btn_green mb10';
      startActiveName = 'Соединение установлено...'
    }
    return (
      <div>
        {this.state.preloaders &&
          <div className="preloaders"></div>
        }
        <div className="nav">
          <div className={startActiveClass} onClick={this.onStart()}>{startActiveName}</div>
          <br />
          {this.state.startActive &&
            <>
              <div className="btn mr10" onClick={this.onStatistic()}>Статистика</div>
            </>
          }
        </div>
        <div className="statistic">
          {this.state.statistic.map((item: any, i) => (
            <div className="statistic__item" key={i}>
              <div>Cтандартное отклонение: {item.averageDeviation}</div>
              <div>Мода: {item.moda.value}, {item.moda.n}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default Mode;