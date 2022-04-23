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

const AddService = (props) => {

	const history = useHistory()
	const [nameState, setNameState] = useState('')
	const [categories, setCategories] = useState([])
	const [categoriesError, setCategoriesError] = useState('')
	const [categoryServicesAttributes, setCategoryServicesAttributes] = useState([])
	const [submitError, setSubmitError] = useState('')
	const nameError = () => toast.error(submitError);
	const serviceSuccessfullyAdded = () => toast.success("Service Successfully Added");
	let apiUrl     = servicePath
	let auth_token = localStorage.getItem("auth_token")

	const changeHandler = event => {
		setNameState(event.target.value)
	}

	const selectCategories = array => {
		setCategoryServicesAttributes(array)
	}

	const removeCategories = array => {
		setCategoryServicesAttributes(array)
	}

	const submitHandler = event => {
		event.preventDefault();
		const category_services = []
		categoryServicesAttributes.forEach(value => {
			category_services.push({"category_id": `${value.id}`})
		})
		const data = {
			"service": {
				"name": `${nameState}`,
				"category_services_attributes": category_services
			}
		}
		trackPromise(
			axios.post(
				apiUrl + "/admin_api/api/v1/services.json",
				data,
				{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
				.then(res =>{
					serviceSuccessfullyAdded()
					history.push("/services")
				})
				.catch(errors => {
					if(errors.response.status == 400){
						setSubmitError("This name already exist you cannot create service with this name");
					}
					if(errors.response.status == 403){
						setSubmitError(errors.response.data.message);
					}
				})
		)
	}

	useEffect(()=>{
		props.token(true)
		submitError && nameError()
		setSubmitError('')

		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/categories.json",{
					headers: {
						"AUTH-TOKEN": auth_token
					},
					params: {
						edit_service: "true"
					}
				}
			)
				.then(res => {
					setCategories(res.data.categories)
				})
				.catch(error =>{
					setCategoriesError(error)

				})
		)
	},[submitError, categoryServicesAttributes])


	return(
		<>
			<div className="header-inner mb-5">
				<div>
					<div className="header-title">
						Add Service
					</div>
					<div className="bc-list">
						<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ <Link to={{pathname: `/services`}}>Services</Link>/
					</div>
				</div>
			</div>
			<div className="container">
			<div className="card">
				<div className="card-header">Add Service</div>
				<div className="card-body">
					<form onSubmit={submitHandler}>
						<div className="form-group">
							<label htmlFor="exampleInputEmail1">Name *</label>
							<input type="text"
										 className="form-control"
										 id="exampleInputEmail1"
										 aria-describedby="emailHelp"
										 name            ='name'
										 defaultValue    = {nameState}
										 onChange        = {changeHandler} />
						</div>
						<div className="form-group">
							<label htmlFor="exampleInputEmail1">Category Name *</label>
							<Multiselect
								options = {categories}
								displayValue = 'name'
								placeholder = 'Select Categories'
								style={{chips: {background: "#228CAA", "text-transform": "capitalize"},optionContainer: { "text-transform": "capitalize"}}}
								onSelect = {selectCategories}
								onRemove = {removeCategories}
							/>
						</div>
						<button type="submit" className="btn btn-primary submit_button">Add Service</button>
					</form>
				</div>
			</div>
		</div>
		</>

	)
}

export default AddService