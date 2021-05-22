const moment = require('moment')
const Ticket = require('../api/models/ticket.model')

//Get current the number of tickets
const getCurNumOfTic = async () => {
  const today = moment().startOf('day')

  const tickets = await Ticket.find({
    createdAt: {
      $gte: today.toDate(),
      $lte: moment(today).endOf('day').toDate()
    }
  })

  return tickets
}
  
//Get the number of tickets for specific date
const getSpecNumOfTic = async (day, month, year) => {
  const specDate = `${year}-${month}-${day}`
  const tickets = await Ticket.find({
    createdAt: {
      $gte: new Date(new Date(specDate).setHours(00, 00, 00)),
      $lt: new Date(new Date(specDate).setHours(23, 59, 59))
    }
  })

  return tickets
}
  
//Get array of dates for 7 days ago
const getSevenDatesArr = () => {
  const dateArr = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000)
    const dateObj = {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear()
    }
    dateArr.push(dateObj)
  }

  return dateArr
}
  
//Get the number of tickets for last weeks
const getNumOfTicFLW = async () => {
  const NumOfTicArr = []
  const dateArr = getSevenDatesArr()
  for (let i = 0; i < dateArr.length; i++) {
      const ticket = await getSpecNumOfTic(dateArr[i].day, dateArr[i].month, dateArr[i].year)
      NumOfTicArr.push(ticket.length)
  }

  return NumOfTicArr
}

module.exports = { getCurNumOfTic, getSpecNumOfTic, getSevenDatesArr, getNumOfTicFLW }