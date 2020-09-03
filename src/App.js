import React, {useState, useEffect} from 'react';
import {withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow} from "react-google-maps"
import * as nokomoData from "./data/csvjson.json";

// function pour display the marker from Gmap
function Map(props) {

    const [selectedPlace, setselectedPlace] = useState(null);

    return (
        <GoogleMap
            defaultZoom={12}
            defaultCenter={{lat: 47.376888, lng: 8.541694}}
        >
            {nokomoData.default
                .filter((place) => {
                    // if price more expensive
                    if (props.formConfiguration.priceMax < place.Pricem2) {
                        return false;
                    }

                    if (!props.formConfiguration.categoriesSelected.includes(place.BuildingType)) {
                        return false;
                    }

                    if (props.formConfiguration.withParking === true && place.Parking == "" ) {
                        return false;
                    }

                    return true;
                })
                .map((place, key) => {
                return (
                    <Marker
                        key={key}
                        position={{
                            lat: parseFloat(place.lat),
                            lng: parseFloat(place.lng)
                        }}

                        onClick={() => {
                            setselectedPlace(place)
                        }}
                    />
                )

            })}

            {selectedPlace && (
                <InfoWindow
                    position={{
                        lat: parseFloat(selectedPlace.lat),
                        lng: parseFloat(selectedPlace.lng)
                    }}

                    onCloseClick={() => {
                        setselectedPlace(null)
                    }}
                >
                    <div>
                        <h2>{selectedPlace.BuildingType}</h2>
                        <p>
                            <strong>Price/m^2: {selectedPlace.Pricem2}</strong><br/><br/>
                            <strong>Parking : {selectedPlace.Parking ? "Oui" : "Non"}</strong>
                        </p>
                    </div>
                </InfoWindow>
            )}

        </GoogleMap>
    )
}

// wrapper for Gmap API
const WrappedMap = withScriptjs(withGoogleMap( Map));

function App() {

    // State to manager the filter
    const [formInfo, setFormInfo] = useState({
        priceMax: null,
        categoriesSelected: [],
        withParking: null
    })

    let handleChangePrice = (event) => {
        setFormInfo({
            ...formInfo,
            priceMax:event.target.value
        });
    }

    let handleChangeCategorie = (event) => {

        let categoriesSelected = formInfo.categoriesSelected;

        if (event.target.checked == false && categoriesSelected.includes(event.target.value)) {
            // remove the categorie
            categoriesSelected = categoriesSelected.filter(c => (c != event.target.value))
        } else if (event.target.checked == true && categoriesSelected) {
            // add the categorie
            categoriesSelected.push(event.target.value)
        }

        setFormInfo({
            ...formInfo,
            categoriesSelected: categoriesSelected
        });
    }

    let handleChangeParking = (event) => {

        setFormInfo({
            ...formInfo,
            withParking: event.target.checked
        });
    }

    let placesCategories = [];
    let priceMin = null;
    let priceMax = null;

    {nokomoData.default.forEach((place, key) => {
        if (! placesCategories.includes(place.BuildingType)) {
            placesCategories.push(place.BuildingType)
        }

        // init
        if (priceMin === null && priceMax === null) {
            priceMin = place.Pricem2;
        }

        if (place.Pricem2 < priceMin) {
            priceMin = place.Pricem2;
        }

        if (priceMax < place.Pricem2) {
            priceMax = place.Pricem2;
        }
    }
    )}


    // Similaire à componentDidMount et componentDidUpdate :
    useEffect(() => {
        setFormInfo({
            priceMax: priceMin,
            categoriesSelected: placesCategories,
            withParking: false
        })
    }, placesCategories);

    // init State
    return <div className="row">
        <div className="col-sm-2">
            <form>
                <div className="form-group" >
                    <label htmlFor="customRange2"><span>Min {priceMin}</span></label>
                    <input style={{"height" : "100%", "width" : "85%"}} type="range" className="custom-range"  onChange={handleChangePrice}  min={priceMin} max={priceMax} />
                    <span>Max {priceMax}</span>
                </div>
                {placesCategories && placesCategories.map((categorie, index) => {
                        return (<span style={{"marginRight" : "2%", "width" : "85%"}}>
                                    <input className="form-check-input" defaultChecked={true} onChange={handleChangeCategorie}  type="checkbox" id="inlineCheckbox1" value={categorie}/>
                                    <label className="form-check-label" htmlFor="inlineCheckbox1">{categorie}</label>
                               </span>)
                    }
                )}

                <div className="form-group row">
                    <div className="col-sm-10">
                        <div className="form-check">
                            <input className="form-check-input" onChange={handleChangeParking}  type="checkbox" id="gridCheck1"/>
                            <label className="form-check-label" htmlFor="gridCheck1">
                                With parking ?
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div className="col-sm-10">
            <WrappedMap
                googleMapURL={`https://maps.googleapis.com/maps/api/js?key=AIzaSyB0Hh0XbLPG-B1zhhS9KAlBJ1z0V2MPpQM&v=3.exp&libraries=geometry,drawing,places`}
                loadingElement={<div style={{height: `100%`}}/>}
                containerElement={<div style={{height: `600px`}}/>}
                mapElement={<div style={{height: `100%`}}/>}
                formConfiguration={formInfo}
            />
        </div>
    </div>
}

export default App;
