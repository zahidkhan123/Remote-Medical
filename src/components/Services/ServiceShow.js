import React, {useEffect, useState} from "react";
import {trackPromise} from "react-promise-tracker";
import axios from "axios"
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
const ServiceShow= (props) => {
  	const {id}                                    	= useParams()
  	const location                                  = useLocation()
    const [service_id, setServiceId]                = useState(id)
    const [service, setService]                     = useState([])
    const [serviceCategories, setServiceCategories] = useState([])
    const [serviceError,setServiceError]            = useState('')
    let apiUrl                                      = servicePath
    let auth_token                                  = localStorage.getItem("auth_token")


    useEffect(() => {
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
                    setService(res.data.service)
                    setServiceCategories(res.data.service.categories)
                })
                .catch(errors => {
                    setServiceError(errors)
                })
        )

    },[])

    return(
    	<>
				<div className="header-inner mb-5">
					<div>
						<div className="header-title">
							Service Show
						</div>
						<div className="bc-list">
							<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ <Link to={{pathname: `/services`}}>Services</Link>/
						</div>
					</div>
				</div>
				<div className="container">
					<table className="table table-striped">
						<thead>
						<tr>
							<th>Id</th>
							<th>Name</th>
							<th>Categories <span className="badge badge-light">{serviceCategories.length}</span></th>
						</tr>
						</thead>
						<tbody>
					<td> {service.id}</td>
					<td style={{textTransform: 'capitalize'}}> {service.name}</td>
					<td> {serviceCategories.map(category => {
						return(
							<ul className="listing">
								<li style={{textTransform: 'capitalize'}}>
									{category.name}
								</li>
							</ul>
						)
					})}</td>
					</tbody>
					</table>
				</div>
			</>
    )
}

export default ServiceShow