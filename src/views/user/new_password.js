import React, {useState, useEffect} from 'react';
import axios                        from 'axios';
import {  useForm       }           from "react-hook-form";
import {  trackPromise  }           from 'react-promise-tracker';
import {  servicePath   }           from "../../constants/defaultValues";
import {  toast         }           from "react-toastify";
import {  Link          }           from "react-router-dom";
import '../../App.css';
import "../../styles/Form/login.scss"

function ForgotPassword() {
	const { register, errors, handleSubmit } = useForm();
	let   apiUrl                             =  servicePath
	const onSubmit = (data,e) => {
		e.preventDefault()
		trackPromise(
			axios.post(apiUrl + `/api/v1/user_sessions/forgot_password.json`,
				{
					email: data["email"]
				},
				{
					headers: {
						"Content-Type": "application/json"
					}
				}
			).then(response => {
				if (response.status == 200){
					toast.success(response.data.message)
				}else {
					toast.error(response.data.message)
				}
			}).catch((error) =>{
				toast.error(error.response.data.message)
			})
		)

	}

	return(
		<div id="login">
			<h3 className="text-center text-white pt-5">Login form</h3>
			<div className="container">
				<div id="login-row" className="row justify-content-center align-items-center">
					<div id="login-column" className="col-md-6">
						<div id="login-box" className="col-md-12">
							<form id="login-form" className="form" onSubmit={handleSubmit(onSubmit)}>
								<h3 className="text-center text-info">Resend Password Instructions</h3>
								<div className="form-group mt-5">
									<label htmlFor="email" className="text-info">Email:</label><br/>
									<input type            ="email"
												 name            ="email"
												 id              ="email"
												 className       ="form-control"
												 ref={register({ required: true })}
									/>
									{errors.email && "Email is required"}
								</div>
								<div className="form-group form-group-btn">
									<input type       ="submit"
												 name       ="submit"
												 className  ="btn btn-info btn-md"
												 value      ="submit"
									/>
								</div>
								<Link to={"/login_user"}>LogIn</Link>
							</form>

						</div>
					</div>
				</div>
			</div>
		</div>

	)
}

export default ForgotPassword