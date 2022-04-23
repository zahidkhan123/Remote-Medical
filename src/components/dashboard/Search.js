import React, {useEffect, useRef, useState} from 'react';
import { Row, Col,Form} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faCheckSquare, faCoffee,faSearch } from '@fortawesome/free-solid-svg-icons'
import axios from "axios";
import { servicePath } from "../../constants/defaultValues";
import Select from "react-select";
import { toast } from "react-toastify";
import AsyncSelect from "react-select/async/dist/react-select.esm";
import {trackPromise} from "react-promise-tracker";
import RangeSlider from 'react-bootstrap-range-slider';


library.add(fab, faCheckSquare, faCoffee,faSearch)

const Search = (props) => {
	const [services, setServices]                         = useState([])
	const [latitude, setLatitude]                         = useState(null)
	const [longitude, setLongitude]                       = useState(null)
	const [countries, setCountries]                       = useState([])
	const [cities, setCities]                             = useState([]);
	const [currentCity, setCurrentCity]                   = useState({});
	const [country_alpha_code2, setCountryAlphaCode2]     = useState(null)
	const [cityName, setCityName]                         = useState("")
	const [entities,setMedicalResourceEntities]           = useState([])
	const [entity_id,setEntityId]                         = useState()
	const apiUrl                                          = servicePath
  const auth_token                                      = localStorage.getItem("auth_token")
  const inputRef                                        = useRef();
  let   autoComplete                                    = null;
	const [ rangeValue, setRangeValue ]                   = useState(null);
	const resourceNotify                                  = () => toast.error("Record not found!")
	const requiredFieldNotification                       = () => toast.error("Please enter all the fields!")

	useEffect(() => {
		setCurrentCity({})
	},[cities])


	useEffect(() => {
		axios.get(apiUrl + `/admin_api/api/v1/dashboard/search_medical_resource.json?`, {
			headers: {
				"AUTH-TOKEN": auth_token,
				"Content-Type": "application/json"
			}})
			.then(res => {
				get_all_countries();
				get_all_medical_resource_entities();
				setServices(res.data.services);
			})
			.catch((error) => {
			})
	},[])

	useEffect(() =>{
		const options = {
			// restrict your search to a specific type of result
			types: ['address'],
			// restrict your search to a specific country, or an array of countries
			// componentRestrictions: { country: ['gb', 'us'] },
			componentRestrictions: { country: country_alpha_code2 && country_alpha_code2.toLowerCase()  },
		};
		autoComplete = new window.google.maps.places.Autocomplete(
			inputRef.current,
			options,
		);
		autoComplete.addListener('place_changed', onPlaceChanged);
		// rangeHandler();
		// autoComplete.bindTo('bounds', props.map);
		// return () => {
		//   new window.google.maps.event.clearInstanceListeners(inputRef.current);
		// }
	},[country_alpha_code2, cities])

	const get_all_countries                 = async () => {
		await axios
			.get(
				apiUrl + `/admin_api/api/v1/dashboard/get_all_countries.json`,
				{
					headers: {
						"AUTH-TOKEN": auth_token,
					},
				}
			)
			.then((response) => {
				if (response.status == 200){
					setCountries(response.data.countries)
				}else{
					toast.error("No country found")
				}
			});
	}

	const get_all_medical_resource_entities = async () => {
		await axios
			.get(
				apiUrl + '/admin_api/api/v1/medical_resource_entities/get_all_entities.json',
				{
					headers: {
						"AUTH-TOKEN": auth_token,
					},
				}
			)
			.then((response) => {
				if (response.status == 200){
					let updated_array = response.data.medical_resource_entities.map( single => ({ id: single.id,label: single.entity_name, value: single.entity_name }))
					setMedicalResourceEntities(updated_array)
				}else{
					toast.error("No country found")
				}
			});
	}

	const filterCities                      =  async (inputValue) => {
		if (inputValue.length >= 3 ){
			let updated_cities = []
			await axios.get(apiUrl + '/admin_api/api/v1/dashboard/cities_search.json?',{
				params: {
					"searchData"    : inputValue,
					"alpha2Code"    : cities[0].alpha2Code,
					"countryId"     : cities[0].id
				},
				headers: {
					"AUTH-TOKEN": auth_token
				}})
				.then(res => {
					if (res.status == 200 && res.data.cities.length > 0){
						updated_cities = res.data.cities
					}else{
						toast.error("No city found of this country.")
					}
				});
			return updated_cities
		}
	};
	const country_base_city_handler         = async (event) =>{
		let alpha2Code   = event.value;
		let country_name = event.label;
		await axios.get(apiUrl + '/admin_api/api/v1/dashboard/country_base_cities.json?',{
			params: {
				"alpha2Code"     : alpha2Code,
				"country_name"   : country_name,
			},
			headers: {
				"AUTH-TOKEN": auth_token
			}})
			.then(res => {
				if (res.status == 200 && res.data.cities.length > 0){
					setCountryAlphaCode2(res.data.cities[0]["alpha2Code"])
					setCities(res.data.cities);
				}else{
					toast.error("No city found of this country.")
				}
			})
	}

	const entity_base_handler               = async (event) =>{
		let id           = event.id;
		setEntityId(id);
	}

	const advance_search_form =  async (event) => {
		event.preventDefault();
		let alpha2Code = event.target.country_name.value;
		let city_name  = event.target.city_name.value;
		// trackPromise(
		await axios.get(apiUrl + '/admin_api/api/v1/dashboard.json?dashboard=dashboard',{
			params: {
				"alpha2Code"                     : alpha2Code,
				"city_name"                      : city_name,
				"medical_resource_entity_ids"    : entity_id,
				"latitude"                       : latitude,
				"longitude"                      : longitude,
				"radius"                         : rangeValue
			},
			headers: {
				"AUTH-TOKEN": auth_token
			}})
			.then(res => {
				if (res.status == 200 && res.data.length > 0){
					props.searchData(res.data);
					props.setZoom(7);
					setCityName(city_name);
					props.setCountryAndCity(alpha2Code,city_name,entity_id,latitude,longitude,rangeValue);
					props.setSearchData(true);
					props.recall_hook(false)
					let lat = parseFloat(res.data[0]["lat"]);
					let lng = parseFloat(res.data[0]["lng"]);
					props.setCenter({lat: lat,lng: lng});
				}else{
					props.setSearchData(false);
					props.setCenter({lat: 47.751076,lng: -120.740135});
					resourceNotify();
				}
			})
		// )
	}

  const onPlaceChanged = () => {
    const place = autoComplete.getPlace();
    if(place.geometry){
      setLatitude(place.geometry.location.lat())
      setLongitude(place.geometry.location.lng())
    }
    // inputRef.current.blur();
  };

  const clearSearchBox = () =>  {
    inputRef.current.value = '';
  }

  const rangeHandler = () => {
    let range = document.getElementById('range');
    let rangeV = document.getElementById('rangeV');
    // let rangeV2 = document.getElementById('rangeV2');
    const setValue = ()=>{
      let newValue = Number( (range.value - range.min) * 100 / (range.max - range.min) );
      let newPosition = 10 - (newValue * 0.2);
      // rangeV2.innerHTML = `<span>${range.value}</span>`;
      rangeV.innerHTML = `<span>${range.value}</span>`;
      rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
    };
    document.addEventListener("DOMContentLoaded", setValue);
    range.addEventListener('input', setValue);
  }


	const handler = () => {
		props.menuCloseFromSearch()
	}

  const handleChange = (event) => {
  	setCurrentCity(event)
		setCityName(event.value)
  }

  const formValidation = (e) => {
    let input_array = e.target.getElementsByTagName('input');
    if(input_array[1].value !== "" && input_array[2].value !== "" && input_array[3].value > 0){
      return true;
    }
    else{
      requiredFieldNotification();
      return false;
    }
  }

  const submitHandler = (event) => {
    event.preventDefault();
    let status=formValidation(event);
    if(status){
      axios.get(apiUrl + '/admin_api/api/v1/dashboard.json', {
        params: {
          "search_data"    : "search_data",
          "service_name"   : event.target.service_name.value,
          "radius"         : event.target.radius.value,
          "latitude"       : latitude,
          "longitude"      : longitude
        },
        headers: {
          "AUTH-TOKEN": auth_token,
          "Content-Type": "application/json"
        }})
        .then(res => {
          if (res.data.length> 0 ){
            props.searchData(res.data)
						// props.recall_hook(true);
						let lat = parseFloat(res.data[0]["lat"])
						let lng = parseFloat(res.data[0]["lng"])
						props.setCenter({lat: lat,lng: lng})
						props.setSearchData(true)
            props.setZoom(13);
            toast.success(res.data.length + " Medical resource found!");
          }else{
						props.setSearchData(false)
						props.setCenter({lat: 47.751076,lng: -120.740135})
            resourceNotify();
          }
        })
        .catch((error) => {
          resourceNotify();
        })
    }
	}

	const resetHandler = () => {
		props.recall_hook(true);
		props.setCenter({lat: 47.751076,lng: -120.740135});
		props.setZoom(4);
	}

return (
  <div className="main-search">
    <h3 className="main-search-heading">SEARCH</h3>
    <Form className="main-search-form" onSubmit={advance_search_form}>
			<Row>
				<Col md={3}>
					<Form.Label className="main-search-form-field">Select Country Name</Form.Label>
					<Select
						name="country_name"
						options={countries}
						onChange={event=> {country_base_city_handler(event)}}
					/>
				</Col>
				<Col md={2}>
					<Form.Label className="main-search-form-field">Select City</Form.Label>
					<AsyncSelect
						name ="city_name"
						// cacheOptions
						value=  {currentCity}
						defaultOptions={cities}
						onChange={handleChange}
						loadOptions={filterCities}
					/>
				</Col>
				<Col md={4}>
					<Form.Label className="main-search-form-field">ENTER ADDRESS</Form.Label>
					<Form.Control
						ref={inputRef}
					/>
				</Col>
				<Col md={3} className="mt-4 mb-5">
					<button as="input" type="submit" className="btn btn-info mr-1">
						<span> <FontAwesomeIcon icon="search" /> Search </span>
					</button>
					<button as="input"
									type="submit"
									className="btn btn-light"
									onClick={resetHandler}
					>
						Reset
					</button>
				</Col>
			</Row>
			<Row className="mb-4">
				<Col md={3}>
					<Form.Label className="main-search-form-field">Select Entity</Form.Label>
					<Select
						name="entity_name"
						options={entities}
						onChange={event=> {entity_base_handler(event)}}
					/>
				</Col>
				<Col md={3}>
					<Form.Label className="main-search-form-field">Select Raduis</Form.Label>
					<RangeSlider
						name ="range"
						value={rangeValue}
						onChange={e => setRangeValue(e.target.value)}
						variant='info'
					/>
				</Col>
			</Row>
			<Row>

					{/*<Col xs="3">*/}
					{/*	<Form.Label className="main-search-form-field">Radius</Form.Label>*/}
					{/*	<RangeSlider*/}
					{/*		value={value}*/}
					{/*		onChange={e => setValue(e.target.value)}*/}
					{/*	/>*/}
					{/*	<Form.Control value={value}/>*/}
					{/*</Col>*/}
				{/*<Col md={3}>*/}
				{/*	<Form.Label className="main-search-form-field">Select Services</Form.Label>*/}
				{/*	<AsyncSelect*/}
				{/*		name ="service_name"*/}
				{/*		cacheOptions*/}
				{/*		defaultOptions={services}*/}
				{/*		// onChange={handleChange}*/}
				{/*		loadOptions={services}*/}
				{/*	/>*/}
				{/*</Col>*/}
        {/*<Col md={3}>*/}
        {/*  <Form.Label className="main-search-form-field">ENTER MEDICAL SPECIALITY NAME</Form.Label>*/}
				{/*	<Select*/}
				{/*		name="service_name"*/}
				{/*		options={services}*/}
				{/*		onMenuOpen={handler}*/}
				{/*	/>*/}
        {/*</Col>*/}
        {/*<Col md={3} className="mt-1 range-body">*/}
        {/*  <Form.Label className="main-search-form-field">ENTER RADIUS</Form.Label>*/}
        {/*  <div className="range-wrap">*/}
        {/*    /!* <div className="range-value-second" id="rangeV2"><span></span></div> *!/*/}
        {/*    <Form.Control type="range"*/}
        {/*                  name="radius"*/}
        {/*                  className="main-search-form-range"*/}
        {/*                  min="0"*/}
        {/*                  max="1000"*/}
        {/*                  step="1"*/}
        {/*                  defaultValue="0"*/}
        {/*                  id="range" onChange={(e) => handleChange(e)}/>            */}
        {/*    <div className="range-value" id="rangeV"><span>0</span></div>              */}
        {/*  </div>              */}
        {/*</Col>*/}
      </Row>
    </Form>
  </div>
)}

export default Search;