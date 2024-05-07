// import useful libraries
import * as math from "mathjs";

//define the fairhold object
export class Fairhold {
  amplitude;
  length;
  position;
  plateau;
  threshold;
  constructor(
    amplitude: number = 0.25,
    length: number = 1,
    position: number = 0.45,
    plateau: number = 0.15,
    threshold: number = 0.5
  ) {
    this.amplitude = amplitude; // Amplitude in the fairhold formula
    this.length = length; // length in the fairhold formula
    this.position = position; // position in the fairhold formula
    this.plateau = plateau; // plateau in the fairhold formula
    this.threshold = threshold; // thersold in the fairhold formula
  }
}
export class Household {
  incomePerPerson; // income per person
  averageRent; // average rent
  averageSocialRent; // average social rent
  househousePriceIndex; // house price index
  income?: number; // income per household
  constructor(
    incomePerPerson: number,
    averageRent: number,
    averageSocialRent: number,
    housePriceIndex: number
  ) {
    this.incomePerPerson = incomePerPerson;
    this.averageRent = averageRent;
    this.averageSocialRent = averageSocialRent;
    this.househousePriceIndex = housePriceIndex;
  }
}
// define the property class
export class Property {
  postcode; // postcode of the property
  hType; // type of the house: D--> detached, S--> semidetached, T--> Terrace, F--> Flats
  numberOfBedrooms; // number of bedrooms in the house
  age; // age of the house
  size; // size of the house in meter squares
  newBuildPricePerMetre: number; // average build price per meter of a new house
  averagePrice: number; // average market price
  itl3: string; // ITL code
  newBuildPrice?: number; // price of the house if it was new
  depreciatedBuildPrice?: number; // price of the house according to the depreciation regression
  bedWeightedAveragePrice?: number; // price of the house weigheted by the number of bedrooms
  landPrice?: number; // price of the land

  constructor(
    postcode: string,
    hType: string,
    numberOfBedrooms: number,
    age: number,
    size: number,
    newBuildPricePerMetre: number,
    averagePrice: number,
    itl3: string,
    gdhi: string,
    hpi: string,
    averageRent: number,
    averageSocialRent: number
  ) {
    this.postcode = postcode;
    this.hType = hType;
    this.numberOfBedrooms = numberOfBedrooms;
    this.age = age;
    this.size = size;
    this.newBuildPricePerMetre = newBuildPricePerMetre;
    this.averagePrice = averagePrice;
    this.itl3 = itl3;

    this.calculateNewBuildPrice(); // calculate new building price
    this.calculateDepreciatedBuildPrice(); // calculated the depreciated building price
    this.calculateBedWeightedAveragePrice(); // calculate the bed weighted building price
    this.calculateLandPrice(); // calculate the price of the land
  }

  // calculate new building price
  calculateNewBuildPrice(precisionRounding: number = 2) {
    if (this.newBuildPricePerMetre) {
      const newBuildPrice = this.newBuildPricePerMetre * this.size; // calculate the price of the new build
      this.newBuildPrice = parseFloat(newBuildPrice.toFixed(precisionRounding)); // round the number

      return this.newBuildPrice;
    } else {
      throw new Error(
        "The Build Price cannot be calculated because pricePerMeter has not been set"
      );
    }
  }

  // calculate nthe depraciated building price
  calculateDepreciatedBuildPrice(
    depreciationFactor: number = -32938,
    precisionRounding: number = 2
  ) {
    if (this.newBuildPrice) {
      const depreciatedBuildPrice =
        this.newBuildPrice + depreciationFactor + math.log(this.age); // depreciated building price
      this.depreciatedBuildPrice = parseFloat(
        depreciatedBuildPrice.toFixed(precisionRounding)
      ); // round the number

      return this.depreciatedBuildPrice;
    } else {
      throw new Error(
        "The Depreciated Price cannot be calculated because newBuildPrice has not been set"
      );
    }
  }

  // calculate the average property price based on the  number of bedrooms
  calculateBedWeightedAveragePrice(
    numberOfBeds: number = this.numberOfBedrooms,
    beds: any = [0, 1, 2, 3, 4, 5, 6],
    bedWeigths: any = [0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4],
    precisionRounding: number = 2
  ) {
    let bedWeigth; // initialize the variable

    if (numberOfBeds < beds[beds.length - 1]) {
      bedWeigth = bedWeigths[numberOfBeds]; // assign the weight based on the number of beds
    } else {
      bedWeigth = bedWeigths[bedWeigths.length - 1]; // assign the last value if out of scale
    }

    if (bedWeigth !== undefined) {
      return (this.bedWeightedAveragePrice = parseFloat(
        (bedWeigth * this.averagePrice).toFixed(precisionRounding)
      )); // calculate the bed weighted average price
    } else {
      throw new Error(
        "The bed weigthed average price cannot be calculated. Check the calculateBedWeightedAveragePrice mehtod."
      );
    }
  }
  calculateLandPrice(
    propertyPrice: any = this.bedWeightedAveragePrice,
    housePrice: any = this.depreciatedBuildPrice
  ) {
    return (this.landPrice = propertyPrice - housePrice); // calculate the price of the land
  }
}

// define the mortgage class
export class Mortgage {
  houseValue: number; //value of the house
  interestRate: number; // interest rate of the mortgage in percentage e.r, 0.05=5%
  termOfTheMortgage: number; // number of years of the mortgage
  initialDeposit: number; // initial deposit of the value of the mortgage in percentage e.g. 0.15 =15% deposit
  amountOfTheMortgage?: number; // amount of the morgage requested
  monthlyPayment?: number; // monthly rate of the mortgage
  constructor(
    houseValue: number,
    interestRate: number = 0.06,
    termOfTheMortgage: number = 30,
    initialDeposit: number = 0.15
  ) {
    this.houseValue = houseValue;
    this.initialDeposit = initialDeposit;
    this.interestRate = interestRate;
    this.termOfTheMortgage = termOfTheMortgage;
    this.calculateamountOfTheMortgage(); // calculate the amount of the mortgage
    this.calculateMonthlyMortgagePayment(); // calculate the montly payment
  }

  calculateamountOfTheMortgage() {
    this.amountOfTheMortgage = this.houseValue * (1 - this.initialDeposit); // calculate the amount of the mortgage by removing the deposit
    return this.amountOfTheMortgage;
  }

  calculateMonthlyMortgagePayment() {
    const monthlyInterestRate = this.interestRate / 12; // Convert annual interest rate to monthly rate
    const numberOfPayments = this.termOfTheMortgage * 12; // Convert term in years to total number of payments
    if (this.amountOfTheMortgage !== undefined) {
      const monthlyPayment =
        (this.amountOfTheMortgage *
          monthlyInterestRate *
          Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1); // Calculate the monthly payment
      this.monthlyPayment = parseFloat(monthlyPayment.toFixed(2)); // Store monthly payment rounded to 2 decimal places in class property
      return this.monthlyPayment;
    } else {
      throw new Error("amountOfTheMortgage is undefined");
    }
  }
}

// set the weights for the bedroom
