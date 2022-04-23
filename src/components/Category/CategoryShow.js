import React, {useEffect, useState} from "react";
import {trackPromise} from "react-promise-tracker";
import axios from "axios"
import {servicePath} from "../../constants/defaultValues";
import ShowMoreText from "react-show-more-text";
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

const CategoryShow = (props) => {
	let   {id}                                      = useParams()
	const location                                  = useLocation()
	const history                                   = useHistory()
	const [category_id, setCategoryId]              = useState(id)
	const [category, setCategory]                   = useState({})
	const [categoryServices, setCategoryServices]   = useState([])
	const [categoryError, setCategoryError]         = useState('')
	let apiUrl                                      = servicePath
	let auth_token                                  = localStorage.getItem("auth_token")

	useEffect(()=>{
		props.token(true)
		trackPromise(
			axios.get(
				apiUrl + `/admin_api/api/v1/categories/${category_id}.json`,{
					headers: {
						"AUTH-TOKEN" : auth_token
					}
				})
				.then(res => {
					setCategory(res.data.category)
					setCategoryServices(res.data.category.category_services)
				})
				.catch(error => {
					setCategoryError(error)
				})
		);
	},[])
	return(
			<>
			<div className="header-inner mb-5">
				<div>
					<div className="header-title">
						Category Show
					</div>
					<div className="bc-list">
						<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ <Link to={{pathname: `/categories`}}>Categories</Link>/ {category.name}
					</div>
				</div>
			</div>
			<div className="container">
			<table className="table table-striped">
				<thead>
				<tr>
					<th>Id</th>
					<th>Name</th>
					<th>Services <span className="badge badge-light">{categoryServices.length}</span></th>
				</tr>
				</thead>
				<tbody>
				<td> {category.id}</td>
				<td style={{textTransform: 'capitalize'}}> {category.name}</td>
				<ShowMoreText
					/* Default options */
					lines={1}
					more="Show more"
					less="Show less"
					className="content-css"
					anchorClass="my-anchor-css-class"
					expanded={false}
					width={280}
				>
					<td>
						{categoryServices.map(service => {
						return(
							<ul>
								<li style={{textTransform: 'capitalize'}}>
									<span>{service.name}</span>,
								</li>
							</ul>
						)
						})}
					</td>
				</ShowMoreText>
				</tbody>
			</table>
		</div>
		</>
	)
}

export default CategoryShow