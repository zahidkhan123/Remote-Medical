import React, {useEffect, useState} from "react";
import axios from "axios"
import {trackPromise} from "react-promise-tracker";
import { ToastContainer, toast } from 'react-toastify';
import NavBar from "../nav_bar";
import { servicePath } from "../../constants/defaultValues";
import "../../styles/category/category_form.css"
import "bootstrap/dist/css/bootstrap.min.css"
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	Redirect,
	useLocation,
	useHistory
} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
toast.configure();

const EditMedicalResource = (props) => {
	const location                          = useLocation()
	const history                           = useHistory()
	const [category,      setCategory]      = useState({})
	const [submitError,   setSubmitError]   = useState('')
	const categorySuccessfullyUpdated       = () => toast.success("Category Successfully Updated");
	let apiUrl                              = servicePath
	let auth_token                          = localStorage.getItem("auth_token")
	useEffect(() => {
		props.token(true)
		set_category_object()
	},[])

	const set_category_object = () =>{
		if (location.state){
			setCategory(location.state.category)
		}
	}

	const changeHandler = (event) => {
		const {name, value} = event.target
		setCategory((preState) => ({
				...preState,
				[name]: value
		}))
	}

	const changeCheckboxHandler = (event) => {
		const {name, checked} = event.target
		setCategory((preState) => ({
				...preState,
				[name]: checked
		}))
	}

	const submitHandler = (event) => {
		event.preventDefault();
		const data = {
			"category":{
				"name":        `${category.name}`,
				"is_active":   `${category.is_active}`
			}
		}
		trackPromise(
			axios.put(apiUrl + `/admin_api/api/v1/categories/${category.id}.json`,data,{
				headers: {
					"AUTH-TOKEN" : auth_token
				}
			})
				.then(res=> {
					categorySuccessfullyUpdated()
					history.push("/categories");
				})
				.catch(errors => {
					setSubmitError(errors)
				})
		)
	}

	return(
		<>
			<div className="header-inner mb-5">
				<div>
					<div className="header-title">
						Edit Category
					</div>
					<div className="bc-list">
						<Link to={{pathname: `dashboard`}}>Dashboard</Link>/ <Link to={{pathname: `categories`}}>Categories</Link>/ {category.name}
					</div>
				</div>
			</div>
			<div className="container">
				<div className="card">
				<div className="card-header">Edit {category.name}</div>
				<div className="card-body">
					<form onSubmit={submitHandler}>
						<div className="form-group">
							<label htmlFor="exampleInputEmail1">Category Name</label>
							<input type="text"
										 className="form-control"
										 id="exampleInputEmail1"
										 aria-describedby="emailHelp"
										 name            ='name'
										 defaultValue    = {category.name}
										 onChange        = {changeHandler} />
						</div>
						<div className="form-group form-check">
							<input type="checkbox"
										 className="form-check-input"
										 id="exampleCheck1"
										 name= 'is_active'
										 defaultChecked = { category.is_active }
										 onClick        = { changeCheckboxHandler }/>
							<label className="form-check-label" htmlFor="exampleCheck1">Active</label>
							<button type="submit" className="btn btn-primary submit_button">Update Category</button>
						</div>
					</form>
				</div>
			</div>
			</div>
		</>
	)
}

export default EditMedicalResource