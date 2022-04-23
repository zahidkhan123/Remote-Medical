import React, {useState, useEffect, useRef} from 'react';
import '../../App.css';
import {trackPromise, usePromiseTracker} from 'react-promise-tracker';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import uuid from "uuid";
import "../../styles/Form/login.scss"
import { servicePath } from "../../constants/defaultValues";
import {
	useHistory,
	useLocation,
	Redirect, Link,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";


function LoginUser(props) {
	const [email,    setEmail]                      = useState('')
	const [password, setPassword]                   = useState('')
	const [sign_in , setSignIn]                     = useState(false)
	const history                                   = useHistory();
	const location                                  = useLocation();
	const randomstring                              = require("randomstring");
	const apiUrl                                    = servicePath
	const loginError = () => toast.error("Incorrect email or password");


	useEffect(() => {
	}, [])

	const changeHandler =(event) => {
		setEmail(event.target.value)
	}

	const changePasswordHandler = (event) => {
		setPassword(event.target.value)
	}

	const formSubmit = (event) => {
		event.preventDefault();
		// let email        = data.email
		// let password     = data.password

		axios.post(apiUrl + "/api/v1/user_sessions/sign_in.json",
			{
				user: {
					email: email,
					password: password,
				},
				user_session:{
					device_uuid:    uuid.v4(),
					device_type:    "web",
					device_token:   randomstring.generate()
				}
			},
			{
				headers:{
					"Content-Type": "application/json"
				}
			}).then((response) => {
				if (response.status === 200) {
					localStorage.setItem("auth_token", response.data.auth_token);
					localStorage.setItem("user_id",    response.data.id);
					localStorage.setItem("user_email", response.data.email);
					localStorage.setItem("is_visitor", response.data.is_visitor);
					setSignIn(true)
				}
			}).catch((error) => {
				loginError();
		})
	}

	return(
		<div id="login">
			<h3 className="text-center text-white pt-5">Login form</h3>
			<div className="container">
				<div id="login-row" className="row justify-content-center align-items-center">
					<div id="login-column" className="col-md-6">
						<div id="login-box" className="col-md-12">
							<form id="login-form" className="form" onSubmit={formSubmit}>
								<h3 className="text-center text-info">Login</h3>
								<div className="form-group">
									<label htmlFor="email" className="text-info">Email:</label><br/>
									<input type            ="text"
												 name            ="email"
												 id              ="email"
												 className       ="form-control"
												 defaultValue    = {email}
												 onChange        = {changeHandler}
									/>
								</div>
								<div className="form-group">
									<label htmlFor="password" className="text-info">Password:</label><br/>
									<input type            ="password"
												 name            ="password"
												 id              ="password"
												 className       ="form-control"
												 defaultValue    = {password}
												 onChange        = {changePasswordHandler}
									/>
								</div>
								<div className="form-group">
									<Link to={"/new_password"}>Forgot Password</Link>
								</div>
								<div className="form-group form-group-btn">
									{/*<label htmlFor="remember-me" className="text-info"><span>Remember me</span> <span><input*/}
									{/*	id="remember-me" name="remember-me" type="checkbox"/></span></label><br/>*/}
									<input type       ="submit"
												 name       ="submit"
												 className  ="btn btn-info btn-md"
												 value      ="submit"
									/>
								</div>
							</form>
							{ sign_in && <Redirect to = "/dashboard"/> }
						</div>
					</div>
				</div>
			</div>
		</div>
	)


}

export default LoginUser