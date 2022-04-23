import React, {useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import LoginUser from "../views/user/login";

function NavBar(props) {
	return(
		<div>
			<nav>
				<ul>
					{ props.auth ?
						<div>
							<li>
								<Link to="/dashboard"> Dashboard </Link>
							</li>
							<li>
								<Link to="/categories">Categories</Link>
							</li>
							<li>
								<Link to="/services">Services</Link>
							</li>
							<li>
								<Link to="/users">Users</Link>
							</li>
							<li>
								<Link to="/medical_resource_entities">Medical Resource Entity</Link>
							</li>
							<li>
								<Link to="/payments">Payments</Link>
							</li>
							<li>
								<Link to="/logout_user"> Logout </Link>
							</li>
						</div>
					:
						<Link to="/login_user">Login</Link>
					}
				</ul>
			</nav>
		</div>
	)
}

export default NavBar