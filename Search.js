import React from 'react';
import { View, StyleSheet, TextInput, Text, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default class Search extends React.Component {
  constructor() {
    super();
    this.state = {
      lat: 0,
      lon: 0,
      searchResults: [],
      searchText: '',
      lonDel:20
    };
  }

  degreesToRadians = (angle) => {
    return angle * (Math.PI / 180);
  };

  kMToLongitudes = (km, atLatitude) => {
    return (km * 0.0089831) / Math.cos(this.degreesToRadians(atLatitude));
  };

  getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status == 'granted') {
      let location = await Location.getCurrentPositionAsync({});

      this.setState({
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      });

      var val=this.kMToLongitudes(1, location.coords.latitude);
      this.setState({lonDel:val})
    }
  };

  handleSearch = async () => {
    const { searchText } = this.state;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchText}`
      );
      const data = await response.json();
      console.log(data[0]);

      if (data && data.length > 0) {
        this.setState({
          searchResults: data,
          lat: data[0].lat,
          lon: data[0].lon,
        });
      }
    } catch (error) {
      console.error('Error searching for location:', error);
    }
  };

  componentDidMount() {
    this.getLocation();
  }
  render() {
    const { searchText, searchResults, lat, lon ,lonDel} = this.state;
    console.log(lat + '   ' + lon);
    if (lat == 0 && lon == 0) {
      return (
        <Text style={{ marginTop: 200, alignSelf: 'center' }}>Loading....</Text>
      );
    }
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Search for locations"
          value={searchText}
          onChangeText={(text) => this.setState({ searchText: text })}
        />
        <Button title="Search" onPress={this.handleSearch} />

        <MapView
          style={styles.map}
          region={{
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
            latitudeDelta: 0.00001,
            longitudeDelta: lonDel,
          }}>
          {searchResults.length > 0 ? (
            <Marker
              key={searchResults[0].place_id}
              coordinate={{
                latitude: parseFloat(searchResults[0].lat),
                longitude: parseFloat(searchResults[0].lon),
              }}
              title={searchResults[0].display_name}
            />
          ) : (
            <Marker
              coordinate={{
                latitude: parseFloat(lat),
                longitude: parseFloat(lon),
              }}
            />
          )}
        </MapView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 50,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
  },
  map: {
    flex: 1,
    marginTop: 10,
  },
});
