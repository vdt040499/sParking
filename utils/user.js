const User = require('../api/models/user.model')
const MoneySource = require('../api/models/moneysource.model')

const getUsersWithMS = async () => {
    const users = await User.find().select(['-password', '-tickets'])
    const mosos = await MoneySource.find()
    const mappedUsers = users.map(user => {
      const newUser = { 
        _id: user.Id, 
        username: user.username, 
        ID: user.ID, 
        balance: user.balance, 
        parkingStatus: user.parkingStatus,
        position: user.position,
        email: user.email,
        plate: user.plate,
        createdAt: user.createdAt
      }
      mosos.forEach(moso => {
        if (moso.user.toString() == user._id.toString()) {
          newUser.moneySource = moso
        }
      })

      return newUser
    })

    return mappedUsers
}

const getUser = async (userId) => {
  const user = await User.findById(userId)

  return user
}

module.exports = { getUsersWithMS, getUser }