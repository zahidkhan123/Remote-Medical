import React, {useEffect, useState} from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	Redirect,
	useLocation,
	useHistory,

} from "react-router-dom";

function ProtectedRoute ({component : Component, ...rest})  {
	// const [authVerification, setauthVerification] = useState(false);
	// useEffect(()=>{
	//
	// },[])
	return (
		<Route {...rest} render ={props => (
			localStorage.getItem("auth_token") ? <Component {...props}/> : <Redirect to = "/login_user" />
		)}/>
	);
}

export default ProtectedRoute