import { Container, Row, Col, Button, Form, Modal } from 'react-bootstrap';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ImageUploader from 'react-images-upload';
import { trackPromise, usePromiseTracker } from 'react-promise-tracker';
import Loader from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { googleMapApiKey, servicePath } from '../../constants/defaultValues';
import { useForm } from 'react-hook-form';
import ReactTooltip from 'react-tooltip';
import '../../styles/Form/AddResourceForm.scss';
// import GooglePlacesAutocomplete, { geocodeByAddress,getLatLng,} from 'react-google-places-autocomplete';
// import GoogleAutoComplete from 'react-auto-complete-address-fields';
// import 'react-auto-complete-address-fields/build/GoogleAutoComplete.css';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useLocation,
  useHistory,
} from 'react-router-dom';
import '../../styles/Form/AddResourceForm.scss';
import { forEach } from 'react-bootstrap/ElementChildren';
import PreferredAreaMap from './preferred_area_map';
import { Multiselect } from 'multiselect-react-dropdown';

const googleMapApiKey1 = googleMapApiKey;

function MedicalResourceEditForm(props) {
  const location = useLocation();
  const history = useHistory();
  const apiUrl = servicePath;
  const auth_token = localStorage.getItem('auth_token');
  const { promiseInProgress } = usePromiseTracker();
  const medical_resource_id = props.medical_resource_id;
  const [medical_resource, setMedicalResource] = useState({});
  const [medical_resource_entities, setMedicalResourceEntities] = useState([]);
  const [active_medical_resource_entities, setActiveMedicalResourceEntities] =
    useState([]);
  const [
    inactive_medical_resource_entities,
    setInActiveMedicalResourceEntities,
  ] = useState([]);
  const [show_entity, setShowEntity] = useState(false);
  const [payments, setPayments] = useState([]);
  const { register, handleSubmit, errors, form } = useForm(); // initialize the hook
  const [loader, setLoader] = useState(false);
  const [image, setImage] = useState([]);
  const [parent_companies, setParentCompanies] = useState([]);
  const noEntity = () => toast.error('Please select atleast one entity!');
  const noServiceFound = () =>
    toast.error('Please select atleast one service from categories!');
  const entities = props.entities;
  const resources = props.resources;
  const from_list = props.from_medical_resource_listing;
  const checkbox = useRef(null);
  const [pocPhoneNumberError, setPocPhoneNumberError] = useState(false);
  let medical_resource_entity_array = [];
  const [showloader, setshowloader] = useState(false);
  const [addresschangeloader, setAddressChangeLoader] = useState(false);
  const [numberError, setNumberError] = useState(false);
  const [alternateNumberError, setAlternateNumberError] = useState(false);
  const inputRef = useRef();
  let autoComplete = null;
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState('');
  const [value, setValue] = useState(null);
  const [geoAddress, setGeoAddress] = useState({});
  const [inputList, setInputList] = useState([]);
  const [other_areas, setOtherServcieAreas] = useState([]);
  const [show, setShow] = useState(false);
  const [d_integer, setDInteger] = useState(null);
  const [edit_address_state, setEditAddressState] = useState(false);
  const [edit_address_index, setEditAddressIndex] = useState(null);
  const [from_edit_form, setFromEditForm] = useState(false);
  const [click_edit_button, setClickEditButton] = useState(false);
  const [is_preferred_service_areas, setIsPreferredServiceAreas] =
    useState(false);
  const [is_other_service_areas, setIsOtherServiceAreas] = useState(false);
  const [parent_id, setParentId] = useState(' ');
  const [
    primary_medical_resource_entity_id,
    setPrimaryMedicalResourceEntityId,
  ] = useState(null);
  const [typeName, setTypeName] = useState([
    'Labs',
    'Physical',
    'Dental',
    'Vaccines',
    'Other',
  ]);
  const [medicalResourceTypeName, setMedicalResourceTypeName] = useState('');
  const entityClick = () => toast.info(CustomToastWithLink);
  const onDrop = (picture) => {
    setImage(picture);
  };
  const error = {
    color: 'red',
    marginBottom: '3px',
  };
  const headers = {
    'AUTH-TOKEN': auth_token,
    'Content-Type': 'multipart/form-data',
    Accept: 'application/json',
  };
  const AllResources = () => {
    axios
      .get(
        apiUrl +
          '/admin_api/api/v1/dashboard/parent_companies.json?parent=parent',
        {
          headers: {
            'AUTH-TOKEN': auth_token,
            'Content-Type': 'application/json',
          },
        }
      )
      .then((response) => {
        setParentCompanies(response.data.medical_resources);
      })
      .catch((error) => {});
  };
  const call_medical_resource_edit = async () => {
    await axios
      .get(
        apiUrl +
          `/admin_api/api/v1/medical_resources/${medical_resource_id}/edit.json`,
        {
          headers: {
            'AUTH-TOKEN': auth_token,
            'Content-Type': 'application/json',
          },
        }
      )
      .then((response) => {
        if (response.status == 200) {
          if (response.data.medical_resource.addresess.length > 0) {
            setInputList(response.data.medical_resource.addresess);
          }
          setMedicalResource(response.data.medical_resource);
          setMedicalResourceTypeName(
            response.data.medical_resource.medical_resource_type
          );
          setAddress(response.data.medical_resource.address);
          setLatitude(response.data.medical_resource.latitude);
          setLongitude(response.data.medical_resource.longitude);
          setPrimaryMedicalResourceEntityId(
            response.data.medical_resource.primary_category_id
          );
          setParentId(response.data.medical_resource.parent_compnay_id);
          setMedicalResourceEntities(
            response.data.medical_resource.medical_resource_entities
          );
          setInActiveMedicalResourceEntities(
            response.data.medical_resource.medical_resource_entities.filter(
              (entity) => entity.is_active == false
            )
          );
          setActiveMedicalResourceEntities(
            response.data.medical_resource.medical_resource_entities.filter(
              (entity) => entity.is_active == true
            )
          );
          setPayments(response.data.medical_resource.medical_resource_payments);
          setshowloader(false);
        } else {
          toast.error('Record not found');
        }
      })
      .catch((error) => {
        setshowloader(false);
        toast.error(error.response.data.message);
      });
  };
  useEffect(() => {
    setshowloader(true);
    call_medical_resource_edit();
    console.log(other_areas);
    AllResources();
  }, []);
  const showAddressLoader = () => {
    return (
      <div
        style={{
          margin: 'auto',
          width: '150px',
          padding: '10px',
          position: 'absolute',
          marginLeft: '450px',
          marginTop: '-100px',
          zIndex: '999',
        }}
      >
        <Loader type='Circles' color='#2BAD60' height='150' width='150' />
      </div>
    );
  };
  const CustomToastWithLink = () => (
    <div>
      <p>Please see the categories and services below by clicking the link</p>
      <form onSubmit={section_categories}>
        <input
          type='submit'
          value='Go to Google'
          value='Go to Section'
          style={{
            color: 'black',
            backgroundColor: 'Transparent',
            backgroundRepeat: 'no-repeat',
            border: 'none',
            cursor: 'pointer',
            overflow: 'hidden',
            outline: 'none',
          }}
        />
      </form>
    </div>
  );
  const section_categories = (e) => {
    e.preventDefault();
    if (document.getElementsByClassName('medical_services')[0]) {
      document.getElementsByClassName('medical_services')[0].scrollIntoView();
    }
  };
  const entitiesClick = (entity, e) => {
    if (e.target.checked) {
      setActiveMedicalResourceEntities((oldArray) => [...oldArray, entity]);
      entityClick();
    } else {
      let filter_entities = active_medical_resource_entities.filter(
        (mre) =>
          mre.medical_resource_entity_id != entity.medical_resource_entity_id
      );
      setActiveMedicalResourceEntities(filter_entities);
    }
  };
  const entitiesValidation = (data, e) => {
    let entities = document.getElementsByClassName('resource_entities');
    let z = 0;
    let count = 0;
    while (z < entities.length) {
      let status = entities[z].querySelectorAll('.form-check-input')[0].checked;
      if (status) {
        count++;
      }
      z++;
    }
    if (count == 0) {
      e.preventDefault();
      noEntity();
      return false;
    } else {
      return true;
    }
  };
  const validateForm = (data, event) => {
    event.preventDefault();
    let medical_services = document.getElementsByClassName('medical_services');
    let i = 0;
    let j = 0;
    let k = 0;
    let status = false;
    let count = 0;
    for (i = 0; i < medical_services.length; i++) {
      let categories = medical_services[i].querySelectorAll('.categories');
      for (j = 0; j < categories.length; j++) {
        let checkboxes = categories[j].querySelectorAll('.service');
        for (k = 0; k < checkboxes.length; k++) {
          status = checkboxes[k].checked;
          if (status) {
            count++;
          }
        }
      }
    }
    if (count == 0) {
      event.preventDefault();
      noServiceFound();
      return false;
    }
    return true;
  };
  function category_service() {
    let Category_container =
      document.getElementsByClassName('medical_services');
    let i = 0;
    while (i < Category_container.length) {
      let categories = [];
      let z = 0;
      let e = Category_container[i].querySelectorAll('.entity');
      let Category_service_container =
        Category_container[i].querySelectorAll('.categories');

      while (z < Category_service_container.length) {
        let a = 0;
        let services = [];
        let c = Category_service_container[z].querySelectorAll('.category');
        let s = Category_service_container[z].querySelectorAll('.service');
        while (a < c.length) {
          let j = 0;
          if (c[a].value) {
            while (j < s.length) {
              if (s[j].checked == true) {
                services.push({ service_id: parseInt(s[j].value) });
              }
              j++;
            }
            categories.push({
              category_id: parseInt(c[a].value),
              services: services,
            });
          }
          a++;
        }
        z++;
      }
      let o = {
        medical_resource_entity_id: parseInt(e[0].value),
        categories: categories,
      };
      medical_resource_entity_array.push(o);
      i++;
    }
  }
  const add_more_add_more_validation = (e) => {
    e.preventDefault();
    let value = Boolean(
      inputList.find((single_list) => {
        return single_list.address == '' || single_list.address == undefined;
      })
    );
    if (value == true && inputList.length > 0) {
      toast.error('Please full fill the services areas field');
      return false;
    } else {
      return true;
    }
  };
  const onSubmit = (data, e) => {
    if (entitiesValidation(data, e) == true) {
      if (
        validateForm(data, e) == true &&
        add_more_add_more_validation(e) == true
      ) {
        category_service();
        let formData = new FormData();
        let adr = '';
        if (from_list == true) {
          adr = document.getElementsByClassName('location-search-input')[0]
            .value;
        } else {
          adr = document.getElementsByClassName('selected-address')[0].value;
        }
        formData.append('medical_resource[name]', data.name);
        formData.append('medical_resource[latitude]', data.latitude);
        formData.append('medical_resource[longitude]', data.longitude);
        formData.append('medical_resource[phone]', data.phone);
        formData.append('medical_resource[address]', adr);
        formData.append(
          'medical_resource[alternate_phone]',
          data.alternate_phone
        );
        formData.append('medical_resource[fax_number]', data.fax_number);
        formData.append('medical_resource[email]', data.email);
        formData.append(
          'medical_resource[parent_id]',
          parent_id == null ? '' : parent_id
        );
        formData.append(
          'medical_resource[medical_resource_type]',
          medicalResourceTypeName
        );
        formData.append(
          'medical_resource[primary_category_id]',
          primary_medical_resource_entity_id
        );
        formData.append(
          'medical_resource[twenty_four_by_seven_emergency]',
          data.twenty_four_by_seven_emergency
        );
        formData.append('medical_resource[city]', data.city);
        formData.append('medical_resource[state]', data.state);
        formData.append('medical_resource[postal_code]', data.postal_code);
        formData.append('medical_resource[poc_title]', data.poc_title);
        formData.append('medical_resource[poc_mobile]', data.poc_mobile);
        formData.append('medical_resource[poc_name]', data.poc_name);
        formData.append('medical_resource[poc_email]', data.poc_email);
        formData.append('medical_resource[poc_phone]', data.poc_phone);
        formData.append('medical_resource[country]', data.country);
        formData.append(
          'medical_resource[country_flag]',
          e.target.country_flag.value
        );
        formData.append(
          'medical_resource[alpha2Code]',
          e.target.alpha2Code.value
        );
        if (Object.keys(image).length > 0) {
          formData.append('medical_resource[image]', image[0], image[0].name);
        }
        formData.append(
          'medical_resource[preferred_service_areas]',
          data.preferred_service_areas
        );
        formData.append(
          'medical_resource[other_service_areas]',
          data.other_service_areas
        );
        formData.append('medical_resource[website]', data.website);
        formData.append(
          'medical_resource[assessment_link]',
          data.assessment_link
        );
        formData.append('medical_resource[instructions]', data.instructions);
        formData.append(
          'medical_resource[agreement_link]',
          data.agreement_link
        );
        formData.append('medical_resource[vendor_link]', data.vendor_link);
        formData.append(
          'medical_resource[languages_spoken]',
          data.languages_spoken
        );
        formData.append('medical_resource[is_inactive]', data.is_inactive);
        formData.append(
          'medical_resource[is_translation_service]',
          data.is_translation_service
        );
        formData.append(
          'medical_resource[initial_contact]',
          data.initial_contact
        );
        formData.append('medical_resource[audit_sent]', data.audit_sent);
        formData.append(
          'medical_resource[audit_returned]',
          data.audit_returned
        );
        formData.append(
          'medical_resource[rmi_audit_review]',
          data.rmi_audit_review
        );
        formData.append(
          'medical_resource[initial_sa_sent]',
          data.initial_sa_sent
        );
        formData.append(
          'medical_resource[initial_sa_returned]',
          data.initial_sa_returned
        );
        formData.append('medical_resource[rmi_sa_review]', data.rmi_sa_review);
        formData.append('medical_resource[rmi_signature]', data.rmi_signature);
        formData.append(
          'medical_resource[vendor_signature]',
          data.vendor_signature
        );
        formData.append(
          'medical_resource[contract_expiration_date]',
          data.contract_expiration_date
        );
        formData.append(
          'medical_resource[is_assessment_none]',
          data.is_assessment_none
        );
        formData.append(
          'medical_resource[is_assessment_remote]',
          data.is_assessment_remote
        );
        formData.append(
          'medical_resource[is_assessment_in_person]',
          data.is_assessment_in_person
        );
        for (var i = 0; i < medical_resource_entity_array.length; i++) {
          formData.append(
            'medical_resource[medical_resource_entities][][medical_resource_entity_id]',
            medical_resource_entity_array[i].medical_resource_entity_id
          );
          for (
            var j = 0;
            j < medical_resource_entity_array[i].categories.length;
            j++
          ) {
            formData.append(
              'medical_resource[medical_resource_entities][][categories][][category_id]',
              medical_resource_entity_array[i].categories[j].category_id
            );
            for (
              var k = 0;
              k <
              medical_resource_entity_array[i].categories[j].services.length;
              k++
            ) {
              formData.append(
                'medical_resource[medical_resource_entities][][categories][][services][][service_id]',
                medical_resource_entity_array[i].categories[j].services[k]
                  .service_id
              );
            }
          }
        }
        for (var i = 1; i < data.payment.length; i++) {
          if (data.payment[i] !== false) {
            formData.append(
              'medical_resource[payments][][payment_id]',
              data.payment[i]
            );
          }
        }
        for (var i = 0; i < inputList.length; i++) {
          formData.append(
            'medical_resource[addresses][][location]',
            inputList[i].address
          );
          formData.append(
            'medical_resource[addresses][][city]',
            inputList[i].city
          );
          formData.append(
            'medical_resource[addresses][][state]',
            inputList[i].state
          );
          formData.append(
            'medical_resource[addresses][][country_name]',
            inputList[i].country
          );
          formData.append(
            'medical_resource[addresses][][alpha2Code]',
            inputList[i].alpha2Code
          );
          formData.append(
            'medical_resource[addresses][][country_flag]',
            inputList[i].country_flag
          );
          formData.append(
            'medical_resource[addresses][][latitude]',
            inputList[i].latitude
          );
          formData.append(
            'medical_resource[addresses][][longitude]',
            inputList[i].longitude
          );
          formData.append(
            'medical_resource[addresses][][postal_code]',
            inputList[i].postal_code
          );
          formData.append(
            'medical_resource[addresses][][is_other_service_areas]',
            inputList[i].is_other_service_areas
          );
          formData.append(
            'medical_resource[addresses][][is_preferred_service_areas]',
            inputList[i].is_preferred_service_areas
          );
        }
        trackPromise(
          axios
            .put(
              apiUrl +
                `/admin_api/api/v1/medical_resources/${medical_resource_id}`,
              formData,
              {
                headers: headers,
              }
            )
            .then((response) => {
              if (response.status == 200) {
                if (from_list) {
                  let redirect = window.location.href;
                  if (redirect.includes('medical_resources')) {
                    history.push('/medical_resources');
                  } else {
                    history.push('/dashboard');
                  }
                  props.closeModal();
                  // toast.success("Medical resource successfully update")
                } else {
                  props.setCenter({
                    lat: parseFloat(latitude),
                    lng: parseFloat(longitude),
                  });
                  history.push('/dashboard');
                  props.closeModal();
                }
              } else {
                toast.error(response.error.message);
              }
            })
            .catch((error) => {
              toast.error(error.response.data.message);
            })
        );
      }
    }
  };
  const onChangePocPhoneNumberFields = (event) => {
    let regex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,9}$/im;
    if (regex.test(event.target.value)) {
      setPocPhoneNumberError(false);
    } else {
      setPocPhoneNumberError(true);
    }
  };
  const onChangeNumberFields = (event) => {
    let regex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,9}$/im;
    if (regex.test(event.target.value)) {
      setNumberError(false);
    } else {
      setNumberError(true);
    }
  };
  const onChangeAlternateNumberFields = (event) => {
    let regex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,9}$/im;
    if (regex.test(event.target.value)) {
      setAlternateNumberError(false);
    } else {
      setAlternateNumberError(true);
    }
  };
  const changeServicesHandler = () => {};
  const assessmentNoneCheckBoxHandler = (event) => {
    const { is_assessment_none, checked } = event.target;
    setMedicalResource((preState) => ({
      ...preState,
      [is_assessment_none]: checked,
    }));
  };
  const isRemoteCheckBoxHandler = (event) => {
    const { is_assessment_remote, checked } = event.target;
    setMedicalResource((preState) => ({
      ...preState,
      [is_assessment_remote]: checked,
    }));
  };
  const isPersonCheckBoxHandler = (event) => {
    const { is_assessment_in_person, checked } = event.target;
    setMedicalResource((preState) => ({
      ...preState,
      [is_assessment_in_person]: checked,
    }));
  };
  const isInactiveCheckBoxHandler = (event) => {
    const { is_inactive, checked } = event.target;
    setMedicalResource((preState) => ({
      ...preState,
      [is_inactive]: checked,
    }));
  };
  const is_translationServiceCheckBoxHandler = (event) => {
    const { is_translation_service, checked } = event.target;
    setMedicalResource((preState) => ({
      ...preState,
      [is_translation_service]: checked,
    }));
  };
  const changePaymentHandler = (e) => {
    const { value, checked } = e.target;
    let payments_array = payments;
    payments_array.forEach((item) => {
      item.is_active = false;
    });

    payments_array.forEach((item) => {
      if (item.id == parseInt(value)) {
        item.is_active = checked;
      }
    });
    setPayments(payments_array);
  };
  const handleSelect = (address) => {
    setAddressChangeLoader(true);
    setGeoAddress({});
    geocodeByAddress(address)
      .then((results) => getLatLng(results[0]))
      .then(({ lat, lng }) => {
        setLatitude(lat);
        console.log(lat);
        setLongitude(lng);
        console.log(lng);
        axios
          .get(
            apiUrl +
              `/admin_api/api/v1/medical_resources/get_geo_address.json?lat=${lat}&lng=${lng}`,
            {
              headers: {
                'AUTH-TOKEN': auth_token,
                'Content-Type': 'application/json',
              },
            }
          )
          .then((response) => {
            if (response.status == 200) {
              setAddressChangeLoader(false);
              setAddress(address);
              setGeoAddress(response.data.geo_location_data);
              console.log(response.data.geo_location_data);
            } else {
              toast.error('Record not found!');
            }
          })
          .catch((error) => {
            toast.error('Something went wrong!');
          });
      });
  };
  const prevCount = usePrevious(is_preferred_service_areas);
  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }
  const handleInputChange = (e, index, address, click_edit_button) => {
    if (click_edit_button == true) {
      index = index;
    } else {
      index = inputList.length - 1;
    }
    const { name, value } = e.target;
    const list = [...inputList];
    list[index][name] = value;
    let dataset = JSON.parse(e.target.dataset.addresses);
    list[index].address = dataset.address;
    list[index].city = dataset.city;
    list[index].state = dataset.state;
    list[index].address = dataset.address;
    list[index].alpha2Code = dataset.alpha2Code;
    list[index].country = dataset.country;
    list[index].country_flag = dataset.country_flag;
    list[index].latitude = dataset.latitude;
    list[index].longitude = dataset.longitude;
    list[index].postal_code = dataset.postal_code;
    // list[index]['dataset'] = JSON.parse(e.target.dataset.addresses)
    list[index]['is_preferred_service_areas'] = is_preferred_service_areas;
    list[index]['is_other_service_areas'] = is_other_service_areas;

    setInputList(list);
  };
  const handleRemoveClick = (event, index) => {
    const list = [...inputList];
    list.splice(index, 1);
    setInputList(list);
    setFromEditForm(false);
  };
  const handleAddClick = (event) => {
    if (event.target.value == 'Add Preferred Service Areas') {
      setIsPreferredServiceAreas(true);
      setIsOtherServiceAreas(false);
    } else {
      setIsOtherServiceAreas(true);
      setIsPreferredServiceAreas(false);
    }
    setClickEditButton(false);
    setInputList([...inputList, { address: '', button: '' }]);
  };
  const handleClose = () => {
    setShow(false);
    setEditAddressState(false);
    setClickEditButton(false);
  };
  const handleShow = (e, index) => {
    e.preventDefault();
    setShow(true);
    setClickEditButton(false);
    setDInteger(index);
  };
  const handleChange = (auto_complete) => {
    setAddress(auto_complete);
  };
  const edit_address = (e, index, current_address) => {
    setEditAddressIndex(index);
    setEditAddressState(true);
    setFromEditForm(true);
    setClickEditButton(true);
    setOtherServcieAreas(other_areas);
    if (current_address.is_preferred_service_areas == true) {
      setIsPreferredServiceAreas(true);
      setIsOtherServiceAreas(false);
    } else {
      setIsOtherServiceAreas(true);
      setIsPreferredServiceAreas(false);
    }
  };
  const preferred_button_display = (array) => {
    let display_preferred = true;
    if (
      array.filter(
        (obj) => obj.is_preferred_service_areas == is_preferred_service_areas
      ).length < 2
    ) {
      display_preferred = true;
    } else {
      array.map((item, index, arr) => {
        let count = arr.filter(
          (obj) => obj.is_preferred_service_areas == true
        ).length;
        if (
          item.is_preferred_service_areas == true &&
          from_edit_form == false &&
          count >= 2
        ) {
          display_preferred = false;
        } else if (
          item.is_preferred_service_areas == true &&
          from_edit_form == true &&
          count >= 2
        ) {
          display_preferred = false;
        } else if (item.is_preferred_service_areas == true && count >= 2) {
          display_preferred = false;
        }
      });
    }
    return display_preferred;
  };
  const display_label = (x) => {
    let label = '';
    if (x.is_preferred_service_areas == true) {
      label = 'Preferred service areas';
    } else {
      label = 'Other service areas';
    }
    return label;
  };
  const display_address_value = (x) => {
    let adr = '';
    if (
      x.country != undefined &&
      x.country.length > 0 &&
      x.state != undefined &&
      x.state.length > 0 &&
      x.state != 'null'
    ) {
      adr = x.country + ' , ' + x.state;
    } else if (
      x.country != undefined &&
      x.country.length > 0 &&
      x.country != 'null'
    ) {
      adr = x.country;
    }
    return adr;
  };
  const parent_company_dropdown = (parent_companies) => {
    let arr = [];
    parent_companies.map((parent_company) => {
      arr.push({
        parent_company_name: parent_company.name,
        id: parent_company.id,
      });
    });
    return arr;
  };
  const selected_parent_company = (parent_companies, medical_resource) => {
    let selected_array = [];
    let parent_company = parent_companies.filter(
      (x) => x.id == medical_resource.parent_compnay_id
    );
    if (parent_company.length > 0) {
      parent_company.map((pc) => {
        selected_array.push({ parent_company_name: pc.name, id: pc.id });
      });
    }
    return selected_array;
  };
  const onSelectParentCompanyHandler = (selected_parent_company) => {
    setParentId(selected_parent_company[0]['id']);
  };
  const removeSelectedParentCompany = () => {
    setParentId('');
  };
  const primary_categroy_dropdown = (medical_resource_entities) => {
    let arr = [];
    medical_resource_entities.map((entity) => {
      arr.push({
        primary_entity: entity.entity_name,
        id: entity.medical_resource_entity_id,
      });
    });
    return arr;
  };
  const selected_primary_category = (
    medical_resource_entities,
    medical_resource
  ) => {
    let selected_array = [];
    let primary_category = medical_resource_entities.filter(
      (x) =>
        x.medical_resource_entity_id == medical_resource.primary_category_id
    );
    if (primary_category.length > 0) {
      primary_category.map((pc) => {
        selected_array.push({
          primary_entity: pc.entity_name,
          id: pc.medical_resource_entity_id,
        });
      });
    }
    return selected_array;
  };
  const onSelectPrimaryEntityHandler = (selected_entity) => {
    setPrimaryMedicalResourceEntityId(selected_entity[0]['id']);
  };
  const removeSelectedPrimaryEntity = () => {
    setPrimaryMedicalResourceEntityId('');
  };

  const medical_resoucre_type = () => {
    let arr = [];
    typeName.map((name, index) => {
      arr.push({ medical_resource_type: name, id: index });
    });
    return arr;
  };

  const select_medical_resource_type = (event) => {
    var my_str = [];
    event.forEach(function (single_item) {
      my_str.push(single_item.medical_resource_type);
    });
    let str = my_str.join(',');
    setMedicalResourceTypeName(str);
  };

  const remove_medical_resource_type = (
    medicalResourceTypeName,
    removedItem
  ) => {
    var my_str = [];
    let updatedArray = medicalResourceTypeName.filter(
      (mr) => mr.medical_resource_type != removedItem.medical_resource_type
    );
    updatedArray.forEach(function (single_item) {
      my_str.push(single_item.medical_resource_type);
    });
    console.log(my_str);
    let str = my_str.join(',');
    setMedicalResourceTypeName(str);
  };
  const selected_types = () => {
    let selectedArray = [];
    if (medicalResourceTypeName != null && medicalResourceTypeName.length > 0) {
      var arr = medicalResourceTypeName.split(',');
      arr.map((name, index) => {
        selectedArray.push({ medical_resource_type: name, id: index });
      });
    }
    return selectedArray;
  };
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {showloader ? (
        <Loader type='Circles' color='#2BAD60' height='150' width='150' />
      ) : (
        <React.Fragment>
          <ReactTooltip />
          <div className='modal-header modal-header-padding'>
            <h2 className='add-form-top-heading'>Edit Medical Resource</h2>
            <p className='add-form-top-note'>
              * Please select medical resource entities to view corresponding
              services
            </p>
          </div>
          <Container>
            <Row className='entity-container add-form-entities-container'>
              {medical_resource_entities !== null &&
                medical_resource_entities.map((item, index) => {
                  return (
                    <Col
                      xs={12}
                      md={4}
                      className='resource_entities'
                      key={index}
                    >
                      <label
                        className='checkbox-container add-form-entity-checkbox-label-container add-form-labels'
                        data-tip={item.entity_name}
                      >
                        <span>{item.entity_name}</span>
                        <input
                          type='checkbox'
                          onClick={(e) => entitiesClick(item, e)}
                          id={item.id}
                          ref={checkbox}
                          defaultChecked={item.is_active}
                          className='form-check-input'
                        />
                        <span className='checkmark entity-checkbox'></span>
                        <span>
                          {item.icon && (
                            <img src={item.icon} className='image-setting' />
                          )}
                        </span>
                      </label>
                    </Col>
                  );
                })}
            </Row>
            <hr />
            <blockquote className='blockquote add-form-blockquote'>
              <Row>
                <Col xs={5} md={6}>
                  <div className='form-group mb-5'>
                    <label
                      htmlFor='exampleInputEmail2'
                      className='add-form-labels'
                    >
                      Parent Company{' '}
                    </label>
                    <Multiselect
                      options={parent_company_dropdown(parent_companies)}
                      className='add-form-input'
                      displayValue='parent_company_name'
                      placeholder='Select parent company'
                      selectionLimit={1}
                      selectedValues={selected_parent_company(
                        parent_companies,
                        medical_resource
                      )}
                      onSelect={onSelectParentCompanyHandler}
                      onRemove={removeSelectedParentCompany}
                    />
                  </div>
                  {/*<Form.Group>*/}
                  {/*	<Form.Label className="add-form-labels">Parent Company</Form.Label>*/}
                  {/*	<Form.Control as="select" name="parent_id" ref={register} className="add-form-input">*/}
                  {/*		{medical_resource.parent_company_name ?*/}
                  {/*		<option value={medical_resource.parent_compnay_id && medical_resource.parent_compnay_id} selected>{medical_resource.parent_company_name && medical_resource.parent_company_name}</option>:*/}
                  {/*		<option value="" selected>Select a parent company</option>*/}
                  {/*		}*/}
                  {/*		{*/}
                  {/*			Object.keys(parent_companies).length > 0 && parent_companies.map((item) => {*/}
                  {/*				return (*/}
                  {/*					<option value={item.id} style={{textTransform: 'capitalize'}} key={item.id}>{item.name}</option>*/}
                  {/*				);*/}
                  {/*			})*/}
                  {/*		}*/}
                  {/*	</Form.Control>*/}
                  {/*</Form.Group>*/}
                </Col>
                <Col xs={5} md={6}>
                  <div className='form-group mb-5'>
                    <label
                      htmlFor='exampleInputEmail1'
                      className='add-form-labels'
                    >
                      Primary Entity{' '}
                    </label>
                    <Multiselect
                      options={primary_categroy_dropdown(
                        medical_resource_entities
                      )}
                      className='add-form-input'
                      displayValue='primary_entity'
                      placeholder='Select a primary entity'
                      selectionLimit={1}
                      onRemove={removeSelectedPrimaryEntity}
                      onSelect={onSelectPrimaryEntityHandler}
                      selectedValues={selected_primary_category(
                        medical_resource_entities,
                        medical_resource
                      )}
                    />
                  </div>
                  {/*<div className="form-group mb-5">*/}
                  {/*	<label htmlFor="exampleInputEmail1">Categories *</label>*/}
                  {/*	<Select*/}
                  {/*		displayValue = 'name'*/}
                  {/*		placeholder = 'Select Categories'*/}
                  {/*		style={{chips: {background: "#228CAA", "text-transform": "capitalize"},optionContainer: { "text-transform": "capitalize"}}}*/}
                  {/*		options={primary_categroy_dropdown(medical_resource_entities)}*/}
                  {/*	/>*/}
                  {/*</div>*/}
                  {/*<Form.Group>*/}
                  {/*<Form.Label className="add-form-labels">Primary Entity</Form.Label>*/}
                  {/*<Form.Control as="select" name="primary_entity" ref={register} className="add-form-input">*/}
                  {/*	{ medical_resource.primary_category_name ?*/}
                  {/*		<option value={medical_resource.primary_category_id && medical_resource.primary_category_id} selected>{medical_resource.primary_category_name && medical_resource.primary_category_name}</option>:*/}
                  {/*		<option value="" selected>Select a primary entity</option>*/}
                  {/*	}*/}
                  {/*	{*/}
                  {/*		Object.keys(medical_resource_entities).length > 0 && medical_resource_entities.map((item,index) => {*/}
                  {/*			return (*/}
                  {/*				<option value={item.medical_resource_entity_id} style={{textTransform: 'capitalize'}} key={index}>{item.entity_name}</option>*/}
                  {/*			);*/}
                  {/*		})*/}

                  {/*	}*/}
                  {/*</Form.Control>*/}
                  {/*</Form.Group>*/}
                </Col>
              </Row>
            </blockquote>
            <Row>
              <Col xs={12} md={12}>
                {addresschangeloader && showAddressLoader()}
                <Form.Group controlId='add-form-labels'>
                  {from_list == false ? (
                    <>
                      <Form.Label>Address *</Form.Label>
                      <Form.Control
                        type='text'
                        placeholder='Address'
                        name='address'
                        ref={inputRef}
                        defaultValue={
                          medical_resource.address && medical_resource.address
                        }
                        className='add-form-input selected-address'
                        readOnly={false}
                      />
                    </>
                  ) : (
                    <PlacesAutocomplete
                      value={address}
                      onChange={(e) => handleChange(e)}
                      onSelect={(e) => handleSelect(e)}
                    >
                      {({
                        getInputProps,
                        suggestions,
                        getSuggestionItemProps,
                        loading,
                      }) => (
                        <>
                          <Form.Control
                            {...getInputProps({
                              placeholder: 'Search Places ...',
                              className: 'location-search-input',
                              name: 'address',
                            })}
                          />
                          <div className='autocomplete-dropdown-container'>
                            {loading && <div>Loading...</div>}
                            {suggestions.map((suggestion, index) => {
                              const className = suggestion.active
                                ? 'suggestion-item--active'
                                : 'suggestion-item';
                              // inline style for demonstration purpose
                              const style = suggestion.active
                                ? {
                                    backgroundColor: '#fafafa',
                                    cursor: 'pointer',
                                  }
                                : {
                                    backgroundColor: '#ffffff',
                                    cursor: 'pointer',
                                  };
                              return (
                                <div
                                  key={index}
                                  {...getSuggestionItemProps(suggestion, {
                                    className,
                                    style,
                                  })}
                                >
                                  <span>{suggestion.description}</span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </PlacesAutocomplete>
                  )}
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={4}>
                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Country</Form.Label>
                  {geoAddress.country && (
                    <>
                      <Form.Control
                        type='text'
                        placeholder='Country'
                        ref={register}
                        defaultValue={geoAddress.country}
                        name='country'
                        className='add-form-input'
                        readOnly={true}
                      />
                      <Form.Control
                        type='hidden'
                        defaultValue={geoAddress.country_flag}
                        name='country_flag'
                      />
                      <Form.Control
                        type='hidden'
                        defaultValue={geoAddress.alpha2Code}
                        name='alpha2Code'
                      />
                    </>
                  )}
                  {!geoAddress.country && (
                    <>
                      <Form.Control
                        type='text'
                        placeholder='Country'
                        ref={register}
                        defaultValue={medical_resource.country}
                        name='country'
                        className='add-form-input'
                        readOnly={true}
                      />
                      <Form.Control
                        type='hidden'
                        value={medical_resource.country_flag}
                        name='country_flag'
                      />
                      <Form.Control
                        type='hidden'
                        value={medical_resource.alpha2Code}
                        name='alpha2Code'
                      />
                    </>
                  )}
                </Form.Group>
                <Form.Group controlId='add-form-labels'>
                  <Form.Label>State</Form.Label>
                  {geoAddress.state && (
                    <Form.Control
                      type='text'
                      placeholder='State'
                      defaultValue={geoAddress.state}
                      name='state'
                      ref={register}
                      className='add-form-input'
                      readOnly={true}
                    />
                  )}
                  {!geoAddress.state && (
                    <Form.Control
                      type='text'
                      placeholder='State'
                      defaultValue={medical_resource.state}
                      name='state'
                      ref={register}
                      className='add-form-input'
                      readOnly={true}
                    />
                  )}
                </Form.Group>

                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type='email'
                    placeholder='Email'
                    name='email'
                    ref={register({ required: true })}
                    defaultValue={medical_resource.email}
                    className='add-form-input'
                  />
                </Form.Group>

                <div style={error}>
                  {errors.email && 'Please enter an email.'}
                </div>

                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Phone *</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Phone'
                    name='phone'
                    ref={register({
                      required: true,
                      pattern: {
                        value:
                          /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,9}$/im,
                      },
                    })}
                    defaultValue={
                      medical_resource.phone && medical_resource.phone
                    }
                    className='add-form-input phone-no'
                  />
                </Form.Group>

                <div style={error}>
                  {errors.phone &&
                    'Please enter a valid phone number.eg +2324234234'}
                </div>

                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Website'
                    name='website'
                    ref={register}
                    defaultValue={
                      medical_resource.website && medical_resource.website
                    }
                    className='add-form-input'
                  />
                </Form.Group>

                <Form.Group controlId='add-form-labels'>
                  <Form.Label>24/7 Emergency Contact</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='24/7 Emergency Contact'
                    ref={register({
                      //   required: true,
                      pattern: {
                        value:
                          /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,9}$/im,
                      },
                    })}
                    name='twenty_four_by_seven_emergency'
                    defaultValue={
                      medical_resource.twenty_four_by_seven_emergency_contact &&
                      medical_resource.twenty_four_by_seven_emergency_contact
                    }
                    className='add-form-input'
                  />

                  <div style={error}>
                    {errors.twenty_four_by_seven_emergency &&
                      'Please enter a number between 7 to 14 characters in this format.eg +2324234234'}
                  </div>
                </Form.Group>
                <Form.Group>
                  <Form.Label className='add-form-labels'>
                    Medical Resource Type
                  </Form.Label>
                  <Multiselect
                    id='selection'
                    name='medical_resource_type'
                    options={medical_resoucre_type()}
                    displayValue='medical_resource_type'
                    placeholder='Medical Resource Type'
                    selectedValues={selected_types()}
                    onSelect={(e) => {
                      select_medical_resource_type(e);
                    }}
                    onRemove={remove_medical_resource_type}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Longitude *</Form.Label>
                  {geoAddress.longitude && (
                    <Form.Control
                      type='text'
                      placeholder='Longitude'
                      defaultValue={geoAddress.longitude}
                      name='longitude'
                      ref={register}
                      className='add-form-input'
                      readOnly={true}
                    />
                  )}
                  {!geoAddress.longitude && (
                    <Form.Control
                      type='text'
                      placeholder='Longitude'
                      defaultValue={medical_resource.longitude}
                      name='longitude'
                      ref={register}
                      className='add-form-input'
                      readOnly={true}
                    />
                  )}
                </Form.Group>

                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Latitude *</Form.Label>
                  {geoAddress.latitude && (
                    <Form.Control
                      type='text'
                      placeholder='Latitude'
                      defaultValue={geoAddress.latitude}
                      name='latitude'
                      ref={register}
                      className='add-form-input'
                      readOnly={true}
                    />
                  )}

                  {!geoAddress.latitude && (
                    <Form.Control
                      type='text'
                      placeholder='Latitude'
                      defaultValue={medical_resource.latitude}
                      name='latitude'
                      ref={register}
                      className='add-form-input'
                      readOnly={true}
                    />
                  )}
                </Form.Group>

                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Alternate Phone</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Alternate Phone'
                    name='alternate_phone'
                    ref={register}
                    defaultValue={
                      medical_resource.alternate_phone &&
                      medical_resource.alternate_phone
                    }
                    className='add-form-input'
                    onChange={onChangeAlternateNumberFields}
                  />
                </Form.Group>

                <div style={error}>
                  {alternateNumberError &&
                    'Please enter a number between 7 to 14 characters in this format.eg +2324234234'}
                </div>

                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Poc name</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='poc_name'
                    ref={register}
                    name='poc_name'
                    defaultValue={
                      medical_resource.poc_name && medical_resource.poc_name
                    }
                    className='add-form-input'
                  />
                </Form.Group>

                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Poc email</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='poc_email'
                    ref={register}
                    name='poc_email'
                    defaultValue={
                      medical_resource.poc_email && medical_resource.poc_email
                    }
                    className='add-form-input'
                  />
                </Form.Group>

                <Form.Group controlId='add-form-labels'>
                  <Form.Label className='add-form-labels'>Poc Phone</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Poc Phone'
                    name='poc_phone'
                    ref={register}
                    onChange={onChangePocPhoneNumberFields}
                    className='add-form-input'
                    defaultValue={
                      medical_resource.poc_phone && medical_resource.poc_phone
                    }
                  />
                </Form.Group>
                <div style={error}>
                  {pocPhoneNumberError &&
                    'Please enter a number between 7 to 14 characters in this format.eg +2324234234'}
                </div>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group controlId='add-form-labels'>
                  <Form.Label>City</Form.Label>
                  {geoAddress.city && (
                    <Form.Control
                      type='text'
                      placeholder='City'
                      defaultValue={geoAddress.city}
                      ref={register}
                      name='city'
                      className='add-form-input'
                      readOnly={true}
                    />
                  )}
                  {!geoAddress.city && (
                    <Form.Control
                      type='text'
                      placeholder='City'
                      defaultValue={medical_resource.city}
                      ref={register}
                      name='city'
                      className='add-form-input'
                      readOnly={true}
                    />
                  )}
                </Form.Group>

                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Postal code </Form.Label>
                  {geoAddress.postal_code && (
                    <Form.Control
                      type='text'
                      placeholder='Postal code'
                      ref={register}
                      name='postal_code'
                      defaultValue={
                        geoAddress.postal_code
                          ? geoAddress.postal_code
                          : medical_resource.postal_code
                      }
                      className='add-form-input'
                      readOnly={true}
                    />
                  )}
                  {!geoAddress.postal_code && (
                    <Form.Control
                      type='text'
                      placeholder='Postal code'
                      ref={register}
                      name='postal_code'
                      defaultValue={medical_resource.postal_code}
                      className='add-form-input'
                      readOnly={true}
                    />
                  )}
                </Form.Group>

                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Name'
                    ref={register({ required: true })}
                    name='name'
                    defaultValue={
                      medical_resource.name && medical_resource.name
                    }
                    className='add-form-input'
                  />
                </Form.Group>

                <div style={error}>
                  {errors.resource_name && 'Please enter resource name.'}
                </div>

                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Fax Number</Form.Label>
                  <Form.Control
                    type='string'
                    placeholder='Fax number'
                    ref={register}
                    name='fax_number'
                    defaultValue={
                      medical_resource.fax_number && medical_resource.fax_number
                    }
                    className='add-form-input'
                  />
                </Form.Group>

                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Poc title</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Poc title'
                    ref={register}
                    name='poc_title'
                    defaultValue={
                      medical_resource.poc_title && medical_resource.poc_title
                    }
                    className='add-form-input'
                  />
                </Form.Group>

                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Poc mobile</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Poc mobile'
                    ref={register}
                    name='poc_mobile'
                    defaultValue={
                      medical_resource.poc_mobile && medical_resource.poc_mobile
                    }
                    className='add-form-input'
                    onChange={onChangeNumberFields}
                  />
                </Form.Group>

                <div style={error}>
                  {numberError &&
                    'Please enter a number between 7 to 14 characters in this format.eg +2324234234'}
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={12}>
                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows='4'
                    placeholder='Notes'
                    className='add-form-input'
                    // ref={register({ required: true })}
                    ref={register}
                    name='instructions'
                    defaultValue={
                      medical_resource.instructions &&
                      medical_resource.instructions
                    }
                  />
                </Form.Group>
                <div style={error}>
                  {errors.instructions && 'Please enter notes.'}
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={12}>
                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Preferred service areas *</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows='4'
                    placeholder='Preferred service areas'
                    ref={register({ required: false })}
                    name='preferred_service_areas'
                    defaultValue={
                      medical_resource.preferred_service_areas &&
                      medical_resource.preferred_service_areas
                    }
                    className='add-form-input'
                    readOnly={true}
                  />
                </Form.Group>
                {/*<div style={error}>*/}
                {/*	{errors.preferred_service_areas && 'Please enter preferred service areas.'}*/}
                {/*</div>*/}
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={12}>
                <Form.Label>Other service areas *</Form.Label>
                <Form.Control
                  as='textarea'
                  rows='4'
                  placeholder='Other service areas'
                  ref={register({ required: false })}
                  name='other_service_areas'
                  defaultValue={
                    medical_resource.other_service_areas &&
                    medical_resource.other_service_areas
                  }
                  className='add-form-input'
                  readOnly={true}
                />
                {/*<div style={error}>*/}
                {/*	{errors.other_service_areas && 'Please enter other service areas.'}*/}
                {/*</div>*/}
              </Col>
            </Row>
            <Row>
              {
                // preferred_button_display(inputList) &&
                <Col xs={4} md={4}>
                  <Form.Group>
                    <Form.Label className='add-form-labels'>
                      Preferred service areas *
                    </Form.Label>
                    <Form.Control
                      className='btn btn-success'
                      type='button'
                      value='Add Preferred Service Areas'
                      onClick={(e) => {
                        handleAddClick(e);
                        handleShow(e, 0);
                      }}
                    />
                  </Form.Group>
                </Col>
              }
            </Row>
            {inputList.map((x, i) => {
              return (
                <>
                  <Row>
                    <Col xs={8} md={8}>
                      <Form.Group>
                        <Form.Label className='add-form-labels'>
                          {display_label(x)}
                        </Form.Label>
                        <Form.Control
                          readOnly
                          name='address'
                          placeholder='Enter Address'
                          value={display_address_value(x)}
                          // value={ x.address}
                          onChange={(e) =>
                            handleInputChange(
                              e,
                              i,
                              other_areas.address,
                              click_edit_button
                            )
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={2} md={2}>
                      <Form.Group className='mt-4'>
                        <Form.Control
                          className='btn btn-primary'
                          id={`map-${i}`}
                          name='button'
                          type='button'
                          value='Edit'
                          onClick={(e) => {
                            handleShow(e, i);
                            edit_address(e, i, x);
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={2} md={2}>
                      <Form.Group className='mt-4'>
                        <Form.Control
                          className='btn btn-danger'
                          type='button'
                          value='Remove'
                          onClick={(e) => handleRemoveClick(e, i)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={4} md={4}>
                      {inputList.length - 1 === i && (
                        <Form.Group>
                          <Form.Control
                            className='btn btn-success'
                            type='button'
                            value='Add More Other Services Areas'
                            onClick={(e) => {
                              handleAddClick(e);
                              handleShow(e, i);
                            }}
                          />
                        </Form.Group>
                      )}
                    </Col>
                  </Row>
                </>
              );
            })}
            {inputList.length < 1 && (
              <Row>
                <Col xs={4} md={4}>
                  <Form.Group>
                    <Form.Control
                      className='btn btn-success'
                      type='button'
                      value='Add More Other Services Areas'
                      onClick={(e) => {
                        handleAddClick(e);
                        handleShow(e, 0);
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
            <Modal
              show={show}
              onHide={handleClose}
              backdrop='static'
              keyboard={false}
            >
              <Modal.Header closeButton>
                <Modal.Title>Other Service Areas</Modal.Title>
              </Modal.Header>
              <PreferredAreaMap
                map={props.map}
                zoom={props.zoom}
                center={props.center}
                setOtherServcieAreas={setOtherServcieAreas}
                inputList={inputList}
                edit_address_state={edit_address_state}
                edit_address_index={edit_address_index}
                is_preferred_service_areas={is_preferred_service_areas}
                is_other_service_areas={is_other_service_areas}
                from_edit_form={from_edit_form}
                lat={parseFloat(medical_resource.latitude)}
                lng={parseFloat(medical_resource.longitude)}
              />
              <Modal.Footer>
                <Button
                  variant='primary'
                  name='address'
                  data-addresses={JSON.stringify(other_areas)}
                  value={other_areas.address}
                  onClick={(e) => {
                    handleClose(e);
                    handleInputChange(
                      e,
                      d_integer,
                      other_areas,
                      click_edit_button
                    );
                  }}
                >
                  Done
                </Button>
              </Modal.Footer>
            </Modal>
            <Row className='mt-3'>
              <Col xs={12} md={6}>
                <div style={{ display: 'flex' }}>
                  <label className='checkbox-container add-form-labels add-form-checkbox-label-container'>
                    Active
                    <input
                      type='checkbox'
                      name='is_inactive'
                      ref={register}
                      defaultChecked={medical_resource.is_inactive}
                      onChange={(e) => {
                        isInactiveCheckBoxHandler(e);
                      }}
                    />
                    <span className='checkmark entity-checkbox'></span>
                  </label>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div style={{ display: 'flex' }}>
                  <label className='checkbox-container add-form-labels add-form-checkbox-label-container'>
                    Translation Service
                    <input
                      type='checkbox'
                      name='is_translation_service'
                      ref={register}
                      defaultChecked={medical_resource.is_translation_service}
                      onChange={(e) => {
                        is_translationServiceCheckBoxHandler(e);
                      }}
                    />
                    <span className='checkmark entity-checkbox'></span>
                  </label>
                </div>
              </Col>
            </Row>
            <h3>Contract Details</h3>
            <Row>
              <Col xs={12} md={6}>
                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Initial contact</Form.Label>
                  <Form.Control
                    type='date'
                    name='initial_contact'
                    className='add-form-input'
                    ref={register}
                    defaultValue={
                      medical_resource.initial_contact &&
                      medical_resource.initial_contact
                    }
                  />
                </Form.Group>
                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Audit returned</Form.Label>
                  <Form.Control
                    type='date'
                    name='audit_returned'
                    className='add-form-input'
                    ref={register}
                    defaultValue={
                      medical_resource.audit_returned &&
                      medical_resource.audit_returned
                    }
                  />
                </Form.Group>
                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Initial sa sent</Form.Label>
                  <Form.Control
                    type='date'
                    name='initial_sa_sent'
                    className='add-form-input'
                    ref={register}
                    defaultValue={
                      medical_resource.initial_sa_sent &&
                      medical_resource.initial_sa_sent
                    }
                  />
                </Form.Group>
                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Rmi sa review</Form.Label>
                  <Form.Control
                    type='date'
                    name='rmi_sa_review'
                    className='add-form-input'
                    ref={register}
                    defaultValue={
                      medical_resource.rmi_sa_review &&
                      medical_resource.rmi_sa_review
                    }
                  />
                </Form.Group>
                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Vendor signature</Form.Label>
                  <Form.Control
                    type='date'
                    name='vendor_signature'
                    className='add-form-input'
                    ref={register}
                    defaultValue={
                      medical_resource.vendor_signature &&
                      medical_resource.vendor_signature
                    }
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Audit sent</Form.Label>
                  <Form.Control
                    type='date'
                    name='audit_sent'
                    className='add-form-input'
                    ref={register}
                    defaultValue={
                      medical_resource.audit_sent && medical_resource.audit_sent
                    }
                  />
                </Form.Group>
                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Rmi audit review</Form.Label>
                  <Form.Control
                    type='date'
                    name='rmi_audit_review'
                    className='add-form-input'
                    ref={register}
                    defaultValue={
                      medical_resource.rmi_audit_review &&
                      medical_resource.rmi_audit_review
                    }
                  />
                </Form.Group>
                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Initial sa returned</Form.Label>
                  <Form.Control
                    type='date'
                    name='initial_sa_returned'
                    className='add-form-input'
                    ref={register}
                    defaultValue={
                      medical_resource.initial_sa_returned &&
                      medical_resource.initial_sa_returned
                    }
                  />
                </Form.Group>
                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Rmi signature</Form.Label>
                  <Form.Control
                    type='date'
                    ref={register}
                    name='rmi_signature'
                    className='add-form-input'
                    defaultValue={
                      medical_resource.rmi_signature &&
                      medical_resource.rmi_signature
                    }
                  />
                </Form.Group>
                <Form.Group controlId='add-form-labels'>
                  <Form.Label>Contract expiration date</Form.Label>
                  <Form.Control
                    type='date'
                    ref={register}
                    name='contract_expiration_date'
                    className='add-form-input'
                    defaultValue={
                      medical_resource.contract_expiration_date &&
                      medical_resource.contract_expiration_date
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <hr style={{ border: '1px solid #dee2e6' }} />
            <Row>
              <div>
                {active_medical_resource_entities &&
                  active_medical_resource_entities.length > 0 && (
                    <div>
                      {active_medical_resource_entities.map(
                        (medical_resource_entity, index) => (
                          <div className='medical_services' key={index}>
                            {
                              <div>
                                <h3 style={{ textTransform: 'capitalize' }}>
                                  {medical_resource_entity.entity_name}
                                </h3>
                                <input
                                  type='checkbox'
                                  type='hidden'
                                  ref={register}
                                  name={`Entity_id${medical_resource_entity.medical_resource_entity_id}`}
                                  value={
                                    medical_resource_entity.medical_resource_entity_id
                                  }
                                  className='entity'
                                />
                                {medical_resource_entity.categories.map(
                                  (category, index) => (
                                    <div className='categories' key={index}>
                                      <Row>
                                        <Col
                                          xs={12}
                                          md={12}
                                          style={{ marginBottom: '10px' }}
                                          className='mt-3'
                                        >
                                          <h5
                                            style={{
                                              textTransform: 'capitalize',
                                              marginBottom: '5px',
                                            }}
                                          >
                                            {category.name}
                                          </h5>
                                          <input
                                            type='hidden'
                                            ref={register}
                                            name={`Category_id${category.id}`}
                                            value={category.category_id}
                                            className='category'
                                          />
                                        </Col>
                                      </Row>
                                      <Row className='form-services mt-2'>
                                        {category.services.map(
                                          (service, index) => (
                                            <li
                                              className='map-container-service-item'
                                              key={index}
                                            >
                                              <Col xs={12} md={12}>
                                                <label className='checkbox-container add-form-entity-checkbox-label-container add-form-labels'>
                                                  {service.name}
                                                  <input
                                                    type='checkbox'
                                                    ref={register}
                                                    name={`medical_resource_entities[][medical_resource_entity_id][${medical_resource_entity.medical_resource_entity_id}]`}
                                                    value={service.service_id}
                                                    data={category.category_id}
                                                    className='service'
                                                    defaultChecked={
                                                      service.is_active
                                                    }
                                                    onClick={
                                                      changeServicesHandler
                                                    }
                                                  />
                                                  <span className='checkmark entity-checkbox'></span>
                                                </label>
                                              </Col>
                                            </li>
                                          )
                                        )}
                                      </Row>
                                    </div>
                                  )
                                )}
                              </div>
                            }
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
            </Row>
            <hr style={{ border: '1px solid #dee2e6' }} />
            <Row>
              <Col xs={12} md={12}>
                {
                  <div
                    style={{
                      marginBottom: '10px',
                      width: 'auto',
                      padding: '5px',
                    }}
                  >
                    <Row>
                      <Col xs={12} md={3}>
                        <h3>Payments</h3>
                      </Col>
                    </Row>
                    <Row className='form-services mt-2'>
                      {payments.map((item, index) => (
                        <div key={index}>
                          <li className='map-container-payment-item'>
                            <Col xs={12} md={3} key={item.id}>
                              <label className='checkbox-container add-form-labels add-form-checkbox-label-container'>
                                {item.name}
                                <input
                                  type='checkbox'
                                  ref={register}
                                  name={`payment[${item.id}]`}
                                  value={item.id}
                                  className='service'
                                  onChange={(e) => changePaymentHandler(e)}
                                  defaultChecked={item.is_active}
                                />
                                <span className='checkmark entity-checkbox'></span>
                              </label>
                            </Col>
                          </li>
                        </div>
                      ))}
                    </Row>
                    <hr style={{ border: '1px solid #dee2e6' }} />
                  </div>
                }

                {
                  <div
                    style={{
                      marginBottom: '10px',
                      width: 'auto',
                      padding: '5px',
                    }}
                  >
                    <Row>
                      <Col xs={12} md={3}>
                        <h3>Assessment</h3>
                      </Col>
                    </Row>
                    {
                      <Row className='form-services mt-2'>
                        <Col xs={12} md={3}>
                          <label className='checkbox-container add-form-labels add-form-checkbox-label-container'>
                            None
                            <input
                              type='checkbox'
                              ref={register}
                              name='is_assessment_none'
                              className='service'
                              defaultChecked={
                                medical_resource.is_assessment_none
                              }
                              onChange={(e) => {
                                assessmentNoneCheckBoxHandler(e);
                              }}
                            />
                            <span className='checkmark entity-checkbox'></span>
                          </label>
                        </Col>
                        <Col xs={12} md={3}>
                          <label className='checkbox-container add-form-labels add-form-checkbox-label-container'>
                            Remote
                            <input
                              type='checkbox'
                              ref={register}
                              name='is_assessment_remote'
                              className='service'
                              defaultChecked={
                                medical_resource.is_assessment_remote
                              }
                              onChange={(e) => {
                                isRemoteCheckBoxHandler(e);
                              }}
                            />
                            <span className='checkmark entity-checkbox'></span>
                          </label>
                        </Col>
                        <Col xs={12} md={3}>
                          <label className='checkbox-container add-form-labels add-form-checkbox-label-container'>
                            In Person
                            <input
                              type='checkbox'
                              ref={register}
                              name='is_assessment_in_person'
                              className='service'
                              defaultChecked={
                                medical_resource.is_assessment_in_person
                              }
                              onChange={(e) => {
                                isPersonCheckBoxHandler(e);
                              }}
                            />
                            <span className='checkmark entity-checkbox'></span>
                          </label>
                        </Col>
                      </Row>
                    }
                  </div>
                }
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={4}>
                <div
                  style={{
                    marginBottom: '10px',
                    width: 'auto',
                    padding: '5px',
                  }}
                >
                  <Form.Group>
                    <Form.Control
                      as='textarea'
                      rows='4'
                      placeholder='Assessment link'
                      ref={register}
                      name='assessment_link'
                      defaultValue={
                        medical_resource.assessment_link &&
                        medical_resource.assessment_link
                      }
                      className='add-form-input'
                      style={{ marginTop: '10px' }}
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Control
                      as='textarea'
                      rows='4'
                      placeholder='Languages spoken'
                      ref={register}
                      name='languages_spoken'
                      defaultValue={
                        medical_resource.languages_spoken &&
                        medical_resource.languages_spoken
                      }
                      className='add-form-input'
                      style={{ marginTop: '10px' }}
                    />
                  </Form.Group>
                </div>
              </Col>
              <Col xs={12} md={4}>
                <div
                  style={{
                    marginBottom: '10px',
                    width: 'auto',
                    padding: '5px',
                  }}
                >
                  <Form.Group>
                    <Form.Control
                      as='textarea'
                      rows='4'
                      placeholder='Agreement link'
                      ref={register}
                      name='agreement_link'
                      defaultValue={
                        medical_resource.agreement_link &&
                        medical_resource.agreement_link
                      }
                      className='add-form-input'
                      style={{ marginTop: '10px' }}
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Control
                      as='textarea'
                      rows='4'
                      placeholder='Vendor link'
                      ref={register}
                      name='vendor_link'
                      defaultValue={
                        medical_resource.vendor_link &&
                        medical_resource.vendor_link
                      }
                      className='add-form-input'
                      style={{ marginTop: '10px' }}
                    />
                  </Form.Group>
                </div>
              </Col>
            </Row>
            <hr />
            <Row>
              <Col xs={12} md={12}>
                <ImageUploader
                  withIcon={true}
                  buttonText='Choose images'
                  buttonStyles={{ backgroundColor: '#228CAA' }}
                  onChange={onDrop}
                  imgExtension={['.jpg', '.gif', '.png', '.gif']}
                  maxFileSize={1048576}
                  withPreview={true}
                  label='Max image size: 1mb *'
                  singleImage={true}
                  className='add-form-image-uploader'
                />
                <div className='text-center'>
                  {Object.keys(image).length == 0 && (
                    <img
                      src={medical_resource.image}
                      style={{ width: '250px' }}
                    />
                  )}
                </div>
              </Col>
            </Row>
            <Button as='input' type='submit' value='Submit' />
          </Container>
        </React.Fragment>
      )}
    </Form>
  );
}

export default MedicalResourceEditForm;
