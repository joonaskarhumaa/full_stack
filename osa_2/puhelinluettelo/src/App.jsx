import { useState, useEffect } from 'react'
import personService from './services/persons'
import Notification from './components/Notification'
import './index.css'

const Filter = ({ filter, onFilterChange }) => (
  <div>
    filter shown with: <input value={filter} onChange={onFilterChange} />
  </div>
)

const PersonForm = ({ newName, newNumber, onNameChange, onNumberChange, onSubmit }) => (
  <form onSubmit={onSubmit}>
    <div>name: <input value={newName} onChange={onNameChange} /></div>
    <div>number: <input value={newNumber} onChange={onNumberChange} /></div>
    <div><button type="submit">add</button></div>
  </form>
)

const Person = ({ person, onDelete }) => (
  <p>
    <b>{person.name}</b> {person.number}
    <button onClick={() => onDelete(person.id, person.name)}>delete</button>
  </p>
)

const Persons = ({ persons, onDelete }) => (
  <div>
    {persons.map(person =>
      <Person key={person.id} person={person} onDelete={onDelete} />
    )}
  </div>
)

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState({ message: null, type: 'success' })

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification({ message: null, type: 'success' }), 5000)
  }

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => setPersons(initialPersons))
  }, [])

  const addPerson = (event) => {
    event.preventDefault()
    if (newName.trim() === '') return

    const existingPerson = persons.find(person => person.name === newName)

    if (existingPerson) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const updatedPerson = { ...existingPerson, number: newNumber }
        personService
          .update(existingPerson.id, updatedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(p => p.id !== existingPerson.id ? p : returnedPerson))
            showNotification(`Updated ${newName}`)
            setNewName('')
            setNewNumber('')
          })
          .catch(error => {
            const msg = error.response?.data?.error || `Information on ${newName} has already been removed from server`
            showNotification(msg, 'error')
          })
      }
      return
    }

    personService
      .create({ name: newName, number: newNumber })
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        showNotification(`Added ${newName}`)
        setNewName('')
        setNewNumber('')
      })
      .catch(error => {
        const msg = error.response?.data?.error || 'Failed to add person'
        showNotification(msg, 'error')
      })
  }

  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
          showNotification(`Deleted ${name}`)
        })
    }
  }

  const personsToShow = filter === ''
  ? persons
  : persons.filter(person =>
      person.name.toLowerCase().includes(filter.toLowerCase())
    )


  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification.message} type={notification.type} />
      <Filter filter={filter} onFilterChange={(e) => setFilter(e.target.value)} />
      <h3>Add a new</h3>
      <PersonForm
        newName={newName}
        newNumber={newNumber}
        onNameChange={(e) => setNewName(e.target.value)}
        onNumberChange={(e) => setNewNumber(e.target.value)}
        onSubmit={addPerson}
      />
      <h3>Numbers</h3>
      <Persons persons={personsToShow} onDelete={deletePerson} />
    </div>
  )
}

export default App