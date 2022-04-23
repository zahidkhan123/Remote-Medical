import React, { useEffect, useState,useCallback } from "react";
import axios from "axios";
import {trackPromise, usePromiseTracker} from 'react-promise-tracker';
import { Multiselect } from "multiselect-react-dropdown";
import { ToastContainer, toast } from "react-toastify";
import NavBar from "../nav_bar";
import { servicePath } from "../../constants/defaultValues";
import Loader from "react-loader-spinner";
import { Form, Row,Col} from "react-bootstrap";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useLocation,
  useHistory,
} from "react-router-dom";
import {useDropzone} from 'react-dropzone'
import Tooltip from 'react-tooltip-lite';


toast.configure();

const AddMedicalResourceEntity = (props) => {
	const history = useHistory()
  const [entity_name, setEntityName]             = useState("");
  const [update_component, setUpdateComponent]    = useState(false)
  const [component_rerender, setComponentRerender]= useState(0)
  const [is_active, setIsActive]                 = useState(false);
  const [categories, setCategories]              = useState([]);
  const [category_services, setCategoryServices] = useState([]);
	const [selected_services, setSelectedServices] = useState([]);
  const { promiseInProgress } = usePromiseTracker();
  const [image, setImage] = useState(null);
  const [loader, setLoader] = useState(false);
	const serviceSuccessfullyAdded = () => toast.success("Medical Resource entity successfully addded");
  const [error, setError]                        = useState(false);
  let apiUrl                                     = servicePath;
  let auth_token                                 = localStorage.getItem("auth_token");
  const notifyNoServices                         = () => toast.error("Please select atleast one service for each category");
  const notifyNoCategories                       = () => toast.error("Please select atleast one category");
  const notifyNoImage                       = () => toast.error("Please select image file");
  const notifyimageerror                       = () => toast.error("Please select image size less than 1 mb file");
  const unique_service_error                       = () => toast.error("You cannot create medical resource entity with this name it already exist");
	const notifyimagemultipleerror  = () => toast.error("Please select single image");
  const [files, setFiles] = useState([]);


  const {getRootProps, getInputProps} = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
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


  const thumbs = files.map(file => (
    <div className="thumb" key={file.name}>
      <div className="thumbInner">
        <img
          src={file.preview}
          className="dropzone-img"
        />
      </div>
    </div>
  ));

  useEffect(() => {
    props.token(true);
    files.forEach(file => URL.revokeObjectURL(file.preview));
      axios
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
        })
  }, [component_rerender,files]);

  const changeHandler = (event) => {
    setEntityName(event.target.value);
  };

  const changeCheckBoxHandler = (event) => {
  	if (event.target.checked) {
			event.target.value = true;
			setIsActive(true);
		}
		else  {
			event.target.value = false;
			setIsActive(false);
		}
  }

  const truncate =(str) =>  {
		return str.length > 25 ? str.substring(0, 10) + "..." : str;
	}

  const serviceCheckBoxHandler = (event, category) => {
  	if (event.target.checked) {
  		let service_id = event.target.nextSibling.value;
  		category_services.forEach( (single_cat) => {
  			if (single_cat.category_id == category.category_id) {
					single_cat.services.forEach( (single_service) => {
						if (single_service.service_id == service_id) {
							single_service.is_active = true;
						}
					})
				}
			})
		}
  	else {
			let service_id = event.target.nextSibling.value;
			category_services.forEach( (single_cat) => {
				if (single_cat.category_id == category.category_id) {
					single_cat.services.forEach((single_service) => {
						if (single_service.service_id == service_id) {
							single_service.is_active = false;
						}
					});
				}
			});
		}

		setComponentRerender(component_rerender + 1);
  };

  const call_medical_resource_entity_category_services = async (event) => {
    let id = event[event.length - 1].id;
    setUpdateComponent(false)
    await axios
      .get(
        apiUrl + `/admin_api/api/v1/categories/${id}/category_services.json`,
        {
          headers: {
            "AUTH-TOKEN": auth_token,
          },
        }
      )
      .then((response) => {
      	category_services.push({
          category_id:     id,
					category_name:   response.data.category_services[0].category_name,
          services:        response.data.category_services,
        });
        response.data.category_services.filter( x => {
					if (x.is_active){
						selected_services.push({"service_id": x.service_id});
					}
				})
				setUpdateComponent(true)
      })
      .catch((error) => {

				toast.error(error.response.data.message)
      });
  };

	 useEffect( () => {

	 },[update_component])

  const render_category_name = (category) => {
		let category_name_html = <>
      <Col md={12} className="mb-3">
        <b>{category.category_name.toUpperCase()}</b>
        <input type="hidden" name="medical_resource_entity[categories][][category_id]" value={category.category_id} className="medical_category_id" />
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
                onClick={ e => {serviceCheckBoxHandler(e,single_category)} }
              />
              {
                service_obj.is_active ? <input type="hidden" defaultValue={service_obj.service_id} name="medical_resource_entity[categories][][services][][service_id]" /> : <input type="hidden" />
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

  const render_single_service_html = () => {
    let services_html = [];

    category_services.map((single_category) => {
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

  const render_category_services = () => {
    let category_services_html = <></>;

    if (Object.keys(category_services).length) {
      category_services_html = (
        <>
					{render_single_service_html()}
        </>
      );
    }

    return category_services_html;
  };

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



  const remove_category_services = (selectedList, removedItem) =>{
		const update_category_services = category_services.filter( (item) => removedItem.id != item.category_id )
		setCategoryServices(update_category_services)
  }
  

	const submitHandler = (event) => {
    event.preventDefault();
    if(category_services.length > 0){
      if(services_validation()){
        let formData = new FormData(event.target)
        if(Object.keys(files).length > 0){
          setLoader(true);
          formData.append('medical_resource_entity[image]', files[0], files[0].name);
          trackPromise(
            axios.post(
              apiUrl + "/admin_api/api/v1/medical_resource_entities.json",
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
                if(errors.response.status == 400){
                  unique_service_error();
                  // setError(errors)
                }
              })
          )
        }
        else{
            notifyNoImage();
        }
      }
      else {
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
			<div className="header-inner">
					<div>
						<div className="header-title">
							Add Medical Resource Entity
						</div>
						<div className="bc-list">
							<Link to={{pathname: `/dashboard`}}>Dashboard</Link>/ <Link to={{pathname: `/medical_resource_entities`}}>Medical Resource Entities</Link>/
						</div>
					</div>
			</div>
      <div className="container">
				<div className="card mb-5">
					<div className="card-header">Add Medical Resource Entity</div>
					<div className="card-body">
						<form onSubmit={submitHandler}>
							<div className="form-group">
								<label htmlFor="exampleInputEmail1">Medical Resource Entity Name *</label>
								<input type="text"
											 className="form-control"
                       id="exampleInputEmail1"
                       required="true"
											 aria-describedby="emailHelp"
											 name            ='medical_resource_entity[entity_name]'
											 defaultValue    = {entity_name}
											 onChange        = {changeHandler} />
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
              </section>

							<div className="form-group">
								<label htmlFor="selection">Categories *</label>
								<Multiselect
									id = "selection"
									options={categories}
									displayValue="category_name"
									placeholder="Select Category"
									style={{chips: {background: "#228CAA", "text-transform": "capitalize"},optionContainer: { "text-transform": "capitalize"}}}
									onSelect={ call_medical_resource_entity_category_services }
									onRemove={ remove_category_services }
								/>
							</div>
							<div className="form-group">
								{render_category_services()}
							</div>
							<button type="submit" className="btn btn-primary submit_button">Add Medical Resource Entity</button>
						</form>
					</div>
				</div>
			</div>
      </>
    );

    return resource_entity_html;
  };

	return <>{
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
			<Loader type="Circles" color="#2BAD60" height="150" width="150"/>
		</div>) :
		render_resource_entity_page()}</>;
};

export default AddMedicalResourceEntity;
