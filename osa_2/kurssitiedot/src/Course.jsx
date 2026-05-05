const Header = ({ course }) => <h1>{course}</h1>

const Part = ({ part }) => (
  <p>
    {part.name} {part.exercises}
  </p>
)

const Content = ({ parts }) => (
  <div>
    {parts.map(part => <Part key={part.name} part={part} />)}
  </div>
)

const Total = ({ parts }) => (
  <p><b>total of {parts.reduce((sum, part) => sum + part.exercises, 0)} exercises</b></p>
)

const Course = ({ course }) => (
  <div>
    <Header course={course.name} />
    <Content parts={course.parts} />
    <Total parts={course.parts} />
  </div>
)

export default Course