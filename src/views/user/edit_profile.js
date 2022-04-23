import React, {useState, useEffect, useRef} from 'react';
import { Container, Row, Col, Spinner,Button,Form } from 'react-bootstrap';
import '../../App.css';
import {trackPromise, usePromiseTracker} from 'react-promise-tracker';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { servicePath } from "../../constants/defaultValues";
import {
	Redirect,
	useHistory,
	useLocation
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";


function EditProfile(props) {
	const [ sign_in ,setSignIn]                     = useState(false)
	const { register, handleSubmit, watch, errors } = useForm();
	const onSubmit                                  = data => console.log(data);
	let   history                                   = useHistory();
	let   location                                  = useLocation();
	let   randomstring                              = require("randomstring");
	let   apiUrl                                    = servicePath
  const auth_token                                = localStorage.getItem("auth_token")
	const user_email                                = localStorage.getItem("user_email");
	const wrongpassword = () => toast.error("your new password and confirm password not match");
	const updated = () => toast.error("Successfully Updated");



	useEffect(() => {
		props.token(true)
  }, [])
    
	const error={
		color: 'red',
		marginBottom: '3px'
	}

	const formSubmit = (data) => {
		let email              = data.email
		let current_password   = data.current_password;
		let new_password       = data.new_password;
		let confirm_password   = data.confirm_password;
		let id                 = localStorage.getItem("user_id");

		if(new_password.localeCompare(confirm_password) == 0){
			const  formData = new FormData();
			formData.append('user[id]', id);
			formData.append('user[email]', email);
			formData.append('user[current_password]', current_password);
			formData.append('user[new_password]', new_password);
			formData.append('user[confirm_password]', confirm_password);
			axios.post(
				apiUrl+`/admin_api/api/v1/users/${id}/edit_current_user.json`,formData,{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
			.then((response) => {
				if (response.status === 200) {
					localStorage.removeItem("auth_token");
					history.push("/login_user");
					updated();
				}
			}).catch((error) => {
				
			})
		}
		else{
			wrongpassword();
		}
	}

	return(
		<div>
			<h3 className="text-center text-white pt-5"></h3>
			<div className="container">
				<div id="login-row" className="row justify-content-center align-items-center">
					<div id="login-column" className="col-md-6">
						<div id="login-box" className="col-md-12">
							<form id="login-form" className="form" onSubmit={handleSubmit(formSubmit)}>
								<h3 className="text-center text-info">Edit Profile</h3>
								<div className="form-group">
									<label htmlFor="email" className="text-info">Email:</label><br/>
									<input type            ="text"
												 name            ="email"
												 id              ="email"
												 readOnly        = "true"
												 defaultValue    = {user_email}
												 className       ="form-control"
												 ref={register({required: true})} 
									/>
									<div style={error}>
										{errors.email && 'Please enter an email.'}
 									</div>
								</div>
								<div className="form-group">
									<label htmlFor="password" className="text-info">Current Password:</label><br/>
									<input type            ="password"
												 name            ="current_password"
												 id              ="password"
												 className       ="form-control"
												 ref={register({required: true})} 
									/>
									<div style={error}>
										{errors.current_password && 'Please enter an current password.'}
 									</div>
								</div>
								<div className="form-group">
									<label htmlFor="password" className="text-info">New Password:</label><br/>
									<input type            ="password"
												 name            ="new_password"
												 id              ="password"
												 className       ="form-control"
												 ref={register({required: true})} 
									/>
									<div style={error}>
										{errors.new_password && 'Please enter new password.'}
 									</div>
								</div>
								<div className="form-group">
									<label htmlFor="password" name= "confirm_password" className="text-info">Confirm Password:</label><br/>
									<input type            ="password"
												 name            ="confirm_password"
												 id              ="password"
												 className       ="form-control"
												 ref={register({required: true})} 
									/>
									<div style={error}>
										{errors.confirm_password && 'Please enter confirm password.'}
 									</div>
								</div>
								<div className="form-group">
									<input type       ="submit"
												 name       ="submit"
												 className  ="btn btn-info btn-md"
												 value      ="submit"
									/>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
			
		</div>
	)


}

export default EditProfile



// <Container style={{textAlign: "justify", marginLeft: '300px', padding: '50px', backgroundColor: 'lightblue', width: '900px', alignContent: 'center', boxShadow: '5px 10px 8px 10px #C0C0C0'}}>
// 				<Form onSubmit={handleSubmit(formSubmit)}>
// 					<Row style={{padding: '20px'}}>
// 						<Col md={6}>
// 							<Form.Group controlId="formBasicEmail">
// 								<Form.Label>Email address</Form.Label>
// 								<Form.Control  name="email" type="email" placeholder="Enter email" ref={register({required: true})} />
// 							</Form.Group>
// 							<div style={error}>
// 							{errors.email && 'Please enter an email.'}
// 							</div>
// 						</Col>
// 					</Row>
// 					<Row style={{padding: '20px'}}>
// 						<Col md={6}>
// 							<Form.Group controlId="formBasicPassword">
// 								<Form.Label>Current Password</Form.Label>
// 								<Form.Control name= "current_password" type="password" placeholder="Curent Password" ref={register({required: true})} />
// 							</Form.Group>
// 							<div style={error}>
// 							{errors.current_password && 'Please enter an current password.'}
// 							</div>
// 						</Col>
// 					</Row>
//                     <Row style={{padding: '20px'}}>
// 						<Col md={6}>
// 							<Form.Group controlId="formBasicPassword">
// 								<Form.Label>New Password</Form.Label>
// 								<Form.Control name= "new_password" type="password" placeholder="New Password" ref={register({required: true})} />
// 							</Form.Group>
// 							<div style={error}>
// 							{errors.new_password && 'Please enter new password.'}
// 							</div>
// 						</Col>
// 					</Row>
//                     <Row style={{padding: '20px'}}>
// 						<Col md={6}>
// 							<Form.Group controlId="formBasicPassword">
// 								<Form.Label>Confirm Password</Form.Label>
// 								<Form.Control name= "confirm_password" type="password" placeholder="Confirm Password" ref={register({required: true})} />
// 							</Form.Group>
// 							<div style={error}>
// 							{errors.confirm_password && 'Please enter confirm password.'}
// 							</div>
// 						</Col>
// 					</Row>
// 					<Button variant="primary" type="submit" style={{margin: '20px'}}>
// 						Submit
// 					</Button>
// 				</Form>
// 				{ sign_in && <Redirect to = "/dashboard"/> }
// 			</Container>