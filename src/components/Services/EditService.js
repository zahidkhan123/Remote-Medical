	import React, {useEffect, useState} from "react";
	import axios from "axios"
	import {trackPromise} from "react-promise-tracker";
	import { ToastContainer, toast } from 'react-toastify';
	import {Multiselect} from "multiselect-react-dropdown";
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

	const EditService = (props) => {
		const {id}                                                        = useParams()
		const location                                                    = useLocation()
		const history                                                     = useHistory()
		const [service, setService]                                       = useState({})
		const [serviceCategories, setServiceCategories]                   = useState([])
		const [serviceError, setServiceError]                             = useState('')
		const [categoryServicesAttributes, setCategoryServicesAttributes] = useState([])
		const [categories, setCategories]                                 = useState([])
		const [categoriesError, setCategoriesError]                       = useState('')
		const [submitError, setSubmitError]                               = useState('')
		const serviceSuccessfullyUpdated = () => toast.success("Service Successfully Updated");

		let apiUrl       = servicePath
		let auth_token   = localStorage.getItem("auth_token")
		let service_id   = id

		const changeHandler = event => {
			setService({
				name: event.target.value
			})
		}

		const submitHandler = event => {
				event.preventDefault()
				console.log(categoryServicesAttributes)
				const category_services = []
				categoryServicesAttributes.forEach(value => {
					category_services.push({"category_id": `${value.id}`})
				})
				const data = {
					"service": {
						"name": `${service.name}`,
						"category_services_attributes": category_services
					}
				}
				trackPromise(
					axios.put(
					apiUrl + `/admin_api/api/v1/services/${service_id}.json`,
					data,
					{
						headers: {
							"AUTH-TOKEN": auth_token
						}
					}
				)
				.then(res =>{
					serviceSuccessfullyUpdated()
					history.push("/services")
				})
				.catch(errors => {
					if(errors.response.status == 403){
						toast.error(errors.response.data.message);
					}else{
						toast.error(errors)
					}
				})
			)
		}

		const selectCategories = array => {
			setCategoryServicesAttributes(array)
		}

		const removeCategories = array => {
			setCategoryServicesAttributes(array)
		}

		useEffect(()=>{
			props.token(true)
			trackPromise(
				axios.get(
					apiUrl + `/admin_api/api/v1/services/${service_id}.json`,{
						headers: {
							"AUTH-TOKEN" : auth_token
						}
					}
				)
				.then(res => {
					if(res.status == 200){
						setService(res.data.service)
						setServiceCategories(res.data.service.categories)
						setCategoryServicesAttributes(res.data.service.categories)
					}else{
						toast.error("Record not found")
					}
				})
				.catch(errors => {
					setServiceError(errors)
				})
			)

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
		},[])


		return(
			<>
				<div className="header-inner mb-5">
					<div>
						<div className="header-title">
							Edit Service
						</div>
						<div className="bc-list">
							<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ <Link to={{pathname: `/services`}}>Services</Link>/
						</div>
					</div>
				</div>
				<div className="container">
					<div className="card">
						<div className="card-header">Edit {service.name}</div>
						<div className="card-body">
							<form onSubmit={submitHandler}>
								<div className="form-group">
									<label htmlFor="exampleInputEmail1">Name *</label>
									<input type="text"
												 className="form-control"
												 id="exampleInputEmail1"
												 aria-describedby="emailHelp"
												 name            ='name'
												 defaultValue    = {service.name}
												 onChange        = {changeHandler} />
								</div>
								<div className="form-group mb-5">
									<label htmlFor="exampleInputEmail1">Categories *</label>
									<Multiselect
										options = {categories}
										displayValue = 'name'
										placeholder = 'Select Categories'
										style={{chips: {background: "#228CAA", "text-transform": "capitalize"},optionContainer: { "text-transform": "capitalize"}}}
										onSelect = {selectCategories}
										onRemove = {removeCategories}
										selectedValues = {serviceCategories}
									/>
								</div>
								<button type="submit" className="btn btn-primary submit_button">Update Service</button>
							</form>
						</div>
					</div>
				</div>
				</>
		)
	}

	export default EditService