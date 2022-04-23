import React, {useEffect, useState} from "react";
import axios from "axios";
import {trackPromise, usePromiseTracker} from "react-promise-tracker";
import { BrowserRouter as Router, Switch, Route, Link, Redirect, useLocation, useHistory} from "react-router-dom";
import { servicePath } from "../../constants/defaultValues";
import {confirmAlert} from "react-confirm-alert";
import { ToastContainer, toast } from 'react-toastify';
import "../../styles/custom/generic_listing.scss"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Pagination from "reactive-pagination";
import Loader from "react-loader-spinner";
const successfullyDeleted = () => toast.error("Payment Successfully Deleted");

toast.configure();
const PaymentList = (props) =>  {
	const { promiseInProgress }                   = usePromiseTracker();
	const [is_payment_deleted, setPaymentDeleted] = useState(false)
	const [payment_deleted_error, setPaymentDeleteError] = useState(false)
	const [payments, setPayment] = useState([])
	const [error, setError]      = useState('')
	let auth_token               = localStorage.getItem("auth_token")
	let apiUrl                   = servicePath
	const [page,setPage]                               = useState(null)
	const [per_page, setPerPage]                       = useState(null)
	const [next_page_exist, setNextPage_Exist]         = useState(false)
	const [previous_page_exist, setPreviousPage_Exist] = useState(false)
	const [total_pages_count, setTotalPagesCount]      = useState(null)
	const [total_records, setTotalRecords]             = useState(null)

	useEffect(() => {
		props.token(true)
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/payments.json",{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)	.then(res => {
				setPayment(res.data.payments)
				setPage(res.data.paging_data.page)
				setPerPage(res.data.paging_data.per_page)
				setNextPage_Exist(res.data.paging_data.next_page_exist)
				setPreviousPage_Exist(res.data.paging_data.previous_page_exist)
				setTotalPagesCount(res.data.paging_data.total_pages)
				setTotalRecords(res.data.paging_data.total_records)
			}).catch(error => {
				setError(error)
			})
		)
	},[])


	const deleteHandler =(event,page) => {
		event.preventDefault();
		const id = event.target.id
		confirmAlert({
			title: 'Confirm to Delete',
			message: 'Are you sure you want to delete this payment?',
			buttons: [
				{
					label: 'Yes',
					onClick: () => {
						trackPromise(
							axios.delete( `${apiUrl}/admin_api/api/v1/payments/${id}.json`,{
								headers: {
									"AUTH-TOKEN": auth_token
								}
							})
								.then(res => {
									successfullyDeleted()
									paginationHandler(page)
								})
								.catch(errors => {
									setPaymentDeleteError(errors)
								})
						)
					}
				},
				{
					label: 'No'
				}
			]
		});
	}
	const paginationHandler = (event) => {
		let page_number = event
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/payments.json?page=" + page_number,{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
			.then(res => {
				if (res.status ==200){
					setPage(page_number)
					setPayment(res.data.payments)
				} else{
					toast.error("Record not found!")
				}
			})
			.catch(error =>{
				setError(error)
			})
		);

	}
	const changeHandler = () => {

	}

	const searchHandler =(event)=> {
		event.preventDefault();
		const data = event.target.payment_name.value;
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/payments.json?search_data=" + data,{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
				.then(res => {
					if (res.status == 200 && res.data.payments.length > 0 ){
						setPayment(res.data.payments)
					} else{
						toast.error("Record not found!")
					}
				})
				.catch(error =>{
					toast.error(error.response.data.message)
				})
		);
	}
	return(
		promiseInProgress ?  (<div
				style={{
					width: "100%",
					height: "100",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					position: "absolute",
					top: "240px"
				}}>
				<Loader type="Circles" color="#2BAD60" height="150" width="150" />
			</div>) :
		<>
			<div className="header-inner mb-5">
				<div>
					<div className="header-title">
						Payments
					</div>
					<div className="bc-list">
						<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ Payments
					</div>
				</div>
				<div className="button-add">
					<Link to={{pathname: `/add_payment`}} className="btn btn-primary"> <FontAwesomeIcon icon="plus" /> Add Payment</Link>
				</div>
			</div>
			<div className="container">
			<div className="row mb-3 mt-3">
				<form className="form-inline" onSubmit={searchHandler}>
					<div className="form-group mx-sm-3 mb-2 ">
						<input type="search"
									 className="form-control"
									 placeholder="Search Payment"
									 id="searchCategory"
									 aria-describedby="emailHelp"
									 name            ='payment_name'
									 onChange        = {changeHandler} />
					</div>
					<button type="submit" className="btn btn-primary submit_button mb-2">Search</button>
				</form>
			</div>
			<table className="table table-striped">
				<thead>
				<tr>
					<th>Id</th>
					<th>Name</th>
					<th>Active</th>
					<th style={{textAlign: 'center'}}>Actions</th>
				</tr>
				</thead>
				<tbody>
				{payments.map(payment => {
					return (
						<>
							<tr key={payment.id}>
								<td> {payment.id}  </td>
								<td style={{textTransform: 'capitalize', textAlign: 'left'}}>
									{payment.name}
								</td>
								<td style={{textTransform: 'capitalize', textAlign: 'left'}}>
									{payment.is_active ? "Yes" : "No"}
								</td>
								<td>
									<div className="btn-group action-buttons" role="group" aria-label="Basic example">
										<Link to={{pathname: `/edit_payment/${payment.id}`, state: {payment: payment}}}
													class="btn btn-outline-primary">Edit</Link>
										<Link to={{pathname: `/show_payment/${payment.id}`, state: {payment: payment}}}
													class="btn btn-outline-success">Show</Link>
										<Link to="" onClick={ e => {deleteHandler(e,page)}} id={payment.id} class="btn btn-outline-danger">Delete</Link>
									</div>
								</td>
							</tr>
						</>
					)
				})}
				</tbody>
			</table>
			<div className="mt-2 pagination-handler">
				<Pagination
					activePage={page}
					itemsCountPerPage={per_page}
					totalItemsCount={total_records}
					delimeter={5}
					onChange={event => {paginationHandler(event)}}
					styling="default"
				/>
			</div>
		</div>
		</>
	)
}

export default PaymentList