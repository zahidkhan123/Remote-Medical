import React, { useState, useEffect,forwardRef,useImperativeHandle } from 'react';
import '../../styles/Dashboard/burger-menu.scss'
import axios from 'axios';
import { toast } from 'react-toastify';
import { servicePath } from "../../constants/defaultValues";
import ReactTooltip from 'react-tooltip';

const BurgerMenu = forwardRef((props, ref) => {
  const apiUrl = servicePath
  const [ toggle, setToggle ] = useState(false);
  const [ medical_resource_entities, setMedical_resource_entities ] = useState([]);
  const auth_token   = localStorage.getItem("auth_token")
	const notifyNoEntity = () => toast.error("Medical resource entity not found!");
	const resourceNotify = () => toast.error("Medical resource not found!");
  let menuTrigger = document.querySelectorAll('.js-menuToggle');


  useImperativeHandle(ref, () => ({
    getMenuClose() {
    }
  }));

  function openPushNav() {
    // topNav[0].classList.add('isOpen');
    document.querySelectorAll('.js-topPushNav')[0].classList.remove('pushNav-close');
    document.querySelectorAll('.js-topPushNav')[0].classList.add('pushNav');
    let body = document.getElementsByTagName('body')[0];
    // body.classList.add('pushNavIsOpen');
  }

  useEffect(() => {
    setToggle(true);
    axios.get(apiUrl + '/admin_api/api/v1/medical_resource_entities/get_all_entities.json', {
      headers: {
        "AUTH-TOKEN": auth_token,
        "Content-Type": "application/json"
      }})
      .then(res => {
        setMedical_resource_entities(res.data.medical_resource_entities);
      })
      .catch((error) => {
        notifyNoEntity();
      })
  },[])

  function closePushNav() {
    document.querySelectorAll('.pushNav')[0].classList.add('pushNav-close');
    document.querySelectorAll('.pushNav')[0].classList.remove('pushNav');
    // topNav[0].classList.remove('isOpen');
    let body = document.getElementsByTagName('body')[0];
    body.classList.remove('pushNavIsOpen');
  }

  toggle && toggleMenu();

  function toggleMenu(){
    menuTrigger[0].addEventListener('click', function(e) {
      let body = document.getElementsByTagName('body')[0];
      e.preventDefault();
      if (document.getElementsByTagName('ul')[0].classList.contains('pushNav-close')) {
        openPushNav();
        let element= document.querySelectorAll('.dashboard-map')[0];
        if(element == undefined){
          element = document.querySelectorAll('.dashboard-map-full-width')[0];
        }
        element.classList.add("dashboard-map-full-width")
        element.classList.remove("dashboard-map")
        body.classList.remove('isOpen');
      } else {
        closePushNav();
        let element= document.querySelectorAll('.dashboard-map')[0];
        if(element == undefined){
          element = document.querySelectorAll('.dashboard-map-full-width')[0];
        }
        element.classList.add("dashboard-map")
        element.classList.remove("dashboard-map-full-width")
      }
    })
    setToggle(false);
  }

  const handleChecked = (event) => {
    props.showLoader();
    event.preventDefault();
    let array1=[];
    let e1 = event.target;
    if(e1.tagName == "P"){
      e1 = e1.parentElement
    }
    if(e1.tagName == "IMG"){
      e1 = e1.parentElement
    }
    if(e1.parentElement.classList.contains('entity-burger-menu-label-link-checked')){
      e1.parentElement.classList.remove('entity-burger-menu-label-link-checked');
    }
    else{
      e1.parentElement.classList.add('entity-burger-menu-label-link-checked');
    }

    let entities = document.getElementsByClassName("entity-burger-menu-list-item");

    for(let i=0; i<entities.length; i++){
      if(document.getElementsByClassName("entity-burger-menu-list-item")[i].classList.contains('entity-burger-menu-label-link-checked')){
        let id = document.getElementsByClassName("entity-burger-menu-list-item")[i].querySelector('.entity-burger-menu-label').id
        array1.push(id);
      }
    }

      axios.get(apiUrl + `/admin_api/api/v1/dashboard.json?`,{
        params: {
          dashboard: 'dashboard',
          medical_resource_entity_ids: array1
        },
        headers: {
          "AUTH-TOKEN": auth_token,
          "Content-Type": "application/json"
        }})
        .then(res => {
          if (res.data.length > 0) {
            props.hideLoader();
            props.set_medical_resources(res.data);
            if (array1.length > 0){
							let lat = parseFloat(res.data[0]["lat"])
							let lng = parseFloat(res.data[0]["lng"])
							props.setCenter({lat: lat,lng: lng})
							props.setIsBurgerSelected(true)
						}else{
							props.setCenter({lat: 47.751076,lng: -120.740135})
							props.setIsBurgerSelected(false)
						}
            props.setZoom(3);
						toast.success(res.data.length + " Medical resource found!");
						console.log(array1);
          } else{
            props.hideLoader();
            props.set_medical_resources(res.data)
						props.setCenter({lat: 47.751076,lng: -120.740135})
						resourceNotify();
          }
          // setMedical_resource_entities(res.data.medical_resource_entities);
        })
        .catch((error) => {
          // notifyNoEntity();
        })
      // );
    console.log(array1);
  }

  return (
    <div className="burger-menu-nav">
      <div className="wrapper">
        <div className="burger js-menuToggle width-setting">
          <i className="fa fa-navicon"></i>
        </div>
      </div>
      <nav>
        <ul className="pushNav-close js-topPushNav isOpen entity-burger-menu-overflows">
					<ReactTooltip />
          {
            medical_resource_entities && 
            medical_resource_entities.map((item) => {
                return(
                  <li className="entity-burger-menu-list-item" key={item.id}>
                    <span id={item.id} onClick={(e)=> handleChecked(e)} className="entity-burger-menu-span entity-burger-menu-label"  >
                      { item.image &&
                      <img src={item.image} className="image-setting-entity-burger-menu" data-tip={item.entity_name}/> }
                      <p className="entity-burger-menu-p">
                        {item.entity_name}
                      </p>
                    </span>
                  </li>
                );
              }
            )
          } 
        </ul>
      </nav>
      <span className="screen"></span>
    </div>
  );
});
    
    
    
export default BurgerMenu;