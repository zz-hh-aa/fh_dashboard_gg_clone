"use client";
import { trueDependencies } from "mathjs";
import React, { useState } from "react";
import calculateFairhold from "@/sharedCode/testClasses";

const CalculatorInput = () => {
  const [housePostcode, sethousePostcode] = useState(""); // variable associated to the postcode
  const houseTypes = {
    Detached: "D",
    Semidetached: "S",
    Terrace: "T",
    Flat: "F",
  }; // variables associated to the house types
  const [houseType, setHouseType] = useState(houseTypes.Detached); // variables associated to the house type

  const [houseBedrooms, setHouseBedrooms] = useState(""); // variables associated to the number of bedrooms in the house
  const [howSize, setHouseSize] = useState(""); // variables associated to the house size
  const [houseAge, setHouseAge] = useState(""); // variables associated to the house age

  // fucntion that defines what happens after submitting the form
  async function handleSubmit(e: any) {
    e.preventDefault(); // pr event the default of the form
    const formData = new FormData(e.currentTarget); // get the data in the form, e.g postcode, house size etc

    //fetch the data: call the api and attach the form data
    const response = await fetch("/api", {
      method: "POST",
      body: formData, // pass the form data to the API
    }).then((response) => response.json());

    calculateFairhold(response);
  }

  return (
    <div className="flex items-center justify-center text-black mt-5">
      <div className=" w-1/2  border-black border-2 rounded-lg ">
        <div className="bg-black text-white h-48 flex items-center justify-center">
          <h1 className="text-6xl">Fairhold Calculator</h1>
        </div>
        <form onSubmit={handleSubmit} className=" flex flex-col m-5">
          <h2 className="mb-1 font-bold">House postcode</h2>
          <input
            className="mb-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
            disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
             rounded-md "
            type="text"
            placeholder="e.g. SE17 1PE"
            value={housePostcode}
            onChange={(e) => sethousePostcode(e.target.value)}
            name="housePostcode"
          />
          <h2 className="mb-1 font-bold">House size</h2>
          <input
            className="mb-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
            disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
             rounded-md "
            type="text"
            placeholder="Provide the house size in m square, e.g. 66"
            value={howSize}
            onChange={(e) => setHouseSize(e.target.value)}
            name="houseSize"
          />
          <h2 className="mb-1 font-bold">House typology</h2>
          <div className="flex">
            <label className="mx-2">
              <input
                className="accent-black"
                type="radio"
                id="Detached"
                name="houseType"
                value={houseTypes.Detached}
                checked={houseType === houseTypes.Detached}
                onChange={() => setHouseType(houseTypes.Detached)}
              />
              Detached
            </label>

            <label className="mx-2">
              <input
                className="accent-black"
                type="radio"
                id="Semidetached"
                name="houseType"
                value={houseTypes.Semidetached}
                checked={houseType === houseTypes.Semidetached}
                onChange={() => setHouseType(houseTypes.Semidetached)}
              />
              Semi-Detached
            </label>

            <label className="mx-2">
              <input
                className="accent-black"
                type="radio"
                id="Terrace"
                name="houseType"
                value={houseTypes.Terrace}
                checked={houseType === houseTypes.Terrace}
                onChange={() => setHouseType(houseTypes.Terrace)}
              />
              Terrace
            </label>

            <label className="mx-2">
              <input
                className="accent-black"
                type="radio"
                id="Flat"
                name="houseType"
                value={houseTypes.Flat}
                checked={houseType === houseTypes.Flat}
                onChange={() => setHouseType(houseTypes.Flat)}
              />
              Flat
            </label>
          </div>

          <h2 className="mb-1 font-bold">House age</h2>
          <input
            className="mb-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
            disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
             rounded-md "
            type="float"
            placeholder="Provide the house age in years. For a new build, insert age 1"
            value={houseAge}
            onChange={(e) => setHouseAge(e.target.value)}
            name="houseAge"
          />
          <h2 className="mb-1 font-bold">Number of bedrooms</h2>
          <input
            className="mb-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
            disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
             rounded-md "
            type="integer"
            placeholder="Provide the number of bedrooms e.g. 2"
            value={houseBedrooms}
            onChange={(e) => setHouseBedrooms(e.target.value)}
            name="houseBedrooms"
          />
          <button
            className="text-white bg-black w-1/3 rounded-xl"
            type="submit"
          >
            Calculate
          </button>
        </form>
      </div>
    </div>
  );
};

export default CalculatorInput;
