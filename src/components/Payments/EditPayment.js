import React, {useEffect, useState} from "react";
import axios from "axios"
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

const EditPayment = (props) => {
	const {id}                              = useParams()
	const location                          = useLocation()
	const history                           = useHistory()
	const [payment_id,      setPaymentId]   = useState(id)
	const [payment,      setPayment]        = useState({})
	const [submitError,   setSubmitError]   = useState('')
	const categorySuccessfullyUpdated       = () => toast.success("Payment Successfully Updated");
	let apiUrl                              = servicePath
	let auth_token                          = localStorage.getItem("auth_token")

	useEffect(() => {
		props.token(true)
		trackPromise(
			axios.get(
				apiUrl + `/admin_api/api/v1/payments/${payment_id}.json`,{
					headers: {
						"AUTH-TOKEN" : auth_token
					}
				})
				.then(res => {
					if (res.status ==  200){
						setPayment(res.data.payment)
					} else{
						toast.error("Record not found")
					}
				})
				.catch(error => {
					setSubmitError(error)
				})
		);
	},[])


	const changeHandler = (event) => {
		const {name, value} = event.target
		setPayment((preState) => ({
				...preState,
				[name]: value
		}))
	}

	const changeCheckboxHandler = (event) => {
		const {name, checked} = event.target
		setPayment((preState) => ({
				...preState,
				[name]: checked
		}))
	}

	const submitHandler = (event) => {
		event.preventDefault();
		const data = {
			"payment":{
				"name":        `${payment.name}`,
				"is_active":   `${payment.is_active}`
			}
		}
		trackPromise(
			axios.put(apiUrl + `/admin_api/api/v1/payments/${payment.id}.json`,data,{
				headers: {
					"AUTH-TOKEN" : auth_token
				}
			})
				.then(res=> {
					categorySuccessfullyUpdated()
					history.push("/payments");
				})
				.catch(errors => {
					toast.error(errors.response.data.message)
				})
		)
	}

	return(
		<>
			<div className="header-inner mb-5">
				<div>
					<div className="header-title">
						Edit Payment
					</div>
					<div className="bc-list">
						<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ <Link to={{pathname: `/payments`}}>Payments</Link>/ {payment.name}
					</div>
				</div>
			</div>
			<div className="container">
				<div className="card">
				<div className="card-header">Edit {payment.name}</div>
				<div className="card-body">
					<form onSubmit={submitHandler}>
						<div className="form-group">
							<label htmlFor="exampleInputEmail1">Payment Name *</label>
							<input type="text"
										 className="form-control"
										 id="exampleInputEmail1"
										 aria-describedby="emailHelp"
										 name            ='name'
										 defaultValue    = {payment.name}
										 onChange        = {changeHandler} />
						</div>
						<div className="form-group form-check">
							<label className="checkbox-container add-form-labels add-form-checkbox-label-container">Active
							<input type="checkbox"
										 className="form-check-input"
										 id="exampleCheck1"
										 name= 'is_active'
										 defaultChecked = { payment.is_active }
										 onClick        = { changeCheckboxHandler }/>
								<span className="checkmark entity-checkbox"></span>
							</label>
							<button type="submit" className="btn btn-primary submit_button">Update Payment</button>
						</div>
					</form>
				</div>
			</div>
			</div>
		</>
	)
}

export default EditPayment