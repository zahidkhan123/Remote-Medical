import React, {useEffect, useState} from "react";
import {trackPromise, usePromiseTracker} from "react-promise-tracker";
import axios from "axios"
import "bootstrap/dist/css/bootstrap.min.css"
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { ToastContainer, toast } from 'react-toastify';
import "../../styles/custom/generic_listing.scss"
import { servicePath } from "../../constants/defaultValues";
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
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faCheckSquare, faCoffee,faPlus } from '@fortawesome/free-solid-svg-icons'
import Pagination from "reactive-pagination";
import Loader from "react-loader-spinner";
library.add(fab, faCheckSquare, faCoffee,faPlus)
toast.configure();

const CategoryList = (props) => {
	const { promiseInProgress }                     = usePromiseTracker();
	const [is_category_delete, setIsCategoryDelete] = useState(false)
	const [categories, setCategories] = useState([])
	const [categoriesError, setCategoriesError] = useState('')
	const [categoryDeleteError, setCategoryDeleteError] = useState('')
	const successfullyDeleted = () => toast.error("Category Successfully Deleted");
	let   auth_token = localStorage.getItem("auth_token")
	let   apiUrl     = servicePath
	const [page,setPage]                               = useState(null)
	const [per_page, setPerPage]                       = useState(null)
	const [next_page_exist, setNextPage_Exist]         = useState(false)
	const [previous_page_exist, setPreviousPage_Exist] = useState(false)
	const [total_pages_count, setTotalPagesCount]      = useState(null)
	const [total_records, setTotalRecords]             = useState(null)

	useEffect(()=>{
		props.token(true)

		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/categories.json",{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
			.then(res => {
				setCategories(res.data.categories)
				setPage(res.data.paging_data.page)
				setPerPage(res.data.paging_data.per_page)
				setNextPage_Exist(res.data.paging_data.next_page_exist)
				setPreviousPage_Exist(res.data.paging_data.previous_page_exist)
				setTotalPagesCount(res.data.paging_data.total_pages)
				setTotalRecords(res.data.paging_data.total_records)
			})
			.catch(error =>{
				setCategoriesError(error)
			})
		);
	},[])
	

	const deleteHandler = (event,page) => {
		let e = event
		e.preventDefault();
		const id = e.target.id
		trackPromise(
			axios.get( `${apiUrl}/admin_api/api/v1/categories/${id}/before_delete_verification.json`,{
				headers: {
					"AUTH-TOKEN": auth_token
				}
			})
			.then(res => {
				if (res.status ==  200){
					confirmAlert({title: "Not able to delete", message: res.data.message})
				}else if (res.status ==  204){
					confirmAlert({
						title: 'Confirm to Delete',
						message: 'Are you sure you want to delete this category?',
						buttons: [
							{
								label: 'Yes',
								onClick: () => {
									trackPromise(
										axios.delete( `${apiUrl}/admin_api/api/v1/categories/${id}.json`,{
											headers: {
												"AUTH-TOKEN": auth_token
											}
										})
										.then(res => {
											if (res.status ==  200){
												successfullyDeleted()
												paginationHandler(page)
											} else{
												toast.error("Record not found!")
											}
										})
										.catch(errors => {
											setCategoryDeleteError(errors)
										})
									)
								}
							},
							{
								label: 'No'
							}
						]
					});
				} else{
					console.log("aaaaa")
				}
			})
			.catch(errors => {
				setCategoryDeleteError(errors)
			})
		)
	}

	const paginationHandler = (event) => {
		let page_number = event
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/categories.json?page=" + page_number,{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
				.then(res => {
					if (res.status == 200){
						setPage(page_number)
						setCategories(res.data.categories)
					} else{
						toast.error("Record not found!")
					}
				})
				.catch(error =>{
					setCategoriesError(error)

				})
		);

	}

	const changeHandler = () => {

	}

	const searchHandler =(event)=> {
		event.preventDefault();
		const data = event.target.category_name.value;
		trackPromise(
			axios.get(
				apiUrl + "/admin_api/api/v1/categories.json?search_data=" + data,{
					headers: {
						"AUTH-TOKEN": auth_token
					}
				}
			)
				.then(res => {
					if (res.status == 200 && res.data.categories.length > 0 ){
						setCategories(res.data.categories)
					} else{
						toast.error("Record not found!")
					}
				})
				.catch(error =>{
					setCategoriesError(error)
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
						Categories
					</div>
					<div className="bc-list">
						<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ Categories
					</div>
				</div>
				<div className="button-add">
					<Link to={{pathname: `/add_category`}} className="btn btn-primary"> <FontAwesomeIcon icon="plus" /> Add Category</Link>
				</div>
			</div>
			<div className="container">
				<div className="row mb-3 mt-3">
					<form className="form-inline" onSubmit={searchHandler}>
						<div className="form-group mx-sm-3 mb-2 ">
							<input type="search"
										 className="form-control"
										 placeholder="Search Category"
										 id="searchCategory"
										 aria-describedby="emailHelp"
										 name='category_name'
										 onChange={changeHandler}/>
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
					{categories.map(category => {
						return (
							<>
								<tr key={category.id}>
									<td>{category.id}</td>
									<td style={{textTransform: 'capitalize', textAlign: 'left'}}>
										{category.name}
									</td>
									<td style={{textTransform: 'capitalize', textAlign: 'left'}}>
										{category.is_active ? "Yes" : "No"}
									</td>
									<td>
										<div className="btn-group action-buttons" role="group" aria-label="Basic example">
											<Link to={{pathname: `/edit_category/${category.id}`, state: {category: category}}}
														class="btn btn-outline-primary">Edit</Link>
											<Link to={{pathname: `/show_category/${category.id}`, state: {category: category}}}
														class="btn btn-outline-success">Show</Link>
											<Link to="" onClick={ e => deleteHandler(e,page)} id={category.id} class="btn btn-outline-danger">Delete</Link>
										</div>
									</td>
								</tr>
							</>
						)
					})}
					</tbody>
				</table>
				<div className="mt-2 pagination-handler">
					{categories && categories.length > 0 &&
					< Pagination
						activePage={page}
						itemsCountPerPage={per_page}
						totalItemsCount={total_records}
						delimeter={5}
						onChange={event => {
							paginationHandler(event)
						}}
						styling="default"
					/>
					}
				</div>
			</div>

		</>
	)
}

export default CategoryList