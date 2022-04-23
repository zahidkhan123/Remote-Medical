import React, {useState ,useEffect} from 'react'
import { BrowserRouter as Router, Switch, Route, Link, Redirect, useLocation, useHistory} from "react-router-dom";
import Header from '../components/dashboard/Header'
import LoginUser from "../views/user/login";
import ForgotPassword from "../views/user/new_password";
import EditProfile from "../views/user/edit_profile";
import ContactUs from "../components/Users/ContactUs";
import LoginRoute from "./login_route";
import LogoutUser from "../views/user/logout"
import ProtectedRoute from "./protected_routes";
import MapContainer from "../components/dashboard/MapContainer";
import CategoryList from "../components/Category/CategoryList";
import AddCategory from "../components/Category/AddCategory";
import EditCategory from "../components/Category/EditCategory";
import CategoryShow from "../components/Category/CategoryShow";
import AddService from "../components/Services/AddService";
import ServiceList from "../components/Services/ServiceList";
import EditService from "../components/Services/EditService";
import ServiceShow from "../components/Services/ServiceShow";
import MedicalResourceEntityList from "../components/MedicalResourceEntity/MedicalResourceEntityList";
import MedicalResourceEntityShow from "../components/MedicalResourceEntity/MedicalResourceEntityShow";
import EditMedicalResourceEntity from "../components/MedicalResourceEntity/EditMedicalResourceEntity";
import AddMedicalResourceEntity from "../components/MedicalResourceEntity/AddMedicalResourceEntity";
import PaymentList from "../components/Payments/PaymentList";
import AddPayment from "../components/Payments/AddPayment";
import EditPayment from "../components/Payments/EditPayment";
import PaymentShow from "../components/Payments/PaymentShow";
import UserList from "../components/Users/UserList";
import AddUser from "../components/Users/AddUser";
import UserShow from "../components/Users/UserShow";
import UserEdit from "../components/Users/UserEdit";
import MedicalResourceList from "../components/MedicalResource/MedicalResourceList";
import MedicalResourceShow from "../components/MedicalResource/MedicalResourceShow";
import EditMedicalResource from "../components/MedicalResource/EditMedicalResource";
import GeoChart from "../components/charts/GeoChart";
import PartnerCompanyList from "../components/PartnerCompany/PartnerCompanyList"
import AddPartnerCompany from "../components/PartnerCompany/AddPartnerCompany"
import EditPartnerCompany from "../components/PartnerCompany/EditPartnerCompany"
import CountryBaseMedicalResource from "../components/MedicalResource/CountryBaseMedicalResource"



function AppRoute() {
	let [ auth, setAuth] = useState(false)
	return (
		<div>
			{auth && <Header/> }
			<Router>
				<Switch>
					<LoginRoute exact path="/"                                 component={LoginUser}/>
					<LoginRoute       path="/login_user"                       component={LoginUser}/>
					<LoginRoute       path="/new_password"                     component={ForgotPassword}/>
					<Route            path="/logout_user"                      component={LogoutUser} />
					<ProtectedRoute   path="/edit_profile"                     component={() => {return <EditProfile  token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/contact_us"                       component={() => {return <ContactUs    token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/users"                            component={() => {return <UserList     token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/add_user"                         component={() => {return <AddUser      token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/show_user/:id"                    component={() => {return <UserShow     token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/edit_user/:id"                    component={() => {return <UserEdit     token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/dashboard"                        component={() => {return <MapContainer token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/services"                         component={() => {return <ServiceList  token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/add_service"                      component={() => {return <AddService   token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/edit_service/:id"                 component={() => {return <EditService  token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/show_service/:id"                 component={() => {return <ServiceShow  token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/categories"                       component={() => {return <CategoryList token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/add_category"                     component={() => {return <AddCategory  token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/edit_category/:id"                component={() => {return <EditCategory token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/show_category/:id"                component={() => {return <CategoryShow token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/add_medical_resource_entity"      component={() => {return <AddMedicalResourceEntity  token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/medical_resource_entities"        component={() => {return <MedicalResourceEntityList token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/medical_resource_entity_show/:id" component={() => {return <MedicalResourceEntityShow token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/edit_medical_resource_entity/:id" component={() => {return <EditMedicalResourceEntity token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/medical_resources"                component={() => {return <MedicalResourceList token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/edit_medical_resource"            component={() => {return <EditMedicalResource token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/medical_resource_show/:id"        component={() => {return <MedicalResourceShow token ={setAuth}/>  }}/>
					<ProtectedRoute   path="/payments"                         component={() => {return <PaymentList token  ={setAuth}/>  }}/>
					<ProtectedRoute   path="/add_payment"                      component={() => {return <AddPayment  token  ={setAuth}/>  }}/>
					<ProtectedRoute   path="/show_payment/:id"                 component={() => {return <PaymentShow token  ={setAuth}/>  }}/>
					<ProtectedRoute   path="/edit_payment/:id"                 component={() => {return <EditPayment token  ={setAuth}/>  }}/>
					<ProtectedRoute   path="/charts"                           component={() => {return <GeoChart    token  ={setAuth}/>  }}/>
					<ProtectedRoute   path="/partner_companies"                component={() => {return <PartnerCompanyList   token        ={setAuth}/>  }}/>
					<ProtectedRoute   path="/add_partner_company"              component={() => {return <AddPartnerCompany    token        ={setAuth}/>  }}/>
					<ProtectedRoute   path="/edit_partner_company/:id"         component={() => {return <EditPartnerCompany   token        ={setAuth}/>  }}/>
					<ProtectedRoute   path="/country_base_medical_resource"    component={() => {return <CountryBaseMedicalResource token  ={setAuth}/>  }}/>
				</Switch>
			</Router>
		</div>

	)
}
export default AppRoute

