import React, {useEffect, useState} from "react";
import axios from "axios";
import {trackPromise, usePromiseTracker} from "react-promise-tracker";
import { BrowserRouter as Router, Switch, Route, Link, Redirect, useLocation, useHistory} from "react-router-dom";
import { servicePath } from "../../constants/defaultValues";
import { ToastContainer, toast } from 'react-toastify';
import "../../styles/custom/generic_listing.scss"
import {Button, Col, Container, Form, Modal, Row} from "react-bootstrap";
import Loader from "react-loader-spinner";
import Pagination from "reactive-pagination";

const CountryBaseDashboard = (props) => {
	const { promiseInProgress }                              = usePromiseTracker();
	const   apiUrl                                           = servicePath
	const 	auth_token                                       = localStorage.getItem("auth_token")

	useEffect(()=>{

		props.token(true)

	})

}

export default CountryBaseDashboard


