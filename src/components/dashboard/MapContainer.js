import React, {useState, useEffect, useRef} from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow,MarkerClusterer} from '@react-google-maps/api';
import { useLoadScript } from '@react-google-maps/api';
import axios from 'axios';
import {Container, Row, Col, Button, Collapse, Form, Dropdown, Badge} from 'react-bootstrap';
import '../../App.css';
import {trackPromise, usePromiseTracker} from 'react-promise-tracker';
import Loader from "react-loader-spinner";
import Modal from 'react-modal';
import MedicalResourceForm from './addResourceForm';
import { toast } from 'react-toastify';
import { servicePath } from "../../constants/defaultValues";
import { googleMapApiKey } from "../../constants/defaultValues";
import SlidingPanel from 'react-sliding-side-panel';
import Truncate from 'react-truncate';
import {
	geocodeByAddress,
	getLatLng
} from "react-places-autocomplete";
import 'react-toastify/dist/ReactToastify.css';
import AutoComplete from './Autocomplete';
import Spiderfy from './Map';
import MedicalResourceEditForm from '../../components/dashboard/editResourceForm';
import Search from './Search';
import '../../styles/Dashboard/dashboard.scss'
import BurgerMenu from './BurgerMenu';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	Redirect,
} from "react-router-dom";
import ReactTooltip from "react-tooltip";
// import Select from 'react-dropdown-select';
import Select from "react-select";
import Async, { makeAsyncSelect } from 'react-select/async';
import AsyncSelect from 'react-select/async';

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Pagination from "reactive-pagination";
import "../../styles/custom/generic_listing.scss"
import "../../styles/custom/preferred_areas_map.scss"
const googleMapApiKey1 = googleMapApiKey;
const libraries=['places', 'geometry'];
toast.configure();


