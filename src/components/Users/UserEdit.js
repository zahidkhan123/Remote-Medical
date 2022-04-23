import React, {useEffect, useState} from "react";
import axios from "axios";
import {trackPromise} from "react-promise-tracker";
import { ToastContainer, toast } from 'react-toastify';
import NavBar from "../nav_bar";
import { servicePath } from "../../constants/defaultValues";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	Redirect,
	useLocation,
	useHistory,
	useParams
} from "react-router-dom";
import {Multiselect} from "multiselect-react-dropdown";
import data from "../../constants/menu";
toast.configure();
const UserEdit = (props) =>  {
	const {id}																					 = useParams()
	const [user_id, setUserId]                           = useState(id)
	const [user, setUser]                                = useState({})
	const [error, setError]                              = useState('')
	const [password_instruction, setPasswordInstruction] = useState(false)
	const [role, setRole]                                = useState('')
	const [userRoles,    setUserRoles]                   = useState([])
	let auth_token          = localStorage.getItem("auth_token")
	let apiUrl              = servicePath
	let location            = useLocation()
	let history             = useHistory()

	useEffect(() => {
		props.token(true)
		trackPromise(
			axios.get(
				apiUrl + `/admin_api/api/v1/users/${user_id}.json`,{
					headers: {
						"AUTH-TOKEN" : auth_token
					}
				})
				.then(res => {
					if (res.status == 200){
						setUser(res.data.user)
						fetchUserRoles();
					} else{
						toast.error("Record not found")
					}
				})
				.catch(error => {
					toast.error(error.response.data.message)
				})
		);
	},[])

	const fetchUserRoles = () => {
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
					toast.error("Record not found")
				}
			})
		)
	}

	const changeFirstNameHandler = (event) => {
		const {name, value} = event.target
		setUser((preState) => ({
			...preState,
			[name]: value
		}))

	}
	const changeLastNameHandler = (event) => {
		const {name, value} = event.target
		setUser((preState) => ({
			...preState,
			[name]: value
		}))
	}
	const changeEmailHandler = (event) => {
		const {name, value} = event.target
		setUser((preState) => ({
			...preState,
			[name]: value
		}))
	}

	const submitHandler = (event) => {
		event.preventDefault()
		const data = {
			user: {
				"first_name"   : event.target.first_name.value,
				"last_name"    : event.target.last_name.value,
				"role"         : role,
				"email"        : event.target.email.value,
			}
		}
		trackPromise(
			axios.put(
				apiUrl+`/admin_api/api/v1/users/${user.id}.json`,data,{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			).then(res => {
				if (res.status == 200){
					history.push("/users");
					toast.success("User Successfully Updated")
				}else {
					toast.error("Invalid Request")
				}
			}).catch(errors => {
				if(errors.response.status == 403){
					toast.error(errors.response.data.message)
				}else{
					toast.error(errors)
				}
			})
		)
	}

	const user_roles_key_pair = (data) => {
		let arr = []
		data.map( (value) => {
			arr.push(
				{
					user_role: value,
					value:     value
				}
			)
		})
		return arr
	}

	const onSelectDefaultRoleHandler = (selected_user_role) =>{
		setRole(selected_user_role[0]["user_role"])
	}

	const removeSelectedDefaultRole = () =>{
		setRole("")
	}

	const selected_parent_company =(userRoles,user) =>{
		let selected_array= []
		let roles  = user_roles_key_pair(userRoles)
		let default_roles = roles.filter(x => x.user_role == user.role)
		if(default_roles.length > 0){
			default_roles.map(pc => {
				selected_array.push({user_role: pc.user_role, value: pc.value})
			})
		}
		return selected_array
	}

	return(
		<>
			<div className="header-inner mb-5">
				<div>
					<div className="header-title">
						Edit User
					</div>
					<div className="bc-list">
						<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ <Link to={{pathname: `/users`}}>Users</Link>/
					</div>
				</div>
			</div>
			<div className="container mb-5">
				<div className="card mb-5">
					<div className="card-header">Edit {user.email}</div>
					<div className="card-body">
						<form onSubmit={submitHandler}>
							<div className="form-group">
								<label htmlFor="exampleInputEmail1">First Name *</label>
								<input type="text"
											 className="form-control"
											 id="exampleInputEmail1"
											 aria-describedby="emailHelp"
											 name            ='first_name'
											 defaultValue    = {user.first_name}
											 onChange        = {changeFirstNameHandler} />
							</div>
							<div className="form-group">
								<label htmlFor="exampleInputEmail1">Last Name *</label>
								<input type="text"
											 className="form-control"
											 id="exampleInputEmail1"
											 aria-describedby="emailHelp"
											 name            ='last_name'
											 defaultValue    = {user.last_name}
											 onChange        = {changeLastNameHandler} />
							</div>
							<div className="form-group">
								<label htmlFor="exampleInputEmail3"  className="add-form-labels">Select User Roles </label>
								<Multiselect
									options        = {user_roles_key_pair(userRoles)}
									className      = "add-form-input"
									displayValue   = 'user_role'
									placeholder    = 'Select user role'
									selectionLimit = {1}
									selectedValues = {selected_parent_company(userRoles,user)}
									onSelect       = {onSelectDefaultRoleHandler}
									onRemove       = {removeSelectedDefaultRole}
								/>
							</div>
							<div className="form-group">
								<label htmlFor="exampleInputEmail1">Email *</label>
								<input type="text"
											 className="form-control"
											 id="exampleInputEmail1"
											 aria-describedby="emailHelp"
											 name            ='email'
											 defaultValue    = {user.email}
											 onChange        = {changeEmailHandler} />
							</div>
							<button type="submit" className="btn btn-primary submit_button">Update User</button>
						</form>
					</div>
				</div>
			</div>
		</>
	)

}

export default UserEdit