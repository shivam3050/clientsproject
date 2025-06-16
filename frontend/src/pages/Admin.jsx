import AdminBody from "./AdminBody";
// import { useNavigate } from "react-router-dom";
import "./Admin.css"

let isMenuAsideOn = false;


function MenuLoaderButton (){  


  const elementAside = document.querySelector('.admin-aside-pure');
  const elementAsideAverlay = document.querySelector('.admin-aside-overlay');


    if(isMenuAsideOn){
      elementAside.style.left = '-25%';
      isMenuAsideOn = false;
      elementAsideAverlay.style.opacity = 0;
    } else {
      elementAside.style.left = '0px';
      elementAside.style.top = '0px';
      elementAside.style.zIndex = 2;
      elementAsideAverlay.style.opacity = 0.4;
      elementAsideAverlay.style.zIndex = 1;

      isMenuAsideOn = true;

    }
    
}









const Adminn = ()=>{
  // const navigate = useNavigate();



    return (<div className='admin-homepage'>
      <header className="admin-header">
        <button onClick={MenuLoaderButton}>
          <div></div>
          <div></div>
          <div></div>
        </button>
      
      </header>
      <section className='admin-aside-pure'>
          <header>
            <button onClick={MenuLoaderButton}>Close</button>
          </header>
          <main>
          <ul>
            <li><a href="/student" target="_blank" className="" rel="noopener noreferrer" onClick={()=>{MenuLoaderButton();}}>Student</a></li>
            <li>About</li>
          </ul>
          </main>
      </section>
      <section onClick={()=>{MenuLoaderButton()}} className='admin-aside-overlay'>
      </section>
      <main className="admin-body">
        <AdminBody/>
      </main>
      <footer className="admin-footer">
      footer
      </footer>
    </div>)
}

export default Adminn;