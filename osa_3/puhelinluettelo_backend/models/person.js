const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  // 3.19: nimen pituus vähintään 3
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  // 3.20: puhelinnumeron validointi
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      validator: (value) => {
        // 2 tai 3 numeroa, väliviiva, vähintään yksi numero, vain numeroita
        return /^\d{2,3}-\d+$/.test(value)
      },
      message: (props) => `${props.value} is not a valid phone number!`
    },
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
