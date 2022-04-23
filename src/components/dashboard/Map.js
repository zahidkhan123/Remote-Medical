import React,{useState, useEffect, useRef} from "react";
import MarkerClusterer from '@googlemaps/markerclustererplus';
import axios from "axios";
import { toast          } from "react-toastify";
import { servicePath    } from "../../constants/defaultValues";
import { renderToString } from 'react-dom/server'
import {Col} from "react-bootstrap";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
} from "react-router-dom";

const Spiderfy = (props) => {
	const apiUrl                    = servicePath
	const auth_token                = localStorage.getItem("auth_token")
  const [editCheck,setEditCheck]  = useState(null);
  let medicalResources            = props.medical_resources;
  let center                      = props.center;
  let is_burger_selected          = props.is_burger_selected;

  useEffect(() => {
  	markerNodeMounted();
  },[props.medical_resources]);


  useEffect(() => {
		if (props.is_burger_selected){
			markerNodeMounted();
		}
  },[props.medical_resources && props.is_burger_selected]);

  const prevCount = usePrevious(props.addActive)

	function usePrevious(value) {
		const ref = useRef();
		useEffect(() => {
			ref.current = value;
			props.map.addListener("click", (e) => {
				if(ref.current){
					console.log(ref.current)
					props.openAddModal(e);
				}
			});
		});
		return ref.current;
	}



  const render_categories_names = (medical_resource) => {
		let categories_names_html = [];
		medical_resource.medical_resource_entities.forEach( (single_item) => {
			single_item.categories.forEach((single_cat) => {
				categories_names_html.push(
					<> <li> {single_cat.name} </li> </>
				);
			});
		});

		return categories_names_html;
	}

	function onlyUnique(value, index, self) {
		return self.indexOf(value) === index;
	}
	const services = medical_resource => {
		let services_info_window = medical_resource && medical_resource.medical_resource_entities && medical_resource.medical_resource_entities.map(item => {
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

	const content_string = (medical_resource) => {
		let custom_string =
			<div class="container">
				<div class="row">
					<h6 class="info-window-ul">
						<Router>
							<Link to={{pathname: `/medical_resource_show/${medical_resource.id}`}}
										target="_blank">{medical_resource.name}
							</Link>
						</Router>
					</h6>
				</div>
				<div class="row">
					<div class="col-md-4 col-12">
						<h6>Categories</h6>
						<ul class="info-window-ul">
							{render_categories_names(medical_resource)}
						</ul>
						{
							medical_resource.parent_company_name &&
							<div className="mb-3">
								<h6> Head Quarter</h6>
								{medical_resource.parent_company_name}
								<a href={`/medical_resource_show/${medical_resource.id}`} target="_blank">Open Link</a>
							</div>
						}
						<div>
							<h6>Contact Us</h6>
							<p> {medical_resource.phone} </p>
							<p>
								{(() => {
									if (medical_resource.email !== "NULL" && medical_resource.email) {
										return (
											<p className="text-break">{medical_resource.email}</p>
										)}
								})()}
							</p>
							<p> {medical_resource.address} </p>
							<div>
							{
								medical_resource.addresses && (medical_resource.addresses.map( medical_resource_address => {
									return(
										<>
											{
												medical_resource_address.is_preferred_service_areas == true ?  <>
													<h6>Preferred service areas</h6>
													<p>{medical_resource_address.address}</p>
												</> : <>
													<h6>Other service areas</h6>
													<p>{medical_resource_address.address}</p>
												</>
											}
										</>
									);
								})
								)
							}
							</div>
						</div>
						{(() => {
							if (medical_resource.website !== "NULL" && medical_resource.website) {
								return (
									<div className="mt-1">
										<h6>Website Link</h6>
										<div className="text-truncate">
											{medical_resource.website}
										</div>
										<span><a href={medical_resource.website}  target="_blank">Open Link</a></span>
									</div>
								)}
						})()}
						{(() => {
							if (medical_resource.assessment_link !== "NULL" && medical_resource.assessment_link) {
								return (
									<div className="mt-1">
										<h6>Assesment Link</h6>
										<div className="text-truncate">
											{medical_resource.assessment_link}
										</div>
										<span><a href={medical_resource.assessment_link}  target="_blank">Open Link</a></span>
									</div>
								)}
						})()}
						{(() => {
							if (medical_resource.vendor_link !== "NULL" && medical_resource.vendor_link) {
								return (
									<div className="mt-1">
										<h6>Vendor Link</h6>
										<div className="text-truncate">
											{medical_resource.vendor_link}
										</div>
										<span><a href={medical_resource.vendor_link}  target="_blank">Open Link</a></span>
									</div>
								)}

						})()}
						{(() => {

							if (medical_resource.languages_spoken !== "NULL" && medical_resource.languages_spoken) {
								return (
									<div className="mt-1 mb-2">
										<h6>Language Spoken</h6>
										{medical_resource.languages_spoken}
									</div>
								)
							}
						})()}
					</div>
					<div className="col-md-4 col-12">
						<ul className="info-window-ul">
							<h6>Services</h6>
							{
								services(medical_resource).map((service)=>{
									return (
										<li>
											{service}
										</li>
									);
								})
							}
						</ul>
						<ul className="info-window-ul">
							<h6>Payments</h6>
							{
								medical_resource.medical_resource_payments && (medical_resource.medical_resource_payments.map(item => {
										return (
											<li>
												{item.name }
											</li>
										);
									})
								)
							}
						</ul>
					</div>
					<div className="col-md-4 col-12">
						<ul className="info-window-ul">
							<h6>Medical Resource Entities</h6>
							{
								medical_resource.medical_resource_entities && (medical_resource.medical_resource_entities.map(item => {
										return (
											<li>
												{item.entity_name}
											</li>
										);
									})
								)
							}
						</ul>
						<h6>Image</h6>
						{(() => {
							if (medical_resource.image !== "NULL" && medical_resource.image) {
								return (
									<img src={medical_resource.image} style={{height: '200px', width: '200px'}}/>
								)}

						})()}
						<h6>Created By</h6>
						{medical_resource.created_by}
						<>
							{ medical_resource.updated_by &&
								<>
									<h6>Updated By</h6>
									{medical_resource.updated_by}
								</>
							}
						</>
						<h6>Created At</h6>
						{medical_resource.created_at}
						<>
							{medical_resource.updated_at &&
								<>
									<h6>Updated At</h6>
									{medical_resource.updated_at}
								</>
							}
						</>
					</div>
				</div>
			</div>;
		return renderToString( custom_string )
	}

  const markerNodeMounted = () => {
    let markers = [];
    // let map = props.mapobject.current.state.map;
		let map = new window.google.maps.Map(props.mapobject.current.mapRef, {
      // center: {lat: 47.751076,lng: -120.740135},
      center: {lat: center.lat,lng: center.lng},
      zoom: 4,
    });
    props.setMap(map);
    // const markerCluster = new MarkerClusterer(map, markers);
    let markerCluster = new MarkerClusterer(map, markers,{
      imagePath:
        "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
    });

    var minClusterZoom = 13;
    markerCluster.setMaxZoom(minClusterZoom);
    let oms = require(`npm-overlapping-marker-spiderfier/lib/oms.min`)
    oms = new oms.OverlappingMarkerSpiderfier(map, {
      markersWontMove: true,   // we promise not to move any markers, allowing optimizations
      markersWontHide: true,   // we promise not to change visibility of any markers, allowing optimizations
      basicFormatEvents: true
    });
		var infowindow = new window.google.maps.InfoWindow();
    for (var i = 0, len = medicalResources.length; i < len; i++) {
    	// make a closure over the marker and marker data
			(function () {
				var latitude  = parseFloat(medicalResources[i].lat);
				var longitude = parseFloat(medicalResources[i].lng);
				var marker    = new window.google.maps.Marker({
					position:     new window.google.maps.LatLng({lat: latitude, lng: longitude}),
					icon: {url: medicalResources[i].icon, scaledSize: new window.google.maps.Size(30, 30)},
					map: map,
					medical_resource_id: medicalResources[i].medical_resource_id,
					// animation: window.google.maps.Animation.DROP
				});
				map.setCenter(marker.getPosition())
				markers.push(marker);
				window.google.maps.event.addListener(marker, 'spider_click', function(e) {  // 'spider_click', not plain 'click'
					// let markerData = window.medicalResources[i];
					axios.get(apiUrl + '/admin_api/api/v1/medical_resources/' + medical_resource_id + '.json', {
						headers: {
							"AUTH-TOKEN": auth_token,
						}})
						.then(res => {
							if (res.status == 200){
								infowindow.setContent(content_string(res.data.medical_resource));
								infowindow.open(map,marker);
							}else{
								toast.error(res.response.data.message)
							}
						})
						.catch((error) => {
							toast.error(error.message)
						})
				});
				let medical_resource_id = medicalResources[i].medical_resource_id
				oms.addMarker(marker, function(){
					if(document.getElementsByClassName('editButton')[0]){
						props.openEditModal(medical_resource_id);
					}
					if(document.getElementsByClassName('editButtonChecked')[0]){
						props.getCurrentResource(this.medical_resource_id);
						props.setInfoWindowActive(true);
					}
				});
				markerCluster.addMarker(marker)
			})();
    }
		window.google.maps.event.addListener(markerCluster, 'clusterclick', function(c) {
			// console.log('Number of managed markers in cluster: ' + c.getSize());
			var m = c.getMarkers();
			for (let i in m) {
				m[i].setAnimation(window.google.maps.Animation.BOUNCE);
				setTimeout(function() {
					m[i].setAnimation(null)
				}, 3000);
			}
		});
  }
  

  return (
    <>

      {/* {
        medicalResources.map((item) => {
          // make a closure over the marker and marker data
          var latitude = parseFloat(item.lat);
          var longitude = parseFloat(item.lng);
          var marker = new window.google.maps.Marker({
            position: {lat: latitude, lng: longitude},
            icon: {url: item.icon, scaledSize: new window.google.maps.Size(30, 30)},
            map: map,
            medical_resource_id: item.medical_resource_id
          });
          markers.push(marker);
          window.google.maps.event.addListener(marker, 'spider_click', function(e) {  // spider click not click
    
          });
          let medical_resource_id = item.medical_resource_id
          let temp = editCheck
          oms.addMarker(marker, function(){
            test();
            if(document.getElementsByClassName('editButton')[0]){
              props.openEditModal(medical_resource_id);
            }
            if(Object.keys(props.current_medical_resource).length == 0 && document.getElementsByClassName('editButtonChecked')[0]){
              props.getCurrentResource(this.medical_resource_id);
              props.setInfoWindowActive(prev => prev = !prev);
            }
          });
          markerCluster.addMarker(marker)
        })
      } */}
    </>
  );
    
};
    
    
    
export default Spiderfy;