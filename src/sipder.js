import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import { MAP, MARKER } from "react-google-maps/lib/constants";
import { useGoogleMap } from '@react-google-maps/api';
import {OverlappingMarkerSpiderfier} from 'ts-overlapping-marker-spiderfier';
// import OverlappingMarkerSpiderfier from 'overlapping-marker-spiderfier';


// let oms = require('npm-overlapping-marker-spiderfier/lib/oms.min.js')
const google = window.google;
var medical_resource=[];
let medical_resource_marker = {};

// export default class Spiderfy extends React.Component {
const Spiderfy = (props) => {

  medical_resource = props.mr;

  const map = useGoogleMap(); 
  var marker;
  var oms = new OverlappingMarkerSpiderfier(map, {
    markersWontMove: true,
    markersWontHide: true,
    basicFormatEvents: true
  });
  // this.markerNodeMounted = this.markerNodeMounted.bind(this)
  
  // const findResource=(lat,lng)=>{
  //   var latitude=lat().toFixed(2);
  //   var longitude=lng().toFixed(2);
  //   var i=0;

  //   for(i=0; i < medical_resource.length; i++){
  //     var mlat=parseFloat(parseFloat(medical_resource[i].latitude).toFixed(3));
  //     var mlong=parseFloat(parseFloat(medical_resource[i].latitude).toFixed(3));
  //     if(mlat == latitude && mlong == longitude) 
  //     {
  //       medical_resource_marker = medical_resource[i];
  //     }
  //   }
  //   return medical_resource_marker;
  // }
  

  const markerNodeMounted = (ref) => {
    if(ref!=null){
    marker = new window.google.maps.Marker({
      map: map,
      position: {lat: ref.props.position.lat, lng: ref.props.position.lng}
    });
    }
  else{
    marker = new window.google.maps.Marker({
      map: map,
      position: {lat: parseFloat(props.item.latitude), lng: parseFloat(props.item.longitude)}
    });
  }
  
    window.google.maps.event.addListener(marker, "spider_click", (e) => {
      // if (props.onSpiderClick) props.onSpiderClick(e);
    });
    oms.addMarker(marker,function(e){
      // findResource(e.latLng.lat,e.latLng.lng);
      // props.handleChange(props.item);
    }); 
   
  }

  return (
      React.Children.map(props.children, child => 
        React.cloneElement(child, { ref: markerNodeMounted })
      )
  );
  
}



export default Spiderfy;
