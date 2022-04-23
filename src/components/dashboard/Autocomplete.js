import React, { Component } from 'react';


class AutoComplete extends Component {
  constructor(props) {
    super(props);
    this.clearSearchBox = this.clearSearchBox.bind(this);
    this.state = {
    	activeModal: false
		}
  }

  componentDidMount({ map, mapApi , addActive, openAddModal} = this.props) {
  	const options = {
        // restrict your search to a specific type of result
        types: ['all'],
        // restrict your search to a specific country, or an array of countries
        // componentRestrictions: { country: ['gb', 'us'] },
    };
    this.autoComplete = new window.google.maps.places.Autocomplete(
        this.searchInput
    );
    this.autoComplete.addListener('place_changed', this.onPlaceChanged);
    this.autoComplete.bindTo('bounds', map);
  }
	shouldComponentUpdate({ map, mapApi , addActive, openAddModal} = this.props){
		if (addActive) {
			this.state.activeModal = true
		}
		return addActive
	}

  componentWillUnmount() {
    new window.google.maps.event.clearInstanceListeners(this.searchInput);
  }

  onPlaceChanged = ({ map, addplace ,addActive,openAddModal} = this.props) => {
  	let active = addActive;
  	let self = this;
  	let modal = openAddModal
		const marker = new  window.google.maps.Marker({
			map,
			anchorPoint: new  window.google.maps.Point(0, -29),
		});

    const place = this.autoComplete.getPlace();
    if (!place.geometry) return;
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } 
    else {
      map.setCenter(place.geometry.location);
      map.setZoom(10);
    }
		marker.setPosition(place.geometry.location);
		marker.setVisible(true);
    addplace(place);
    this.searchInput.blur();
		window.google.maps.event.addListener(marker,'click',function (event) {;
			if (self.state.activeModal) {
				modal(event);
			}
		})
  };


  clearSearchBox() {
    this.searchInput.value = '';
  }

  render() {
    return (
      <div className="map-search">
        <input
          className="map-container-autocomplete"
          ref={(ref) => {
              this.searchInput = ref;
          }}
          type="text"
          onFocus={this.clearSearchBox}
          placeholder="Search a place"
					style={{width: "600px"}}
        />
      </div>
    );
  }
}

export default AutoComplete;