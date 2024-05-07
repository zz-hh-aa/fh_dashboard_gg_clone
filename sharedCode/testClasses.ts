import { Mortgage, Property, Fairhold, Household } from "./classes";

const fairhold = new Fairhold(); // set the fairhold
const mortgage = new Mortgage(200000); // set the new mortgage

function calculateFairhold(houseData: any) {
  const property = new Property(
    houseData.postcode,
    houseData.houseType,
    houseData.houseBedrooms,
    houseData.houseAge,
    houseData.houseSize,
    houseData.buildPrice[0].priceMid,
    houseData.averagePrice,
    houseData.itl3[0].itl3
  );
  const household = new Household(
    houseData.gdhi[0].gdhi_2020,
    houseData.averageRent,
    houseData.averageSocialRent,
    houseData.hpi
  );
  return console.log(property, household);
}

export default calculateFairhold;
