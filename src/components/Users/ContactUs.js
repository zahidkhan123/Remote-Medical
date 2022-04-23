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


toast.configure();
const ContactUs = (props) =>  {
  const [ sign_in ,setSignIn]                     = useState(false)
	const { register, handleSubmit, watch, errors } = useForm();
	const onSubmit                                  = data => console.log(data);
	let   history                                   = useHistory();
	let   location                                  = useLocation();
	let   randomstring                              = require("randomstring");
	let   apiUrl                                    = servicePath
  const auth_token                                = localStorage.getItem("auth_token")
	const user_email                                = localStorage.getItem("user_email");
	const updated = () => toast.success("Successfully send");


	useEffect(() => {
		props.token(true)
  },[])
  
  const error={
		color: 'red',
		marginBottom: '3px'
	}

	const formSubmit = (data) => {
    let email              = data.email
		let name   = data.name;
		let subject       = data.subject;
		let message   = data.message;
    let id                 = localStorage.getItem("user_id");
    const  formData = new FormData();
			formData.append('email', email);
			formData.append('name', name);
			formData.append('subject', subject);
			formData.append('message', message);
			axios.post(
				apiUrl+`/admin_api/api/v1/users/send_contact_information`,formData,{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
			.then((response) => {
				if (response.status === 200) {
					history.push("/dashboard");
					updated();
				}
			}).catch((error) => {
				
			})
  }


	return(
		<div>
			<h3 className="text-center text-white pt-5"></h3>
			<div className="container">
				<div id="login-row" className="row justify-content-center align-items-center">
					<div id="login-column" className="col-md-6">
						<div id="login-box" className="col-md-12">
							<form id="login-form" className="form" onSubmit={handleSubmit(formSubmit)}>
								<h3 className="text-center text-info">Contact Us</h3>
								<div className="form-group">
									<label htmlFor="email" className="text-info">Email *</label><br/>
									<input type            ="text"
												 name            ="email"
												 id              ="email"
												 defaultValue    = {user_email}
												 className       ="form-control"
												 ref={register({required: true})} 
									/>
									<div style={error}>
										{errors.email && 'Please enter an email.'}
 									</div>
								</div>
								<div className="form-group">
									<label htmlFor="name" className="text-info">Name *</label><br/>
									<input type            ="text"
												 name            ="name"
												 id              ="name"
												 className       ="form-control"
												 ref={register({required: true})} 
									/>
									<div style={error}>
										{errors.name && 'Please enter your name.'}
 									</div>
								</div>
								<div className="form-group">
									<label htmlFor="subject" className="text-info">Subject *</label><br/>
									<input type            ="text"
												 name            ="subject"
												 id              ="subject"
												 className       ="form-control"
												 ref={register({required: true})} 
									/>
									<div style={error}>
										{errors.subject && 'Please enter subject.'}
 									</div>
								</div>
								<div className="form-group">
									<label htmlFor="message" name= "message" className="text-info">Message *</label><br/>
									<textarea name            ="message"
												 id              ="message"
												 className       ="form-control"
												 ref={register({required: true})} 
									/>
									<div style={error}>
										{errors.message && 'Please enter the message.'}
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

export default ContactUs