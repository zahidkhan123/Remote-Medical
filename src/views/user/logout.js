import React from 'react';
import '../../App.css';
import axios from 'axios';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { servicePath } from "../../constants/defaultValues";
import { useHistory } from "react-router-dom";

function LogoutUser() {
	let history      = useHistory()
	let apiUrl       = servicePath
	let auth_token   = localStorage.getItem("auth_token")
	if (auth_token !== "") {
			axios.post(apiUrl + "/api/v1/user_sessions/logout.json",
				{},
				{
					headers: {
						"AUTH-TOKEN": auth_token,
						"Content-Type": "application/json"
					}
				}).then((response) => {
				if (response.status === 200) {
					localStorage.removeItem("auth_token")
					localStorage.removeItem("user_id");
					localStorage.removeItem("user_email");
					localStorage.removeItem("is_visitor");
					history.push("/");
					window.location.reload();
					NotificationManager.success('Success message', 'Title here');
				}
			}).catch((error) => {
				if ( error.response.status === 401){
					localStorage.removeItem("auth_token")
					history.push("/");
					window.location.reload();
					NotificationManager.success('Success message', 'Title here');
				}

			})
		} else {
			NotificationManager.success('Success message', 'Title here');
	}

	return(
		<div></div>
	)


}

export default LogoutUser