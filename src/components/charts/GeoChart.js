import React, {useEffect, useState} from "react";
import {trackPromise, usePromiseTracker} from "react-promise-tracker";
import axios from "axios";
import { servicePath, googleMapApiKey } from "../../constants/defaultValues";
import "../../styles/custom/generic_listing.scss"
import "../../styles/chart/geo_chart.scss"
import {ToastContainer,toast} from "react-toastify";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Loader from "react-loader-spinner";
import Pagination from "reactive-pagination";
import {Col, Form, Row} from "react-bootstrap";
import Select from "react-select";

const GeoChart = (props)=>{
	const { promiseInProgress }                                       = usePromiseTracker();
	let   auth_token                                                  = localStorage.getItem("auth_token")
	let   apiUrl                                                      = servicePath
	const key                                                         = googleMapApiKey
	const [countries,                   setCountries]                 = useState([])
	const [entities,                    setMedicalResourceEntities]   = useState([])
	const [services,                    setServices]                  = useState([])
	const [entity_id,                   setEntityId]                  = useState("")
	const [service_id,                  setServiceId]                 = useState("")
	const [entity_name,                 setEntityName]                = useState("")
	const [service_name,                setServiceName]               = useState("")
	const [country_name,                setCountryName]               = useState("")
	const [page,                        setPage]                      = useState(null)
	const [per_page,                    setPerPage]                   = useState(null)
	const [next_page_exist,             setNextPage_Exist]            = useState(false)
	const [previous_page_exist,         setPreviousPage_Exist]        = useState(false)
	const [total_page_count,            setTotalPagesCount]           = useState(null)
	const [total_records,               setTotalRecords]              = useState(null)
	const [paginated_medical_resources, setPaginatedMedicalResources] = useState([])

	useEffect(()=> {
		props.token(true)
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/charts.json?",{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
			.then(res => {
				if (res.status == 200 ){
					// custom_geo_chart(res.data.medical_resources.reduce((b,c)=>((b[b.findIndex(d=>d.el["country_name"]===c["country_name"])]||b[b.push({el:c,id: c["id"],medical_resource_id: c["medical_resource_id"],country_name: c["country_name"],country_flag: c["country_flag"],count:0})-1]).count++,b),[]));
					customGeoChart(res.data.medical_resources);
					getCountries();
					getMedicalResourceEntities();
					getServices();
					console.log(res.data);
					setPaginatedMedicalResources(res.data.paginated_data)
					setPage(res.data.paging_data.page)
					setPerPage(res.data.paging_data.per_page)
					setNextPage_Exist(res.data.paging_data.next_page_exist)
					setPreviousPage_Exist(res.data.paging_data.previous_page_exist)
					setTotalPagesCount(res.data.paging_data.total_pages)
					setTotalRecords(res.data.paging_data.total_records)
				} else{
					toast.error("Record not found!")
				}
			})
			.catch(error =>{
				toast.error(error.response.data.message)
			})
		);
	},[])

	const customGeoChart                 = (data)         => {
		window.google.charts.load('current', {
			'packages': ['geochart'],
			'mapsApiKey': key
		});
		window.google.charts.setOnLoadCallback(drawMarkersMap);

		function drawMarkersMap() {
			var dataTable = new window.google.visualization.DataTable();
			dataTable.addColumn('string', 'Country');
			dataTable.addColumn('number', 'MedicalResources');
			// A column for custom tooltip content
			dataTable.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
			let resources_arr = [];
			data.forEach((single_resource) => {
				resources_arr.push(
					[
						single_resource.country_name,
						single_resource.total_count,
						' <img src="' + single_resource.country_flag + '" style="width:25px; margin-right: 10px; margin-bottom: 5px;">' + single_resource.total_count
					]
				)
			});
			dataTable.addRows(
				resources_arr
			);
			var options = {
				colors: ['#AADFF3', '#97D5EE', '#058DC7'],
				tooltip: {
					isHtml: true,
					textStyle: {
						bold: false, color: 'black',fontSize: 14,width: 100
					}
				}
			};
			var chart = new window.google.visualization.GeoChart(document.getElementById('chart_div'));
			chart.draw(dataTable, options);
		}
	}
	const paginationHandler              = (event)        => {
		let page_number  = event
		// trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/charts.json?page=" + page_number,{
					params: {
						"country_name"                   : country_name,
						"service_id"                     : service_id,
						"medical_resource_entity_ids"    : entity_id
					},
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
			.then(response => {
				if (response.status == 200){
					customGeoChart(response.data.medical_resources);
					setPage(page_number)
					setPaginatedMedicalResources(response.data.paginated_data)
				}else{
					customGeoChart(response.data);
					toast.error("Record not found!")
				}
			})
			.catch(error =>{
				toast.error("Record not found!")
			})
		// );
	}
	const entityBaseHandler              = (event)        => {
		if (event != null) {
			let id = event.id;
			let name = event.label;
			setEntityId(id);
			setEntityName(name)
		}
	}
	const getCountries                   = async ()       => {
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
	const getMedicalResourceEntities     = async ()       => {
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
	const getServices                    = async ()       => {
		await axios
			.get(
				apiUrl + '/admin_api/api/v1/services/getAllServices.json',
				{
					headers: {
						"AUTH-TOKEN": auth_token,
					},
				}
			)
			.then((response) => {
				if (response.status == 200 && response.data.services.length > 0){
					setServices(response.data.services)
				}else{
					toast.error("No service found")
				}
			});
	}
	const advance_search_form            = async (event)  => {
		event.preventDefault();
		await axios.get(apiUrl + '/admin_api/api/v1/charts.json?',{
			params: {
				"country_name"                   : country_name,
				"service_id"                     : service_id,
				"medical_resource_entity_ids"    : entity_id
			},
			headers: {
				"AUTH-TOKEN": auth_token
			}})
			.then(res => {
				if (res.status == 200 && res.data.medical_resources.length > 0){
					customGeoChart(res.data.medical_resources)
					setPaginatedMedicalResources(res.data.paginated_data)
				}else{
					toast.error("No record found")
				}
			})
	}
	const countryHandler                 = (event)        => {
		if (event != null){
			let name = event.country_name
			setCountryName(name)
		}
	}
	const resetHandler                   = ()             => {
		window.location.reload()
	}
	const serviceChangeHandler           = (event)        => {
		if (event != null){
			let id           = event.id;
			let name         = event.label;
			setServiceId(id);
			setServiceName(name);
		}
	}
	const searchCountry                  = ()             => {
		let search_html = (
			<div className="main-search">
				<h3 className="main-search-heading">SEARCH</h3>
				<Form className="main-search-form" onSubmit={advance_search_form}>
					<Row>
						<Col md={3}>
							<Form.Label className="main-search-form-field">Select Country Name</Form.Label>
							<Select
								name          ="country_name"
								defaultValue  ={country_name}
								isClearable   ={true}
								options       ={countries}
								onChange      ={ e => countryHandler(e)}
							/>
						</Col>
						<Col md={3}>
							<Form.Label className="main-search-form-field">Select Entity</Form.Label>
							<Select
								name          ="entity_name"
								defaultValue  ={entity_name}
								isClearable   ={true}
								options       ={entities}
								onChange      ={e => {entityBaseHandler(e)}}
							/>
						</Col>
						<Col md={2}>
							<Form.Label className="main-search-form-field">Select Service</Form.Label>
							<Select
								name           ="service_name"
								defaultValue   ={service_name}
								isClearable    ={true}
								options        ={services}
								onChange       ={ e => {serviceChangeHandler(e)}}
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
				</Form>
			</div>
		)
		return search_html
	}
	const callingGeoChart                = ()             => {
		let chart_html = (
			<>
				<div className="header-title">
					Geochart
				</div>
				<div id="chart_div">
				</div>
				<div className="mt-5">
					<table className="table table-striped">
						<thead>
							<tr>
								<th>Id</th>
								<th>Country</th>
								<th>Medical Resource Count</th>
							</tr>
						</thead>
						<tbody>
							{
								paginated_medical_resources.map((pmr, index) =>{
									return(
										<>
											<tr key={index}>
												<td className="country_id">
													{pmr.id}
												</td>
												<td className="country_flag">
													<img src={pmr.country_flag}/>
													{pmr.country_name}
												</td>
												<td>
													{pmr.total_count}
												</td>
											</tr>
										</>
									)
								})
							}
						</tbody>
					</table>
				</div>
				<div  className=" pagination-handler mb-5" >
					{ paginated_medical_resources && paginated_medical_resources.length > 0 && next_page_exist &&
					<Pagination
						activePage={page}
						itemsCountPerPage={per_page}
						totalItemsCount={total_records}
						delimeter={5}
						onChange={event => {paginationHandler(event)}}
						styling="default"
					/>
					}
				</div>
			</>
		)
		return chart_html
	}
	return(
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
		</div>)
		:
		 <>
			 <div className="header-inner mb-2">
				 <div>
					 <div className="bc-list">
						 <Link to={{pathname: `/dashboard`}}>Dashboard</Link>/
					 </div>
				 </div>
			 </div>

			 <div className="container">
				 {searchCountry()}
				 {callingGeoChart()}
			 </div>
		 </>
	)
};

export default GeoChart;