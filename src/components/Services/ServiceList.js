import React, {useEffect, useState} from "react";
import {trackPromise, usePromiseTracker} from "react-promise-tracker";
import Pagination from "reactive-pagination";
import "reactive-pagination/dist/index.css";
import axios from "axios"
import { ToastContainer, toast } from 'react-toastify';
import {servicePath} from "../../constants/defaultValues";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	Redirect,
	useLocation,
	useHistory
} from "react-router-dom";
import {confirmAlert} from "react-confirm-alert";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Loader from "react-loader-spinner";
toast.configure();

const ServiceList = (props) => {
	const { promiseInProgress }                        = usePromiseTracker();
	const history                                      = useHistory()
	const [services, setServices]                      = useState([])
	const [servicesError, setServicesError]            = useState('')
	const [serviceDeleteError, setServiceDeleteError]  = useState('')
	const [is_service_delete, setIsServiceDeleted]     = useState(false)
	const [page,setPage]                               = useState(null)
	const [per_page, setPerPage]                       = useState(null)
	const [next_page_exist, setNextPage_Exist]         = useState(false)
	const [previous_page_exist, setPreviousPage_Exist] = useState(false)
	const [total_pages_count, setTotalPagesCount]      = useState(null)
	const [total_records, setTotalRecords]             = useState(null)
	const successfullyDeleted                          = () => toast.error("Service Successfully Deleted");
	let   auth_token                                   = localStorage.getItem("auth_token")
	let   apiUrl                                       = servicePath

	useEffect(()=>{
		props.token(true)
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/services.json",{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
				.then(res => {
					setServices(res.data.services)
					setPage(res.data.paging_data.page)
					setPerPage(res.data.paging_data.per_page)
					setNextPage_Exist(res.data.paging_data.next_page_exist)
					setPreviousPage_Exist(res.data.paging_data.previous_page_exist)
					setTotalPagesCount(res.data.paging_data.total_pages)
					setTotalRecords(res.data.paging_data.total_records)
				})
				.catch(error =>{
					setServicesError(error)

				})
		);
	},[])


	const deleteHandler = (page,event) => {
		let e = event
		e.preventDefault();
		const id = e.target.id
		trackPromise(
			axios.get( `${apiUrl}/admin_api/api/v1/services/${id}/before_delete_verification.json`,{
				headers: {
					"AUTH-TOKEN": auth_token
				}
			})
				.then(res => {
					if (res.status ==  200){
						confirmAlert({title: "Not able to delete", message: res.data.message})
					}else if (res.status ==  204){
						confirmAlert({
							title: 'Confirm to Delete',
							message: 'Are you sure you want to delete this service?',
							buttons: [
								{
									label: 'Yes',
									onClick: () => {
										trackPromise(
											axios.delete( `${apiUrl}/admin_api/api/v1/services/${id}.json`,{
												headers: {
													"AUTH-TOKEN": auth_token
												}
											})
												.then(res => {
													successfullyDeleted()
													if (is_service_delete == true){
														setIsServiceDeleted(false)
													}
													paginationHandler(page)
												})
												.catch(errors => {
													setServiceDeleteError(errors)
												})
										)
									}
								},
								{
									label: 'No'
								}
							]
						});
					} else{
						console.log("aaaaa")
					}
				})
				.catch(errors => {
					setServiceDeleteError(errors)
				})
		)
	}

	const paginationHandler = (event) => {
		let page_number = event
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/services.json?page=" + page_number,{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
			.then(res => {
				if (res.status == 200){
					setPage(page_number)
					setServices(res.data.services)
				}else{
					toast.error("Record not found!")
				}
			})
			.catch(error =>{
				setServicesError(error)
			})
		);
	}

	const changeHandler = () => {

	}

	const searchHandler =(event)=> {
		event.preventDefault();
		const data = event.target.service_name.value;
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/services.json?search_data=" + data,{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
			.then(res => {
				if (res.status == 200 && res.data.services.length > 0 ){
					setServices(res.data.services)
				} else{
					toast.error("Record not found!")
				}
			})
			.catch(error =>{
				setServicesError(error)
				toast.error(error.response.data.message)
			})
		);
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
			</div>) :
		<>
			<div className="header-inner mb-5">
				<div>
					<div className="header-title">
						Services
					</div>
					<div className="bc-list">
						<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ Services
					</div>
				</div>
				<div className="button-add">
					<Link to={{pathname: `/add_service`}} className="btn btn-primary"> <FontAwesomeIcon icon="plus"/> Add Service</Link>
				</div>
			</div>
			<div className="container">
			<div className="row mb-3 mt-3">
				<form className="form-inline" onSubmit={searchHandler}>
					<div className="form-group mx-sm-3 mb-2">
						<input type="search"
									 placeholder="Search Service"
									 className="form-control"
									 id="searchService"
									 aria-describedby="emailHelp"
									 name            ='service_name'
									 onChange        = {changeHandler} />
					</div>
					<button type="submit" className="btn btn-primary submit_button mb-2">Search</button>
				</form>
			</div>
			<table className="table table-striped">
				<thead>
				<tr>
					<th>Id</th>
					<th>Name</th>
					<th></th>
					<th>Actions</th>
				</tr>
				</thead>
				<tbody>
				{services.map((service, index) => {
					return (
						<>
							<tr key={index}>
								<td>{service.id}</td>
								<td style={{textTransform: 'capitalize'}}>
									{service.name}
								</td>
								<td>
									{/*{service.is_active ? "Yes" : "No"}*/}
								</td>
								<td>
									<div className="btn-group action-buttons" role="group" aria-label="Basic example">
										<Link to={{pathname: `/edit_service/${service.id}`, state: {service: service}}}
													className="btn btn-outline-primary">Edit</Link>
										<Link to={{pathname: `/show_service/${service.id}`, state: {service: service}}}
													className="btn btn-outline-success">Show</Link>
										<Link to="" onClick={ e => deleteHandler(page,e)} id={service.id} className="btn btn-outline-danger">Delete</Link>
									</div>
								</td>
							</tr>
						</>
					)
				})}
				</tbody>
			</table>
			<div className="mt-2 pagination-handler">
				{ services && services.length > 0 &&
				<Pagination
					activePage={page}
					itemsCountPerPage={per_page}
					totalItemsCount={total_records}
					delimeter={5}
					onChange={event => {
						paginationHandler(event)
					}}
					styling="default"
				/>
				}
			</div>
		</div>
		</>
	)
}

export default ServiceList