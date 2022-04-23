import React, {useEffect, useState} from "react";
import axios from "axios";
import {trackPromise, usePromiseTracker} from "react-promise-tracker";
import { BrowserRouter as Router, Switch, Route, Link, Redirect, useLocation, useHistory} from "react-router-dom";
import { servicePath } from "../../constants/defaultValues";
import { ToastContainer, toast } from 'react-toastify';
import "../../styles/custom/generic_listing.scss"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Loader from "react-loader-spinner";

toast.configure();

const AddPartnerCompany = (props) => {

	const auth_token                                   = localStorage.getItem("auth_token")
	const apiUrl                                       = servicePath
	const use_history                                  = useHistory();
	const [partner_company_name,setPartnerCompanyName] = useState()
	const [abbreviation_name,setAbbreviationName]      = useState()

	useEffect(()=>{
		props.token(true)
	},[])

	const partner_company_name_handler = (e) => {
		setPartnerCompanyName(e.target.value)
	}
	const abbreviation_name_handler = (e) => {
		setAbbreviationName(e.target.value)
	}

	const submitHandler = (e) => {
		e.preventDefault();
		const data = {
			"partner_company":{
				"partner_company_name":   `${partner_company_name}`,
				"abbreviation_name":      `${abbreviation_name}`
			}
		}
		trackPromise(axios.post(
			apiUrl + "/admin_api/api/v1/partner_companies.json",
			data,
			{
				headers: {
					"AUTH-TOKEN" : auth_token
				}
			}
		)
		.then(res => {
			if (res.status ==  200){
				use_history.push("/partner_companies");
			} else{
				toast.error("Please full the fields")
			}
		})
		.catch(errors => {
			toast.error("Something went wrong.")
		}))
	}
	return(
		<>
			<div className="header-inner mb-5">
				<div>
					<div className="header-title">
						Add Payment
					</div>
					<div className="bc-list">
						<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ <Link to={{pathname: `/partner_companies`}}>Partner Companies</Link>/ {partner_company_name}
					</div>
				</div>
			</div>
			<div className="container">
				<div className="card">
					<div className="card-header">Add Partner Company</div>
					<div className="card-body">
						<form onSubmit={submitHandler}>
							<div className="form-group">
								<label htmlFor="exampleInputEmail1">Partner Company Name *</label>
								<input type="text"
											 className="form-control"
											 id="exampleInputEmail1"
											 aria-describedby="emailHelp"
											 name            ='partner_company_name'
											 defaultValue    = {partner_company_name}
											 onChange        = {partner_company_name_handler} />
							</div>
							<div className="form-group">
								<label htmlFor="exampleInputEmail2">Abbreviation Name *</label>
									<input type="text"
												 className="form-control"
												 id="exampleInputEmail2"
												 name= 'abbreviation_name'
												 defaultChecked = { abbreviation_name }
												 onChange       = { abbreviation_name_handler }/>
								<button type="submit" className="btn btn-primary submit_button mt-4">Add </button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	)

}

export default AddPartnerCompany