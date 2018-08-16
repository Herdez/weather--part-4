import React, { Component } from 'react';
import './App.css';
import request from 'superagent';
import { PropagateLoader } from 'react-spinners';


class App extends Component {
  constructor(){
    super();

    this.state = {
      checked: false,
      show: false,
      city: {},
      country: '',
      loading: true,
      daily: '',
      week: [],
      cities: [{
        id: 1,
        name: 'France'
      },{
        id:2,
        name: 'Canada'
      }]
    }
  }

  componentDidMount() {
    setTimeout(() => this.setState({ loading: false }), 1500); // simulates an async action, and hides the spinner
  }  

  checkBtn = (e) => {
    e.preventDefault();
    this.setState({
      checked: true
    })
  }

  updateInput = (e) => {
    e.preventDefault();
    let value = this.refs.inputLocation.value;
    if (value !== '') {
      let newState = this.state;
      newState.city = {id: this.state.cities.length + 1, name: value.replace(value[0], value[0].toUpperCase())};
      this.setState(newState);
      newState.cities.push(newState.city);
      newState.checked = false;
      this.setState(newState);
    }
  }

  getDayOfWeek = (dayOfWeek) => {
    let now = new Date();
    let options = {  
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    return now.toLocaleString('en-us', options); 
  }

  getHour = (hour) => {
    let hours = hour.getHours();
    return hours + ':00';
  }

  weather = (location) => {
     const API_URL = `https://api.darksky.net/forecast/7b99d5e089197748e933189d8174655f/${location.lat},${location.lng}`;

     request
        .get(API_URL)
        .then(response => { 
          let dailyWeather = response.body.hourly.data;
          this.setState({
            week: []
          })
          dailyWeather.forEach(hour => {
            let dayOfWeek = new Date(hour.time * 1000);
            let today = new Date();
            if (dayOfWeek.getDay() == today.getDay()) {
              this.setState({
                daily: this.getDayOfWeek(dayOfWeek),
                loading: false,
                week: [ 
                  ...this.state.week,
                  {
                    hour: this.getHour(dayOfWeek),
                    summary: hour.summary, 
                    pressure: hour.pressure, 
                    temperature: hour.temperature, 
                    wind: hour.windSpeed
                  }
                ], 
              });
            }
          })
        });
  }  
  
  getWeather = (e) => {
    e.preventDefault();
    let country = e.target.innerText;
    const API_URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${country}`;
    this.setState({
      loading: true
    });

    request
      .get(API_URL)   
      .then(response => {
        let location = response.body.results[0].geometry.location;
        return location;
      })
      .then(this.weather)
      .catch(error => {
        this.setState({
          country: 'N/A Country',
          show: false,
          loading: false
        });
      });
    this.setState({
      show: true,
      country: country
    });
   }


  render() {
    let cities = this.state.cities;
    let hourly = this.state.week;

    return (
      <div className='app'>
        <header className='app__header'>
          <button className='app__add' onClick={ this.checkBtn }>
            <i className="fa fa-plus-circle"></i>
            New city
          </button>
       </header>
        <div className='grid'>
          <aside className='app__aside'> 
            <div className='loading'>
              <PropagateLoader
                sizeUnit={"px"}
                size={12}
                color={'#4b83fd'}
                loading={this.state.loading}
              />
            </div>      
            <h1 className='app__title'>All countries</h1>
            {cities.map((city, i) => {  
              return <a key={ i } href='#' onClick={ this.getWeather } className='app__country'>{ city.name }</a>
            })}
            { this.state.checked &&
              <form onSubmit={ this.updateInput }> 
                <input autoFocus type='text' ref="inputLocation" placeholder='Location' className='app__input' />
              </form>
            }
          </aside>
              <section className='app__view'>
                  <h3>{ this.state.show } {this.state.country }</h3>
                  { this.state.show &&    
                      <table className="tr-table tr-table-zebra">
                          <thead>
                          <tr>
                              <th>{this.state.daily.slice(11, 23)}</th>
                          </tr>
                          </thead>
                          <tbody>
                          {hourly.map((hour, i) => {
                            return <tr key={ i }>
                                     <td>{hour.hour}, {hour.temperature}F, {hour.summary}, {hour.wind}m/s, {hour.pressure}</td>
                                   </tr>
                          })}
                            </tbody>
                      </table>
                  }
              </section> 
        </div>
      </div>
    );
  }
}

export default App;
