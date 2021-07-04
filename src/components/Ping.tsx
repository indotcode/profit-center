import React from "react";

type StateType = {
  url: string,
  list: any
}

class Ping extends React.Component<{}, StateType> {
  state = {
    url: '',
    list: []
  }

  onUrl = () => (event: any) => {
    this.setState({ url: event.target.value })
  }

  onSendPing = () => (event: any) => {
    event.preventDefault();
    if (this.state.url === '') return false;

    this.ping(this.state.url).then(response => {
      let list = [{ url: this.state.url, status: response }].concat(this.state.list);
      this.setState({ list: list })
    })
  }

  async ping(url: string) {
    let urlRs: any = url.split('://');
    if (urlRs.length !== 2 && (urlRs[0] !== 'http' || urlRs[0] !== 'https')) {
      return 'Отказ';
    }
    const t0 = performance.now();
    try {
      await fetch(url, { mode: 'no-cors' });
    }
    catch (err) {
      return 'Отказ';
    }
    const t1 = performance.now();
    return ((t1 - t0) / 1000).toFixed(3) + ' секунд';
  }

  render() {
    return (
      <div>
        <h2>Пинг сервис</h2>
        <form className="form" onSubmit={this.onSendPing()}>
          <input type="text" onInput={(event: any) => this.setState({ url: event.target.value })} value={this.state.url} />
          <button type="submit">Пинг</button>
        </form>
        {this.state.list.length !== 0 &&
          <div className="mt10">
            <h4>Пинг лист</h4>
            {this.state.list.map((item: any, i) => (
              <div className="mt5 mb5" key={i}>
                <span>{item.url}</span>   
                <span className="ml10 mr10">|</span>  
                <span>{item.status}</span> 
              </div>
            ))}
          </div>
        }
      </div>
    )
  }
}

export default Ping;