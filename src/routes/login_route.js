import React from 'react'
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	Redirect,
	useLocation,
	useHistory
} from "react-router-dom";

function LoginRoute ({component : Component, ...rest})  {
	return (
		<Route {...rest} render ={props => (
			localStorage.getItem("auth_token") ? <Redirect to = "/dashboard"/> :  <Component {...props}/>
		)}/>
	);

}

export default LoginRoute