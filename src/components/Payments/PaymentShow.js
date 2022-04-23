import React, {useEffect, useState} from "react";
import {trackPromise} from "react-promise-tracker";
import axios from "axios"
import {servicePath} from "../../constants/defaultValues";
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
import {toast} from "react-toastify";

const PaymentShow = (props) => {
	const {id}                                      = useParams()
	const location                                  = useLocation()
	const history                                   = useHistory()
	const [payment_id, setPaymentId]                = useState(id)
	const [payment, setPayment]                     = useState({})
	const [paymentError, setPaymentError]           = useState('')
	let apiUrl                                      = servicePath
	let auth_token                                  = localStorage.getItem("auth_token")

	useEffect(()=>{
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
					setPaymentError(error)
				})
		);
	},[])

	return(
		<>
			<div className="header-inner mb-5">
				<div>
					<div className="header-title">
						Payment Show
					</div>
					<div className="bc-list">
						<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ <Link to={{pathname: `/payments`}}>Payments</Link>/ {payment.name}
					</div>
				</div>
			</div>
			<div className="container">
				<table className="table table-striped">
				<thead>
					<tr>
						<th>Id</th>
						<th>Name</th>
						<th>Active</th>
					</tr>
				</thead>
				<tbody>
					<td> {payment.id}</td>
					<td style={{textTransform: 'capitalize'}}> {payment.name}</td>
					<td> {payment.is_active ? "Yes" : "No"}</td>
				</tbody>
			</table>
			</div>
		</>
	)
}

export default PaymentShow