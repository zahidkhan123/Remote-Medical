import React, {useEffect, useState} from "react";
import axios from "axios";
import {trackPromise, usePromiseTracker} from "react-promise-tracker";
import { ToastContainer, toast } from 'react-toastify';
import { servicePath } from "../../constants/defaultValues";
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
import Pagination from "reactive-pagination";
import Loader from "react-loader-spinner";
import {confirmAlert} from "react-confirm-alert";
toast.configure();
const MedicalResourceEntityList = (props) => {
	const { promiseInProgress }                                 = usePromiseTracker();
	const [medical_resource_entities, setMedicalResourceEntity] = useState([])
	const [error, setError]                                     = useState('')
	let apiUrl                                                  = servicePath
	let auth_token                                              = localStorage.getItem("auth_token")
  const [page,setPage]                               = useState(null)
	const [reload_delete,setreload_delete]             = useState(false)
	const [per_page, setPerPage]                       = useState(null)
	const [next_page_exist, setNextPage_Exist]         = useState(false)
	const [previous_page_exist, setPreviousPage_Exist] = useState(false)
	const [total_pages_count, setTotalPagesCount]      = useState(null)
  const [total_records, setTotalRecords]             = useState(null)
  const notifyDeleted                                = () => toast.success("Successfully Deleted");
  const notifyErrorDeleted                           = () => toast.error("Not Deleted");


	useEffect(() => {
		props.token(true)
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/medical_resource_entities.json",{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			).then(response => {
				setMedicalResourceEntity(response.data.medical_resource_entities)
				setPage(response.data.paging_data.page)
				setPerPage(response.data.paging_data.per_page)
				setNextPage_Exist(response.data.paging_data.next_page_exist)
				setPreviousPage_Exist(response.data.paging_data.previous_page_exist)
				setTotalPagesCount(response.data.paging_data.total_pages)
				setTotalRecords(response.data.paging_data.total_records)
			}).catch(error => {
				setError(error)
			})
		)
	},[])
	const paginationHandler = (event) => {
		let page_number = event
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/medical_resource_entities.json?page=" + page_number,{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
      .then(response => {
        setPage(page_number)
        setMedicalResourceEntity(response.data.medical_resource_entities)
      })
      .catch(error =>{
        setError(error)

      })
		);

  }
  
	const changeHandler = () => {

  }

	const handleDelete = (id,event,page) => {
		let e = event
		e.preventDefault();
		trackPromise(
			axios.get( `${apiUrl}/admin_api/api/v1/medical_resource_entities/${id}/before_delete_verification.json`,{
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
							message: 'Are you sure you want to delete this medical resource entity?',
							buttons: [
								{
									label: 'Yes',
									onClick: () => {
										trackPromise(
											axios.delete( `${apiUrl}/admin_api/api/v1/medical_resource_entities/${id}.json`,{
												headers: {
													"AUTH-TOKEN": auth_token
												}
											})
											.then(res => {
												if (res.status == 200){
													notifyDeleted();
													paginationHandler(page)
												} else{
													toast.error("Record not found")
												}
											})
											.catch(errors => {
												notifyErrorDeleted();
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
					notifyErrorDeleted();
				})
		)
	}

	// const handleDelete = (id,event) => {
	// 	let e = event
	// 	e.preventDefault();
	// 	confirmAlert({
	// 		title: 'Confirm to Delete',
	// 		message: 'Are you sure you want to delete this medical resource entity?',
	// 		buttons: [
	// 			{
	// 				label: 'Yes',
	// 				onClick: () => {
	// 					trackPromise(
	// 						axios.delete(
	// 							apiUrl + `/admin_api/api/v1/medical_resource_entities/${id}.json`,{
	// 							headers: {
	// 								"AUTH-TOKEN": auth_token
	// 							}
	// 						})
	// 							.then(res => {
	// 								setreload_delete((prev_state) => !prev_state);
	// 								notifyDeleted();
	// 							})
	// 							.catch(errors => {
	// 								notifyErrorDeleted();
	// 							})
	// 					)
	// 				}
	// 			},
	// 			{
	// 				label: 'No'
	// 			}
	// 		]
	// 	});
	// }


	const searchHandler =(event)=> {
		event.preventDefault();
		const data = event.target.entity_name.value;
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/medical_resource_entities.json?search_data=" + data,{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
      .then(res => {
        if (res.status == 200 && res.data.medical_resource_entities.length > 0 ){
          setMedicalResourceEntity(res.data.medical_resource_entities)
        } else{
          toast.error("Record not found!")
        }
      })
      .catch(error =>{
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
						Medical Resource Entities
					</div>
					<div className="bc-list">
						<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ Medical Resource Entities
					</div>
				</div>
				<div className="button-add">
					<Link to={{pathname: `/add_medical_resource_entity`}} className="btn btn-primary"> <FontAwesomeIcon icon="plus"/> Add</Link>
				</div>
			</div>
			<div className="container">
			<div className="row mb-3 mt-3">
				<form className="form-inline" onSubmit={searchHandler}>
					<div className="form-group mx-sm-3 mb-2">
						<input type="search"
									 placeholder="Search Medical Resource Entity"
									 className="form-control"
									 id="searchEntity"
									 aria-describedby="emailHelp"
									 name            ='entity_name'
									 onChange        = {changeHandler} 
            />
					</div>
					<button type="submit" className="btn btn-primary submit_button mb-2">Search</button>
				</form>
			</div>
			<table className="table table-striped">
				<thead>
				<tr>
					<th>Id</th>
					<th>Name</th>
					<th>Active</th>
					<th>Actions</th>
				</tr>
				</thead>
				<tbody>
				{medical_resource_entities.map(medical_resource_entity => {
					return (
						<>
							<tr key={medical_resource_entity.id}>
								<td>{medical_resource_entity.id}</td>
								<td style={{textTransform: 'capitalize'}}>
									{medical_resource_entity.entity_name}
								</td>
								<td>
									{medical_resource_entity.is_active ? "Yes" : "No"}
								</td>
								<td>
									<div className="btn-group action-buttons" role="group" aria-label="Basic example">
										<Link to={{pathname: `/edit_medical_resource_entity/${medical_resource_entity.id}`, state: {medical_resource_entity: medical_resource_entity}}}
													class="btn btn-outline-primary">Edit</Link>
										<Link to={{pathname: `/medical_resource_entity_show/${medical_resource_entity.id}`, state: {medical_resource_entity: medical_resource_entity}}}
													class="btn btn-outline-success">Show</Link>
										<Link to="" onClick={(e) => handleDelete(medical_resource_entity.id,e,page)} id={medical_resource_entity.id} class="btn btn-outline-danger">Delete</Link>
									</div>
								</td>
							</tr>
						</>
					)
				})}
				</tbody>
			</table>
			<div  className="mt-2 pagination-handler" >
				{ medical_resource_entities && medical_resource_entities.length > 0 &&
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
		</div>
		</>
	)
}

export default MedicalResourceEntityList