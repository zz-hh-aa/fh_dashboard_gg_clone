// import the Request and Response classes
import { NextResponse, NextRequest } from "next/server";

// import mysql2/promise for mysql connectivity
import mysql from "mysql2/promise";

// import GetDBSettings to retrieve the database connection environment parameters, and the IDBSettings object interface
import { GetDBSettings, IDBSettings } from "@/sharedCode/common";
const connectionParams = GetDBSettings();

// define and export the GET handler function
export async function POST(request: Request) {
  const formData = await request.formData(); // get the data submitted in the form

  const data = {
    housePostcode: formData.get("housePostcode"), // get the housePostcode variable
    houseSize: formData.get("houseSize"), // get the houseSize variable
    houseAge: formData.get("houseAge"), // get the houseAge variable
    houseBedrooms: formData.get("houseBedrooms"), // get the houseBedrooms variable
    houseType: formData.get("houseType"), // get the houseType variable
  };

  try {
    const connection = await mysql.createConnection(connectionParams); // create the connection to the database

    // data are going to be queried at different levels of granularity based on the postcode
    const postcodeParts = data.housePostcode.split(/\s+/); // split the postcode based on the white space, for example SE17 1PE into SE17 and 1PE
    const postcodeLvl1 = postcodeParts[0].replace(/[^a-zA-Z]/g, ""); // extract only the characters of the first part, e.g SE
    const postcodeLvl2 = postcodeParts[0]; //  exctract the first part in total , e.g., SE17
    const postcodeLvl3 = postcodeParts[0] + " " + postcodeParts[1][0]; // extract the first part and add the secon, e.g., SE17 1

    // create the progressive queries
    const minimumNumberPostcodes = 30; // minimum number of entries to create the average
    let pricesPaid; // declare the variable for prices paid
    let numberOfTransactions; // declare the variable for numbers of transactions retrieved
    let granularityPostcode; // declare the granularity of the postcode

    const postdoceSearch3 = postcodeLvl3 + "%"; // add the % for SQL query
    const getPricesLvl3Query = `SELECT id,postcode,price FROM fairhold.pricesPaid WHERE propertyType = '${data.houseType}' AND postcode LIKE '${postdoceSearch3}'`; // create the sql query and count how many items meet the criteria
    const [pricesPaidLvl3] = await connection.execute(getPricesLvl3Query); // execute the query and retrieve the results
    const numberOfPricesPaidLvl3 = Object.keys(pricesPaidLvl3).length; // extract the number of entries

    if (
      pricesPaidLvl3 !== null &&
      numberOfPricesPaidLvl3 >= minimumNumberPostcodes
    ) {
      pricesPaid = pricesPaidLvl3; // if condtion is met, the granularity is appropriate
      numberOfTransactions = numberOfPricesPaidLvl3; // check the granularity
      granularityPostcode = postcodeLvl3; // granularity of the postcode
    } else {
      const postdoceSearch2 = postcodeLvl2 + "%"; // add the % for SQL query
      const getPricesLvl2Query = `SELECT id,postcode,price FROM fairhold.pricesPaid WHERE propertyType = '${data.houseType}' AND postcode LIKE '${postdoceSearch2}'`; // create the sql query and count how many items meet the criteria
      const [pricesPaidLvl2] = await connection.execute(getPricesLvl2Query); // execute the query and retrieve the results
      const numberOfPricesPaidLvl2 = Object.keys(pricesPaidLvl2).length; // extract the number of entries

      if (
        pricesPaidLvl2 !== null &&
        numberOfPricesPaidLvl2 >= minimumNumberPostcodes
      ) {
        pricesPaid = pricesPaidLvl2; // if condtion is met, the granularity is appropriate
        numberOfTransactions = numberOfPricesPaidLvl2; // check the granularity
        granularityPostcode = postcodeLvl2; // granularity of the postcode
      } else {
        const postdoceSearch1 = postcodeLvl1 + "%"; // add the % for SQL query
        const getPricesLvl1Query = `SELECT id,postcode,price FROM fairhold.pricesPaid WHERE propertyType = '${data.houseType}' AND postcode LIKE '${postdoceSearch1}'`; // create the sql query and count how many items meet the criteria
        const [pricesPaidLvl1] = await connection.execute(getPricesLvl1Query); // execute the query and retrieve the results
        const numberOfPricesPaidLvl1 = Object.keys(pricesPaidLvl1).length; // extract the number of entries
        pricesPaid = pricesPaidLvl1; // if condtion is met, the granularity is appropriate
        numberOfTransactions = numberOfPricesPaidLvl1; // check the granularity
        granularityPostcode = postcodeLvl1; // granularity of the postcode when performing the average price search
      }
    }

    // Calculate the total price
    const totalPrice = pricesPaid.reduce(
      (total: number, item: any) => total + item.price,
      0
    );

    // Calculate the average price
    const averagePrice = totalPrice / pricesPaid.length;
    const getBuildPriceQuery = `SELECT * FROM fairhold.buildPrices WHERE houseType = '${data.houseType}'`; // create the sql query
    const [buildPrice] = await connection.execute(getBuildPriceQuery); // execute the query and retrieve the results

    // get the ITL3 value
    const getITL3Query = `SELECT itl3 FROM fairhold.itl3 WHERE postcode = '${data.housePostcode}'`; // create the sql query
    const [itl3] = await connection.execute(getITL3Query); // execute the query and retrieve the results

    // get the gdhi value --> Note: this need to change to accommodate future data
    const getGDHIQuery = `SELECT gdhi_2020 FROM fairhold.gdhi JOIN fairhold.itl3 ON fairhold.gdhi.itl3 = fairhold.itl3.itl3 WHERE postcode = '${data.housePostcode}'`; // create the sql query
    const [gdhi] = await connection.execute(getGDHIQuery); // execute the query and retrieve the results

    // get the rent value --> Note: this need to change to accommodate future data
    const getRentQuery = `SELECT monthlyMeanRent FROM fairhold.rent JOIN fairhold.itl3 ON fairhold.rent.itl3 = fairhold.itl3.itl3 WHERE postcode = '${data.housePostcode}'`; // create the sql query
    const [rent] = await connection.execute(getRentQuery); // execute the query and retrieve the results
    const totalRent = rent.reduce(
      (total: number, item: any) => total + item.monthlyMeanRent,
      0
    );
    const averageRent = totalRent / rent.length;

    // get the rent value --> Note: this need to change to accommodate future data
    const getSocialRentQuery = `SELECT earningsPerWeek FROM fairhold.socialRent JOIN fairhold.itl3 ON fairhold.socialRent.itl3 = fairhold.itl3.itl3 WHERE postcode = '${data.housePostcode}'`; // create the sql query
    const [Socialrent] = await connection.execute(getSocialRentQuery); // execute the query and retrieve the results
    const totalSocialRent = rent.reduce(
      (total: number, item: any) => total + item.earningsPerWeek,
      0
    );
    const averageSocialRent = totalSocialRent / Socialrent.length;

    // get the hpi value --> Note: this need to change to accommodate future data
    const getHPIQuery = `SELECT hpi_2020 FROM fairhold.hpi JOIN fairhold.itl3 ON fairhold.hpi.itl3 = fairhold.itl3.itl3 WHERE postcode = '${data.housePostcode}'`; // create the sql query
    const [hpi] = await connection.execute(getHPIQuery); // execute the query and retrieve the results
    const totalHpi = hpi.reduce(
      (total: number, item: any) => total + item.hpi_2020,
      0
    );
    const averageHpi = totalHpi / hpi.length;

    connection.end(); // close the connection
    return NextResponse.json({
      postcode: data.housePostcode,
      houseType: data.houseType,
      houseAge: parseFloat(data.houseAge),
      houseBedrooms: parseFloat(data.houseBedrooms),
      houseSize: parseFloat(data.houseSize),
      averagePrice: parseFloat(averagePrice.toFixed(2)),
      itl3: itl3,
      gdhi: gdhi,
      hpi: averageHpi,
      buildPrice: buildPrice,
      averageRent: averageRent,
      averageSocialRent: averageSocialRent,
      numberOfTransactions: numberOfTransactions,
      granularityPostcode: granularityPostcode,
      pricesPaid: pricesPaid,
    }); // return the results
  } catch (err) {
    console.log("ERROR: API - ", (err as Error).message);

    const response = {
      error: (err as Error).message,
      returnedStatus: 200,
    };

    return NextResponse.json(response, { status: 200 });
  }
}

/* // import the Request and Response classes
import { NextResponse, NextRequest } from "next/server";

// 1. populate the connection parameters
let connectionParams = GetDBSettings();

// define and export the GET handler function
export async function GET(request: Request) {
  

    // 3. create a query to fetch data
    const test_postcode = "SE17 1PE";
    let get_exp_query = "";
    

    // 4. exec the query and retrieve the results
   

    // 5. close the connection when done
    

    // return the results as a JSON API response
    
  } catch (err) {
    console.log("ERROR: API - ", (err as Error).message);

    const response = {
      error: (err as Error).message,
      returnedStatus: 200,
    };

    return NextResponse.json(response, { status: 200 });
  }
} */
