import React, {useEffect, useState} from "react";
import axios from "axios";
import {trackPromise} from "react-promise-tracker";
import { BrowserRouter as Router, Link, useLocation, useHistory,useParams} from "react-router-dom";
import { servicePath } from "../../constants/defaultValues";
import { toast } from 'react-toastify';
import "../../styles/custom/generic_listing.scss"

toast.configure();

const EditPartnerCompany = (props) => {
	const {id}                                            = useParams();
	const auth_token                                      = localStorage.getItem("auth_token");
	const apiUrl                                          = servicePath
	const use_history                                     = useHistory();
	const [partner_company, setPartnerCompany]            = useState({});
	const [partner_company_id,      setPartnerCompanyId]  = useState(id);

	useEffect(()=>{
		props.token(true)
		trackPromise(
			axios.get(
				apiUrl + `/admin_api/api/v1/partner_companies/${partner_company_id}.json`,{
					headers: {
						"AUTH-TOKEN" : auth_token
					}
				})
				.then(res => {
					if (res.status ==  200){
						setPartnerCompany(res.data.partner_company)
					} else{
						toast.error("Record not found")
					}
				})
				.catch(error => {
				})
		);
	},[])


	const partner_company_name_handler = (e) => {
		const {name, value} = e.target
		setPartnerCompany((preState) => ({
			...preState,
			[name]: value
		}))
	}
	const abbreviation_name_handler = (e) => {
		const {name, value} = e.target
		setPartnerCompany((preState) => ({
			...preState,
			[name]: value
		}))
	}

	const submitHandler = (e) => {
		e.preventDefault();
		const data = {
			"partner_company":{
				"partner_company_name":   `${partner_company.partner_company_name}`,
				"abbreviation_name":      `${partner_company.abbreviation_name}`
			}
		}
		trackPromise(axios.put(
			apiUrl + `/admin_api/api/v1/partner_companies/${partner_company_id}.json`,
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
				toast.error("Please fullfill the fields")
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
						Edit Partner Company
					</div>
					<div className="bc-list">
						<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ <Link to={{pathname: `/partner_companies`}}>Partner Companies</Link>/
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
								<input type            ="text"
											 className       ="form-control"
											 id              ="exampleInputEmail1"
											 aria-describedby="emailHelp"
											 name            ='partner_company_name'
											 defaultValue    ={partner_company.partner_company_name}
											 onChange        ={partner_company_name_handler} />
							</div>
							<div className="form-group">
								<label htmlFor="exampleInputEmail2">Abbreviation Name *</label>
									<input type            ="text"
												 className       ="form-control"
												 id              ="exampleInputEmail2"
												 name            ='abbreviation_name'
												 defaultChecked  ={ partner_company.abbreviation_name }
												 onChange        ={ abbreviation_name_handler }/>
								<button type="submit" className="btn btn-primary submit_button mt-4">Update </button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	)

}

export default EditPartnerCompany