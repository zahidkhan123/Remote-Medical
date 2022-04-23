import React, {useEffect, useState} from "react";
import axios from "axios";
import {trackPromise, usePromiseTracker} from "react-promise-tracker";
import { BrowserRouter as Router, Switch, Route, Link, Redirect, useLocation, useHistory} from "react-router-dom";
import { servicePath } from "../../constants/defaultValues";
import { ToastContainer, toast } from 'react-toastify';
import "../../styles/custom/generic_listing.scss"
import "../../styles/custom/preferred_areas_map.scss"
import { useForm } from 'react-hook-form';
import {Button, Col, Container, Form, Modal, Row} from "react-bootstrap";
import Loader from "react-loader-spinner";

const PreferredAreaMap = (props) =>{
	const { register, handleSubmit, errors, form} = useForm(); // initialize the hook
	const { promiseInProgress }          = usePromiseTracker();
	const apiUrl                         = servicePath;
	const auth_token 										 = localStorage.getItem("auth_token");
	const [geoAddress, setGeoAddress]    = useState({});
	const [data, setData]                = useState([]);
	const [loader, setLoader]            = useState(false);
	const [lat, setLat]                  = useState(null);
	const [lng, setLng]									 = useState(null);
	const [ description, setDescription] = useState("");
	const [ isUpdated, setIsUpdated]     = useState(false);


	function initAutocomplete() {
		const map = new window.google.maps.Map(document.getElementById("googleMap"), {
			center: { lat: lat ? lat : props.lat, lng: lng ? lng : props.lng },
			zoom: 5,
			mapTypeId: "roadmap",
		});
		const input = document.getElementById("pac-input");
		const searchBox = new window.google.maps.places.SearchBox(input);
		map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(input);
		map.addListener("bounds_changed", () => {
			searchBox.setBounds(map.getBounds());
		});
		let markers = [];
		searchBox.addListener("places_changed", () => {
			const places = searchBox.getPlaces();

			if (places.length == 0) {
				return;
			}
			markers.forEach((marker) => {
				marker.setMap(null);
			});
			markers = [];
			const bounds = new window.google.maps.LatLngBounds();
			places.forEach((place) => {
				if (!place.geometry || !place.geometry.location) {
					console.log("Returned place contains no geometry");
					return;
				}
				const icon = {
					url: place.icon,
					size: new window.google.maps.Size(71, 71),
					origin: new window.google.maps.Point(0, 0),
					anchor: new window.google.maps.Point(17, 34),
					scaledSize: new window.google.maps.Size(25, 25),
				};
				markers.push(
					new window.google.maps.Marker({
						map,
						icon,
						title: place.name,
						position: place.geometry.location,
					})
				);
				if (place.geometry.viewport) {
					bounds.union(place.geometry.viewport);
				} else {
					bounds.extend(place.geometry.location);
				}
				placeMarker(place.geometry.location);
			});
			map.fitBounds(bounds);
		});
		window.google.maps.event.addListener(map, "click", (event) => {
			placeMarker(event.latLng);
		});
		function placeMarker(location) {
			var marker = new window.google.maps.Marker({
				position: location,
				map: map,
				draggable: true
			});
			setLoader(true)
			axios.get(apiUrl + `/admin_api/api/v1/medical_resources/get_geo_address.json?lat=${location.lat()}&lng=${location.lng()}`, {
				headers: {
					"AUTH-TOKEN": auth_token,
					"Content-Type": "application/json"
				}
			}).then((response)=>{
				if (response.status == 200){
					setGeoAddress(response.data.geo_location_data);
					props.setOtherServcieAreas(response.data.geo_location_data)
					setLat(location.lat())
					setLng(location.lng())
					setLoader(false)
					setIsUpdated(true)
					initAutocomplete()
				}else {
					setLoader(false)
					initAutocomplete()
					toast.error(response.message)
				}
			}).catch((error)=>{
				setLoader(false)
				toast.error(error)
			})
		}
	}

	useEffect(()=> {
		if ( props.edit_address_state && props.inputList.length > 0 ) {
			let area = props.inputList.filter( (a,i) => i == props.edit_address_index)
			if (props.from_edit_form ==  true){
				setGeoAddress(area[0])
				props.setOtherServcieAreas(area[0])
			}else{
				setGeoAddress(area[0].dataset)
			}
		}
		setIsUpdated(false)
		initAutocomplete();
	},[])

	const showLoader = () => {
		return(
			<div style={{margin: 'auto', width: '50%', padding: '10px'}}>
				<Loader type="Circles" color="#2BAD60" height="150" width="150" />
			</div>
		);
	}
	return(
		<>
			{
				loader ? showLoader()
				:
				<Modal.Body>
					<input
					id="pac-input"
					className="controls"
					type="text"
					placeholder="Search Box"
				/>
				<div id="googleMap">
				</div>
				<Form>
					<Container>
						{/*{ props.is_preferred_service_areas &&*/}
						{/*	<>*/}
						{/*		<Row>*/}
						{/*			<Col xs={12}>*/}
						{/*				<Form.Group>*/}
						{/*					<Form.Label className="add-form-labels">Address *</Form.Label>*/}
						{/*					<Form.Control type="text" placeholder="Address" defaultValue={geoAddress && geoAddress.address} name="address" className="add-form-input" readOnly={true}/>*/}
						{/*				</Form.Group>*/}
						{/*			</Col>*/}
						{/*		</Row>*/}
						{/*		<Row>*/}
						{/*			<Col xs={12} md={4}>*/}
						{/*				<Form.Group>*/}
						{/*					<label className="add-form-labels">Country</label>*/}
						{/*					<Form.Control type="text" placeholder="Country" defaultValue={geoAddress && geoAddress.country} name="country"  className="add-form-input" readOnly={true} />*/}
						{/*					<Form.Control type="hidden" value={ geoAddress && geoAddress.country_flag} name="country_flag"/>*/}
						{/*				</Form.Group>*/}
						{/*			</Col>*/}
						{/*			<Col xs={12} md={4}>*/}
						{/*				<Form.Group>*/}
						{/*					<label className="add-form-labels">State</label>*/}
						{/*					<Form.Control type="text" placeholder="State" defaultValue={geoAddress && geoAddress.state} name="state" className="add-form-input" readOnly={true} />*/}
						{/*				</Form.Group>*/}
						{/*			</Col>*/}
						{/*			<Col xs={12} md={4}>*/}
						{/*				<Form.Group>*/}
						{/*					<Form.Label className="add-form-labels">City</Form.Label>*/}
						{/*					<Form.Control type="text" placeholder="City" defaultValue={geoAddress && geoAddress.city}  name="city" className="add-form-input" readOnly={true} />*/}
						{/*				</Form.Group>*/}
						{/*			</Col>*/}
						{/*		</Row>*/}
						{/*		<Row>*/}
						{/*			<Col xs={12} md={4}>*/}
						{/*				<Form.Group>*/}
						{/*					<Form.Label className="add-form-labels">Postal code </Form.Label>*/}
						{/*					<Form.Control type="text" placeholder="postal code" name="postal_code" className="add-form-input" defaultValue={geoAddress && geoAddress.postal_code} readOnly={true} />*/}
						{/*				</Form.Group>*/}
						{/*			</Col>*/}
						{/*			<Col xs={12} md={4}>*/}
						{/*				<Form.Group>*/}
						{/*					<Form.Label className="add-form-labels">Longitude *</Form.Label>*/}
						{/*					<Form.Control type="text" placeholder="Longitude" defaultValue={geoAddress && geoAddress.longitude} name="longitude"  className="add-form-input" readOnly={true}/>*/}
						{/*				</Form.Group>*/}
						{/*			</Col>*/}
						{/*			<Col xs={12} md={4}>*/}
						{/*				<Form.Group>*/}
						{/*					<Form.Label className="add-form-labels">Latitude *</Form.Label>*/}
						{/*					<Form.Control type="text" placeholder="Latitude" defaultValue={geoAddress && geoAddress.latitude} name="latitude" className="add-form-input" readOnly={true}/>*/}
						{/*				</Form.Group>*/}
						{/*			</Col>*/}
						{/*		</Row>*/}
						{/*	</>*/}
						{/*}*/}
						<>
							<Row>
								<Col xs={12} md={6}>
									<Form.Group>
										<label className="add-form-labels">Country</label>
										<Form.Control type="text" placeholder="Country" defaultValue={geoAddress && geoAddress.country} name="country"  className="add-form-input" readOnly={true} />
										<Form.Control type="hidden" value={ geoAddress && geoAddress.country_flag} name="country_flag"/>
									</Form.Group>
								</Col>
								<Col xs={12} md={6}>
									<Form.Group>
										<label className="add-form-labels">State</label>
										<Form.Control type="text" placeholder="State" defaultValue={geoAddress && geoAddress.state} name="state" className="add-form-input" readOnly={true} />
									</Form.Group>
								</Col>
							</Row>
						</>
					</Container>
				</Form>
				</Modal.Body>
			}
		</>
	)
}

export default PreferredAreaMap