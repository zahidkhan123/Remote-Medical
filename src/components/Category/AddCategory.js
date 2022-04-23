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
	useHistory
} from "react-router-dom";
toast.configure();

const AddCategory = (props) => {
	const [name, setNameState]                      = useState('')
	const [is_active, setIsActive]                  = useState(false)
	const [submitError, setSubmitError]             = useState('')
	const nameError = () => toast.error(submitError);
	const categorySuccessfullyAdded = () => toast.success("Category Successfully Added");

	let apiUrl     = servicePath
	let auth_token = localStorage.getItem("auth_token")
	let history    = useHistory();

	const changeHandler= event =>{
		setNameState(event.target.value)
	}

	const changeCheckBoxHandler = (event) => {
		setIsActive(event.target.checked)
	}

	const submitHandler = event => {
		event.preventDefault();
		const data = {
			"category":{
				"name":       `${name}`,
				"is_active":  `${is_active}`
			}
		}
		trackPromise(axios.post(
			apiUrl + "/admin_api/api/v1/categories.json",
			data,
			{
				headers: {
					"AUTH-TOKEN" : auth_token
				}
			}
		)
			.then(res => {
				categorySuccessfullyAdded()
				history.push("/categories");
			})
			.catch(errors => {
				if(errors.response.status == 400){
					setSubmitError("This name already exist you cannot create category with this name");
				}
				if(errors.response.status == 403){
					setSubmitError(errors.response.data.message);
				}
			}))


	}

	useEffect(()=>{
		props.token(true)
		submitError && nameError()
		setSubmitError('')
	},[submitError])

	return(
		<>
			<div className="header-inner mb-5">
				<div>
					<div className="header-title">
						Add Category
					</div>
					<div className="bc-list">
						<Link to={{pathname: `dashboard`}}>Dashboard</Link>/ <Link to={{pathname: `categories`}}>Categories</Link>/ {name}
					</div>
				</div>
			</div>
			<div className="container">
			<div className="card">
				<div className="card-header">Add Category</div>
				<div className="card-body">
					<form onSubmit={submitHandler}>
						<div className="form-group">
							<label htmlFor="exampleInputEmail1">Category Name *</label>
							<input type="text"
										 className="form-control"
										 id="exampleInputEmail1"
										 aria-describedby="emailHelp"
										 name            ='name'
										 defaultValue    = {name}
										 onChange        = {changeHandler} />
						</div>
						<div className="form-group form-check">
							<label className="checkbox-container add-form-labels add-form-checkbox-label-container">Active
								<input type="checkbox"
											 className="form-check-input"
											 id="exampleCheck1"
											 name= 'is_active'
											 defaultChecked = { is_active }
											 onClick        = { changeCheckBoxHandler }/>
								<span className="checkmark entity-checkbox"></span>
							</label>
							<button type="submit" className="btn btn-primary submit_button">Add Category</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		</>
	)
}

export default AddCategory