import React, {useEffect, useState} from "react";
import axios from "axios";
import {trackPromise} from "react-promise-tracker";
import { Multiselect } from 'multiselect-react-dropdown';
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
toast.configure();

const AddUser = (props) => {

	const history = useHistory()
	const [first_name,   setFirstNameState] = useState('')
	const [last_name,    setLastNameState]  = useState('')
	const [email,        setEmailState]     = useState('')
	const [role,         setRole]           = useState('')
	const [submitError,  setSubmitError]    = useState('')
	const [userRoles,    setUserRoles]      = useState([])
	const nameError                         = () => toast.error(submitError);
	const serviceSuccessfullyAdded          = () => toast.success("User Successfully Added");
	let apiUrl     = servicePath
	let auth_token = localStorage.getItem("auth_token")

	const changeFirstNameHandler = event => {
		setFirstNameState(event.target.value)
	}
	const changeLastNameHandler = event => {
		setLastNameState(event.target.value)
	}
	const changeEmailHandler = event => {
		setEmailState(event.target.value)
	}
	const user_roles_key_pair =(data) =>{
		let arr = []
		data.map((value)=>{
			arr.push(
				{
					user_role: value,
					value:     value
				}

			)
		})
		return arr
	}

	const submitHandler = event => {
		event.preventDefault();

		const data = {
			"user": {
				"first_name"    : `${first_name}`,
				"last_name"     : `${last_name}`,
				"email"         : `${email}`,
				"role"          : `${role}`
			}
		}
		trackPromise(
			axios.post(
				apiUrl + "/admin_api/api/v1/users.json",
				data,
				{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
			.then(res =>{
				if(res.status == 200){
					serviceSuccessfullyAdded()
					history.push("/users")
				}else{
					toast.error("Invalid request")
				}
			})
			.catch(errors => {

				toast.error(errors.response.data.message)
			})
		)
	}

	useEffect(()=>{
		props.token(true)
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/users/user_roles.json",{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)	.then(res => {
				if(res.status == 200 && res.data.user_roles.length > 0){
					setUserRoles(res.data.user_roles)
				}else{
					nameError();
				}
			})
		)
	},[])
	const onSelectDefaultRoleHandler = (selected_user_role) =>{
		setRole(selected_user_role[0]["user_role"])
	}
	const removeSelectedDefaultRole = () =>{
		setRole("")
	}
	return(
		<>
			<div className="header-inner mb-5">
				<div>
					<div className="header-title">
						Add Category
					</div>
					<div className="bc-list">
						<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ <Link to={{pathname: `/users`}}>Users</Link>/
					</div>
				</div>
			</div>
			<div className="container mb-5">
				<div className="card">
					<div className="card-header">Add User</div>
					<div className="card-body">
						<form onSubmit={submitHandler}>
							<div className="form-group">
								<label htmlFor="exampleInputEmail1">First Name *</label>
								<input type="text"
											 className="form-control"
											 id="exampleInputEmail1"
											 aria-describedby="emailHelp"
											 name            ='first_name'
											 defaultValue    = {first_name}
											 onChange        = {changeFirstNameHandler} />
							</div>
							<div className="form-group">
								<label htmlFor="exampleInputEmail2">Last Name *</label>
								<input type="text"
											 className="form-control"
											 id="exampleInputEmail2"
											 aria-describedby="emailHelp"
											 name            ='last_name'
											 defaultValue    = {last_name}
											 onChange        = {changeLastNameHandler} />
							</div>
							<div className="form-group">
								<label htmlFor="exampleInputEmail3"  className="add-form-labels">Select User Roles </label>
								<Multiselect
									options        = {user_roles_key_pair(userRoles)}
									className      = "add-form-input"
									id             = "exampleInputEmail3"
									displayValue   = 'user_role'
									placeholder    = 'Select User Roles'
									selectionLimit = {1}
									onSelect       = {onSelectDefaultRoleHandler}
									onRemove       = {removeSelectedDefaultRole}
								/>
							</div>
							<div className="form-group">
								<label htmlFor="exampleInputEmail4">Email *</label>
								<input type="text"
											 className="form-control"
											 id="exampleInputEmail4"
											 aria-describedby="emailHelp"
											 name            ='email'
											 defaultValue    = {email}
											 onChange        = {changeEmailHandler} />

							</div>
							<button type="submit" className="btn btn-primary submit_button">Add User</button>
						</form>
					</div>
				</div>
			</div>
		</>

	)
}

export default AddUser