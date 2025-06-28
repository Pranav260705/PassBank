import reactLogo from './assets/react.svg'
import './App.css'
import Navbar from './components/Navbar'
import Manager from './components/Manager'
import Footer from './components/Footer'

function App() {

  return (
    <>
      <Navbar></Navbar>
      <div className='min-h-[88vh]'>
      <Manager></Manager>
      </div>
      <Footer></Footer>
    </>
  )
}

export default App
