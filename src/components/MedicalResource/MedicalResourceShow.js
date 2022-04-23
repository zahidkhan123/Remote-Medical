import React, {useEffect, useState} from "react";
import {trackPromise, usePromiseTracker} from "react-promise-tracker";
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
import '../../styles/Dashboard/dashboard.scss'
import ShowMoreText from "react-show-more-text";
import {toast} from "react-toastify";
import Loader from "react-loader-spinner";

const MedicalResourceShow = (props) => {
	const { promiseInProgress }                               = usePromiseTracker();
	const {id}                                  					    = useParams()
	const location                                  					= useLocation()
	const history                                       			= useHistory()
	const [medical_resource_id, setMedicalResourceId]   			= useState(id)
	const [medical_resource, setMedicalResource]        			= useState({})
	let apiUrl                                      					= servicePath
	let auth_token                                  					= localStorage.getItem("auth_token")

	useEffect(()=>{
		props.token(true)
		trackPromise(
			axios.get(
				apiUrl + `/admin_api/api/v1/medical_resources/${medical_resource_id}.json`,{
					headers: {
						"AUTH-TOKEN" : auth_token
					}
				})
				.then(res => {
					if (res.status == 200){
						setMedicalResource(res.data.medical_resource)
					}else{
						toast.error("Record not found")
					}
				})
				.catch(error => {
					toast.error(error.response.data.message)
				})
		);
	},[])

	const executeOnClick =() => {
		console.log("adsasd")
	}

	const display_country_state = (adr) => {
		let value = ""
		if (adr.country_name != undefined  && adr.country_name != null && adr.country_name.length > 0 && adr.state != undefined  && adr.state != "null" && adr.state.length > 0){
			value = adr.country_name + ',' + adr.state
		}else if (adr.country_name != undefined  && adr.country_name != null && adr.country_name.length > 0){
			value = adr.country_name
		}
		return value
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
						Medical Resource Show
					</div>
					<div className="bc-list">
						<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ <Link to={{pathname: `/medical_resources`}}>Medical Resources</Link>/ {medical_resource.name}
					</div>
				</div>
			</div>
			<div className="container medical-show">
				<div className="row mt-2">
					<div className="col-6">
						<div className="card" style={{"width": "18rem;"}}>
							<div className="card-header">
								Contact Information
							</div>
							<table className="table table-striped ">
								<tbody>
									<tr>
										<td><strong>Name:</strong></td>
										<td className="text-capitalize">
											{ medical_resource.name }
										</td>
									</tr>
									<tr>
										<td><strong>Email:</strong></td>
										<td className="text-capitalize">
											{ medical_resource.email }
										</td>
									</tr>
									<tr>
										<td><strong>Phone Number:</strong></td>
										<td>
											{ medical_resource.phone }
										</td>
									</tr>
									<tr>
										<td><strong>Website:</strong></td>
										<td>
											{ medical_resource.website &&
												<a href={medical_resource.website} target="_blank">Open link</a>
											}
										</td>
									</tr>
									<tr>
										<td><strong>Address:</strong></td>
										<td className="text-capitalize">
											{ medical_resource.address }
										</td>
									</tr>
									<tr>
										<td><strong>24/7 Emergency Contact:</strong></td>
										<td>
											{ medical_resource.twenty_four_by_seven_emergency_contact }
										</td>
									</tr>
									<tr>
										<td><strong>Alternate Phone:</strong></td>
										<td>
											{ medical_resource.alternate_phone }
										</td>
									</tr>
									<tr>
										<td><strong>Fax Number:</strong></td>
										<td>
											{ medical_resource.fax_number }
										</td>
									</tr>
									<tr>
										<td><strong>Postal Code:</strong></td>
										<td>
											{ medical_resource.postal_code }
										</td>
									</tr>
									<tr>
										<td><strong>City:</strong></td>
										<td className="text-capitalize">
											{ medical_resource.city }
										</td>
									</tr>
									<tr>
										<td><strong>State:</strong></td>
										<td className="text-capitalize">
											{ medical_resource.state }
										</td>
									</tr>
									<tr>
										<td><strong>Country:</strong></td>
										<td className="text-capitalize">
											{ medical_resource.country }
										</td>
									</tr>
									{ medical_resource.instructions &&
									<tr>
										<td><strong>Notes:</strong></td>
										<td>
											{ medical_resource.instructions }
										</td>
									</tr>
									}
									{ medical_resource.preferred_service_areas &&
									<tr>
										<td><strong>Preferred Service Areas:</strong></td>
										<td>
											{ medical_resource.preferred_service_areas }
										</td>
									</tr>
									}
									{ medical_resource.other_service_areas &&
									<tr>
										<td><strong>Other Service Areas:</strong></td>
										<td>
											{ medical_resource.other_service_areas }
										</td>
									</tr>
									}
								</tbody>
							</table>
						</div>
					</div>

					<div className="col-6">
						<div className="card" style={{"width": "18rem;"}}>
							<div className="card-header">
								Poc Detail
							</div>
							<table className="table table-striped">
								<tbody>
								<tr>
									<td><strong>Poc Title:</strong></td>
									<td className="text-capitalize">
										{ medical_resource.poc_title }
									</td>
								</tr>
								<tr>
									<td><strong>Poc Name:</strong></td>
									<td className="text-capitalize">
										{ medical_resource.poc_name }
									</td>
								</tr>
								<tr>
									<td><strong>Poc Email:</strong></td>
									<td className="text-capitalize">
										{ medical_resource.poc_email }
									</td>
								</tr>
								<tr>
									<td><strong>Poc Mobile:</strong></td>
									<td>
										{ medical_resource.poc_mobile }
									</td>
								</tr>
								<tr>
									<td><strong>Poc Phone:</strong></td>
									<td>
										{ medical_resource.poc_phone }
									</td>
								</tr>
								</tbody>
							</table>
						</div>

						<div className="card mt-4" style={{"width": "18rem;"}}>
							<div className="card-header">
								Social Links
							</div>
							<table className="table table-striped social-links-table">
								<tbody>
								<tr>
									<td><strong>Website:</strong></td>
									<td>
										{ medical_resource.website &&
											<a href={ medical_resource.website } target="_blank"> Open link</a>
										}
									</td>
								</tr>
								<tr>
									<td><strong>Vendor Link:</strong></td>
									<td>
										{
											medical_resource.vendor_link &&
											<a href={ medical_resource.vendor_link} target="_blank"> Open link</a>
										}
									</td>
								</tr>
								<tr>
									<td><strong>Assessment Link:</strong></td>
									<td>
										{
											medical_resource.assessment_link &&
											<a href={ medical_resource.assessment_link } target="_blank">Open link</a>
										}
									</td>
								</tr>
								<tr>
									<td><strong>Agreement Link:</strong></td>
									<td>
										{ medical_resource.agreement_link &&
											<a href={medical_resource.agreement_link} target="_blank"> Open link</a>
										}
									</td>
								</tr>
								</tbody>
							</table>
						</div>
						<div className="card mt-4" style={{"width": "18rem;"}}>
							<div className="card-header">
								Parent Company
							</div>
							<table className="table table-striped social-links-table">
								<tbody>
									<tr>
										<td><strong>Parent Company Name:</strong></td>
										<td>
											{ medical_resource.parent_company_name &&
												<Link to={{pathname: `/medical_resource_show/${medical_resource.id}`}} target="_blank">{medical_resource.parent_company_name}</Link>
											}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
				<div className="row mt-4 mb-5">
					<div className="col-12">
						<div className="card" style={{"width": "18rem;"}}>
							<div className="card-header">
								Services Areas
							</div>
							<table className="table table-striped">
								<tbody>
								{ medical_resource.addresses && medical_resource.addresses.map((adr, index) => {
									return(
										<>
											<tr key={index}>
												{adr.is_preferred_service_areas &&
												<>
													{console.log(adr)}
													<td><strong>Preferred Service Areas:</strong></td>
													<td className="text-capitalize">
														{display_country_state(adr)}
													</td>
												</>
												}
											</tr>
											<tr key={index + index}>
												{adr.is_other_service_areas &&
												<>
													<td><stroyng>Other Service Areas:</stroyng></td>
													<td className="text-capitalize">
														{display_country_state(adr)}
													</td>
												</>
												}
											</tr>
										</>
									)
								})}
								</tbody>
							</table>
						</div>

					</div>
				</div>
				<div className="row mt-4">
					<div className="col-12">
						<div className="card">
							<div>
								<table className="table table-striped entity-detail-show">
									<thead>
									<th>Medical Resource Entity</th>
									<th>Category/Services</th>
									</thead>
									<tbody>
									{ medical_resource.medical_resource_entities && medical_resource.medical_resource_entities.map((entity, index) => {
										return(
											<tr>
												<td className="align-top">
													<strong className="text-capitalize d-block mb-2">{entity.entity_name && entity.entity_name}</strong>
												</td>
												<td>
													<ul>
														{ entity.categories && entity.categories.map((entity_category, index) => {
															return(
																<li key={index} className="mb-3">
																	<strong className="text-capitalize d-block mb-2">{entity_category.name && entity_category.name}</strong>
																	<ul>
																		<ShowMoreText
																			/* Default options */
																			lines={1}
																			more='Show more'
																			less='Show less'
																			className='content-css'
																			anchorClass='my-anchor-css-class'
																			onClick={executeOnClick}
																			expanded={false}
																			width={280}
																		>
																			{
																				entity_category.services && entity_category.services.map((entity_service, i) => {
																					return(
																						<li key={i} className="text-capitalize">{entity_service.name}</li>
																					)
																				})}
																		</ShowMoreText>
																	</ul>
																</li>
															);
														})
														}
													</ul>
												</td>
											</tr>
										);
									})
									}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
				<div className="row mt-4 mb-5">
					<div className="col-4">
						<div className="card" style={{"width": "18rem;"}}>
							<div className="card-header">
								Payments
							</div>
							<table className="table table-striped">
								<tbody>
								<tr>
									{ medical_resource.medical_resource_payments && medical_resource.medical_resource_payments.map((payment, index) => {
										return(
											<td className="text-capitalize">
											<span key={payment.id} style={{paddingLeft: '3px'}}>
												{payment.name + ","}
											</span>
											</td>
										)
									})}
								</tr>
								</tbody>
							</table>
						</div>
						<div className="card" style={{"width": "18rem;"}}>
								<div className="card-header">
									Languages Spoken
								</div>
								<table className="table table-striped">
									<tbody>
									<tr>
										<td className="text-capitalize">
										{ medical_resource.languages_spoken &&
												<span>
													{ medical_resource.languages_spoken }
												</span>
										}
										</td>
									</tr>
									</tbody>
								</table>
							</div>
						</div>
					<div className="col-8 mb-5">
						<div className="card" style={{"width": "18rem;"}}>
								<div className="card-header">
									Contract Details
								</div>
								<table className="table table-striped">
									<tbody>
									{ medical_resource.audit_sent &&
										<tr>
											<td><strong>Audit Sent:</strong></td>
											<td>
												{ medical_resource.audit_sent }
											</td>
										</tr>
									}

									{ medical_resource.audit_returned &&
										<tr>
											<td><strong>Audit Returned:</strong></td>
											<td>
												{ medical_resource.audit_returned }
											</td>
										</tr>
									}
									
									{ medical_resource.contract_expiration_date &&
										<tr>
											<td><strong>Contact Expiration Date:</strong></td>
											<td>
												{ medical_resource.contract_expiration_date }
											</td>
										</tr>
									}

									{ medical_resource.initial_contact &&
										<tr>
											<td><strong>Intial Contact:</strong></td>
											<td>
												{ medical_resource.initial_contact }
											</td>
										</tr>
									}

									{ medical_resource.initial_sa_returned &&
										<tr>
											<td><strong>Intial Sa Returned:</strong></td>
											<td>
												{ medical_resource.initial_sa_returned }
											</td>
										</tr>
									}

									{ medical_resource.initial_sa_sent &&
										<tr>
											<td><strong>Intial Sa Sent:</strong></td>
											<td>
												{ medical_resource.initial_sa_sent }
											</td>
										</tr>
									}
									{ medical_resource.rmi_audit_review &&
										<tr>
											<td><strong>Rmi Audit Review:</strong></td>
											<td>
												{ medical_resource.rmi_audit_review }
											</td>
										</tr>
									}
									{ medical_resource.rmi_sa_review &&
										<tr>
											<td><strong>Rmi Sa Review:</strong></td>
											<td>
												{ medical_resource.rmi_sa_review }
											</td>
										</tr>
									}
									{ medical_resource.rmi_signature &&
										<tr>
											<td><strong>Rmi Signature:</strong></td>
											<td>
												{ medical_resource.rmi_signature }
											</td>
										</tr>
									}
									{ medical_resource.vendor_signature &&
										<tr>
											<td><strong>Vendor Signature:</strong></td>
											<td>
												{ medical_resource.vendor_signature }
											</td>
										</tr>
									}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

		</>
	)
}

export default MedicalResourceShow