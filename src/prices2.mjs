import "./polyfills.mjs";
import express from "express";
import { Temporal } from "@js-temporal/polyfill";

// Refactor the following code to get rid of the legacy Date class.
// Use Temporal.PlainDate instead. See /test/date_conversion.spec.mjs for examples.

function createApp(database) {
  const app = express();

  app.put("/prices", (req, res) => {
    const liftPassCost = req.query.cost;
    const liftPassType = req.query.type;
    database.setBasePrice(liftPassType, liftPassCost);
    res.json();
  });

  app.get("/prices", (req, res) => {
    const age = req.query.age;
    const type = req.query.type;
    const baseCost = database.findBasePriceByType(type).cost;
    //const date = parseDate(req.query.date); //14 let const? 17
    const date= req.query.date && Temporal.PlainDate.from(req.query.date); //1
    //date = date instanceof Date ? date.toTemporalInstant().toZonedDateTimeISO("UTC").toPlainDate(): date //13  18 pois

    const cost = calculateCost(age, type, date, baseCost);
    res.json({ cost });
  });

  
    //const date2= req.query.date && Temporal.PlainDate.from(req.query.date); //1

    // function parseDate(dateString) {
    //   if (dateString) {
    //  //  return Temporal.PlainDate.from(req.query.date(dateString))//3
    //  return new Date(dateString);
    //   }
    // }
    function parseDate(dateString) {
    if (dateString) {
      return new  Date(dateString); //16
     // return Temporal.PlainDate.from(dateString); //16

    }
  }

  function calculateCost(age, type, date, baseCost) {
    //date = date instanceof Date ? date.toTemporalInstant().toZonedDateTimeISO("UTC").toPlainDate(): date //13

    if (type === "night") {
      return calculateCostForNightTicket(age, baseCost);
    } else {
      return calculateCostForDayTicket(age, date, baseCost);
    }
  }

  function calculateCostForNightTicket(age, baseCost) {
    if (age === undefined) {
      return 0;
    }
    if (age < 6) {
      return 0;
    }
    if (age > 64) {
      return Math.ceil(baseCost * 0.4);
    }
    return baseCost;
  }

  function calculateCostForDayTicket(age, date, baseCost) {
    let reduction = calculateReduction(date);
    if (age === undefined) {
      return Math.ceil(baseCost * (1 - reduction / 100));
    }
    if (age < 6) {
      return 0;
    }
    if (age < 15) {
      return Math.ceil(baseCost * 0.7);
    }
    if (age > 64) {
      return Math.ceil(baseCost * 0.75 * (1 - reduction / 100));
    }
    return Math.ceil(baseCost * (1 - reduction / 100));
  }

  function calculateReduction(date) {
    console.log("d", date)
    let reduction = 0;
    if (date && isMonday(date) && !isHoliday(date)) {
      reduction = 35;
    }
    return reduction;
  }


  function isMonday(date) {
   // return date instanceof Date? date.getDay() === 1 : date.dayOfWeek === 1; //1 vika posta Dte?
    //return  date.dayOfWeek === 1; //1 vika posta Dte? 13
    return date.dayOfWeek === 1;
  }

  function isHoliday(date) {
    const holidays = database.getHolidays();
    for (let row of holidays) {

   let holiday = new Temporal.PlainDate.from(row.holiday); //6   let holiday = new Date(row.holiday);
   console.log("holiday", holiday)   
    console.log("date", date)
     // console.log("dayyy",row.holiday)

    //  console.log("holi",holi)
 //const isDate = date instanceof Date? date.toTemporalInstant().toZonedDateTimeISO("UTC").toPlainDate().toString()=== holiday.toString() : date.toString() === holiday.toString();
   //2 12pois
   //if(date && !(holiday instanceof Date)&& isDate) return true//3 //10pois
      if (
        date &&
       // date.getFullYear() === holiday.getFullYear() &&  //4
     //  holiday instanceof Date &&  date.getFullYear() === holiday.getFullYear() && //5 //8 postuui


       // date.getMonth() === holiday.getMonth() && // 8
     // !(holiday instanceof Date) && isDate   // date && !(holiday instanceof Date) && isDate // date.getDate() === holiday.getDate()7 //9 11pois
      // date instanceof Date? date.toTemporalInstant().toZonedDateTimeISO("UTC").toPlainDate().toString()=== holiday.toString() : date.toString() === holiday.toString()
        //111  14 pois
       date.toString === holiday.toString //14
       //date.equals(holiday)
   
      ) {
        return true;
      }
    }
    return false;
  }

  return app;
}

export { createApp };
