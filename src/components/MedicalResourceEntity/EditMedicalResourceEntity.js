import React, { useEffect, useState } from "react";
import axios from "axios";
import {trackPromise, usePromiseTracker} from 'react-promise-tracker';
import { Multiselect } from "multiselect-react-dropdown";
import { ToastContainer, toast } from "react-toastify";
import NavBar from "../nav_bar";
import { servicePath } from "../../constants/defaultValues";
import { Form, Col,Row} from "react-bootstrap";
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
import {useDropzone} from 'react-dropzone'
import Loader from "react-loader-spinner";
import Tooltip from 'react-tooltip-lite';


toast.configure();

const EditMedicalResourceEntity = (props) => {
	const {id} = useParams()
	const location = useLocation()
	const history = useHistory()
	const [medical_resource_entity, setMedicalResourceEntity] = useState({});
	const [entity_name, setEntityName] = useState("");
	const [component_rerender, setComponentRerender] = useState(0)
	const [is_active, setIsActive] = useState(false);
	const [categories, setCategories] = useState([]);
	const [category_services, setCategoryServices] = useState([]);
	const [selected_services, setSelectedServices] = useState([]);
	const [update_component, setUpdateComponent] = useState(false);
	const [test, setTest] = useState(false);
	const { promiseInProgress } = usePromiseTracker();
	const serviceSuccessfullyAdded = () => toast.success("Medical Resource entity successfully addded");
	const notifyNoServices = () => toast.error("Please select atleast one service for each category");
	const notifyNoCategories = () => toast.error("Please select atleast one category");
	const [error, setError] = useState("");
	let apiUrl = servicePath;
	let auth_token = localStorage.getItem("auth_token");
	const [files, setFiles] = useState([]);
	const [image, setImage] = useState(null);
	const notifyimageerror  = () => toast.error("Please select image size less than 1 mb file");
	const notifyimagemultipleerror  = () => toast.error("Please select single image");




	const {getRootProps, getInputProps} = useDropzone({
		accept: 'image/*',
		onDrop: acceptedFiles => {
			if (acceptedFiles[0].size < 1000000) {
				if(acceptedFiles.length == 1){
					setFiles(acceptedFiles.map(file => Object.assign(file, {
						preview: URL.createObjectURL(file)
					})));
				}
				else{
					notifyimagemultipleerror();
				}
			}
			else{
				setFiles([]);
        notifyimageerror();
			}
		}
	});


	function dataURItoBlob(dataURI) {
// convert base64/URLEncoded data component to raw binary data held in a string
		var byteString;
		if (dataURI.split(',')[0].indexOf('base64') >= 0){
			byteString = dataURI.split(',')[1];
		}
		else{
			byteString = unescape(dataURI.split(',')[0]);
		}
// separate out the mime component
		var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
// write the bytes of the string to a typed array
		var ia = new Uint8Array(byteString.length);
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}
		return new Blob([ia], {type:mimeString});
	}

	const getMedicalResourceEntity = async () => {
		let entityData = {};
		await axios
			.get(
				apiUrl + `/admin_api/api/v1/medical_resource_entities/${id}/edit.json`,
				{
					headers: {
						"AUTH-TOKEN": auth_token,
					},
				}
			)
			.then((response) => {
				entityData = response.data.medical_resource_entity;
				setEntityName(entityData.entity_name);
				setImage(response.data.medical_resource_entity.image);
// setFiles(oldArray => [...oldArray, response.data.medical_resource_entity.image]);
			})
			.catch((error) => {
				toast.error(error.response.data.message)
			});
		return entityData;
	}

	useEffect(() => {
		props.token(true);
		const fetchData = async () => {
			const data = await getMedicalResourceEntity();
			setMedicalResourceEntity(data);
			setCategoryServices(data.categories)
		};

		fetchData();

		async function categoryServices() {
			await axios
				.get(
					apiUrl + "/admin_api/api/v1/categories/categories_with_services.json",
					{
						headers: {
							"AUTH-TOKEN": auth_token,
						},
					}
				)
				.then((response) => {
					setCategories(response.data.categories);
				})
				.catch((error) => {
					setError(error);
				});
		}
		categoryServices();



	}, []);

	const truncate =(str) =>  {
		return str.length > 25 ? str.substring(0, 10) + "..." : str;
	}

	const call_medical_resource_entity_category_services = async (event) => {
		let id = event[event.length - 1].id;
		axios
			.get(
				apiUrl + `/admin_api/api/v1/categories/${id}/category_services.json`,
				{
					headers: {
						"AUTH-TOKEN": auth_token,
					},
				}
			)
			.then((response) => {
// setCategoryServices(response.data.category_services)
				setCategoryServices(prevState => [
					...prevState,
					{
						category_id: id,
						category_name: response.data.category_services[0].category_name,
						services: response.data.category_services,
					}
				]);
				setUpdateComponent(currentIsActive => !currentIsActive);
			})
			.catch((error) => {
				setError(error);
			});
	};

	useEffect( () => {
	},[update_component])

	const selected_categories = (medical_resource_entity_categories) => {
		let selected_catrgory_names = [];
		if (medical_resource_entity_categories && medical_resource_entity_categories.length > 0) {
			medical_resource_entity_categories.map(
				(x) => { selected_catrgory_names.push({ category_name: x.category_name, id: x.category_id })} );
		}
		return selected_catrgory_names;
	};

	const changeHandler = (event) => {
		setEntityName(event.target.value);
	};

	const changeCheckBoxHandler = (event) => {
		if (event.target.checked) {
			event.target.value = true;
			setIsActive(true);
		}
		else {
			event.target.value = false;
			setIsActive(false);
		}
	}

	const serviceCheckBoxHandler = (event,category) => {
		console.log(category)
		let selected_category = category
		if (event.target.checked) {
//let service_id = event.target.nextSibling.value;
			let service_id = event.target.nextSibling.id;
			category_services.forEach( (single_cat) => {
				if(category.category_id == single_cat.category_id) {
					single_cat.services.forEach((single_service) => {
						if (single_service.service_id == service_id) {
							single_service.is_active = true;
						}
					})
				}
			})
		}
		else {
			let service_id = event.target.nextSibling.id;
			category_services.forEach( (single_cat) => {
				if(category.category_id == single_cat.category_id){
					single_cat.services.forEach( (single_service) => {
						if (single_service.service_id == service_id) {
							single_service.is_active = false;
						}
					})
				}
			})
		}
// setComponentRerender(component_rerender + 1);
		setUpdateComponent((oldState) => !oldState );
	};


	const render_category_name = (category) => {
		let category_name_html = <>
			<Col md={12} className="mb-3">
				<b>{category.category_name.toUpperCase()}</b>
				<input type="hidden" name="medical_resource_entity[categories][][category_id]" value={category.category_id} />
			</Col>
		</>;
		return category_name_html;
	};

	const render_single_category_services = (single_category) => {
		let services_html = [];
		services_html.push(render_category_name(single_category));
		single_category.services.map((service_obj) => {
			services_html.push(
				<>
					<Col md={4}>
						<label className="checkbox-container add-form-labels add-form-checkbox-label-container">
						{/*<label className="form-check form-check-inline">*/}
							<input
								type="checkbox"
								className="form-check-input"
								name="is_active"
								defaultChecked={service_obj.is_active}
								onClick={e => {serviceCheckBoxHandler(e,single_category)}}
							/>
							{
								service_obj.is_active ? (<><input type="hidden"
																								defaultValue={service_obj.service_id}
																								name="medical_resource_entity[categories][][services][][service_id]"
																								id={service_obj.service_id}/>
																								<input type="hidden"
																											 id={service_obj.service_id}
																											 defaultValue={service_obj.is_active}
																											 name="medical_resource_entity[categories][][services][][is_active]"
																								/>
																								</>)
																								: (<>
																								<input type="hidden"
																											 id={service_obj.service_id}
																											 defaultValue={service_obj.service_id}
																											 name="medical_resource_entity[categories][][services][][service_id]"
																								/>
																								<input type="hidden"
																									id={service_obj.service_id}
																									defaultValue={service_obj.is_active}
																									name="medical_resource_entity[categories][][services][][is_active]"
																									/>
																								</>)
							}
							<Tooltip content={service_obj.service_name}>
								<span className="text-capitalize">{truncate(service_obj.service_name)}</span>
							</Tooltip>
							<span className="checkmark entity-checkbox"></span>
						</label>
					</Col>
				</>
			);
		});
		return services_html;
	}

	const render_single_service_html = (temp_category_services) => {
		let services_html = [];
		temp_category_services.map((single_category) => {
			services_html.push(
				<div className="card mt-4">
					<div className="card-body">
						<Row>
							{render_single_category_services(single_category)}
						</Row>
					</div>
				</div>
			);
		});

		return services_html;
	};

	const render_category_services = (temp_category_services) => {
		let category_services_html = <></>;
		if (Object.keys(temp_category_services).length) {
			category_services_html = (
				<>
					{render_single_service_html(temp_category_services)}
				</>
			);
		}
		return category_services_html;
	};

	const remove_category_services = (selectedList, removedItem) =>{
		const updated_category_services = category_services.filter( (item) => removedItem.id != item.category_id )
		setCategoryServices(updated_category_services)
	}

	const services_validation = () => {
		let services_check = 0;
		for(let count=0; count < category_services.length; count++){
			let services = category_services[count].services;
			let check=0;
			for(let service_count=0; service_count < services.length; service_count++){
				if(services[service_count].is_active){
					check++;
				}
			}
			if(check > 0){
				continue;
			}
			else{
				services_check++;
				break;
			}
		}
		if(services_check == 0){
			return true;
		}
		else{
			return false;
		}
	}

	const thumbs = files.map(file => (
		<div className="thumb" key={file.name}>
			{console.log(file)}
			<div className="thumbInner">
				<img
					src={file.preview}
					className="dropzone-img"
				/>
			</div>
		</div>
	));

	const submitHandler = (event) => {
		event.preventDefault();
		if(category_services.length > 0){
			if(services_validation()){
				let formData = new FormData(event.target)
				if(Object.keys(files).length > 0){
					formData.append('medical_resource_entity[image]', files[0], files[0].name);
				}
				let array=[];
				let category_array=[];
				for(let i=0; i < category_services.length; i++){
					let service_array=[];
					for(let j=0; j < category_services[i].services.length; j++){
						let service = {};
						if(category_services[i].services[j].is_active){
							service = {
								"service_id": category_services[i].services[j].service_id
							}
							service_array.push(service);
						}
					}

					let category={
						"category_id": category_services[i].category_id,
						"services": service_array
					}
					category_array.push(category);
				}
				let id= "";
				trackPromise(
					axios.put(
						apiUrl + `/admin_api/api/v1/medical_resource_entities/${medical_resource_entity.id}.json`,
						formData,
						{
							headers: {
								"AUTH-TOKEN": auth_token
							}
						}
					)
					.then(res =>{
						serviceSuccessfullyAdded()
						history.push("/medical_resource_entities")
					})
					.catch(errors => {
						toast.error(errors.response.data.message)
						// setError(errors)
					})
				);
			}
			else{
				notifyNoServices();
			}
		}
		else{
			notifyNoCategories();
		}
	}

	const render_resource_entity_page = () => {
		let resource_entity_html = (
			<>
				<div className="header-inner mb-5">
					<div>
						<div className="header-title">
							Edit Medical Resource Entity
						</div>
						<div className="bc-list">
							<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/<Link to={{pathname: `/medical_resource_entities`}}>Medical Resource Entities</Link>/
						</div>
					</div>
				</div>
				<div className="container">
					<div className="card">
					<div className="card-header">Edit {medical_resource_entity.entity_name}</div>
					<div className="card-body">
						<form onSubmit={submitHandler}>
							<div className="form-group">
								<label htmlFor="exampleInputEmail1">
									Medical Resource Entity Name *
								</label>
								<input
									type="text"
									className="form-control"
									required="true"
									id="exampleInputEmail1"
									aria-describedby="emailHelp"
									name="medical_resource_entity[entity_name]"
									defaultValue={medical_resource_entity.entity_name}
									onChange={changeHandler}
								/>
							</div>
							<section className="container">
								<div {...getRootProps()} className="dropzone-container">
									<input {...getInputProps()}/>
									{
										<p>Drop some files here, or click *</p>
									}
								</div>
								<aside className="thumbsContainer">
									{thumbs}
								</aside>
								{
									image && Object.keys(files).length == 0 &&
									<aside className="thumbsContainer">
										<div className="thumb">
											<div className="thumbInner">
												<img
													src={image}
													className="dropzone-img"
												/>
											</div>
										</div>
									</aside>
								}
							</section>
							<div className="form-group">
								<label htmlFor="selection">
									Categories *
								</label>
								<Multiselect
									id="selection"
									options={categories}
									displayValue="category_name"
									placeholder="Select Category"
									style={{chips: {background: "#228CAA", "text-transform": "capitalize"},optionContainer: { "text-transform": "capitalize"}}}
									selectedValues={ selected_categories(category_services) }
									onSelect={e => {
										call_medical_resource_entity_category_services(e, medical_resource_entity.medical_resource_entity_categories)
									}}
									onRemove={remove_category_services}
								/>
							</div>
							<div className="form-group">
								{render_category_services(category_services)}
							</div>
							<button type="submit" className="btn btn-primary submit_button">Update Medical Resource Entity</button>
						</form>
					</div>
				</div>
				</div>
			</>
		);
		return resource_entity_html;
	};

	if (Object.keys(medical_resource_entity).length) {
		return (
			<>{promiseInProgress ? (<div
					style={{
						width: "100%",
						height: "100",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						position: "absolute",
						top: "240px"
					}}>
					<Loader type="Circles" color="#2BAD60" height="150" width="150"/>
				</div>) :
				render_resource_entity_page()}</>
		);
	}
	else {
		return <></>
	}

};

export default EditMedicalResourceEntity;