const MapContainer = (props) => {
	const apiUrl = servicePath
	const auth_token   = localStorage.getItem("auth_token")
	const notifyme = () => toast.success("Medical resource created!");
	const notifyEditMe = () => toast.success("Medical resource updated!");
	const [ selected, setSelected ] = useState({});
	const [ editmodal, setEditModal ] = useState({});
	const [ address, setAddress ] = useState({});
	const [center,setCenter]=useState(null);
	const [modalShow, setModalShow] = useState(false);
	const [editModalShow, setEditModalShow] = useState(false);
	const [ addActive, setAddActive ] = useState(false);
  const [ editActive, setEditActive ] = useState(false);
  
  const [ editModalCheck, setEditModalCheck ] = useState(false);
	const [ infoWindowActive, setInfoWindowActive ] = useState(false);
  const [ markerShown, setMarkerShown ] = useState(false);
	// const [ isUnmounted, setIsUnmounted ] = useState(false);
	const [ marker, setMarker ] = useState({});
	const [medical_resources,setMedicalResources]= useState([]);
	const [current_medical_resource,setCurrentMedicalResource]= useState({});
	const [medical_resource_entities,setMedicalResourceEntities]= useState([]);
  const { promiseInProgress } = usePromiseTracker();
  const [ lat, setlat ] = useState(null);
  const [ lng, setlng ] = useState(null);
  const [ zoom, setzoom ] = useState(4);
  const [ places, setplaces ] = useState([]);
  const [ address_autocomplete, setaddress_autocomplete ] = useState('');
  const [ submit_form, setSubmitForm ] = useState(false);
  const mapobject = useRef(null);
  const BurgerMenuRef = useRef();
	const inputRef      = useRef();
  const [map, setMap] = React.useState(null)
  const [search_data, setSearchData] = useState(false)
  const [is_burger_selected, setIsBurgerSelected] = useState(false)
	const [open, setOpen] = useState(true);
	const [medical_resources_list, setMedicalResourcesList] = useState([]);
	const [page,setPage]                                                = useState(null)
	const [per_page, setPerPage]                                        = useState(null)
	const [next_page_exist, setNextPage_Exist]                          = useState(false)
	const [previous_page_exist, setPreviousPage_Exist]                  = useState(false)
	const [total_pages_count, setTotalPagesCount]                       = useState(null)
	const [total_records, setTotalRecords]                              = useState(null)
	const [country_alpha_code2, setCountryAlphaCode2]                   = useState(null)
	const [country_and_city, setCountryAndCity]                         = useState(null)
	const [isModalActive, setIsModalActive]                             = useState(false)
	const [singleMedicalResourceId, setsingleMedicalResourceId]            = useState('')
	const [from_medical_resource_listing, setFromMedicalResourceListing]   = useState('')
	let is_visitor =localStorage.getItem("is_visitor")
	let services_info_window=[];

	const menuCloseFromSearch = (props) => {
		BurgerMenuRef.current.getMenuClose();
	}

	const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapApiKey1,
    libraries: libraries,
  })

	const [places_address, setPlacesAddress] = React.useState("");

	const [coordinates, setCoordinates] = React.useState({
    lat: null,
    lng: null
  	});

  const onLoad = React.useCallback(function callback(map,maps) {
    const bounds = new window.google.maps.LatLngBounds();
    handleBounds();
    setMap(map)
  }, [])

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  const services = value => {
    services_info_window = current_medical_resource && current_medical_resource.medical_resource_entities && current_medical_resource.medical_resource_entities.map(item => {
      return item.categories.map((category) => {
        return category.services.map((service)=>{
          return (
              service.name
          );
        })
      })
    });
    let temp_array = services_info_window.flat().flat();
    let unique = temp_array.filter(onlyUnique);
    return unique;
  };

	let refs = {};

	function handleChange(newValue) {
		setSelected(newValue);
  }
  
	const getCurrentResource =  (id) => {
		axios.get(apiUrl + '/admin_api/api/v1/medical_resources/' + id + '.json', {
      headers: {
        "AUTH-TOKEN": auth_token,
      }})
      .then(res => {
        setCurrentMedicalResource(res.data.medical_resource);
      })
      .catch((error) => {
				toast.error(error.message)
    })
	}

	const openEditModal = (item) => {
		if (is_visitor == "true"){
			toast.error("You are not authorize to access this page.")
		}else{
			setEditModal(item);
			setEditModalShow(true);
			setFromMedicalResourceListing(false)
			trackPromise(
				axios.get(apiUrl + '/admin_api/api/v1/medical_resources/' + item +'.json', {
					headers: {
						"AUTH-TOKEN": auth_token,
						"Content-Type": "application/json"
					}})
					.then(res => {
						if (res.status == 200){
							setCurrentMedicalResource(res.data.medical_resource);
						}else{
							toast.error("Record not found!")
						}
						// setMedicalResourceEntities(res.data.medical_resource_entities);
					})
					.catch((error) => {
						toast.error(error.response.data.message)
					})
			);
		}
	}

	function handleBounds() {
		if( mapobject.current.state.map.center != undefined){
			setCenter({ lat: mapobject.current.state.map.center.lat(),
				lng: mapobject.current.state.map.center.lng()});
		}else{
			setCenter({lat: 47.751076, lng: -120.740135})
		}
  }

	const showMarker=()=> {
		let o = Object.keys(marker).length
		if ( o > 0 && addActive == true) {
			return true;
		}
		else{
			return false;
		}

	}

	const showClickMarker=(e)=> {
		if (addActive == true) {
			return true;
		}
		else{
			return false;
		}
  }

	const openAddModal=(e)=> {
    // BurgerMenuRef.current.getMenuClose();
		// var geocoder = new window.google.maps.Geocoder();
		// var latitude = e.latLng.lat();
		// var longitude = e.latLng.lng();
		// var latlng = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
		// var address_place_id = ""
		// geocoder.geocode({ location: latlng }, function (results, status) {
		// 	if (status === window.google.maps.GeocoderStatus.OK) {
		// 		if (results[0]) {
		// 			debugger
		// 			address_place_id = results[0].place_id
		// 			console.log(results[0].place_id);
		// 		} else {
		// 			console.log('No results found');
		// 		}
		// 	} else {
		// 		console.log('Geocoder failed due to: ' + status);
		// 	}
		// });

    setMarker({lat: e.latLng.lat(),lng: e.latLng.lng()});
    setCenter({lat: e.latLng.lat(),lng: e.latLng.lng()});
    if (is_visitor == "true"){
			toast.error("You are not authorize to access this page.")
		}else {
			trackPromise(
				axios.get(apiUrl + '/admin_api/api/v1/medical_resource_entities/get_all_entities.json', {
					headers: {
						"AUTH-TOKEN": auth_token
					}
				})
					.then(res => {
						setModalShow(true);
						setMedicalResourceEntities(res.data.medical_resource_entities);
					})
					.catch((error) => {
						toast.error(error.response.data.message)
					})
			);
		}
	}

	const setMarkerState = () => {
		setMarker({});
	}

	function closerModal(){
		setsingleMedicalResourceId("")
    setModalShow(false);
		setEditModalShow(false);
  }
  
	function closeModal(){
		notifyme();
		setModalShow(false);
  }
  
  function closeAddModal(){
    setModalShow(false);
  }

	function closeEditModal(){
    notifyEditMe();
		setEditModalShow((prevState) => !prevState);
	}

	function afterOpenModal() {
  }
  
  const addPlace = (place) => {
    setMarker({lat: place.geometry.location.lat(),lng: place.geometry.location.lng()});
    setplaces([place]);
    // setMarker({});
    // setlat(place.geometry.location.lat());
    // setlng(place.geometry.location.lng());
  };


  const showLoader = () => {
    if(document.getElementsByClassName('loader-main-hide')[0]){
      document.getElementsByClassName('loader-main-hide')[0].classList.add('loader-main-visible')
      document.getElementsByClassName('loader-main-hide')[0].classList.remove('loader-main-hide')
    }
  }

  const hideLoader = () => {
    if(document.getElementsByClassName('loader-main-visible')[0]){
      document.getElementsByClassName('loader-main-visible')[0].classList.add('loader-main-hide')
      document.getElementsByClassName('loader-main-visible')[0].classList.remove('loader-main-visible')
    }
  }

  const _generateAddress = () => {
    const geocoder = new window.google.maps.Geocoder;
    geocoder.geocode({ 'location': { lat: lat, lng: lng } }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          setzoom(13);
          setaddress_autocomplete(results[0].formatted_address);
          setCenter({lat: lat,lng: lng})   //for setting position after submit
        } else {
          window.alert('No results found');
        }
      } 
      else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }


	const call_medical_resources_listing = async (alpha2Code,city_name,medical_resource_entity_ids,latitude,longitude,radius) => {
		await axios
			.get(
				apiUrl + "/admin_api/api/v1/medical_resources.json?medical_resource_listing=medical_resource_listing",
				{
					params: {
						"alpha2Code"                     : alpha2Code,
						"city_name"                      : city_name,
						"medical_resource_entity_ids"    : medical_resource_entity_ids,
						"latitude"                       : latitude,
						"longitude"                      : longitude,
						"radius"                         : radius
					},
					headers: {
						"AUTH-TOKEN": auth_token,
					},
				}
			).then(res => {
				if(res.status == 200 && res.data.medical_resources && res.data.medical_resources.length > 0){
					setMedicalResourcesList(res.data.medical_resources)
					setPage(res.data.paging_data.page)
					setPerPage(res.data.paging_data.per_page)
					setNextPage_Exist(res.data.paging_data.next_page_exist)
					setPreviousPage_Exist(res.data.paging_data.previous_page_exist)
					setTotalPagesCount(res.data.paging_data.total_pages)
					setTotalRecords(res.data.paging_data.total_records)
					setCountryAlphaCode2(alpha2Code)
				}else {
					toast.error("Record not found")
				}
			})
	}

	useEffect(() => {
    let isMounted = true;
		props.token(true)
    Modal.setAppElement('#root')
    trackPromise(
      axios.get(apiUrl + '/admin_api/api/v1/dashboard.json?dashboard=dashboard',{
        headers: {
          "AUTH-TOKEN": auth_token
        }})
        .then(res => {
          if (isMounted)
						call_medical_resources_listing("","","","","","");
          	setMedicalResources(res.data);
						setSubmitForm(false);
        })
        .catch((error) => {
        })
    );
    return () => { isMounted = false };
  },[submit_form,editModalShow]);

  useEffect(() => {
  },[medical_resources && is_burger_selected]);


	const customStyles = {
		content : {
			top                   : '50%',
			left                  : '50%',
			right                 : 'auto',
			bottom                : 'auto',
			marginRight           : '-50%',
			transform             : 'translate(-50%, -50%)',
      maxHeight: '100vh',
      maxWidth: '100%'
		}
	};

	const mapStyles = {
		height: "100vh",
    width: "100%"
	};

	const defaultCenter = {
		lat: 47.751076
		,lng: -120.740135
	}

	const searchDataHandler  = (data) => {
		if (data != "undefined"){
			setMedicalResources(data);
			let lat = parseFloat(data[0]["lat"])
			let lng = parseFloat(data[0]["lng"])
			setCenter({lat: lat,lng: lng})
		}
  }

  const setCountryAndCityHandler = (alpha2Code,city_name,medical_resource_entity_ids,latitude,longitude,raduis) => {
		if (alpha2Code != "undefined" && city_name != "undefined" && medical_resource_entity_ids != "undefined" && latitude != "undefined" && longitude != "undefined" && raduis != "undefined"){
			call_medical_resources_listing(alpha2Code.toLowerCase(),city_name.toLowerCase(),medical_resource_entity_ids,latitude,longitude,raduis)
		}
	}

	const paginationHandler = (event) => {
		let page_number = event
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/medical_resources.json?medical_resource_listing=medical_resource_listing&page=" + page_number,{
					params: {
						"alpha2Code"   : country_alpha_code2,
					},
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
			.then(res => {
				if (res.status == 200){
					setPage(page_number)
					setMedicalResourcesList(res.data.medical_resources)
					setTotalRecords(res.data.paging_data.total_records)
				} else{
					toast.error("Record not found")
				}
			})
			.catch(error =>{
				toast.error(error.response.data.message)
			})
		);
	}

	const clickhandler =(e,medical_resource) => {
		e.preventDefault()
		if (is_visitor ==  "true"){
			toast.error("You are not authorize to access this page.")
		}else {
			setEditModal(medical_resource.id);
			setEditModalShow(true)
			setIsModalActive(true)
			setFromMedicalResourceListing(true)
			trackPromise(
				axios.get(apiUrl + '/admin_api/api/v1/medical_resources/' + medical_resource.id + '.json', {
					headers: {
						"AUTH-TOKEN": auth_token,
						"Content-Type": "application/json"
					}
				})
					.then(res => {
						if (res.status == 200) {
							setCurrentMedicalResource(res.data.medical_resource);
						} else {
							toast.error("Record not found!")
						}
					})
					.catch((error) => {
						toast.error(error.response.data.message)
					})
			);
		}
	}
	const renderFormBasedOnMarker = (map,addPlace,addActive,openAddModal) => {
		return(
			<AutoComplete
				map={map}
				addplace={addPlace}
				addActive={addActive}
				openAddModal={openAddModal}
			/>
		)
	}

	const addMedicalResourceState = (event) => {
		event.preventDefault();
		if (addActive){
			setAddActive(false)
		}else {
			setAddActive(true)
		}
	}
	const renderMap = () => {
    return (
        <div>
          { promiseInProgress ?
						(
							<div
								style={{
									width: "100%",
									height: "100",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									position: "absolute",
									top: "240px"
								}}>
								<Loader type="Circles" color="#2BAD60" height="150" width="150"/>

							</div>
						) :
            <>
							<Modal
								isOpen={modalShow}
								onAfterOpen={afterOpenModal}
								onRequestClose={closerModal}
								style={customStyles}
								contentLabel="Add Resource"
							>
								{
									promiseInProgress ?  (<div
										style={{
											width: "100%",
											height: "100",
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
											position: "absolute",
											top: "240px"
										}}>
										<Loader type="Circles" color="#2BAD60" height="150" width="150" />
									</div>) :
									<React.Fragment>
										<i className="fa fa-times add-modal-close-icon" onClick={closeAddModal}></i>
										<MedicalResourceForm map={map} addressData={address} click={closeModal} entities={medical_resource_entities} resources={medical_resources} setMarkerState={setMarkerState} latlng={marker} setSubmitForm={setSubmitForm}  setZoom={setzoom}/>
									</React.Fragment>
								}
							</Modal>
							{
								editActive && promiseInProgress ?  (<div
										style={{
											width: "100%",
											height: "100",
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
											position: "absolute",
											top: "240px"
										}}>
										<Loader type="Circles" color="#2BAD60" height="150" width="150" />
									</div>) :
									<Modal
										isOpen={editModalShow}
										onAfterOpen={afterOpenModal}
										onRequestClose={closerModal}
										style={customStyles}
										contentLabel="Edit Medical Resource">
										<MedicalResourceEditForm
											medical_resource_id={current_medical_resource.id}
											addressData={address}
											entities={medical_resource_entities}
											closeModal={closeEditModal}
											medical_resources={medical_resources}
											setMarkerState={setMarkerState}
											click={closeEditModal}
											from_medical_resource_listing={from_medical_resource_listing}
											setCenter={setCenter}
										/>
									</Modal>
							}
							<Container className="main-search-heading-container">
								<Row>
									<div className="col-md-6">
										<h3 className="main-heading">DASHBOARD</h3>
									</div>
									<div className="col-md-6">
										<h3 className="main-heading float-right">Total: {total_records}</h3>
									</div>
								</Row>
								{
									map &&
									<Search
										menuCloseFromSearch             = { menuCloseFromSearch}
										addPlace                        = { addPlace}
										map                             = { map}
										recall_hook                     = { setSubmitForm}
										setZoom                         = { setzoom}
										setCenter                       = { setCenter}
										setCountryAndCity               = { setCountryAndCityHandler}
										searchData                      = { searchDataHandler}
										setPage                         = { setPage}
										setPerPage                      = { setPerPage}
										setNextPage_Exist               = { setNextPage_Exist}
										setPreviousPage_Exist           = { setPreviousPage_Exist}
										setTotalPagesCount              = { setTotalPagesCount}
										setTotalRecords                 = { setTotalRecords}
										setSearchData                   = { setSearchData}
										medical_resource_entities       = { medical_resource_entities}
									/>
								}
							</Container>
							<div className="menu-map-container d-flex">
								{/*<BurgerMenu*/}
								{/*	set_medical_resources={setMedicalResources}*/}
								{/*	ref={BurgerMenuRef}*/}
								{/*	showLoader={showLoader}*/}
								{/*	hideLoader={hideLoader}*/}
								{/*	setZoom={setzoom}*/}
								{/*	setCenter={setCenter}*/}
								{/*	setIsBurgerSelected={setIsBurgerSelected}*/}
								{/*/>*/}
								<div className="dashboard-map">
									<div className="main-dashboard-autocomplete-buttons">
											{
												map &&
												renderFormBasedOnMarker(map, addPlace, addActive, openAddModal)
											}

											<div>
												{
													addActive ?
														<button onClick={ e => {addMedicalResourceState(e)}} className="btn btn-success main-dashboard-add-button">
															<i className="fa fa-plus dashboard-add-button-icon"></i>Add Medical Resource</button> :
														<button onClick={ e => {addMedicalResourceState(e)}} className="btn btn-info main-dashboard-add-button">
															<i className="fa fa-plus dashboard-add-button-icon"></i>Add Medical Resource</button>
												}


												{/*{*/}
												{/*	addActive ?*/}
												{/*	<button onClick={*/}
												{/*		() => {*/}
												{/*			setMarker({});*/}
												{/*			setAddActive(currentIsActive => !currentIsActive);*/}
												{/*		}*/}
												{/*	} className="btn btn-success main-dashboard-add-button">*/}
												{/*		<i className="fa fa-plus dashboard-add-button-icon"></i>Add Medical Resource*/}
												{/*	</button>*/}
												{/*	:*/}
												{/*	<button onClick={()=> setAddActive(currentIsActive => !currentIsActive)}>*/}
												{/*																																																																																																						className="btn btn-info main-dashboard-add-button"><i className="fa fa-plus dashboard-add-button-icon"></i>Add Medical Resource</button> }*/}
												{/*																																																																																																						*/}
												{ editActive ? <button onClick={()=> {
													setEditActive(currentIsActive => !currentIsActive)
													setCurrentMedicalResource({});
												}} className="btn btn-success editButton">Edit Medical Resource</button> : <button onClick={()=> {
													setEditActive(currentIsActive => !currentIsActive)
												}} className="btn  btn-info editButtonChecked">Edit Medical Resource</button>
												}

											</div>
									</div>
									<Loader type="Circles" color="#2BAD60" height="150" width="150" className="loader-main-hide"/>
									<GoogleMap
										mapContainerStyle={mapStyles}
										ref={mapobject}
										center={ center ? center : defaultCenter}
										zoom={zoom}
										onClick={ (e) => showClickMarker() &&  openAddModal(e) }
										onDragEnd = {()=> handleBounds()}
										onLoad={onLoad}>
										{/*{test(center,defaultCenter)}*/}
										{/*{console.log(  center)}*/}
										{/*{console.log(  "center")}*/}
										{/*{console.log( defaultCenter)}*/}
										{/*{console.log( "defaultCenter")}*/}

										{
											map &&
											<Spiderfy medical_resources={medical_resources}
																mapobject={mapobject}
																getCurrentResource={getCurrentResource}
																setInfoWindowActive={setInfoWindowActive}
																current_medical_resource={current_medical_resource}
																editModalCheck={editActive}
																infoWindowActive={infoWindowActive}
																openEditModal={openEditModal}
																addActive={addActive}
																setCurrentMedicalResource={setCurrentMedicalResource}
																setMap={setMap}
																showClickMarker={showClickMarker}
																openAddModal={openAddModal}
																map={map}
																center ={center}
																setCenter ={setCenter}
																is_burger_selected={is_burger_selected}
											/>
										}
									</GoogleMap>
								</div>
							</div>
							<div className="d-flex flex-column mt-5 pr-3 pl-3">
								<h3> Medical Resource Listing</h3>
								<table className="table table-striped mt-3">
									<thead>
									<tr>
										<th>Id</th>
										<th>Name</th>
										<th>Active</th>
										<th>Service Type</th>
										<th>Actions</th>
									</tr>
									</thead>
									<tbody>

									{medical_resources_list && medical_resources_list.length > 0 && medical_resources_list.map( (listed_item, index) => {
										return (
											<>
												<ReactTooltip/>
												<tr key={index}>
													<td>
														{listed_item.id}
													</td>
													<td data-tip={listed_item.name} style={{textTransform: 'capitalize'}}>
														{listed_item.name}
													</td>
													<td>
														{listed_item.is_active ? "Yes" : "No"}
													</td>
													<td>
														<ul>
															{listed_item.medical_resource_entities.map(medical_resource_entity => {
																return (
																	<li style={{textTransform: 'capitalize'}}>
																		{medical_resource_entity.entity_name}
																	</li>
																)
															})}
														</ul>
													</td>
													<td>
														<div className="btn-group action-buttons" role="group" aria-label="Basic example">
															<Link to={""} onClick={ e => clickhandler(e,listed_item)} className="btn btn-outline-info">Edit</Link>
															<Link to={{
																pathname: `/medical_resource_show/${listed_item.id}`,
																state: {medical_resource: listed_item}
															}} className="btn btn-outline-info">Show</Link>
															{/*<Link to="" onClick={ e => {deleteHandler(e,page)}} id={listed_item.id}*/}
															{/*			className="btn btn-outline-danger">Delete</Link>*/}
														</div>
													</td>
												</tr>
											</>
										)
									})}
									{/*<>*/}
									{/*	{*/}
									{/*		isModalActive &&*/}
									{/*		<Modal*/}
									{/*			isOpen={editModalShow}*/}
									{/*			onAfterOpen={afterOpenModal}*/}
									{/*			onRequestClose={closerModal}*/}
									{/*			style={customStyles}*/}
									{/*			contentLabel="Edit Medical Resource"*/}
									{/*		>*/}
									{/*			<MedicalResourceEditForm  medical_resource_id={singleMedicalResourceId}   click={closerModal} from_medical_resource_listing={true} closeModal={closerModal} />*/}
									{/*		</Modal>*/}
									{/*	}*/}
									{/*</>*/}
									</tbody>
								</table>
								<div className="mt-2 pagination-handler">
									{medical_resources_list && medical_resources_list.length > 0 &&
									<Pagination
										activePage={page}
										itemsCountPerPage={per_page}
										totalItemsCount={total_records}
										delimeter={5}
										onChange={ event => {
											paginationHandler(event)
										}}
										styling="default"
									/>
									}
								</div>
							</div>
						</>
          }
      </div>
    )
  }

  if (loadError) {
    return <div>Map cannot be loaded right now, sorry.</div>
  }

  return isLoaded ? renderMap() : null
}
export default MapContainer;