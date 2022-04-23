import React, { useState } from 'react';
import { slide as Menu } from 'react-burger-menu'
import '../../styles/Dashboard/top-burger-menu.scss'
import { Dropdown } from 'react-bootstrap';


const Header = (props) => {
  const [toggle,setToggle]=useState(false);
  const user_email = localStorage.getItem("user_email");
  function showSettings(event) {
    event.preventDefault();
    
  }


return (
  <div className="main-header">
    <div className="top-burger-menu-container">
      <Menu>
        <a href="/dashboard">
          <i className="fa fa-tachometer"></i>
          <span className="bm-item-inner-label">Dashboard</span>
        </a>
        <a href="/categories">
          <i className="fa fa-sliders"></i>
          <span className="bm-item-inner-label">Categories</span>
        </a>
        <a href="/services">
          <i className="fa fa-tasks"></i>
          <span className="bm-item-inner-label">Services</span>
        </a>
        <a href="/medical_resource_entities">
          <i className="fa fa-sliders"></i>
          <span className="bm-item-inner-label">Medical Resource Entity</span>
        </a>
        <a href="/medical_resources">
          <i className="fa fa-plus-square"></i>
          <span className="bm-item-inner-label">Medical Resources</span>
        </a>
        <a href="/payments">
          <i className="fa fa-star-half-o"></i>
          <span className="bm-item-inner-label">Payment</span>
        </a>
				<a href="/partner_companies">
					<i className="fa fa-star-half-o"></i>
					<span className="bm-item-inner-label">Partner Companies</span>
				</a>
        <a href="/users">
          <i className="fa fa-user-circle-o"></i>
          <span className="bm-item-inner-label">Users</span>
        </a>
				<a href="/charts">
					<i className="fa fa-star-half-o"></i>
					<span className="bm-item-inner-label">HeatMap</span>
				</a>
        <a href="/contact_us">
          <i className="fa fa-at"></i>
          <span className="bm-item-inner-label">Contact Us</span>
        </a>
        {/*<a href={process.env.PUBLIC_URL + '/ERDREMOTE.pdf'} target="_blank">*/}
        {/*  <span className="bm-item-inner-label">Test Us</span>*/}
        {/*</a>*/}
      </Menu>
    </div>
    
    <div className="main-header-title-container">
			<a href="/dashboard"> <img src={process.env.PUBLIC_URL + '/logo.png'} className="logo"/></a>
    </div>

    <div className="main-header-username-container">
      <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-basic" className="dropdown-button">
          <i className="fa fa-user-circle main-header-dropdown-user-icon"></i>
          <p className="ml-4 mt-1" className="main-header-dropdown-p">{user_email}
						<i className="fa-angle-down" className="main-header-dropdown-i"></i>
          </p>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item href="/edit_profile">Edit profile</Dropdown.Item>
					<Dropdown.Item href={process.env.PUBLIC_URL + '/' +
					'grd-release-notes.pdf'} target="_blank">
						v-1.1.2-release notes
					</Dropdown.Item>
          <Dropdown.Item href="/logout_user">Log out</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  </div>


)

}

export default Header;