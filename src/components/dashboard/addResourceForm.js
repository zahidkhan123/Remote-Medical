import { Container, Row, Col, Button, Form, Modal } from 'react-bootstrap';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ImageUploader from 'react-images-upload';
import { trackPromise, usePromiseTracker } from 'react-promise-tracker';
import Loader from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { servicePath } from '../../constants/defaultValues';
import ReactTooltip from 'react-tooltip';
import '../../styles/Form/AddResourceForm.scss';
import { Disable } from 'react-disable';
import PreferredAreaMap from './preferred_area_map';
import { Multiselect } from 'multiselect-react-dropdown';

function MedicalResourceForm(props) {
  const { register, handleSubmit, errors, form } = useForm(); // initialize the hook
  const [fields, setFields] = useState({});
  const [loader, setLoader] = useState(false);
  const [disableForm, setDisableForm] = useState(false);
  //Checkboxes
  const [activeCheckbox, setactiveCheckbox] = useState(false);
  const [translationService, settranslationService] = useState(false);
  const [noneCheckbox, setNoneCheckbox] = useState(false);
  const [remoteCheckbox, setRemoteCheckbox] = useState(false);
  const [inPerson, setInPerson] = useState(false);
  const [payment, setPayment] = useState(false);
  const [parent_companies, setParentCompanies] = useState([]);
  const [geoAddress, setGeoAddress] = useState([]);
  const [phoneError, setPhoneError] = useState(false);
  const apiUrl = servicePath;
  const auth_token = localStorage.getItem('auth_token');
  const [numberError, setNumberError] = useState(false);
  const [alternateNumberError, setAlternateNumberError] = useState(false);
  const [pocPhoneNumberError, setPocPhoneNumberError] = useState(false);
  const [image, setImage] = useState([]);
  const { promiseInProgress } = usePromiseTracker();
  const [
    medical_resource_entities_services,
    setMedicalResourceEntitiesServices,
  ] = useState([]);
  const [payments, setPayments] = useState([]);
  const [edit_address_state, setEditAddressState] = useState(false);
  const [edit_address_index, setEditAddressIndex] = useState(null);
  const [is_preferred_service_areas, setIsPreferredServiceAreas] =
    useState(false);
  const [is_other_service_areas, setIsOtherServiceAreas] = useState(false);
  const [parent_id, setParentId] = useState('');
  const [
    primary_medical_resource_entity_id,
    setPrimaryMedicalResourceEntityId,
  ] = useState(null);
  //Toast
  const noEntity = () => toast.error('Please select atleast one entity!');
  const noServices = () =>
    toast.error('Please select atleast one service from categories!');
  const noImage = () => toast.error('Please add image!');
  const noParentCompanies = () =>
    toast.error('Something went wrong Parent Companies not Found!');
  const notifyNumberFormatError = () =>
    toast.error('Please enter alternate phone and poc mobile in valid format!');
  const entityClick = () => toast.info(CustomToastWithLink);

  const entities = props.entities;
  const resources = props.resources;
  const latlng = props.latlng;
  const checkbox = useRef(null);
  let medical_resource_entity_array = [];

  const [inputList, setInputList] = useState([]);
  const [other_areas, setOtherServcieAreas] = useState([]);
  const [show, setShow] = useState(false);
  const [d_integer, setDInteger] = useState(null);
  const [click_edit_button, setClickEditButton] = useState(false);
  const [from_edit_form, setFromEditForm] = useState(false);
  const [typeName, setTypeName] = useState([
    'Labs',
    'Physical',
    'Dental',
    'Vaccines',
    'Other',
  ]);
  const [medicalResourceTypeName, setMedicalResourceTypeName] = useState('');
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
  const onDrop = (picture) => {
    setImage(picture);
  };
  const error = {
    color: 'red',
    marginBottom: '3px',
  };
  const section_categories = (e) => {
    e.preventDefault();
    if (document.getElementsByClassName('medical_services')[0]) {
      document.getElementsByClassName('medical_services')[0].scrollIntoView();
    }
  };
  const headers = {
    'AUTH-TOKEN': auth_token,
    'Content-Type': 'multipart/form-data',
  };
  //Payment api getting all  payments
  Object.keys(payments).length == 0 &&
    axios
      .get(apiUrl + '/admin_api/api/v1/payments.json', {
        headers: {
          'AUTH-TOKEN': auth_token,
        },
      })
      .then((response) => {
        setPayments(response.data.payments);
      })
      .catch((error) => {});

  useEffect(() => {
    AllResources();
  }, []);

  const serviceChangeHandler = (e) => {
    let array = [];
    medical_resource_entities_services.map((item) => {
      item.medical_resource_entity_categories.map((category) => {
        category.medical_resource_entity_category_services.map((service) => {
          if (e.target.checked) {
            if (service.id == e.target.id) {
              service.is_active = 'true';
            }
          } else {
            if (service.id == e.target.id) {
              service.is_active = 'false';
            }
          }
        });
      });
      array.push(item);
    });
    setMedicalResourceEntitiesServices(array);
  };

  const changePaymentHandler = (e) => {
    const { value, checked } = e.target;

    let payments_array = payments;
    payments_array.forEach((item) => {
      item.is_active = false;
    });

    payments_array.forEach((item) => {
      if (item.id == value) {
        item.is_active = checked;
      }
    });
    setPayments(payments_array);
  };

  const showLoader = () => {
    return (
      <div
        style={{
          margin: 'auto',
          width: '50%',
          padding: '10px',
          position: 'absolute',
          marginLeft: '450px',
          marginTop: '-120px',
        }}
      >
        <Loader type='Circles' color='#2BAD60' height='150' width='150' />
      </div>
    );
  };

  // Getting services by selecting the entity
  const entitiesClick = (e) => {
    if (e.target.checked == true) {
      entityClick();
    }
    setDisableForm(true);
    setLoader(true);
    setMedicalResourceEntitiesServices([]);
    let entities = document.getElementsByClassName('resource_entities');
    let i = 0;
    let entities_checkboxes = [];
    while (i < entities.length) {
      entities_checkboxes.push(
        entities[i].querySelectorAll('.form-check-input')
      );
      i++;
    }
    let checkbox_ids = [];
    let j = 0;
    while (j < entities_checkboxes.length) {
      if (entities_checkboxes[j][0].checked == true) {
        checkbox_ids.push(entities_checkboxes[j][0].id);
      }
      j++;
    }

    if (checkbox_ids.length == 0) {
      setLoader(false);
      setDisableForm(false);
    }

    // for(let z=0; z<checkbox_ids.length; z++){
    if (e.target.checked == true) {
      let temp_array = [];
      let temp_array_two = [];
      axios
        .get(
          apiUrl + '/admin_api/api/v1/medical_resource_entities/' + e.target.id,
          {
            headers: {
              'AUTH-TOKEN': auth_token,
              Accept: '*/*',
            },
          }
        )
        .then((res) => {
          if (res.status == 200) {
            temp_array.push(res.data.medical_resource_entity);
            temp_array.filter(
              (v, i, a) => a.findIndex((t) => t.id === v.id) === i
            );
            if (medical_resource_entities_services.length > 0) {
              temp_array_two = [
                ...medical_resource_entities_services,
                res.data.medical_resource_entity,
              ];
            }
            medical_resource_entities_services.length > 0
              ? setMedicalResourceEntitiesServices(temp_array_two)
              : setMedicalResourceEntitiesServices(temp_array);
            setLoader(false);
            setDisableForm(false);
          } else {
            toast.error('Record not found!.');
          }
        })
        .catch((error) => {
          console.log(error);
        });
      // }
    } else {
      setDisableForm(false);
      let filter_Array = medical_resource_entities_services.filter(
        (id) => id.id != e.target.id
      );
      setMedicalResourceEntitiesServices(filter_Array);
      setLoader(false);
    }
  };

  const AllResources = () => {
    setLoader(true);
    axios
      .get(
        apiUrl +
          `/admin_api/api/v1/dashboard/parent_companies.json?parent=parent`,
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
      .catch((error) => {
        setLoader(false);
        noParentCompanies();
      });
    axios
      .get(
        apiUrl +
          `/admin_api/api/v1/medical_resources/get_geo_address.json?lat=${latlng.lat}&lng=${latlng.lng}`,
        {
          headers: {
            'AUTH-TOKEN': auth_token,
            'Content-Type': 'application/json',
          },
        }
      )
      .then((response) => {
        if (response.status == 200) {
          setGeoAddress(response.data.geo_location_data);
          setLoader(false);
        } else {
          toast.error(response.message);
        }
      })
      .catch((error) => {
        setLoader(false);
        toast.error(error);
      });
  };

  //Making Medical Resource Entity array
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
        let s =
          Category_service_container[z].querySelectorAll('.form-check-input');
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

  // Entities validations
  const entitiesValidation = (e) => {
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
      return true;
    }
    return false;
  };

  //services validation
  const servicesValidation = (e) => {
    let categories = document.getElementsByClassName('categories');
    let z = 0;
    let count = 0;
    while (z < categories.length) {
      let k = 0;
      let category = categories[z].querySelectorAll('.form-check-input');
      while (k < category.length) {
        let status = category[k].checked;
        if (status) {
          count++;
        }
        k++;
      }
      z++;
    }
    if (count == 0) {
      e.preventDefault();
      noServices();
      return false;
    }
    return true;
  };

  const imagevalidation = (e) => {
    if (Object.keys(image).length == 0) {
      e.preventDefault();
      // noImage();
      // return false;
      return false;
    } else {
      return true;
    }
  };

  const add_more_add_more_validation = (e) => {
    e.preventDefault();
    let value = Boolean(
      inputList.find((single_list) => {
        return single_list.address == '';
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
    // props.setreload(true);
    let entity_status = entitiesValidation(e);
    if (!entity_status) {
      let service_status = servicesValidation(e);
      if (service_status) {
        category_service();
        let image_status = imagevalidation(e);
        let add_more_validation = add_more_add_more_validation(e);
        // if (image_status && add_more_validation) {
        if (add_more_validation) {
          if (!numberError && !alternateNumberError && !pocPhoneNumberError) {
            let formData = new FormData();
            formData.append('medical_resource[name]', data.name);
            formData.append('medical_resource[latitude]', data.latitude);
            formData.append('medical_resource[longitude]', data.longitude);
            formData.append('medical_resource[phone]', data.phone);
            formData.append('medical_resource[address]', data.address);
            formData.append('medical_resource[postal_code]', data.postal_code);
            formData.append(
              'medical_resource[alternate_phone]',
              data.alternate_phone
            );
            formData.append('medical_resource[fax_number]', data.fax_number);
            formData.append('medical_resource[email]', data.email);
            formData.append('medical_resource[parent_id]', parent_id);
            formData.append(
              'medical_resource[medical_resource_type]',
              medicalResourceTypeName
            );
            formData.append(
              'medical_resource[primary_category_id]',
              primary_medical_resource_entity_id == null
                ? ''
                : primary_medical_resource_entity_id
            );
            formData.append(
              'medical_resource[twenty_four_by_seven_emergency]',
              data.twenty_four_by_seven_emergency
            );
            formData.append('medical_resource[city]', data.city);
            formData.append('medical_resource[state]', data.state);
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
            image_status &&
              formData.append(
                'medical_resource[image]',
                image[0],
                image[0].name
              );
            // formData.append('medical_resource[preferred_service_areas]', data.preferred_service_areas);
            // formData.append('medical_resource[other_service_areas]', data.other_service_areas);
            formData.append('medical_resource[website]', data.website);
            formData.append(
              'medical_resource[assessment_link]',
              data.assessment_link
            );
            formData.append(
              'medical_resource[instructions]',
              data.instructions
            );
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
            formData.append(
              'medical_resource[rmi_sa_review]',
              data.rmi_sa_review
            );
            formData.append(
              'medical_resource[rmi_signature]',
              data.rmi_signature
            );
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
                  medical_resource_entity_array[i].categories[j].services
                    .length;
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
            for (var i = 0; i < data.payment.length; i++) {
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
                inputList[i].dataset.address
              );
              formData.append(
                'medical_resource[addresses][][city]',
                inputList[i].dataset.city
              );
              formData.append(
                'medical_resource[addresses][][state]',
                inputList[i].dataset.state
              );
              formData.append(
                'medical_resource[addresses][][country_name]',
                inputList[i].dataset.country
              );
              formData.append(
                'medical_resource[addresses][][alpha2Code]',
                inputList[i].dataset.alpha2Code
              );
              formData.append(
                'medical_resource[addresses][][country_flag]',
                inputList[i].dataset.country_flag
              );
              formData.append(
                'medical_resource[addresses][][latitude]',
                inputList[i].dataset.latitude
              );
              formData.append(
                'medical_resource[addresses][][longitude]',
                inputList[i].dataset.longitude
              );
              formData.append(
                'medical_resource[addresses][][postal_code]',
                inputList[i].dataset.postal_code
              );
              formData.append(
                'medical_resource[addresses][][description]',
                inputList[i].dataset.description
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
                .post(
                  apiUrl + '/admin_api/api/v1/medical_resources.json',
                  formData,
                  {
                    headers: headers,
                  }
                )
                .then((response) => {
                  if (response.status == 200) {
                    props.setMarkerState();
                    props.setSubmitForm((currentIsActive) => !currentIsActive);
                    // props.setZoom(10);
                    props.click();
                  } else {
                    toast.error(response.data.message);
                  }
                })
                .catch((error) => {
                  toast.error(error.response.data.message);
                })
            );
          }
        }
      }
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

  const onChangePocPhoneNumberFields = (event) => {
    let regex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,9}$/im;
    if (regex.test(event.target.value)) {
      setPocPhoneNumberError(false);
    } else {
      setPocPhoneNumberError(true);
    }
  };

  // handle input change
  const handleInputChange = (e, index, address, click_edit_button) => {
    if (click_edit_button == true) {
      index = index;
    } else {
      index = inputList.length - 1;
    }
    const { name, value } = e.target;
    const list = [...inputList];
    list[index][name] = value;
    list[index]['dataset'] = JSON.parse(e.target.dataset.addresses);
    list[index]['is_preferred_service_areas'] = is_preferred_service_areas;
    list[index]['is_other_service_areas'] = is_other_service_areas;
    setInputList(list);
    setFromEditForm(false);
    setEditAddressState(false);
    setClickEditButton(false);
  };

  // handle click event of the Remove button
  const handleRemoveClick = (e, index) => {
    let list = [...inputList];
    list.splice(index, 1);
    setInputList(list);
    setFromEditForm(false);
  };

  // handle click event of the Add button
  const prevCount = usePrevious(is_preferred_service_areas);

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }
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

  const handleShow = (e, index) => {
    e.preventDefault();
    setShow(true);
    setClickEditButton(false);
    setDInteger(index);
  };

  const handleClose = () => {
    setShow(false);
    setFromEditForm(false);
    setEditAddressState(false);
    setClickEditButton(false);
  };
  const edit_address = (e, index, current_address) => {
    setEditAddressIndex(index);
    setEditAddressState(true);
    setClickEditButton(true);
    setFromEditForm(true);
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
      x.dataset != undefined &&
      x.dataset.country != null &&
      x.dataset.country.length > 0 &&
      x.dataset.state != null &&
      x.dataset.state.length > 0
    ) {
      adr = x.dataset.country + ' , ' + x.dataset.state;
    } else if (
      x.dataset != undefined &&
      x.dataset.country != null &&
      x.dataset.country.length > 0
    ) {
      adr = x.dataset.country;
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
  const onSelectParentCompanyHandler = (selected_parent_company) => {
    setParentId(selected_parent_company[0]['id']);
  };
  const removeSelectedParentCompany = () => {
    setParentId('');
  };
  const primary_categroy_dropdown = (medical_resource_entities) => {
    let arr = [];
    medical_resource_entities.map((entity) => {
      arr.push({ primary_entity: entity.entity_name, id: entity.id });
    });
    return arr;
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

  const remove_medical_resource_type = (event) => {
    if (event.length == 0) {
      setMedicalResourceTypeName('');
    } else {
      var arr = medicalResourceTypeName.split(',');
      var removeValue = event[0].medical_resource_type;
      var updatedValue = arr.filter((a) => a == removeValue);
      var str = updatedValue.join(',');
      setMedicalResourceTypeName(str);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {promiseInProgress ? (
        <div
          style={{
            width: '100%',
            height: '100',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
          }}
        >
          <Loader type='Circles' color='#2BAD60' height='350' width='350' />
        </div>
      ) : (
        <React.Fragment>
          <ReactTooltip />
          <div className='modal-header modal-header-padding'>
            <h2 className='add-form-top-heading'>Add Medical Resource</h2>
            <p className='add-form-top-note'>
              * Please select medical resource entities to view corresponding
              services
            </p>
          </div>
          <Container>
            <Disable disabled={disableForm}>
              <Row className='entity-container add-form-entities-container'>
                {entities !== null &&
                  entities.map((item) => {
                    return (
                      <Col
                        xs={12}
                        md={4}
                        className='resource_entities'
                        key={item.id}
                      >
                        <label
                          className='checkbox-container add-form-entity-checkbox-label-container add-form-labels'
                          data-tip={item.entity_name}
                        >
                          {item.entity_name}
                          <input
                            type='checkbox'
                            onClick={(e) => entitiesClick(e)}
                            id={item.id}
                            ref={checkbox}
                            className='form-check-input'
                          />
                          <span className='checkmark entity-checkbox'></span>
                          <span>
                            {item.image && (
                              <img src={item.image} className='image-setting' />
                            )}
                          </span>
                        </label>
                      </Col>
                    );
                  })}
              </Row>
            </Disable>
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
                      onSelect={onSelectParentCompanyHandler}
                      onRemove={removeSelectedParentCompany}
                    />
                  </div>
                  {/*<Form.Group>*/}
                  {/*  <Form.Label className="add-form-labels">Parent Company</Form.Label>*/}
                  {/*  <Form.Control as="select" name="parent_id" ref={register} className="add-form-input">*/}
                  {/*    <option value="" disabled selected>Select a parent company</option>*/}
                  {/*    {*/}
                  {/*      Object.keys(parent_companies).length > 0 && parent_companies.map((item) => {      */}
                  {/*        return (*/}
                  {/*          <option value={item.id} style={{textTransform: 'capitalize'}} key={item.id}>{item.name}</option>*/}
                  {/*        );*/}
                  {/*      })*/}
                  {/*    }*/}
                  {/*  </Form.Control>*/}
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
                      options={primary_categroy_dropdown(entities)}
                      className='add-form-input'
                      displayValue='primary_entity'
                      placeholder='Select a primary entity'
                      selectionLimit={1}
                      onRemove={removeSelectedPrimaryEntity}
                      onSelect={onSelectPrimaryEntityHandler}
                    />
                  </div>
                  {/*<Form.Group>*/}
                  {/*  <Form.Label className="add-form-labels">Primary Entity</Form.Label>*/}
                  {/*  <Form.Control as="select" name="primary_entity" ref={register} className="add-form-input">*/}
                  {/*    <option value="" disabled selected>Select a primary entity</option>*/}
                  {/*    { */}
                  {/*      Object.keys(entities).length > 0 && entities.map((item) => { */}
                  {/*        return (*/}
                  {/*          <option value={item.id} style={{textTransform: 'capitalize'}} key={item.id}>{item.entity_name}</option>*/}
                  {/*        );*/}
                  {/*      })*/}
                  {/*  */}
                  {/*    }*/}
                  {/*  </Form.Control>*/}
                  {/*</Form.Group>*/}
                </Col>
              </Row>
            </blockquote>
						<Row>
							<Col xs={12} md={12}>
								<Form.Group>
									<Form.Label className='add-form-labels'>Address *</Form.Label>
									<Form.Control
										type='text'
										placeholder='Address'
										defaultValue={geoAddress.address}
										name='address'
										ref={register({ required: true })}
										className='add-form-input'
										readOnly={false}
									/>
								</Form.Group>

								<div style={error}>
									{errors.address && 'Please enter address.'}
								</div>
							</Col>
						</Row>
            <Row>
              {loader && showLoader()}
              <Col xs={12} md={4}>
                <Form.Group>
                  <label className='add-form-labels'>Country</label>
                  <Form.Control
                    type='text'
                    placeholder='Country'
                    defaultValue={geoAddress.country}
                    name='country'
                    ref={register}
                    className='add-form-input'
                    readOnly={true}
                  />
                  <Form.Control
                    type='hidden'
                    value={geoAddress.country_flag}
                    name='country_flag'
                  />
                  <Form.Control
                    type='hidden'
                    value={geoAddress.alpha2Code}
                    name='alpha2Code'
                  />
                </Form.Group>

                <Form.Group>
                  <label className='add-form-labels'>State</label>
                  <Form.Control
                    type='text'
                    placeholder='State'
                    defaultValue={geoAddress.state}
                    name='state'
                    ref={register}
                    className='add-form-input'
                    readOnly={true}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className='add-form-labels'>Email *</Form.Label>
                  <Form.Control
                    type='email'
                    placeholder='Email'
                    name='email'
                    ref={register({ required: true })}
                    className='add-form-input'
                  />
                </Form.Group>

                <div style={error}>
                  {errors.email && 'Please enter an email.'}
                </div>

                <Form.Group>
                  <Form.Label className='add-form-labels'>Phone *</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Phone number'
                    name='phone'
                    ref={register({
                      required: true,
                      pattern: {
                        value:
                          /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,9}$/im,
                      },
                    })}
                    className='add-form-input phone-no'
                  />
                </Form.Group>

                <div style={error}>
                  {errors.phone &&
                    'Please enter a valid phone number.eg +2324234234'}
                </div>

                <Form.Group>
                  <Form.Label className='add-form-labels'>Website</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Website'
                    name='website'
                    ref={register}
                    className='add-form-input'
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className='add-form-labels'>
                    24/7 Emergency Contact
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='24/7 Emergency Contact'
                    ref={register({
                      // required: true,
                      pattern: {
                        value:
                          /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,9}$/im,
                      },
                    })}
                    name='twenty_four_by_seven_emergency'
                    className='add-form-input'
                  />
                </Form.Group>

                <div style={error}>
                  {errors.twenty_four_by_seven_emergency &&
                    'Please enter a number between 7 to 14 characters in this format.eg +2324234234'}
                </div>
                <Form.Group>
                  <Form.Label className='add-form-labels'>Poc Phone</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Poc Phone'
                    name='poc_phone'
                    ref={register}
                    onChange={onChangePocPhoneNumberFields}
                    className='add-form-input'
                  />
                </Form.Group>
                <div style={error}>
                  {pocPhoneNumberError &&
                    'Please enter a number between 7 to 14 characters in this format.eg +2324234234'}
                </div>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label className='add-form-labels'>
                    Longitude *
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Longitude'
                    defaultValue={geoAddress.longitude}
                    name='longitude'
                    ref={register({ required: true })}
                    className='add-form-input'
                    readOnly={true}
                  />
                </Form.Group>

                <div style={error}>
                  {errors.longitude && 'Please enter longitude.'}
                </div>

                <Form.Group>
                  <Form.Label className='add-form-labels'>
                    Latitude *
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Latitude'
                    defaultValue={geoAddress.latitude}
                    name='latitude'
                    ref={register({ required: true })}
                    className='add-form-input'
                    readOnly={true}
                  />
                </Form.Group>

                <div style={error}>
                  {errors.latitude && 'Please enter latitude.'}
                </div>

                <Form.Group>
                  <Form.Label className='add-form-labels'>
                    Alternate Phone
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Alternate Phone'
                    name='alternate_phone'
                    ref={register}
                    onChange={onChangeAlternateNumberFields}
                    className='add-form-input'
                  />
                </Form.Group>

                <div style={error}>
                  {alternateNumberError &&
                    'Please enter a number between 7 to 14 characters in this format.eg +2324234234'}
                </div>

                <Form.Group>
                  <Form.Label className='add-form-labels'>Poc name</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='poc name'
                    ref={register}
                    name='poc_name'
                    className='add-form-input'
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className='add-form-labels'>Poc email</Form.Label>
                  <Form.Control
                    type='email'
                    placeholder='poc email'
                    ref={register}
                    name='poc_email'
                    className='add-form-input'
                  />
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
                    onSelect={select_medical_resource_type}
                    onRemove={remove_medical_resource_type}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label className='add-form-labels'>City</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='City'
                    defaultValue={geoAddress.city}
                    ref={register}
                    name='city'
                    className='add-form-input'
                    readOnly={true}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className='add-form-labels'>
                    Postal code{' '}
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='postal code'
                    ref={register}
                    name='postal_code'
                    className='add-form-input'
                    defaultValue={geoAddress.postal_code}
                    readOnly={true}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className='add-form-labels'>Name *</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Name'
                    ref={register({ required: true })}
                    name='name'
                    className='add-form-input'
                  />
                </Form.Group>

                <div style={error}>{errors.name && 'Please enter name.'}</div>
                <Form.Group>
                  <Form.Label className='add-form-labels'>
                    Fax Number
                  </Form.Label>
                  <Form.Control
                    type='string'
                    placeholder='Fax number'
                    ref={register}
                    name='fax_number'
                    className='add-form-input'
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className='add-form-labels'>Poc title</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Poc title'
                    ref={register}
                    name='poc_title'
                    className='add-form-input'
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className='add-form-labels'>
                    Poc mobile
                  </Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Poc mobile'
                    ref={register}
                    name='poc_mobile'
                    onChange={onChangeNumberFields}
                    className='add-form-input'
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
                <Form.Group>
                  <Form.Label className='add-form-labels'>Notes</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows='4'
                    placeholder='Notes'
                    // ref={register({ required: true })}
                    ref={register}
                    name='instructions'
                    className='add-form-input'
                  />
                </Form.Group>
                <div style={error}>
                  {errors.instructions && 'Please enter notes.'}
                </div>
              </Col>
            </Row>
            {/*<Row>*/}
            {/*  <Col xs={12} md={12}>*/}
            {/*    <Form.Group>*/}
            {/*      <Form.Label className="add-form-labels">Preferred service areas *</Form.Label>*/}
            {/*      <Form.Control as="textarea" rows="4" placeholder="Preferred service areas"  ref={register} name="preferred_service_areas" className="add-form-input"/>*/}
            {/*    </Form.Group>*/}
            {/*    <div style={error}>*/}
            {/*      {errors.preferred_service_areas && 'Please enter preferred service areas.'}*/}
            {/*    </div>*/}
            {/*  </Col>*/}
            {/*</Row>*/}
            {/*<Row>*/}
            {/*  <Col xs={12} md={12}>*/}
            {/*    <Form.Group>*/}
            {/*      <Form.Label className="add-form-labels">Other service areas </Form.Label>*/}
            {/*      <Form.Control as="textarea" rows="4" placeholder="Other service areas" name="other_service_areas" ref={register} className="add-form-input"/>*/}
            {/*      <div style={error}>*/}
            {/*        {errors.other_service_areas && 'Please enter other service areas.'}*/}
            {/*      </div>*/}
            {/*    </Form.Group>  */}
            {/*  </Col>*/}
            {/*</Row>*/}
            <Row>
              {preferred_button_display(inputList) && (
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
              )}
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
                          onChange={(e) =>
                            handleInputChange(e, i, other_areas.address)
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
                          onClick={(e) => handleRemoveClick(e, i, x)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={4} md={4}>
                      {inputList.length - 1 === i && (
                        <Form.Group>
                          <Form.Label className='add-form-labels'>
                            Other Service areas *
                          </Form.Label>
                          <Form.Control
                            className='btn btn-success'
                            type='button'
                            value='Add More Other Service Areas'
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
                    <Form.Label className='add-form-labels'>
                      Other Service areas *
                    </Form.Label>
                    <Form.Control
                      className='btn btn-success'
                      type='button'
                      value='Add More Other Service Areas'
                      onClick={(e) => {
                        handleAddClick(e);
                        handleShow(e, 1);
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
                <Modal.Title>Services Areas</Modal.Title>
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
                // from_edit_form              = {from_edit_form}
                lat={latlng.lat}
                lng={latlng.lng}
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
            <Row className='mt-4'>
              <Col xs={12} md={6}>
                <div>
                  <label className='checkbox-container add-form-labels add-form-checkbox-label-container'>
                    Active
                    <input
                      type='checkbox'
                      onChange={() =>
                        setactiveCheckbox((prevState) => !prevState)
                      }
                      name='is_inactive'
                      ref={register}
                      value={activeCheckbox}
                    />
                    <span className='checkmark entity-checkbox'></span>
                  </label>
                </div>
              </Col>

              <Col xs={12} md={6}>
                <div className=''>
                  <label className='checkbox-container add-form-labels add-form-checkbox-label-container'>
                    Translation Service
                    <input
                      type='checkbox'
                      onChange={() =>
                        settranslationService((prevState) => !prevState)
                      }
                      name='is_translation_service'
                      ref={register}
                      value={translationService}
                    />
                    <span className='checkmark entity-checkbox'></span>
                  </label>
                </div>
              </Col>
            </Row>
            <hr />
            <h3>Contract Details</h3>
            <Row>
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className='add-form-labels'>
                    Initial contact
                  </Form.Label>
                  <Form.Control
                    type='date'
                    name='initial_contact'
                    ref={register}
                    className='add-form-input'
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className='add-form-labels'>
                    Audit returned
                  </Form.Label>
                  <Form.Control
                    type='date'
                    name='audit_returned'
                    ref={register}
                    className='add-form-input'
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className='add-form-labels'>
                    Initial sa sent
                  </Form.Label>
                  <Form.Control
                    type='date'
                    name='initial_sa_sent'
                    ref={register}
                    className='add-form-input'
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className='add-form-labels'>
                    Rmi sa review
                  </Form.Label>
                  <Form.Control
                    type='date'
                    name='rmi_sa_review'
                    ref={register}
                    className='add-form-input'
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className='add-form-labels'>
                    Vendor signature
                  </Form.Label>
                  <Form.Control
                    type='date'
                    name='vendor_signature'
                    ref={register}
                    className='add-form-input'
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className='add-form-labels'>
                    Audit sent
                  </Form.Label>
                  <Form.Control
                    type='date'
                    name='audit_sent'
                    ref={register}
                    className='add-form-input'
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className='add-form-labels'>
                    Rmi audit review
                  </Form.Label>
                  <Form.Control
                    type='date'
                    name='rmi_audit_review'
                    ref={register}
                    className='add-form-input'
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className='add-form-labels'>
                    Initial sa returned
                  </Form.Label>
                  <Form.Control
                    type='date'
                    name='initial_sa_returned'
                    ref={register}
                    className='add-form-input'
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className='add-form-labels'>
                    Rmi signature
                  </Form.Label>
                  <Form.Control
                    type='date'
                    ref={register}
                    name='rmi_signature'
                    className='add-form-input'
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className='add-form-labels'>
                    Contract expiration date
                  </Form.Label>
                  <Form.Control
                    type='date'
                    ref={register}
                    name='contract_expiration_date'
                    className='add-form-input'
                  />
                </Form.Group>
              </Col>
            </Row>
            <hr style={{ border: '1px solid #dee2e6' }} />
            <Row>
              {Object.keys(medical_resource_entities_services).length > 0 && (
                <div>
                  {console.log(medical_resource_entities_services)}
                  {medical_resource_entities_services.map((value) => (
                    <div className='medical_services'>
                      <h3 style={{ textTransform: 'capitalize' }}>
                        {value.entity_name}
                      </h3>
                      <Form.Control
                        type='hidden'
                        ref={register}
                        name={`Entity_id${value.id}`}
                        value={value.id}
                        className='entity'
                      />
                      {value.medical_resource_entity_categories.map((item) => (
                        <div className='categories'>
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
                                {item.category_name}
                              </h5>
                              <Form.Control
                                type='hidden'
                                ref={register}
                                name={`Category_id${item.id}`}
                                value={item.category_id}
                                className='category'
                              />
                            </Col>
                          </Row>
                          <Row className='form-services mt-2'>
                            {item.medical_resource_entity_category_services.map(
                              (service, index) => (
                                <li className='map-container-service-item'>
                                  {console.log(service.is_active)}
                                  <Col xs={12} md={12}>
                                    <label className='checkbox-container add-form-entity-checkbox-label-container add-form-labels'>
                                      {service.service_name}
                                      <input
                                        type='checkbox'
                                        id={service.id}
                                        ref={checkbox}
                                        value={service.service_id}
                                        className='form-check-input'
                                        onChange={(e) =>
                                          serviceChangeHandler(e)
                                        }
                                        defaultChecked={
                                          service.is_active
                                            ? service.is_active
                                            : false
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
                      ))}
                      <hr style={{ border: '1px solid #dee2e6' }} />
                    </div>
                  ))}
                </div>
              )}
            </Row>
            <Row>
              <Col xs={12} md={12}>
                {Object.keys(payments).length > 0 && (
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
                        <li className='map-container-payment-item'>
                          <Col xs={12} md={3} key={item.id}>
                            <label className='checkbox-container add-form-labels add-form-checkbox-label-container'>
                              {item.name}
                              <input
                                type='checkbox'
                                id={item.id}
                                ref={register}
                                name={`payment[${index}]`}
                                onChange={changePaymentHandler}
                                value={item.id}
                                className='service'
                              />
                              <span className='checkmark entity-checkbox'></span>
                            </label>
                          </Col>
                        </li>
                      ))}
                    </Row>
                    <hr style={{ border: '1px solid #dee2e6' }} />
                  </div>
                )}
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
                              onChange={() =>
                                setNoneCheckbox((prevState) => !prevState)
                              }
                              value={noneCheckbox}
                              className='service'
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
                              onChange={() =>
                                setRemoteCheckbox((prevState) => !prevState)
                              }
                              value={remoteCheckbox}
                              className='service'
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
                              onChange={() =>
                                setInPerson((prevState) => !prevState)
                              }
                              value={inPerson}
                              className='service'
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
                      placeholder='Agreement link'
                      ref={register}
                      name='agreement_link'
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
                      placeholder='Assessment link'
                      ref={register}
                      name='assessment_link'
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
                      className='add-form-input'
                      style={{ marginTop: '10px' }}
                    />
                  </Form.Group>
                </div>
              </Col>
            </Row>
            <hr />
            <Row>
              <Col>
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
              </Col>
            </Row>
            <Button
              as='input'
              type='submit'
              value='Submit'
              style={{ backgroundColor: '#228CAA' }}
            />
          </Container>
        </React.Fragment>
      )}
    </Form>
  );
}

export default MedicalResourceForm;
