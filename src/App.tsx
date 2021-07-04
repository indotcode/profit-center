import './style/global.scss';
import React from 'react';
import Data from './components/Data';
import Ping from './components/Ping';

type StateType = {
  page:string
}

class App extends React.Component<{}, StateType>{
  state = {
    page: 'data'
  }

  onPage = (pageName:string) => () => {
    if(this.state.page !== pageName){
      this.setState({page: pageName})
    }
  }

  render(){
    return (
      <div className="page">
        <div className="page__menu">
          <h2>Меню</h2>
          <ul>
            <li onClick={this.onPage('data')}>Данные</li>
            <li onClick={this.onPage('ping')}>Пинг</li>
          </ul>
        </div>
        <div className='page__main'>
          {this.state.page === 'data' &&
            <Data/>
          }
          {this.state.page === 'ping' &&
            <Ping/>
          }
        </div>
      </div>
    )
  }
}

export default App;
