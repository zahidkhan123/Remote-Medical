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

toast.configure();
const ParentCompanyList = (props) => {

	const apiUrl                                       = servicePath
	const auth_token                                   = localStorage.getItem("auth_token")
	const [partner_companies,setPartnerCompanies]      = useState([])
	const [page,setPage]                               = useState(null)
	const [per_page, setPerPage]                       = useState(null)
	const [next_page_exist, setNextPage_Exist]         = useState(false)
	const [previous_page_exist, setPreviousPage_Exist] = useState(false)
	const [total_pages_count, setTotalPagesCount]      = useState(null)
	const [total_records, setTotalRecords]             = useState(null)
	const {promiseInProgress}                          = usePromiseTracker()

	useEffect(() => {
		props.token(true)
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/partner_companies.json",{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)	.then(response => {
				if (response.status ==  200){
					if (response.data.partner_companies.length > 0){
						setPartnerCompanies(response.data.partner_companies)
						setPage(response.data.paging_data.page)
						setPerPage(response.data.paging_data.per_page)
						setNextPage_Exist(response.data.paging_data.next_page_exist)
						setPreviousPage_Exist(response.data.paging_data.previous_page_exist)
						setTotalPagesCount(response.data.paging_data.total_pages)
						setTotalRecords(response.data.paging_data.total_records)
					}else{
						toast.error("Record not found.")
					}
				}else{
					toast.error("Record not found.")
				}
			}).catch(error => {
				toast.error("Something went wrong.")
			})
		)
	},[])

	const changeHandler = () => {}

	const searchHandler =(event)=> {
		event.preventDefault();
		const data = event.target.partner_company_name.value;
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/partner_companies.json?search_data=" + data,{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
			.then(res => {
				if (res.status == 200 && res.data.partner_companies.length > 0 ){
					setPartnerCompanies(res.data.partner_companies)
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
						Partner Companies
					</div>
					<div className="bc-list">
						<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ Partner Companies
					</div>
				</div>
				<div className="button-add">
					<Link to={{pathname: `/add_partner_company`}} className="btn btn-primary"> <FontAwesomeIcon icon="plus" /> Add Partner Company</Link>
				</div>
			</div>
			<div className="container">
				<div className="row mb-3 mt-3">
					<form className="form-inline" onSubmit={searchHandler}>
						<div className="form-group mx-sm-3 mb-2 ">
							<input type="search"
										 className="form-control"
										 placeholder="Search Partner Company"
										 id="searchCategory"
										 aria-describedby="emailHelp"
										 name            ='partner_company_name'
										 onChange        = {changeHandler} />
						</div>
						<button type="submit" className="btn btn-primary submit_button mb-2">Search</button>
					</form>
				</div>
				<table className="table table-striped">
					<thead>
					<tr>
						<th>Id</th>
						<th>Partner Company Name</th>
						<th>Abbreviation Name</th>
						<th style={{textAlign: 'center'}}>Actions</th>
					</tr>
					</thead>
					<tbody>
					{partner_companies.map(partner_company => {
						return (
							<>
								<tr key={partner_company.id}>
									<td> {partner_company.id}  </td>
									<td style={{textTransform: 'capitalize', textAlign: 'left'}}>
										{partner_company.partner_company_name}
									</td>
									<td style={{textTransform: 'capitalize', textAlign: 'left'}}>
										{partner_company.abbreviation_name}
									</td>
									<td>
										<div className="btn-group action-buttons" role="group" aria-label="Basic example">
											<Link to={{pathname: `/edit_partner_company/${partner_company.id}`, state: {partner_company: partner_company}}}
														class="btn btn-outline-primary">Edit</Link>
											<Link to={{pathname: `/show_partner_company/${partner_company.id}`, state: {partner_company: partner_company}}}
														class="btn btn-outline-success">Show</Link>
											{/*<Link to="" onClick={ e => {deleteHandler(e,page)}} id={partner_company.id} class="btn btn-outline-danger">Delete</Link>*/}
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
						// onChange={event => {paginationHandler(event)}}
						styling="default"
					/>
				</div>
			</div>
		</>
	)
}

export default ParentCompanyList