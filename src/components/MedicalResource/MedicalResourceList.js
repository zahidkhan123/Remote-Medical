import React, {useEffect, useState} from "react";
import {trackPromise ,usePromiseTracker} from "react-promise-tracker";
import { Button,Badge } from 'react-bootstrap';
import axios from "axios"
import "bootstrap/dist/css/bootstrap.min.css"
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { ToastContainer, toast } from 'react-toastify';
import "../../styles/custom/generic_listing.scss"
import { servicePath } from "../../constants/defaultValues";
import Pagination from "reactive-pagination";
import "reactive-pagination/dist/index.css";
import ReactTooltip from 'react-tooltip';
import MedicalResourceEditForm from "../dashboard/editResourceForm"
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	Redirect,
	useLocation,
	useHistory
} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faCheckSquare, faCoffee,faPlus } from '@fortawesome/free-solid-svg-icons'
import Loader from "react-loader-spinner";
import Modal from "react-modal";
library.add(fab, faCheckSquare, faCoffee,faPlus)
toast.configure();

const MedicalResourceList = (props) => {
	const { promiseInProgress } = usePromiseTracker();
	const [is_medical_resource_delete, setIsMedicalResourceDelete]      = useState(false)
	const [medical_resources, setMedicalResources]                      = useState([])
	const [medical_resource_error, setMedicalResourceError]             = useState('')
	const [medical_resource_deleteError, setMedicalResourceDeleteError] = useState('')
	const [page,setPage]                                                = useState(null)
	const [per_page, setPerPage]                                        = useState(null)
	const [next_page_exist, setNextPage_Exist]                          = useState(false)
	const [previous_page_exist, setPreviousPage_Exist]                  = useState(false)
	const [total_pages_count, setTotalPagesCount]                       = useState(null)
	const [total_records, setTotalRecords]                              = useState(null)
	const [isModalActive, setIsModalActive]                             = useState(false)
	const [editModalShow, setEditModalShow]                             = useState(false)
	const [closeEditModal, setCloseEditModal]                           = useState(false)
	const [singleMedicalResourceId, setsingleMedicalResourceId]         = useState('')
	let   auth_token                                                    = localStorage.getItem("auth_token")
	let   apiUrl                                                        = servicePath

	const successfullyDeleted = () => toast.error("Medical Resource Successfully Deleted");

	useEffect(()=>{
		props.token(true)
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/medical_resources.json?medical_resource_listing=medical_resource_listing",{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
				.then(res => {
					if (res.status == 200){
						setMedicalResources(res.data.medical_resources)
						setPage(res.data.paging_data.page)
						setPerPage(res.data.paging_data.per_page)
						setNextPage_Exist(res.data.paging_data.next_page_exist)
						setPreviousPage_Exist(res.data.paging_data.previous_page_exist)
						setTotalPagesCount(res.data.paging_data.total_pages)
						setTotalRecords(res.data.paging_data.total_records)
					} else {
						medical_resource_error(res.data.message)
					}
				})
				.catch(error =>{
					toast.error(error.response.data.message);
				})
		);
	},[])
	

	const deleteHandler = (event,page) => {
		let e = event
		e.preventDefault();
		const id = e.target.id
		confirmAlert({
			title: 'Confirm to Delete',
			message: 'Are you sure you want to delete this medical resource?',
			buttons: [
				{
					label: 'Yes',
					onClick: () => {
						trackPromise(
							axios.delete( `${apiUrl}/admin_api/api/v1/medical_resources/${id}.json`,{
								headers: {
									"AUTH-TOKEN": auth_token
								}
							})
							.then(res => {
								if (res.status == 200){
									successfullyDeleted()
									paginationHandler(page)
								} else{
									toast.error("Record not found!")
								}
							})
							.catch(errors => {
								toast.error(errors.response.data.message)
							})
						)
					}
				},
				{
					label: 'No'
				}
			]
		});
	}

	const paginationHandler = (event) => {
		let page_number = event
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/medical_resources.json?medical_resource_listing=medical_resource_listing&page=" + page_number,{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
				.then(res => {
					if (res.status == 200){
						setPage(page_number)
						setMedicalResources(res.data.medical_resources)
						setTotalRecords(res.data.paging_data.total_records)
					} else{
						medical_resource_error(res.data.message)
					}
				})
				.catch(error =>{
					toast.error(error.response.data.message)
				})
		);

	}
	const truncate =(str) =>  {
		return str.length > 15 ? str.substring(0, 10) + "..." : str;
	}
	const changeHandler = () => {

	}

	const searchHandler =(event)=> {
		event.preventDefault();
		const data = event.target.name.value;
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/medical_resources.json?",{
					params: {
						"search_medical_resource" : "search_medical_resource",
						"name": data
					},
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
				.then(res => {
					if (res.status == 200 && res.data.medical_resources.length > 0 ){
						setMedicalResources(res.data.medical_resources)
					} else{
						toast.error("Record not found!")
					}
				})
				.catch(error =>{
					toast.error(error.response.data.message)
				})
		);
	}
	const clickhandler =(e,medical_resource) => {
		e.preventDefault()
		setsingleMedicalResourceId(medical_resource.id)
		setEditModalShow(true)
		setIsModalActive(true)
	}

	const afterOpenModal = () => {}

	function closerModal() {
		setsingleMedicalResourceId("")
		setEditModalShow(false)
		setIsModalActive(false)
	}

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
	return(
		promiseInProgress  ?  (<div
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
						Medical Resources
					</div>
					<div className="bc-list">
						<Link to={{pathname: `dashboard`}}>Dashboard</Link>/ Medical Resource
					</div>
				</div>
			</div>
			<div className="container">
				<div className="row mb-3 mt-4">
					<div className="col-6">
						<form className="form-inline" onSubmit={searchHandler}>
							<div className="form-group mx-sm-3 mb-2">
								<input type="search"
											 placeholder="Search Medical Resource"
											 className="form-control"
											 id="searchCategory"
											 aria-describedby="emailHelp"
											 name='name'
											 onChange={changeHandler}/>
							</div>
							<button type="submit" className="btn btn-primary submit_button mb-2">Search</button>
						</form>
					</div>
					<div className="col-6">
						<Button variant="primary" className="float-right">
							Medical Resources Count <Badge variant="light">{total_records}</Badge>
							<span className="sr-only">unread messages</span>
						</Button>
					</div>
				</div>
				{/*{ medical_resources.length > 0 ? <Loader type="Circles" className="loader" /> : null }*/}
				<table className="table table-striped">
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

					{medical_resources.map( (medical_resource, index) => {
						return (
							<>
								<ReactTooltip/>
								<tr key={index}>
									<td>
										{medical_resource.id}
									</td>
									<td data-tip={medical_resource.name} style={{textTransform: 'capitalize'}}>
										{medical_resource.name}
									</td>
									{/*<td data-tip={medical_resource.name}>*/}
									{/*	{ truncate(medical_resource.name) }*/}
									{/*</td>*/}
									<td>
										{medical_resource.is_active ? "Yes" : "No"}
									</td>
									<td>
										<ul>
											{medical_resource.medical_resource_entities.map(medical_resource_entity => {
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
											<Link to={""} onClick={ e => clickhandler(e,medical_resource)} class="btn btn-outline-primary">Edit</Link>
											<Link to={{
												pathname: `/medical_resource_show/${medical_resource.id}`,
												state: {medical_resource: medical_resource}
											}} class="btn btn-outline-success">Show</Link>
											<Link to="" onClick={ e => {deleteHandler(e,page)}} id={medical_resource.id}
														class="btn btn-outline-danger">Delete</Link>
										</div>
									</td>
								</tr>
							</>
						)
					})}
					<>
						{
							isModalActive &&
							<Modal
								isOpen={editModalShow}
								onAfterOpen={afterOpenModal}
								onRequestClose={closerModal}
								style={customStyles}
								contentLabel="Edit Medical Resource"
							>
								<MedicalResourceEditForm  medical_resource_id={singleMedicalResourceId}   click={closerModal} from_medical_resource_listing={true} closeModal={closerModal} />
							</Modal>
						}
					</>
					</tbody>
				</table>
				<div className="mt-2 pagination-handler">
					{medical_resources && medical_resources.length > 0 &&
					< Pagination
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

export default MedicalResourceList