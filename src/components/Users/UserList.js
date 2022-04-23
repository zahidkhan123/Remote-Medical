import React, {useEffect, useState} from "react";
import axios from "axios";
import {trackPromise, usePromiseTracker} from "react-promise-tracker";
import { ToastContainer, toast } from 'react-toastify';
import { servicePath } from "../../constants/defaultValues";
import "../../styles/custom/generic_listing.scss"
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
import Pagination from "reactive-pagination";
import Loader from "react-loader-spinner";
toast.configure();
const UserList = (props) =>  {
	const { promiseInProgress }                          = usePromiseTracker();
	const [users, setUser]                               = useState([])
	const [error, setError]                              = useState('')
	const [is_admin, setIsAdmin]                         = useState()
	const [is_deleted_user, setIsDeletedUser]            = useState(false)
	const [password_instruction, setPasswordInstruction] = useState(false)
	let auth_token          = localStorage.getItem("auth_token")
	let apiUrl              = servicePath
	const [page,setPage]                               = useState(null)
	const [per_page, setPerPage]                       = useState(null)
	const [next_page_exist, setNextPage_Exist]         = useState(false)
	const [previous_page_exist, setPreviousPage_Exist] = useState(false)
	const [total_pages_count, setTotalPagesCount]      = useState(null)
	const [total_records, setTotalRecords]             = useState(null)
	const successfullyDeleted = () => toast.error("User Successfully Deleted");
	useEffect(() => {
		props.token(true)
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/users.json",{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)	.then(res => {
				setIsAdmin(res.data.is_admin)
				setUser(res.data.users)
				setPage(res.data.paging_data.page)
				setPerPage(res.data.paging_data.per_page)
				setNextPage_Exist(res.data.paging_data.next_page_exist)
				setPreviousPage_Exist(res.data.paging_data.previous_page_exist)
				setTotalPagesCount(res.data.paging_data.total_pages)
				setTotalRecords(res.data.paging_data.total_records)
			}).catch(error => {
				setError(error.message)
			})
		)
	},[])

	const deleteHandler = (event,page) => {
		let e = event
		e.preventDefault();
		const id = e.target.id
		confirmAlert({
			title: 'Confirm to Delete',
			message: 'Are you sure you want to delete this user?',
			buttons: [
				{
					label: 'Yes',
					onClick: () => {
						trackPromise(
							axios.delete( `${apiUrl}/admin_api/api/v1/users/${id}.json`,{
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
									setError(errors)
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

	const ResendPasswordInstructionHandler = (user,e) => {
		e.preventDefault()
		trackPromise(
			axios.get(
				apiUrl + `/admin_api/api/v1/users/${user.id}/resent_password_instruction.json`,{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			).then(res => {
				setPasswordInstruction(true)
				toast.success("Successfully sent");
			}).catch(error => {
				toast.error(error.response.data.message);
			})
		)
	}

	const paginationHandler = (event) => {
		let page_number = event
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/users.json?page=" + page_number,{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
				.then(res => {
					setPage(page_number)
					setUser(res.data.users)
				})
				.catch(error =>{
					setError(error)

				})
		);

	}
	const changeHandler = () => {

	}
	const searchHandler =(event)=> {
		event.preventDefault();
		const data = event.target.name.value;
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/users.json?search_data=" + data,{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
				.then(res => {
					if (res.status == 200 && res.data.users.length > 0 ){
						setUser(res.data.users)
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
						Users
					</div>
					<div className="bc-list">
						<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ Users
					</div>
				</div>
				<div className="button-add">
					<Link to={{pathname: `/add_user`}} className="btn btn-primary"> <FontAwesomeIcon icon="plus"/> Add User</Link>
				</div>
			</div>
			<div className="container">
			<div className="row mb-3 mt-3">
				<form className="form-inline" onSubmit={searchHandler}>
					<div className="form-group mx-sm-3 mb-2">
						<input type="search"
									 placeholder="Search User"
									 className="form-control"
									 id="searchCategory"
									 aria-describedby="emailHelp"
									 name            ='name'
									 onChange        = {changeHandler} />
					</div>
					<button type="submit" className="btn btn-primary submit_button mb-2">Search</button>
				</form>
			</div>
			<table className="table table-striped">
				<thead>
				<tr>
					<th>Id</th>
					<th>First Name</th>
					<th>Last Name</th>
					<th>Email</th>
					<th>Resend Password Instructions</th>
					<th>Role</th>
					<th>Actions</th>
				</tr>
				</thead>
				<tbody>
				{users.map((user,index) => {
					return (
						<>
							<tr key={index}>
								<td>{user.id}</td>
								<td>
									{user.first_name}
								</td>
								<td>
									{user.last_name}
								</td>
								<td>
									{user.email}
								</td>
								<td>
									{user.is_verified ? "Confirmed" :
										<a href="" onClick={(e) => ResendPasswordInstructionHandler(user, e)}>Resend Password
											Instructions</a>
									}
								</td>
								<td>
									{user.role}
								</td>
								<td>
									<div className="btn-group action-buttons" role="group" aria-label="Basic example">
										{(user.current_user || is_admin) &&
											<Link to={{pathname: `/edit_user/${user.id}`, state: {user: user}}}
														className="btn btn-outline-primary">Edit</Link>
										}
										<Link to={{pathname: `/show_user/${user.id}`, state: {user: user }}} className="btn btn-outline-success">Show</Link>
										{is_admin &&
											<Link to="" onClick={ e => {deleteHandler(e,page)}} id={user.id} className="btn btn-outline-danger">Delete</Link>
										}
									</div>
								</td>
							</tr>
						</>
					)
				})}
				</tbody>
			</table>
			<div className="mt-2 pagination-handler">
				{ users && users.length > 0 &&
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

export default UserList