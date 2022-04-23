import React, { useEffect, useState } from "react";
import axios from "axios";
import { trackPromise } from "react-promise-tracker";
import { ToastContainer, toast } from "react-toastify";
import ShowMoreText from "react-show-more-text";
import NavBar from "../nav_bar";
import { servicePath } from "../../constants/defaultValues";
import {
  Button,
  Collapse,
  Accordion,
  AccordionCollapse,
  Card,
} from "react-bootstrap";
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
toast.configure();
const MedicalResourceEntityShow = (props) => {
  const {id}                                                     = useParams()
  const location                                                 = useLocation();
  const [medical_resource_entity_id, setMedicalResourceEntityId] = useState(id);
  const [medical_resource_entity, setMedicalResourceEntity]      = useState({});
  const [entity_categories, setEntityCategories]                 = useState([]);
  const [entity_category_services, setEntityCategoryService]     = useState([]);
  const [error, setError]                                        = useState("");
  const [update, setUpdate]                                      = useState(false);
  const [all, setall]                                            = useState([]);
  let apiUrl                                                     = servicePath;
  let auth_token                                                 = localStorage.getItem("auth_token");
  const arr1 = [];

  useEffect(() => {
    props.token(true);
    trackPromise(
      axios
        .get(
          apiUrl +
            `/admin_api/api/v1/medical_resource_entities/${medical_resource_entity_id}.json`,
          {
            headers: {
              "AUTH-TOKEN": auth_token,
            },
          }
        )
        .then((response) => {
          setMedicalResourceEntity(response.data.medical_resource_entity);
          setEntityCategories(
            response.data.medical_resource_entity
              .medical_resource_entity_categories
          );
        })
        .catch((error) => {
          setError(error);
        })
    );
  }, []);

  useEffect(() => {}, [update]);

  const itemsToShow = (services, event) => {
    let load_more = 5;
    if (services.length > 5) {
      let slice_array = services.slice(0, load_more);
      all.push(services.filter((x) => !slice_array.includes(x)));
      return services
        .slice(0, load_more)
        .map((service) => <li key={service.id}>{service.service_name}</li>);
    } else {
      return services
        .slice(0, load_more)
        .map((service) => <li key={service.id}>{service.service_name}</li>);
    }
  };

  const call_current = (event, entity_category) => {
    let array = all.flat();
    let updated_array = array.filter(
      (x) => x.category_id == entity_category.category_id
    );
    filter_array(entity_category, updated_array);
    // if (update == true){
    // 	setUpdate(false)
    // } else{
    // 	setUpdate(true)
    // }
  };



  const filter_array = (entity_category, arr) => {
    let services_html = [];
    if (arr != undefined) {
      arr.map((service_obj, index) => {
        services_html.push(<li key={index}>{service_obj.service_name}</li>);
      });
    }

    return services_html;
  };
  const executeOnClick = (isExpanded) => {
    
  };

  return (
    <>
      <div className="header-inner mb-5">
        <div>
          <div className="header-title">Show Medical Resource Entity</div>
          <div className="bc-list">
            <Link to={{ pathname: `/dashboard` }}>Dashboard</Link>/{" "}
            <Link to={{ pathname: `/medical_resource_entities` }}>
              Medical Resource Entities
            </Link>
            /
          </div>
        </div>
      </div>
      <div className="container">
        <table className="table table-striped">
          <thead>
            <tr key={medical_resource_entity.id}>
              <th>ID: {medical_resource_entity.id}</th>
              <th>{medical_resource_entity.entity_name}</th>
              <th>
                Categories{" "}
                <span className="badge badge-light">
                  {entity_categories.length}
                </span>
              </th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>

        <div className="d-flex flex-wrap">
          {entity_categories.map((entity_category) => {
            return (
              <div className="col-3 entity-detail">
                <h5>
                  <b className="mr-1">{entity_category.category_name}</b>{" "}
                  <span className="badge badge-light">
                    {
                      entity_category.medical_resource_entity_category_services
                        .length
                    }
                  </span>
                </h5>
                <ul>
                  {/*{ itemsToShow(entity_category.medical_resource_entity_category_services)  }*/}
                  {/*<button onClick={e => itemsToShow(entity_category.medical_resource_entity_category_services,e)} id = {entity_category.id}>show more </button>*/}
                  {/*<Button*/}
                  {/*	onClick={() => setOpen(!open)}*/}
                  {/*	aria-controls={entity_category.id}*/}
                  {/*	aria-expanded={open}*/}
                  {/*>*/}
                  {/*	click*/}
                  {/*</Button>*/}
                  {/*<Collapse in={open}>*/}
                  {/*	<div id={entity_category.id}>*/}
                  {/*		Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus*/}
                  {/*		terry richardson ad squid. Nihil anim keffiyeh helvetica, craft beer*/}
                  {/*		labore wes anderson cred nesciunt sapiente ea proident.*/}
                  {/*	</div>*/}
                  {/*</Collapse>*/}
                  {/*<Accordion>*/}
                  {/*	/!*<Card>*!/*/}
                  {/*	/!*	<Card.Header>*!/*/}
                  {/*	/!*		<Accordion.Toggle as={Button} variant="link" eventKey="0">*!/*/}
                  {/*	/!*			Click me!*!/*/}
                  {/*	/!*		</Accordion.Toggle>*!/*/}
                  {/*	/!*	</Card.Header>*!/*/}
                  {/*	/!*	<Accordion.Collapse eventKey={entity_category.id}>*!/*/}
                  {/*	/!*		<Card.Body>{ itemsToShow(entity_category.medical_resource_entity_category_services) }</Card.Body>*!/*/}
                  {/*	/!*	</Accordion.Collapse>*!/*/}
                  {/*	/!*</Card>*!/*/}
                  {/*	<Card>*/}
                  {/*		{ entity_category.medical_resource_entity_category_services.length > 5 &&*/}
                  {/*			<Card.Header>*/}
                  {/*				<Accordion.Toggle as={Button} variant="link" eventKey={entity_category.id} onClick={e => call_current(e,entity_category)}>*/}
                  {/*					Click me!*/}
                  {/*				</Accordion.Toggle>*/}
                  {/*			</Card.Header>*/}
                  {/*		}*/}
                  {/*		<Accordion.Collapse eventKey={entity_category.id} >*/}
                  {/*			<Card.Body>*/}
                  {/*				/!*{all && all.map((services,index) => {*!/*/}
                  {/*				/!*	return(*!/*/}
                  {/*				/!*		<div key={index}>*!/*/}
                  {/*				/!*			{*!/*/}
                  {/*				/!*				services.map((service, i) => {*!/*/}
                  {/*				/!*					return (*!/*/}
                  {/*				/!*						<li key={i}>{service.service_name}</li>*!/*/}
                  {/*				/!*					)*!/*/}
                  {/*				/!*				})*!/*/}
                  {/*				/!*			}*!/*/}
                  {/*				/!*		</div>*!/*/}
                  {/*				/!*	)*!/*/}
                  {/*				/!*})}*!/*/}
                  {/*				/!*{test(all)}*!/*/}
                  {/*				{filter_array()}*/}
                  {/*				/!*{all && all.flat().map((service,index) => {*!/*/}
                  {/*				/!*		return (*!/*/}
                  {/*				/!*			<li key={index}>{service.service_name}</li>*!/*/}
                  {/*				/!*		)*!/*/}
                  {/*				/!*	})}*!/*/}
                  {/*			</Card.Body>*/}
                  {/*		</Accordion.Collapse>*/}
                  {/*	</Card>*/}
                  {/*</Accordion>*/}
                  {/*{ get_load_more(entity_category.medical_resource_entity_category_services) }*/}
                  {/*{show_more(entity_category.medical_resource_entity_category_services)}*/}
                  <ShowMoreText
                    /* Default options */
                    lines={1}
                    more="Show more"
                    less="Show less"
                    className="content-css"
                    anchorClass="my-anchor-css-class"
                    onClick={executeOnClick}
                    expanded={false}
                    width={280}
                  >
                    {entity_category.medical_resource_entity_category_services.map(
                      (entity_service) => {
                        return (
                          <li className="text-capitalize">
														<span>{entity_service.service_name}</span>,
                          </li>
                        );
                      }
                    )}
                  </ShowMoreText>
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MedicalResourceEntityShow;
