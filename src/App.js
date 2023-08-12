import React, {useState} from 'react';
import {MapContainer, TileLayer, useMapEvents} from 'react-leaflet';
import axios from 'axios';
import './App.css';
import 'leaflet/dist/leaflet.css';

async function getCountryDetailsFromCoordinates(lat, lng) {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error getting country details from coordinates:', error);
    return null;
  }
}

function MapContainerComponent({onCountryClick}) {
  return (
    <MapContainer
      center={[0, 0]}
      zoom={2}
      style={{height: '100vh', width: '100%'}}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapEvents onCountryClick={onCountryClick} />
    </MapContainer>
  );
}

function MapEvents({onCountryClick}) {
  useMapEvents({
    click: async e => {
      const {lat, lng} = e.latlng;
      const countryDetails = await getCountryDetailsFromCoordinates(lat, lng);
      if (countryDetails) {
        const countryCode = countryDetails.address.country_code.toUpperCase();
        const response = await axios.get(
          `https://restcountries.com/v3.1/alpha/${countryCode}`,
        );
        const clickedCountry = response.data[0];
        console.log(clickedCountry);
        onCountryClick(clickedCountry);
        const currenciesContent = Object.entries(clickedCountry.currencies)
          .map(
            ([code, currency]) =>
              `${code}: ${currency.name} (${currency.symbol})`,
          )
          .join('<br>');

        // Construct the content for the popup
        const content = `
          <div>
          <p>Flag: ${clickedCountry.flag}</p>
          <p>Country: ${clickedCountry.name.common}</p>
            <p>Capital: ${
              clickedCountry.capital && clickedCountry.capital[0]
            }</p>
            <p>Language: ${getCountryLanguages(clickedCountry)}</p>
            <p>Timezones: ${
              clickedCountry.timezones && clickedCountry.timezones.join(', ')
            }</p>
            <p>Population: ${clickedCountry.population}</p>
            <p>Region: ${clickedCountry.region}</p>
            <p>Currencies: ${currenciesContent}</p>
            <p>Latitude: ${lat}, Longitude: ${lng}</p>
            <p>Area: ${clickedCountry.area} sq km</p>
          </div>
        `;

        // Open a popup with the country information
        const map = e.target;
        map.openPopup(content, [lat, lng]);
      }
    },
  });

  return null;
}

// ...

function getCountryLanguages(country) {
  if (country.languages) {
    return Object.values(country.languages).join(', ');
  }
  return 'N/A';
}

function getCountryCurrencies(country) {
  if (country.currencies) {
    return Object.values(country.currencies).join(', ');
  }
  return 'N/A';
}

function getCountryFlag(country) {
  // Implement the logic to fetch the country flag
  // You can use an emoji or an image URL based on your data source
  // For example, if country.code is the country code, you can fetch an emoji like this:
  // return `https://www.countryflags.io/${country.code}/flat/64.png`;

  // Placeholder: Return an emoji flag
  return '🇺🇳';
}

function CountryDetails({selectedCountry}) {
  if (!selectedCountry) {
    return <div>Select a country to view details.</div>;
  }

  const {capital, currencies} = selectedCountry;

  return (
    <div className="CountryDetails">
      <h2>Country Details</h2>
      <p>Capital: {capital && capital[0]}</p>
      <p>Currencies: {currencies && Object.values(currencies).join(', ')}</p>
    </div>
  );
}

function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleCountryClick = country => {
    setSelectedCountry(country);
  };

  return (
    <div className="App">
      <h1>World Map Application</h1>
      <MapContainerComponent onCountryClick={handleCountryClick} />
      <CountryDetails selectedCountry={selectedCountry} />
    </div>
  );
}

export default App;
