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
toast.configure();
const UserShow = (props) =>  {
	const {id}																					 = useParams()
	const [user_id, setUserId]                           = useState(id)
	const [user, setUser]                                = useState({})
	const [error, setError]                              = useState('')
	const [password_instruction, setPasswordInstruction] = useState(false)
	let auth_token                                       = localStorage.getItem("auth_token")
	let apiUrl                                           = servicePath
	let location                                         = useLocation()

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
					} else{
						toast.error("Record not found")
					}
				})
				.catch(error => {
					toast.error(error.response.data.message)
				})
		);
	},[])

	return(
		<>
			<div className="header-inner mb-5">
				<div>
					<div className="header-title">
						User Show
					</div>
					<div className="bc-list">
						<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ <Link to={{pathname: `/users`}}>Users</Link>/
					</div>
				</div>
			</div>
			<div className="container">
				<table className="table table-striped">
				<thead>
				<tr>
					<th>Id</th>
					<th>First Name</th>
					<th>Last Name</th>
					<th>Email</th>
					<th>Role</th>
				</tr>
				</thead>
				<tbody>
					<tr key={user.id}>
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
							{user.role}
						</td>
					</tr>
				</tbody>
			</table>
			</div>
		</>
	)

}

export default UserShow